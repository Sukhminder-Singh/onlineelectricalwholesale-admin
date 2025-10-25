import { useState } from "react";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import Button from "../../../components/ui/button/Button";

interface Attribute {
    id: string;
    name: string;
    type: 'text' | 'number' | 'select';
    options?: string[];
}

interface AttributeManagerProps {
    availableAttributes: Attribute[];
    onAdd: (attribute: Omit<Attribute, 'id'>) => Promise<void>;
    onUpdate: (id: string, attribute: Partial<Attribute>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export default function AttributeManager({ availableAttributes, onAdd, onUpdate, onDelete }: AttributeManagerProps) {
    const [newAttribute, setNewAttribute] = useState({ name: '', type: 'text' as 'text' | 'number' | 'select', options: [] as string[] });
    const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [addLoading, setAddLoading] = useState(false);

    const handleAdd = async () => {
        if (newAttribute.name.trim()) {
            setAddLoading(true);
            await onAdd({
                name: newAttribute.name,
                type: newAttribute.type,
                options: newAttribute.type === 'select' ? (newAttribute.options && newAttribute.options.length > 0 ? newAttribute.options.filter(opt => opt.trim() !== '') : []) : undefined,
            });
            setNewAttribute({ name: '', type: 'text', options: [] });
            setAddLoading(false);
        }
    };

    const handleUpdate = async (id: string, updatedAttribute: Attribute) => {
        setLoadingId(id);
        await onUpdate(id, {
            name: updatedAttribute.name,
            type: updatedAttribute.type,
            options: updatedAttribute.type === 'select' ? (updatedAttribute.options && updatedAttribute.options.length > 0 ? updatedAttribute.options.filter(opt => opt.trim() !== '') : []) : undefined,
        });
        setEditingAttribute(null);
        setLoadingId(null);
    };

    const handleDelete = async (id: string) => {
        setLoadingId(id);
        await onDelete(id);
        setLoadingId(null);
    };

    return (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
            <h4 className="mb-4 text-md font-semibold text-blue-900 dark:text-blue-100">Attribute Management</h4>
            {/* Add New Attribute */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <h5 className="mb-3 font-medium text-gray-900 dark:text-white">Add New Attribute</h5>
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <div>
                        <Label>Attribute Name</Label>
                        <Input 
                            type="text" 
                            value={newAttribute.name}
                            onChange={(e) => setNewAttribute({...newAttribute, name: e.target.value})}
                            placeholder="Enter attribute name"
                        />
                    </div>
                    <div>
                        <Label>Type</Label>
                        <Select
                            options={[
                                { value: 'text', label: 'Text' },
                                { value: 'number', label: 'Number' },
                                { value: 'select', label: 'Select' }
                            ]}
                            placeholder="Select type"
                            onChange={(value) => setNewAttribute({...newAttribute, type: value as 'text' | 'number' | 'select', options: value === 'select' ? [''] : []})}
                            className="dark:bg-dark-900"
                        />
                    </div>
                    <div className="flex items-end">
                        <Button 
                            onClick={handleAdd}
                            className="bg-green-500 text-white hover:bg-green-600"
                            disabled={addLoading}
                        >
                            {addLoading ? 'Adding...' : 'Add Attribute'}
                        </Button>
                    </div>
                </div>
                {newAttribute.type === 'select' && (
                    <div className="mt-4">
                        <Label>Options</Label>
                        <div className="space-y-2">
                            {newAttribute.options.map((option, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        type="text"
                                        value={option}
                                        onChange={e => {
                                            const newOptions = [...newAttribute.options];
                                            newOptions[index] = e.target.value;
                                            setNewAttribute({ ...newAttribute, options: newOptions });
                                        }}
                                    />
                                    <Button
                                        onClick={() => {
                                            const newOptions = newAttribute.options.filter((_, i) => i !== index);
                                            setNewAttribute({ ...newAttribute, options: newOptions });
                                        }}
                                        className="bg-red-500 text-white hover:bg-red-600 px-3"
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ))}
                            <Button
                                onClick={() => setNewAttribute({ ...newAttribute, options: [...newAttribute.options, ''] })}
                                className="bg-green-500 text-white hover:bg-green-600"
                            >
                                Add Option
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Manage Existing Attributes */}
            <div className="space-y-4">
                <h5 className="font-medium text-gray-900 dark:text-white">Manage Existing Attributes</h5>
                {availableAttributes.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        No attributes found. Add your first attribute above!
                    </div>
                ) : (
                    availableAttributes.map((attribute) => (
                        <div key={attribute.id} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                            {editingAttribute?.id === attribute.id ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                                        <div>
                                            <Label>Name</Label>
                                            <Input 
                                                type="text" 
                                                value={editingAttribute?.name ?? ''}
                                                onChange={(e) => setEditingAttribute(editingAttribute ? { ...editingAttribute, name: e.target.value } : null)}
                                            />
                                        </div>
                                        <div>
                                            <Label>Type</Label>
                                            <Select
                                                options={[
                                                    { value: 'text', label: 'Text' },
                                                    { value: 'number', label: 'Number' },
                                                    { value: 'select', label: 'Select' }
                                                ]}
                                                placeholder="Select type"
                                                onChange={(value) => setEditingAttribute(editingAttribute ? { ...editingAttribute, type: value as 'text' | 'number' | 'select', options: value === 'select' ? (editingAttribute.options || ['']) : undefined } : null)}
                                                className="dark:bg-dark-900"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                onClick={() => handleUpdate(attribute.id, editingAttribute)}
                                                className="bg-blue-500 text-white hover:bg-blue-600"
                                                size="md"
                                                disabled={loadingId === attribute.id}
                                            >
                                                {loadingId === attribute.id ? 'Saving...' : 'Save'}
                                            </Button>
                                            <Button 
                                                onClick={() => setEditingAttribute(null)}
                                                className="bg-gray-500 text-white hover:bg-gray-600"
                                                disabled={loadingId === attribute.id}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                    {editingAttribute?.type === 'select' && (
                                        <div>
                                            <Label>Options</Label>
                                            <div className="space-y-2">
                                                {editingAttribute?.options?.map((option: string, index: number) => (
                                                    <div key={index} className="flex gap-2">
                                                        <Input 
                                                            type="text" 
                                                            value={option}
                                                            onChange={(e) => {
                                                                const newOptions = [...(editingAttribute?.options || [])];
                                                                newOptions[index] = e.target.value;
                                                                setEditingAttribute(editingAttribute ? {...editingAttribute, options: newOptions} : null);
                                                            }}
                                                        />
                                                        <Button 
                                                            onClick={() => {
                                                                const newOptions = (editingAttribute?.options || []).filter((_: string, i: number) => i !== index);
                                                                setEditingAttribute(editingAttribute ? {...editingAttribute, options: newOptions} : null);
                                                            }}
                                                            className="bg-red-500 text-white hover:bg-red-600 px-3"
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button 
                                                    onClick={() => {
                                                        const newOptions = [...(editingAttribute?.options || []), ''];
                                                        setEditingAttribute(editingAttribute ? {...editingAttribute, options: newOptions} : null);
                                                    }}
                                                    className="bg-green-500 text-white hover:bg-green-600"
                                                >
                                                    Add Option
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h6 className="font-medium text-gray-900 dark:text-white">{attribute.name}</h6>
                                        <p className="text-sm text-gray-500">Type: {attribute.type}</p>
                                        {attribute.type === 'select' && attribute.options && (
                                            <p className="text-sm text-gray-500">Options: {attribute.options.join(', ')}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            onClick={() => setEditingAttribute(attribute)}
                                            className="bg-blue-500 text-white hover:bg-blue-600"
                                        >
                                            Edit
                                        </Button>
                                        <Button 
                                            onClick={() => handleDelete(attribute.id)}
                                            className="bg-red-500 text-white hover:bg-red-600"
                                            disabled={loadingId === attribute.id}
                                        >
                                            {loadingId === attribute.id ? 'Deleting...' : 'Delete'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
} 