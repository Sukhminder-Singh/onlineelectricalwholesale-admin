import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { LoadingSpinner, LoadingOverlay, SkeletonTable } from "../../components/ui/loading";
import { stateApi, countryApi, State, Country } from "../../services/api";
import { showSuccessToast, showErrorToast } from "../../components/ui/toast";

export default function StateList() {
    const [states, setStates] = useState<State[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        country: ""
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [stateData, countryData] = await Promise.all([
                    stateApi.getAll(),
                    countryApi.getAll()
                ]);
                setStates(stateData);
                setCountries(countryData);
            } catch (error) {
                // handle error
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleEdit = (state: State) => {
        setFormData({ name: state.name || "", code: state.code || "", country: typeof state.country === 'object' ? state.country._id || "" : state.country || "" });
        setEditingId(state._id || null);
    };

    const handleDelete = async (id: string | undefined) => {
        if (!id) return;
        try {
            await stateApi.delete(id);
            setStates(prev => prev.filter(s => s._id !== id));
            if (editingId === id) {
                setEditingId(null);
                setFormData({ name: "", code: "", country: "" });
            }
            showSuccessToast("State Deleted", "The state was deleted successfully.");
        } catch (error) {
            showErrorToast("Delete Failed", "Error deleting state.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingId) {
                const updated = await stateApi.update(editingId, formData);
                setStates(prev => prev.map(s => s._id === editingId ? updated : s));
                setEditingId(null);
                showSuccessToast("State Updated", "The state was updated successfully.");
            } else {
                const newState = await stateApi.create({ name: formData.name, code: formData.code, country: formData.country });
                setStates(prev => [...prev, newState]);
                showSuccessToast("State Added", "The state was added successfully.");
            }
            setFormData({ name: "", code: "", country: "" });
        } catch (error) {
            showErrorToast("Save Failed", "Error saving state.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setFormData({ name: "", code: "", country: "" });
    };

    return (
        <>
            <PageBreadcrumb pageTitle="State Management" />
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="space-y-6">
                    <ComponentCard title="States List">
                        <LoadingOverlay isLoading={isLoading} text="Loading states...">
                            {isLoading ? (
                                <SkeletonTable rows={5} columns={3} />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full table-auto">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Name</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Code</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Country</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {states.length === 0 ? (
                                                <tr><td colSpan={4} className="text-center py-6 text-gray-500">No states found.</td></tr>
                                            ) : states.map((state) => (
                                                <tr key={state._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="py-3 px-4">{state.name}</td>
                                                    <td className="py-3 px-4">{state.code}</td>
                                                    <td className="py-3 px-4">{typeof state.country === 'object' ? state.country.name : state.country}</td>
                                                    <td className="py-3 px-4">
                                                        <button onClick={() => handleEdit(state)} className="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                                                        <button onClick={() => handleDelete(state._id)} className="text-red-600 hover:text-red-800">Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </LoadingOverlay>
                    </ComponentCard>
                </div>
                <div className="space-y-6">
                    <ComponentCard title="Add State">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="stateName">State Name</Label>
                                <Input 
                                    type="text" 
                                    id="stateName" 
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    placeholder="Enter state name"
                                />
                            </div>
                            <div>
                                <Label htmlFor="stateCode">State Code</Label>
                                <Input 
                                    type="text" 
                                    id="stateCode" 
                                    value={formData.code}
                                    onChange={(e) => handleInputChange("code", e.target.value)}
                                    placeholder="Enter state code (e.g., CA)"
                                />
                            </div>
                            <div>
                                <Label htmlFor="country">Country</Label>
                                <select
                                    id="country"
                                    value={formData.country}
                                    onChange={(e) => handleInputChange("country", e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value="">Select country</option>
                                    {countries.map((country) => (
                                        <option key={country._id} value={country._id}>{country.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-5">
                                <Button size="sm" variant="primary" disabled={isSubmitting}>
                                    {isSubmitting ? (editingId ? <>Updating...</> : <>Adding...</>) : (editingId ? 'Update' : 'Submit')}
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleReset} disabled={isSubmitting}>
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