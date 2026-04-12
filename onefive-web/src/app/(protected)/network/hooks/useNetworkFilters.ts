import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export const useNetworkFilters = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [activeTab, setActiveTab] = useState<'people' | 'startups'>(() => (searchParams.get('tab') as 'people' | 'startups') || 'people');
    const [networkView, setNetworkView] = useState<'discover' | 'network'>(() => (searchParams.get('view') as 'discover' | 'network') || 'discover');
    const [networkSubView, setNetworkSubView] = useState<'feed' | 'connections'>('connections');
    const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
    const [intentionFilter, setIntentionFilter] = useState(() => searchParams.get('intention') || 'all');
    const [roleFilter, setRoleFilter] = useState(() => searchParams.get('role') || 'all');
    const [locationFilter, setLocationFilter] = useState(() => searchParams.get('location') || 'all');
    const [sortBy, setSortBy] = useState(() => searchParams.get('sort') || 'recent');
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        const setParam = (key: string, value: string, defaultValue: string) => {
            if (value !== defaultValue) params.set(key, value);
            else params.delete(key);
        };

        setParam('tab', activeTab, 'people');
        setParam('view', networkView, 'discover');
        setParam('q', searchQuery, '');
        setParam('intention', intentionFilter, 'all');
        setParam('role', roleFilter, 'all');
        setParam('location', locationFilter, 'all');
        setParam('sort', sortBy, 'recent');

        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [activeTab, networkView, searchQuery, intentionFilter, roleFilter, locationFilter, sortBy, pathname, router, searchParams]);

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        if (value.length > 0) {
            if (!isSearching) setIsSearching(true);
        } else {
            if (isSearching) setIsSearching(false);
        }
    };

    useEffect(() => {
        if (searchQuery.length > 0) {
            const debounce = setTimeout(() => setIsSearching(false), 500);
            return () => clearTimeout(debounce);
        }
    }, [searchQuery]);

    const clearFilters = () => {
        setSearchQuery('');
        setIntentionFilter('all');
        setRoleFilter('all');
        setLocationFilter('all');
        setSortBy('recent');
    };

    return {
        activeTab, setActiveTab,
        networkView, setNetworkView,
        networkSubView, setNetworkSubView,
        searchQuery, setSearchQuery, handleSearchChange,
        intentionFilter, setIntentionFilter,
        roleFilter, setRoleFilter,
        locationFilter, setLocationFilter,
        sortBy, setSortBy,
        isSearching,
        clearFilters,
        hasActiveFilters: searchQuery || intentionFilter !== 'all' || roleFilter !== 'all' || locationFilter !== 'all' || sortBy !== 'recent',
    };
}; 