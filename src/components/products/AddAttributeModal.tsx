import { useState } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import { showSuccessToast, showErrorToast } from "../ui/toast";

interface Attribute {
    name: string;
    type: 'text' | 'number' | 'select';
    options?: string[];
}

interface AddAttributeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (attribute: Attribute) => Promise<void>;
}

export default function AddAttributeModal({ isOpen, onClose, onAdd }: AddAttributeModalProps) {
    const [newAttribute, setNewAttribute] = useState<Attribute>({ 
        name: '', 
        type: 'text', 
        options: [] 
    });
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        if (!newAttribute.name.trim()) {
            showErrorToast("Validation Error", "Attribute name is required");
            return;
        }

        if (newAttribute.type === 'select' && (!newAttribute.options || newAttribute.options.length === 0)) {
            showErrorToast("Validation Error", "Please add at least one option for select type");
            return;
        }

        setLoading(true);
        try {
            await onAdd({
                name: newAttribute.name.trim(),
                type: newAttribute.type,
                options: newAttribute.type === 'select' 
                    ? newAttribute.options?.filter(opt => opt.trim() !== '') 
                    : undefined
            });
            
            // Reset form
            setNewAttribute({ name: '', type: 'text', options: [] });
            showSuccessToast("Attribute Added", "The attribute was added successfully!");
            onClose();
        } catch (error: any) {
            showErrorToast("Add Failed", error.message || 'Failed to add attribute');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative z-10 w-full max-w-2xl mx-4 rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Add New Attribute
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Create a new attribute that will be available for all products
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Attribute Name */}
                    <div>
                        <Label htmlFor="attrName">Attribute Name *</Label>
                        <Input 
                            type="text" 
                            id="attrName"
                            value={newAttribute.name}
                            onChange={(e) => setNewAttribute({...newAttribute, name: e.target.value})}
                            placeholder="e.g., Color, Size, Material"
                        />
                    </div>

                    {/* Attribute Type */}
                    <div>
                        <Label htmlFor="attrType">Attribute Type *</Label>
                        <Select
                            options={[
                                { value: 'text', label: 'Text' },
                                { value: 'number', label: 'Number' },
                                { value: 'select', label: 'Select (Dropdown)' }
                            ]}
                            placeholder="Select type"
                            value={newAttribute.type}
                            onChange={(value) => setNewAttribute({
                                ...newAttribute, 
                                type: value as 'text' | 'number' | 'select',
                                options: value === 'select' ? [''] : []
                            })}
                            className="dark:bg-dark-900"
                        />
                    </div>

                    {/* Options for Select Type */}
                    {newAttribute.type === 'select' && (
                        <div className="space-y-3">
                            <Label>Options *</Label>
                            <div className="space-y-2">
                                {newAttribute.options?.map((option, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            type="text"
                                            value={option}
                                            onChange={e => {
                                                const newOptions = [...(newAttribute.options || [])];
                                                newOptions[index] = e.target.value;
                                                setNewAttribute({ ...newAttribute, options: newOptions });
                                            }}
                                            placeholder={`Option ${index + 1}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newOptions = (newAttribute.options || []).filter((_, i) => i !== index);
                                                setNewAttribute({ ...newAttribute, options: newOptions });
                                            }}
                                            className="flex h-10 px-4 items-center justify-center rounded-lg bg-red-500 text-white transition-colors hover:bg-red-600"
                                            disabled={newAttribute.options?.length === 1}
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                                
                                <button
                                    type="button"
                                    onClick={() => setNewAttribute({ ...newAttribute, options: [...(newAttribute.options || []), ''] })}
                                    className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add Option
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Info Box */}
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/20">
                        <div className="flex items-start gap-3">
                            <svg className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm text-blue-700 dark:text-blue-300">
                                <p className="font-medium mb-1">Attribute Types:</p>
                                <ul className="space-y-1 text-xs">
                                    <li>• <strong>Text:</strong> Free text input (e.g., Brand, Material)</li>
                                    <li>• <strong>Number:</strong> Numeric input (e.g., Weight, Power)</li>
                                    <li>• <strong>Select:</strong> Dropdown with predefined options (e.g., Size, Color)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-6 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-gray-300 bg-white font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAdd}
                        className="flex items-center justify-center gap-2 rounded-lg px-5 py-3.5 text-sm bg-brand-500 text-white transition hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Adding...' : 'Add Attribute'}
                    </button>
                </div>
            </div>
        </div>
    );
}

