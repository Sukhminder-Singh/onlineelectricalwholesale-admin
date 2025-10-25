import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DropzoneComponent from "../../components/form/form-elements/DropZone";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import ImageTable from "../../components/ui/imageTable/ImageTable";
// import Switch from '../../components/form/switch/Switch';
import { useEffect, useState } from "react";
import { brandApi, Brand } from "../../services/api";
import { showSuccessToast, showErrorToast } from "../../components/ui/toast";
import { createImageUrl } from "../../utils/imageUtils";

export default function AddBrand() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [name, setName] = useState("");
    const [logo, setLogo] = useState<File | undefined>();
    const [logoUrl, setLogoUrl] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

    // Fetch brands on mount
    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        setLoading(true);
        try {
            const data = await brandApi.getAll();
            // Ensure data is always an array
            setBrands(Array.isArray(data) ? data : []);
        } catch (err: any) {
            showErrorToast("Error", err.message || "Failed to fetch brands");
            setBrands([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form submitted with data:", { name, logo, editingId });
        
        // Basic validation
        if (!name.trim()) {
            showErrorToast("Validation Error", "Brand name is required");
            return;
        }
        
        setLoading(true);
        try {
            if (editingId) {
                console.log("Updating brand:", editingId);
                await brandApi.update(editingId, { name: name.trim(), logo });
                showSuccessToast("Brand Updated", "Brand updated successfully");
            } else {
                console.log("Creating new brand");
                await brandApi.create({ name: name.trim(), logo });
                showSuccessToast("Brand Added", "Brand added successfully");
            }
            setName("");
            setLogo(undefined);
            setLogoUrl("");
            setEditingId(null);
            fetchBrands();
        } catch (err: any) {
            console.error("Error saving brand:", err);
            showErrorToast("Error", err.message || "Failed to save brand");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (brand: Brand) => {
        setName(brand.name);
        setLogo(undefined); // Only set new logo if user uploads
        
        // Use utility function to create proper image URL
        const imageUrl = createImageUrl(brand.logo);
        setLogoUrl(imageUrl || "");
        
        setEditingId(brand._id || null);
    };

    const handleDelete = async (id?: string) => {
        if (!id) return;
        setLoading(true);
        try {
            await brandApi.delete(id);
            showSuccessToast("Brand Deleted", "Brand deleted successfully");
            fetchBrands();
        } catch (err: any) {
            showErrorToast("Error", err.message || "Failed to delete brand");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setName("");
        setLogo(undefined);
        setLogoUrl("");
        setEditingId(null);
    };

    // Status toggle handler
    const handleStatusToggle = async (id?: string, currentStatus?: string) => {
        if (!id) {
            console.error("No ID provided for status toggle");
            return;
        }
        
        // Prevent multiple simultaneous updates
        if (statusUpdatingId === id) {
            console.log("Status update already in progress for this brand");
            return;
        }
        
        console.log("Toggling status for brand:", { id, currentStatus });
        setStatusUpdatingId(id);
        
        // Store original brands for potential rollback
        const originalBrands = [...brands];
        
        // Calculate the new isActive value
        const newIsActive = currentStatus !== 'active';
        
        // Optimistic update - update UI immediately
        const optimisticBrands = brands.map(brand => 
            brand._id === id 
                ? { 
                    ...brand, 
                    status: newIsActive ? 'active' : 'inactive',
                    isActive: newIsActive
                  }
                : brand
        );
        setBrands(optimisticBrands);
        
        try {
            console.log("Calling dedicated status toggle API for brand:", id);
            
            // Calculate the new isActive value based on current status
            const newIsActive = currentStatus !== 'active';
            console.log("Toggling to isActive:", newIsActive);
            
            // Use the dedicated status toggle endpoint with the new isActive value
            const updatedBrand = await brandApi.toggleStatus(id, newIsActive);
            console.log("Status toggle API response:", updatedBrand);
            
            const newStatus = updatedBrand.status || (newIsActive ? 'active' : 'inactive');
            showSuccessToast("Status Updated", `Brand status set to ${newStatus}`);
            
            // Update the specific brand in the list with the response data
            setBrands(prevBrands => 
                prevBrands.map(brand => 
                    brand._id === id ? { ...brand, ...updatedBrand } : brand
                )
            );
        } catch (err: any) {
            console.error("Error updating brand status:", err);
            showErrorToast("Error", err.message || "Failed to update status");
            
            // Revert optimistic update on error
            setBrands(originalBrands);
        } finally {
            setStatusUpdatingId(null);
        }
    };

    return (
        <>
            <PageBreadcrumb pageTitle="Add Brand" />
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <Label htmlFor="brandName">Name *</Label>
                        <Input
                            type="text"
                            id="brandName"
                            placeholder="Enter brand name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Upload Image</Label>(Recommended Size : 131 x 131 pixels)
                        <DropzoneComponent
                            onImageUpload={(_url, file) => {
                                setLogo(file);
                                setLogoUrl(_url);
                            }}
                            value={logoUrl}
                            multiple={false}
                        />
                    </div>
                    <div className="flex items-center gap-5">
                        <Button size="sm" variant="primary" type="submit" disabled={loading}>
                            {editingId ? "Update" : "Submit"}
                        </Button>
                        <Button size="sm" variant="primary" type="button" onClick={handleReset}>
                            Reset
                        </Button>
                    </div>
                </form>
                <div className="space-y-6">
                    <ImageTable
                        data={(brands || []).map(b => {
                            // Use utility function to create proper image URL
                            const imageUrl = b.logo;
                            
                            return {
                                _id: b._id,
                                name: b.name,
                                images: imageUrl || '', // Use empty string as fallback, ImageTable will handle this
                                status: (b.isActive === false) ? 'inactive' : 'active',
                            };
                        })}
                        onEdit={(id?: string) => {
                            const brand = (brands || []).find(b => b._id === id);
                            if (brand) handleEdit(brand);
                        }}
                        onDelete={(id?: string) => handleDelete(id)}
                        onStatusToggle={handleStatusToggle}
                        loading={loading}
                        statusUpdatingId={statusUpdatingId}
                    />
                </div>
            </div>
        </>
    );
}