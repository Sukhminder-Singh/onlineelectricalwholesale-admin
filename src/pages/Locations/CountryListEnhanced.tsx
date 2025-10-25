import React, { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { 
    LoadingSpinner, 
    LoadingOverlay, 
    SkeletonTable, 
    SkeletonText,
    Skeleton,
    withLoading,
    useComponentLoading 
} from "../../components/ui/loading";
import { useDataFetching } from "../../hooks/useDataFetching";
import { useLoading } from "../../context/LoadingContext";
import { initialCountryData } from "./initialData";

export type CountryData = {
    id: string;
    name: string;
    code: string;
    phoneCode: string;
    currency: string;
    isActive: boolean;
    createdAt: string;
};

// Simulate API call with delay
const fetchCountries = async (): Promise<CountryData[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    return initialCountryData;
};

const saveCountry = async (country: Omit<CountryData, 'id' | 'createdAt'>): Promise<CountryData> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
        ...country,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
    };
};

// Enhanced CountryList with loading states
function CountryListEnhanced() {
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        phoneCode: "",
        currency: ""
    });

    const { showLoading, hideLoading } = useLoading();
    const { loading: componentLoading, withLoadingState } = useComponentLoading();

    // Use the data fetching hook with loading states
    const {
        data: countries = [],
        loading: dataLoading,
        error: dataError,
        refetch: refetchCountries,
        setData: setCountries
    } = useDataFetching(fetchCountries, {
        immediate: true,
        retryCount: 2,
        onSuccess: (data) => {
            console.log('Countries loaded successfully:', data.length);
        },
        onError: (error) => {
            console.error('Failed to load countries:', error);
        }
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const result = await withLoadingState(async () => {
            const newCountry = await saveCountry({
                name: formData.name,
                code: formData.code,
                phoneCode: formData.phoneCode,
                currency: formData.currency,
                isActive: true
            });
            
            setCountries([...(countries || []), newCountry]);
            setFormData({ name: "", code: "", phoneCode: "", currency: "" });
            
            return newCountry;
        });

        if (result) {
            showLoading('Country added successfully!', 'success');
            setTimeout(() => hideLoading(), 2000);
        }
    };

    const handleReset = () => {
        setFormData({ name: "", code: "", phoneCode: "", currency: "" });
    };

    const toggleActiveStatus = async (id: string) => {
        await withLoadingState(async () => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            setCountries((countries || []).map(country => 
                country.id === id ? { ...country, isActive: !country.isActive } : country
            ));
        });
    };

    const handleRefresh = async () => {
        await refetchCountries();
    };

    // Show skeleton while loading
    if (dataLoading) {
        return (
            <>
                <PageBreadcrumb pageTitle="Country Management" />
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <div className="space-y-6">
                        <ComponentCard title="Countries List">
                            <SkeletonTable rows={5} columns={6} />
                        </ComponentCard>
                    </div>
                    <div className="space-y-6">
                        <ComponentCard title="Add Country">
                            <div className="space-y-4">
                                <SkeletonText lines={4} />
                                <div className="flex items-center gap-5">
                                    <Skeleton width={80} height={32} />
                                    <Skeleton width={80} height={32} />
                                </div>
                            </div>
                        </ComponentCard>
                    </div>
                </div>
            </>
        );
    }

    // Show error state
    if (dataError) {
        return (
            <>
                <PageBreadcrumb pageTitle="Country Management" />
                <div className="flex items-center justify-center min-h-64">
                    <div className="text-center">
                        <div className="text-red-600 dark:text-red-400 mb-4">
                            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <h3 className="text-lg font-medium">Failed to load countries</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {dataError.message}
                        </p>
                        <Button onClick={handleRefresh} variant="primary">
                            Try Again
                        </Button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <PageBreadcrumb pageTitle="Country Management" />
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="space-y-6">
                    <ComponentCard title="Countries List">
                        <div className="flex items-center justify-between mb-4">
                            <span>Countries List</span>
                            <div className="flex items-center gap-2">
                                {dataLoading && <LoadingSpinner size="sm" />}
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={handleRefresh}
                                    disabled={dataLoading}
                                >
                                    Refresh
                                </Button>
                            </div>
                        </div>
                        <LoadingOverlay isLoading={dataLoading} text="Loading countries...">
                            <div className="overflow-x-auto">
                                <table className="w-full table-auto">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Name</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Code</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Phone Code</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Currency</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(countries || []).map((country) => (
                                            <tr key={country.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="py-3 px-4">{country.name}</td>
                                                <td className="py-3 px-4">{country.code}</td>
                                                <td className="py-3 px-4">{country.phoneCode}</td>
                                                <td className="py-3 px-4">{country.currency}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                        country.isActive 
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                    }`}>
                                                        {country.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <button
                                                        onClick={() => toggleActiveStatus(country.id)}
                                                        disabled={componentLoading}
                                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {componentLoading ? 'Updating...' : 'Toggle'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </LoadingOverlay>
                    </ComponentCard>
                </div>
                <div className="space-y-6">
                    <ComponentCard title="Add Country">
                        <LoadingOverlay isLoading={componentLoading} text="Adding country...">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="countryName">Country Name</Label>
                                    <Input 
                                        type="text" 
                                        id="countryName" 
                                        value={formData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        placeholder="Enter country name"
                                        disabled={componentLoading}
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
                                        disabled={componentLoading}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="phoneCode">Phone Code</Label>
                                    <Input 
                                        type="text" 
                                        id="phoneCode" 
                                        value={formData.phoneCode}
                                        onChange={(e) => handleInputChange("phoneCode", e.target.value)}
                                        placeholder="Enter phone code (e.g., +1)"
                                        disabled={componentLoading}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="currency">Currency</Label>
                                    <Input 
                                        type="text" 
                                        id="currency" 
                                        value={formData.currency}
                                        onChange={(e) => handleInputChange("currency", e.target.value)}
                                        placeholder="Enter currency (e.g., USD)"
                                        disabled={componentLoading}
                                    />
                                </div>
                                <div className="flex items-center gap-5">
                                    <Button 
                                        size="sm" 
                                        variant="primary"
                                        disabled={componentLoading}
                                    >
                                        {componentLoading ? (
                                            <>
                                                <LoadingSpinner size="sm" className="mr-2" />
                                                Adding...
                                            </>
                                        ) : (
                                            'Submit'
                                        )}
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={handleReset}
                                        disabled={componentLoading}
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </form>
                        </LoadingOverlay>
                    </ComponentCard>
                </div>
            </div>
        </>
    );
}

export default CountryListEnhanced; 