import { useState, useCallback } from 'react';

export const useFilters = (onFilterChange?: () => void) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterFormation, setFilterFormation] = useState('all');
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

    const handleSearchChange = useCallback((val: string) => {
        setSearchQuery(val);
        if (onFilterChange) onFilterChange();
    }, [onFilterChange]);

    const handleFormationChange = useCallback((val: string) => {
        setFilterFormation(val);
        if (onFilterChange) onFilterChange();
    }, [onFilterChange]);

    return {
        searchQuery,
        setSearchQuery: handleSearchChange,
        filterFormation,
        setFilterFormation: handleFormationChange,
        viewMode,
        setViewMode
    };
};
