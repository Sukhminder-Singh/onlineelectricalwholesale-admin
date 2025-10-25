import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { attributeApi, Attribute, AttributeStats } from '../services/api';

interface AttributeContextType {
    availableAttributes: Attribute[];
    stats: AttributeStats | null;
    loading: boolean;
    error: string | null;
    setAvailableAttributes: (attributes: Attribute[]) => void;
    addAttribute: (attribute: Omit<Attribute, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateAttribute: (id: string, attribute: Partial<Attribute>) => Promise<void>;
    deleteAttribute: (id: string) => Promise<void>;
    toggleAttributeStatus: (id: string) => Promise<void>;
    updateAttributeOrder: (attributes: Array<{ id: string; order: number }>) => Promise<void>;
    bulkUpdateAttributes: (attributes: Attribute[]) => Promise<void>;
    refreshAttributes: () => Promise<void>;
    refreshStats: () => Promise<void>;
}

const AttributeContext = createContext<AttributeContextType | undefined>(undefined);

interface AttributeProviderProps {
    children: ReactNode;
}

export const AttributeProvider: React.FC<AttributeProviderProps> = ({ children }) => {
    const [availableAttributes, setAvailableAttributes] = useState<Attribute[]>([]);
    const [stats, setStats] = useState<AttributeStats | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAttributes = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const attributes = await attributeApi.getAll({ sortBy: 'order', sortOrder: 'asc' });
            // Ensure attributes is always an array
            setAvailableAttributes(Array.isArray(attributes) ? attributes : []);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch attributes';
            setError(errorMessage);
            console.error('Error fetching attributes:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            console.log('Fetching attribute stats...');
            const statsData = await attributeApi.getStats();
            console.log('Attribute stats received:', statsData);
            setStats(statsData);
        } catch (err) {
            console.error('Error fetching attribute stats:', err);
            // Set default stats on error
            setStats({
                total: 0,
                active: 0,
                inactive: 0,
                byType: {
                    text: 0,
                    number: 0,
                    select: 0
                }
            });
        }
    };

    useEffect(() => {
        fetchAttributes();
        fetchStats();
    }, []);

    const addAttribute = async (attribute: Omit<Attribute, '_id' | 'createdAt' | 'updatedAt'>) => {
        try {
            setError(null);
            const newAttribute = await attributeApi.create(attribute);
            setAvailableAttributes(prev => [...prev, newAttribute]);
            await fetchStats(); // Refresh stats after adding
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add attribute');
            throw err;
        }
    };

    const updateAttribute = async (id: string, updatedAttribute: Partial<Attribute>) => {
        try {
            setError(null);
            const updated = await attributeApi.update(id, updatedAttribute);
            setAvailableAttributes(prev => 
                prev.map(attr => attr._id === id ? updated : attr)
            );
            await fetchStats(); // Refresh stats after updating
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update attribute');
            throw err;
        }
    };

    const deleteAttribute = async (id: string) => {
        try {
            setError(null);
            await attributeApi.delete(id);
            setAvailableAttributes(prev => prev.filter(attr => attr._id !== id));
            await fetchStats(); // Refresh stats after deleting
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete attribute');
            throw err;
        }
    };

    const toggleAttributeStatus = async (id: string) => {
        try {
            setError(null);
            const updated = await attributeApi.toggleStatus(id);
            setAvailableAttributes(prev => 
                prev.map(attr => attr._id === id ? updated : attr)
            );
            await fetchStats(); // Refresh stats after toggling
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to toggle attribute status');
            throw err;
        }
    };

    const updateAttributeOrder = async (attributes: Array<{ id: string; order: number }>) => {
        try {
            setError(null);
            await attributeApi.updateOrder({ attributes });
            await fetchAttributes(); // Refresh the list to get updated order
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update attribute order');
            throw err;
        }
    };

    const bulkUpdateAttributes = async (attributes: Attribute[]) => {
        try {
            setError(null);
            await attributeApi.bulkUpdate(attributes);
            await fetchAttributes(); // Refresh the list
            await fetchStats(); // Refresh stats
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to bulk update attributes');
            throw err;
        }
    };

    const refreshAttributes = async () => {
        await fetchAttributes();
    };

    const refreshStats = async () => {
        await fetchStats();
    };

    const value: AttributeContextType = {
        availableAttributes,
        stats,
        loading,
        error,
        setAvailableAttributes,
        addAttribute,
        updateAttribute,
        deleteAttribute,
        toggleAttributeStatus,
        updateAttributeOrder,
        bulkUpdateAttributes,
        refreshAttributes,
        refreshStats
    };

    return (
        <AttributeContext.Provider value={value}>
            {children}
        </AttributeContext.Provider>
    );
};

export const useAttributes = (): AttributeContextType => {
    const context = useContext(AttributeContext);
    if (context === undefined) {
        throw new Error('useAttributes must be used within an AttributeProvider');
    }
    return context;
}; 