import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { LoadingSpinner, LoadingOverlay, SkeletonTable } from "../../components/ui/loading";
import { cityApi, stateApi, countryApi, City, State, Country } from "../../services/api";
import { showSuccessToast, showErrorToast } from "../../components/ui/toast";

export default function ZipcodeList() {
    const [cities, setCities] = useState<City[]>([]);
    const [states, setStates] = useState<State[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        state: ""
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [cityData, stateData, countryData] = await Promise.all([
                    cityApi.getAll(),
                    stateApi.getAll(),
                    countryApi.getAll()
                ]);
                setCities(cityData);
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

    const handleEdit = (city: City) => {
        setFormData({ name: city.name || "", code: city.code || "", state: typeof city.state === 'object' ? city.state._id || "" : city.state || "" });
        setEditingId(city._id || null);
    };

    const handleDelete = async (id: string | undefined) => {
        if (!id) return;
        try {
            await cityApi.delete(id);
            setCities(prev => prev.filter(c => c._id !== id));
            if (editingId === id) {
                setEditingId(null);
                setFormData({ name: "", code: "", state: "" });
            }
            showSuccessToast("City Deleted", "The city was deleted successfully.");
        } catch (error) {
            showErrorToast("Delete Failed", "Error deleting city.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.state) {
            showErrorToast("Validation Error", "Please select a state.");
            return;
        }
        setIsSubmitting(true);
        try {
            if (editingId) {
                const updated = await cityApi.update(editingId, formData);
                setCities(prev => prev.map(c => c._id === editingId ? updated : c));
                setEditingId(null);
                showSuccessToast("City Updated", "The city was updated successfully.");
            } else {
                const newCity = await cityApi.create({ name: formData.name, code: formData.code, state: formData.state });
                setCities(prev => [...prev, newCity]);
                setFormData({ name: "", code: "", state: "" });
                showSuccessToast("City Added", "The city was added successfully.");
            }
        } catch (error) {
            showErrorToast("Save Failed", "Error saving city.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setFormData({ name: "", code: "", state: "" });
    };

    return (
        <>
            <PageBreadcrumb pageTitle="City Management" />
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="space-y-6">
                    <ComponentCard title="Cities List">
                        <LoadingOverlay isLoading={isLoading} text="Loading cities...">
                            {isLoading ? (
                                <SkeletonTable rows={5} columns={3} />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full table-auto">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Name</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Code</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">State</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cities.length === 0 ? (
                                                <tr><td colSpan={4} className="text-center py-6 text-gray-500">No cities found.</td></tr>
                                            ) : cities.map((city) => (
                                                <tr key={city._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="py-3 px-4">{city.name}</td>
                                                    <td className="py-3 px-4">{city.code}</td>
                                                    <td className="py-3 px-4">{city.state && typeof city.state === 'object' && city.state.name ? city.state.name : (typeof city.state === 'string' ? city.state : '')}</td>
                                                    <td className="py-3 px-4">
                                                        <button onClick={() => handleEdit(city)} className="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                                                        <button onClick={() => handleDelete(city._id)} className="text-red-600 hover:text-red-800">Delete</button>
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
                    <ComponentCard title="Add City">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="cityName">City Name</Label>
                                <Input 
                                    type="text" 
                                    id="cityName" 
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    placeholder="Enter city name"
                                />
                            </div>
                            <div>
                                <Label htmlFor="cityCode">City Code</Label>
                                <Input 
                                    type="text" 
                                    id="cityCode" 
                                    value={formData.code}
                                    onChange={(e) => handleInputChange("code", e.target.value)}
                                    placeholder="Enter city code (e.g., NYC)"
                                />
                            </div>
                            <div>
                                <Label htmlFor="state">State</Label>
                                <select
                                    id="state"
                                    value={formData.state}
                                    onChange={(e) => handleInputChange("state", e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value="">Select state</option>
                                    {states.map((state) => (
                                        <option key={state._id} value={state._id}>{state.name}</option>
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