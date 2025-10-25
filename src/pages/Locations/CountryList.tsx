import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { LoadingOverlay, SkeletonTable } from "../../components/ui/loading";
import { useLoading } from "../../context/LoadingContext";
import { countryApi, Country } from "../../services/api";
import { showSuccessToast, showErrorToast } from "../../components/ui/toast";

export default function CountryList() {
    const [countries, setCountries] = useState<Country[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        code: ""
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showLoading, hideLoading } = useLoading();
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        const loadCountries = async () => {
            try {
                setIsLoading(true);
                const data = await countryApi.getAll();
                setCountries(data);
            } catch (error) {
                showLoading('Error loading countries', 'danger');
                setTimeout(() => hideLoading(), 3000);
            } finally {
                setIsLoading(false);
            }
        };
        loadCountries();
    }, []);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleEdit = (country: Country) => {
        setFormData({ name: country.name || "", code: country.code || "" });
        setEditingId(country._id || null);
    };

    const handleDelete = async (id: string | undefined) => {
        if (!id) return;
        try {
            await countryApi.delete(id);
            setCountries(prev => prev.filter(c => c._id !== id));
            if (editingId === id) {
                setEditingId(null);
                setFormData({ name: "", code: "" });
            }
            showSuccessToast("Country Deleted", "The country was deleted successfully.");
        } catch (error) {
            showErrorToast("Delete Failed", "Error deleting country.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingId) {
                const updated = await countryApi.update(editingId, formData);
                setCountries(prev => prev.map(c => c._id === editingId ? updated : c));
                setEditingId(null);
                showSuccessToast("Country Updated", "The country was updated successfully.");
            } else {
                const newCountry = await countryApi.create({ name: formData.name, code: formData.code });
                setCountries(prev => [...prev, newCountry]);
                showSuccessToast("Country Added", "The country was added successfully.");
            }
            setFormData({ name: "", code: "" });
        } catch (error) {
            showErrorToast("Save Failed", "Error saving country.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setFormData({ name: "", code: "" });
    };

    return (
        <>
            <PageBreadcrumb pageTitle="Country Management" />
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="space-y-6">
                    <ComponentCard title="Countries List">
                        <LoadingOverlay isLoading={isLoading} text="Loading countries...">
                            {isLoading ? (
                                <SkeletonTable rows={5} columns={3} />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full table-auto">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Name</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Code</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {countries.length === 0 ? (
                                                <tr><td colSpan={3} className="text-center py-6 text-gray-500">No countries found.</td></tr>
                                            ) : countries.map((country) => (
                                                <tr key={country._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="py-3 px-4">{country.name}</td>
                                                    <td className="py-3 px-4">{country.code}</td>
                                                    <td className="py-3 px-4">
                                                        <button onClick={() => handleEdit(country)} className="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                                                        <button onClick={() => handleDelete(country._id)} className="text-red-600 hover:text-red-800">Delete</button>
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
                    <ComponentCard title="Add Country">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="countryName">Country Name</Label>
                                <Input 
                                    type="text" 
                                    id="countryName" 
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    placeholder="Enter country name"
                                />
                            </div>
                            <div>
                                <Label htmlFor="countryCode">Country Code</Label>
                                <Input 
                                    type="text" 
                                    id="countryCode" 
                                    value={formData.code}
                                    onChange={(e) => handleInputChange("code", e.target.value)}
                                    placeholder="Enter country code (e.g., US)"
                                />
                            </div>
                            <div className="flex items-center gap-5">
                                <Button 
                                    size="sm" 
                                    variant="primary" 
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (editingId ? <>Updating...</> : <>Adding...</>) : (editingId ? 'Update' : 'Submit')}
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={handleReset}
                                    disabled={isSubmitting}
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