import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import AttributeManager from "./AttributeManager";
import { useAttributes } from "../../../context/AttributeContext";
import LoadingSpinner from "../../../components/ui/loading/LoadingSpinner";
import { showSuccessToast } from "../../../components/ui/toast";
import { AttributeProvider } from '../../../context/AttributeContext';

export default function AttributeManagementPageWrapper() {
  return (
    <AttributeProvider>
      <AttributeManagementPage />
    </AttributeProvider>
  );
}

function AttributeManagementPage() {
    const {
        availableAttributes,
        stats,
        loading,
        error,
        addAttribute,
        updateAttribute,
        deleteAttribute,
        refreshAttributes,
        refreshStats
    } = useAttributes();

    // Ensure availableAttributes is always an array
    const safeAttributes = Array.isArray(availableAttributes) ? availableAttributes : [];

    // Before passing to AttributeManager
    const mappedAttributes = safeAttributes.map(attr => ({
        ...attr,
        id: attr._id // add id field for frontend compatibility
    }));

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
                <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h3 className="text-sm font-medium text-red-900 dark:text-red-100">Error Loading Attributes</h3>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                        <button
                            onClick={() => { refreshAttributes(); refreshStats(); }}
                            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <PageBreadcrumb pageTitle="Attribute Management" />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] lg:p-8">
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10">
                                <svg className="h-6 w-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product Attributes</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Manage product specifications and properties</p>
                            </div>
                        </div>
                        <div className="rounded-xl border border-blue-light-200 bg-blue-light-50 p-4 dark:border-blue-light-500/20 dark:bg-blue-light-500/10">
                            <div className="flex items-start gap-3">
                                <svg className="h-5 w-5 text-blue-light-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h3 className="text-sm font-medium text-blue-light-900 dark:text-blue-light-100">How it works</h3>
                                    <p className="text-sm text-blue-light-700 dark:text-blue-light-300 mt-1">
                                        Create and manage product attributes that will be available across all products.
                                        These attributes help categorize and describe products with consistent specifications.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <AttributeManager
                        availableAttributes={mappedAttributes}
                        onAdd={async (attr) => {
                            await addAttribute(attr);
                            await refreshAttributes();
                            await refreshStats();
                            showSuccessToast('Attribute Added', 'The attribute was added successfully.');
                        }}
                        onUpdate={async (id, attr) => {
                            await updateAttribute(id, attr);
                            await refreshAttributes();
                            await refreshStats();
                            showSuccessToast('Attribute Updated', 'The attribute was updated successfully.');
                        }}
                        onDelete={async (id) => {
                            await deleteAttribute(id);
                            await refreshAttributes();
                            await refreshStats();
                            showSuccessToast('Attribute Deleted', 'The attribute was deleted successfully.');
                        }}
                    />
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] lg:p-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Attributes</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats?.total || safeAttributes.length}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All attribute types</p>
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-success-500/10">
                                <svg className="h-7 w-7 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] lg:p-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Attributes</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats?.active || safeAttributes.filter(attr => attr.isActive).length}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Currently in use</p>
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-500/10">
                                <svg className="h-7 w-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] lg:p-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Text Attributes</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats?.byType?.text || safeAttributes.filter(attr => attr.type === 'text').length}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Free text input</p>
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-light-500/10">
                                <svg className="h-7 w-7 text-blue-light-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] lg:p-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Select Attributes</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats?.byType?.select || safeAttributes.filter(attr => attr.type === 'select').length}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Dropdown options</p>
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-theme-purple-500/10">
                                <svg className="h-7 w-7 text-theme-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
} 