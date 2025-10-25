import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import TextArea from "../../components/form/input/TextArea";
import { LoadingSpinner, LoadingOverlay, SkeletonTable } from "../../components/ui/loading";
import { useLoading } from "../../context/LoadingContext";
import { initialSliderData } from "./initialData";
import SliderPreview from "./SliderPreview";
import { saveSliderOrder, saveNewSlider, deleteSlider as deleteSliderAPI, updateSliderStatus, loadSlidersFromAPI } from "./sliderUtils";
import { uploadApi } from '../../services/api';
import { 
    EyeIcon, 
    EyeCloseIcon, 
    DeleteIcon, 
    AngleUpIcon, 
    AngleDownIcon, 
    CheckLineIcon,
    CloseLineIcon
} from "../../icons";
import { showSuccessToast, showErrorToast } from "../../components/ui/toast";
import OrderManager from '../../components/common/OrderSorter';
import { GripVertical } from 'lucide-react';

export type SliderData = {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    link: string;
    order: number;
    isActive: boolean;
    createdAt: string;
};

export default function SliderList() {
    const [sliders, setSliders] = useState<SliderData[]>([]);
    const [savedSliders, setSavedSliders] = useState<SliderData[]>([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        imageUrl: "",
        link: "",
        order: 1
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const { showLoading, hideLoading } = useLoading();

    useEffect(() => {
        const loadSliders = async () => {
            try {
                showLoading('Loading sliders...');
                const apiSliders = await loadSlidersFromAPI();
                setSliders(apiSliders);
                setSavedSliders(apiSliders);
            } catch (error) {
                showLoading('Error loading sliders', 'danger');
                setTimeout(() => hideLoading(), 3000);
            } finally {
                hideLoading();
                setIsLoading(false);
            }
        };
        loadSliders();
    }, []);

    // Check for unsaved changes
    useEffect(() => {
        const hasChanges = JSON.stringify(sliders) !== JSON.stringify(savedSliders);
        setHasUnsavedChanges(hasChanges);
    }, [sliders, savedSliders]);

    const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
                setFormData(prev => ({
                    ...prev,
                    imageUrl: e.target?.result as string
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let imageUrl = formData.imageUrl;
            if (selectedFile) {
                // Upload the image file and get the URL
                const uploadResult = await uploadApi.uploadImage(selectedFile);
                imageUrl = uploadResult.url;
            }
            const newSlider: SliderData = {
                id: Date.now().toString(),
                title: formData.title,
                description: formData.description,
                imageUrl,
                link: formData.link,
                order: sliders.length + 1, // Auto-assign next order number
                isActive: true,
                createdAt: new Date().toISOString()
            };
            const result = await saveNewSlider(newSlider);
            if (result.success && result.slider) {
                setSliders(prev => [...prev, result.slider]);
                setSavedSliders(prev => [...prev, result.slider]);
                setFormData({ title: "", description: "", imageUrl: "", link: "", order: 1 });
                setSelectedFile(null);
                setImagePreview("");
                showSuccessToast("Success", result.message);
            } else {
                showErrorToast("Slider Error", result.message);
            }
        } catch (error: any) {
            let errorMessage = 'Error adding slider';
            if (error && error.message) {
                errorMessage = error.message;
            } else if (error && typeof error === 'object' && 'details' in error) {
                errorMessage = error.details;
            }
            showErrorToast('Slider Error', errorMessage);
            showLoading(errorMessage, 'danger');
            setTimeout(() => hideLoading(), 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setFormData({ title: "", description: "", imageUrl: "", link: "", order: 1 });
        setSelectedFile(null);
        setImagePreview("");
    };

    const toggleActiveStatus = async (id: string) => {
        const slider = sliders.find(s => s.id === id);
        if (!slider) return;
        
        const newStatus = !slider.isActive;
        
        try {
            const result = await updateSliderStatus(id, newStatus);
            if (result.success) {
                setSliders(prev => prev.map(s => 
                    s.id === id ? { ...s, isActive: newStatus } : s
                ));
                showSuccessToast("Success", result.message);
            } else {
                showErrorToast("Slider Error", result.message);
            }
        } catch (error) {
            console.error('Error updating slider status:', error);
            showErrorToast("Slider Error", "Error updating slider status. Please try again.");
        }
    };

    const deleteSlider = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this slider?')) return;
        
        try {
            const result = await deleteSliderAPI(id);
            if (result.success) {
                setSliders(prev => prev.filter(slider => slider.id !== id));
                setSavedSliders(prev => prev.filter(slider => slider.id !== id));
                showSuccessToast("Success", result.message);
            } else {
                showErrorToast("Slider Error", result.message);
            }
        } catch (error) {
            console.error('Error deleting slider:', error);
            showErrorToast("Slider Error", "Error deleting slider. Please try again.");
        }
    };

    const moveSlider = (id: string, direction: 'up' | 'down') => {
        setSliders(prev => {
            const index = prev.findIndex(slider => slider.id === id);
            if (index === -1) return prev;
            
            const newSliders = [...prev];
            if (direction === 'up' && index > 0) {
                [newSliders[index], newSliders[index - 1]] = [newSliders[index - 1], newSliders[index]];
            } else if (direction === 'down' && index < newSliders.length - 1) {
                [newSliders[index], newSliders[index + 1]] = [newSliders[index + 1], newSliders[index]];
            }
            
            // Update order numbers based on new positions
            return newSliders.map((slider, idx) => ({
                ...slider,
                order: idx + 1
            }));
        });
    };

    const saveOrder = async () => {
        setIsSaving(true);
        try {
            const result = await saveSliderOrder(sliders);
            
            if (result.success) {
                setSavedSliders([...sliders]);
                setHasUnsavedChanges(false);
                showSuccessToast("Success", result.message);
            } else {
                showErrorToast("Slider Error", result.message);
            }
        } catch (error) {
            console.error('Error saving slider order:', error);
            showErrorToast("Slider Error", "Error saving slider order. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const resetOrder = () => {
        if (window.confirm('Are you sure you want to reset the order to the last saved state?')) {
            setSliders([...savedSliders]);
            setHasUnsavedChanges(false);
        }
    };

    const isFormValid = formData.title.trim() !== '' && (formData.imageUrl.trim() !== '' || selectedFile !== null);

    return (
        <>
            <PageBreadcrumb pageTitle="Slider Management" />
            
            {/* Slider Preview */}
            <div className="mb-6">
                <SliderPreview sliders={sliders} />
            </div>
            
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="space-y-6">
                    <ComponentCard title="Sliders List">
                        <LoadingOverlay isLoading={isLoading} text="Loading sliders...">
                            {isLoading ? (
                                <SkeletonTable rows={5} columns={4} />
                            ) : (
                                <>
                                    {/* Modern Drag-and-Drop Order Management */}
                                    <div className="mb-4">
                                        <OrderManager
                                            items={sliders}
                                            getId={item => item.id}
                                            onOrderChange={ordered => {
                                                setSliders(ordered.map((slider, idx) => ({ ...slider, order: idx + 1 })));
                                                setHasUnsavedChanges(true);
                                            }}
                                            renderItem={(slider, idx, dragHandleProps, isDragging) => (
                                                <div
                                                    key={slider.id}
                                                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition group"
                                                >
                                                    <img src={slider.imageUrl} alt={slider.title} className="w-16 h-10 object-cover rounded" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-gray-900 dark:text-white truncate">{slider.title}</div>
                                                        <div className="text-xs text-gray-400 truncate">{slider.description}</div>
                                                    </div>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${slider.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{slider.isActive ? 'Active' : 'Inactive'}</span>
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                                        <button onClick={() => toggleActiveStatus(slider.id)} title={slider.isActive ? 'Deactivate' : 'Activate'}>
                                                            {slider.isActive ? <EyeIcon className="w-4 h-4" /> : <EyeCloseIcon className="w-4 h-4" />}
                                                        </button>
                                                        <button onClick={() => deleteSlider(slider.id)} title="Delete">
                                                            <DeleteIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <div {...dragHandleProps} className="cursor-move text-gray-300 hover:text-blue-500">
                                                        <GripVertical className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            )}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={resetOrder}
                                            disabled={!hasUnsavedChanges}
                                            className="flex items-center gap-2"
                                        >
                                            <CloseLineIcon className="w-4 h-4" />
                                            Reset
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="primary" 
                                            onClick={saveOrder}
                                            disabled={!hasUnsavedChanges || isSaving}
                                            className="flex items-center gap-2"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <LoadingSpinner size="sm" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckLineIcon className="w-4 h-4" />
                                                    Save
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </LoadingOverlay>
                    </ComponentCard>
                </div>
                <div className="space-y-6">
                    <ComponentCard title="Add Slider">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="title">Slider Title</Label>
                                <Input 
                                    type="text" 
                                    id="title" 
                                    value={formData.title}
                                    onChange={(e) => handleInputChange("title", e.target.value)}
                                    placeholder="Enter slider title"
                                />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <TextArea 
                                    value={formData.description}
                                    onChange={(value) => handleInputChange("description", value)}
                                    placeholder="Enter slider description"
                                />
                            </div>
                            <div>
                                <Label htmlFor="link">Link URL</Label>
                                <Input 
                                    type="url" 
                                    id="link" 
                                    value={formData.link}
                                    onChange={(e) => handleInputChange("link", e.target.value)}
                                    placeholder="Enter link URL (optional)"
                                />
                            </div>
                            <div>
                                <Label htmlFor="image">Slider Image</Label>
                                <div className="mt-2">
                                    <input
                                        type="file"
                                        id="image"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="block w-full text-sm text-gray-500 dark:text-gray-400
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-blue-50 file:text-blue-700
                                            hover:file:bg-blue-100
                                            dark:file:bg-blue-900 dark:file:text-blue-300"
                                    />
                                </div>
                                {imagePreview && (
                                    <div className="mt-4">
                                        <img 
                                            src={imagePreview} 
                                            alt="Preview" 
                                            className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-5">
                                <Button 
                                    type="submit"
                                    size="sm" 
                                    variant="primary" 
                                    disabled={!isFormValid || isSubmitting}
                                    className="flex items-center gap-2"
                                >
                                    {isSubmitting ? <LoadingSpinner size="sm" /> : 'Add Slider'}
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={handleReset}
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2"
                                >
                                    Reset
                                </Button>
                            </div>
                        </form>
                    </ComponentCard>
                </div>
            </div>
        </>
    );
} 