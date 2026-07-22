'use client';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { Select } from '@/components/base/select/select';
import { Tabs } from '@/components/application/tabs/tabs';
import { SearchLg, Users01 as Users, Building01 as Building, X } from '@untitledui/icons';
import Navbar from '@/components/navbar';

import { useNetworkFilters } from './hooks/useNetworkFilters';
import { useInteractionHandlers } from './hooks/useInteractionHandlers';
import { useNetworkApi, useNetworkActions } from './hooks/useNetworkApi';
import { allIntentionOptions, roleOptions, sortOptions } from './lib/constants';
import type { Person, Startup } from './types';

import PersonCard from './components/PersonCard';
import { ConnectionRequestsQueue } from './components/ConnectionRequestsQueue';
import StartupCard from './components/StartupCard';
import ActivityFeed from './components/ActivityFeed';
import CardSkeleton from './components/CardSkeleton';

const NetworkPage = () => {
    const [visibleCount, setVisibleCount] = useState(8);
    const [loadingMore, setLoadingMore] = useState(false);
    const loadMoreRef = useRef(null);

    const filters = useNetworkFilters();
    const interactions = useInteractionHandlers();
    const networkApi = useNetworkApi({
      view: filters.networkView,
      subView: filters.networkSubView,
      search: filters.searchQuery,
      intention: filters.intentionFilter,
      role: filters.roleFilter,
      location: filters.locationFilter,
      sort: filters.sortBy,
      limit: 20,
      offset: 0,
    });
    const _networkActions = useNetworkActions();

    useEffect(() => {
        setVisibleCount(8);
    }, [filters.activeTab, filters.networkView, filters.searchQuery, filters.intentionFilter, filters.roleFilter, filters.locationFilter, filters.sortBy]);

    const handleClearFilters = () => {
        filters.clearFilters();
        interactions.notifyFiltersCleared();
    };
    
    const handleIntentionClick = useCallback((category: string) => {
        filters.setIntentionFilter(category);
    }, [filters.setIntentionFilter]);

    // Use API data directly - filtering is done server-side
    const filteredPeople = useMemo(() => {
        return networkApi.people;
    }, [networkApi.people]);

    // Use API data directly - filtering is done server-side
    const filteredStartups = useMemo(() => {
        return networkApi.startups;
    }, [networkApi.startups]);

    const currentList = filters.activeTab === 'people' ? filteredPeople : filteredStartups;

    // Nombre réel de connexions acceptées dans la liste chargée. Le Set
    // `interactions.connectedProfiles` est un stub resté vide depuis le retrait
    // de l'endpoint relationships : il affichait toujours 0. (Le total exact
    // au-delà de la page chargée dépend du fix pagination réseau.)
    const connectedProfilesCount = useMemo(
        () => networkApi.people.filter((p) => p.relationStatus === 'ACCEPTED').length,
        [networkApi.people],
    );

    const handleLoadMore = () => {
        setLoadingMore(true);
        setTimeout(() => {
            setVisibleCount(prev => prev + 8);
            setLoadingMore(false);
        }, 1000);
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loadingMore && currentList.length > visibleCount) {
                    handleLoadMore();
                }
            },
            { rootMargin: "200px" }
        );

        const currentRef = loadMoreRef.current;
        if (currentRef) observer.observe(currentRef);
        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, [loadingMore, currentList, visibleCount]);
    
    const networkViewTabs = [{ id: 'discover', label: 'Découvrir', icon: SearchLg }, { id: 'network', label: 'Mon réseau', icon: Users }];
    const activeTabTabs = [{ id: 'people', label: 'Personnes', icon: Users }, { id: 'startups', label: 'Startups', icon: Building }];

    return (
        <div className="min-h-screen bg-[#FCFCFD]">
            <div className="w-full max-w-screen-xl mx-auto"><Navbar /></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-2xl font-bold text-[#101828]">{filters.networkView === 'discover' ? 'Découvrir' : 'Mon réseau'} OneFive</h1>
                            <p className="text-[#475467] mt-1">
                                {filters.networkView === 'discover' 
                                    ? 'Découvrez de nouveaux entrepreneurs, mentors et opportunités' 
                                    : `Votre réseau compte ${filters.activeTab === 'people' ? connectedProfilesCount : filteredStartups.length} ${filters.activeTab === 'people' ? 'connexion' : 'startup'}${(filters.activeTab === 'people' ? connectedProfilesCount : filteredStartups.length) > 1 ? 's' : ''}`
                                }
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Tabs selectedKey={filters.networkView} onSelectionChange={(key) => filters.setNetworkView(key as 'discover' | 'network')}>
                                <Tabs.List type="button-minimal" items={networkViewTabs}>
                                    {(tab) => (
                                        <Tabs.Item key={tab.id}>
                                            {tab.label}
                                        </Tabs.Item>
                                    )}
                                </Tabs.List>
                            </Tabs>
                            <Tabs selectedKey={filters.activeTab} onSelectionChange={(key) => filters.setActiveTab(key as 'people' | 'startups')}>
                                <Tabs.List type="button-minimal" items={activeTabTabs}>
                                    {(tab) => (
                                        <Tabs.Item key={tab.id}>
                                            {tab.label}
                                        </Tabs.Item>
                                    )}
                                </Tabs.List>
                            </Tabs>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="relative flex-1">
                            <div className="w-full md:w-80">
                                <Input shortcut size="sm" aria-label="Search" placeholder={filters.networkView === 'discover' ? "Rechercher des profils, startups..." : "Rechercher dans votre réseau..."} icon={SearchLg} value={filters.searchQuery} onChange={(e: any) => filters.handleSearchChange(e.target.value)} />
                            </div>
                            {filters.searchQuery && <div className="absolute top-full left-0 mt-2 text-sm text-[#475467]"><span>{currentList.length} résultat{currentList.length > 1 ? 's' : ''}</span></div>}
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}><Select selectedKey={filters.intentionFilter} onSelectionChange={(key) => filters.setIntentionFilter(key as string)} placeholder="Intention" items={allIntentionOptions} size="sm">{(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}</Select></motion.div>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}><Select selectedKey={filters.roleFilter} onSelectionChange={(key) => filters.setRoleFilter(key as string)} placeholder="Rôle" items={roleOptions} size="sm">{(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}</Select></motion.div>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <input
                                    type="text"
                                    placeholder="Ville (ex: Paris, Lyon...)"
                                    defaultValue={filters.locationFilter === 'all' ? '' : filters.locationFilter}
                                    onChange={(e) => filters.setLocationFilter(e.target.value.trim() === '' ? 'all' : e.target.value)}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}><Select selectedKey={filters.sortBy} onSelectionChange={(key) => filters.setSortBy(key as string)} placeholder="Trier par" items={sortOptions} size="sm">{(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}</Select></motion.div>
                            <AnimatePresence>{filters.hasActiveFilters && <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><Button color="tertiary" onClick={handleClearFilters} iconLeading={<motion.div animate={{ rotate: [0, 90, 180] }} transition={{ duration: 0.3 }}><X className="h-4 w-4" data-icon /></motion.div>} className="hover:bg-red-50 hover:text-red-600 transition-colors">Effacer</Button></motion.div>}</AnimatePresence>
                        </div>
                    </div>
                </div>

                {filters.networkView === 'network' && filters.activeTab === 'people' && (
                    <div className="mb-6 w-fit">
                        <Tabs selectedKey={filters.networkSubView} onSelectionChange={(key) => filters.setNetworkSubView(key as any)}>
                            <Tabs.List type="button-minimal" items={[{ id: 'connections', label: `Mes Connexions (${connectedProfilesCount})` }, { id: 'feed', label: "Flux d'activité" }]}>
                                {(tab) => <Tabs.Item key={tab.id}>{tab.label}</Tabs.Item>}
                            </Tabs.List>
                        </Tabs>
                    </div>
                )}

                {filters.activeTab === 'people' && <ConnectionRequestsQueue />}

                <div className={filters.networkView === 'network' && filters.activeTab === 'people' && filters.networkSubView === 'feed' ? 'w-full' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'}>
                    {networkApi.loading ? (
                        Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)
                    ) : (
                        <>
                            {filters.networkView === 'network' && filters.activeTab === 'people' && filters.networkSubView === 'feed' ? (
                                <ActivityFeed activities={networkApi.activity} />
                            ) : (
                                currentList.slice(0, visibleCount).map((item) => (
                                    filters.activeTab === 'people' ? (
                                        <PersonCard key={item.id} person={item as Person} networkView={filters.networkView} pendingRequests={interactions.pendingOutgoing} followedProfiles={interactions.followedProfiles} handleConnect={interactions.handleConnect} handleFollow={interactions.handleFollow} searchQuery={filters.searchQuery} intentionFilter={filters.intentionFilter} roleFilter={filters.roleFilter} locationFilter={filters.locationFilter} />
                                    ) : (
                                        <StartupCard key={item.id} startup={item as Startup} handleFollowStartup={interactions.handleFollowStartup} searchQuery={filters.searchQuery} handleIntentionClick={handleIntentionClick} />
                                    )
                                ))
                            )}
                        </>
                    )}
                </div>

                {!networkApi.loading && currentList.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="animate-pulse"><SearchLg className="h-16 w-16 mx-auto text-gray-300 mb-4" /></div>
                        <h2 className="text-xl font-semibold text-[#101828]">{filters.networkView === 'network' && !filters.hasActiveFilters ? `Votre réseau est vide` : `Aucun résultat`}</h2>
                        <p className="text-[#475467] mt-2">{filters.networkView === 'network' && !filters.hasActiveFilters ? `Explorez l'onglet "Découvrir" pour suivre des ${filters.activeTab === 'people' ? 'personnes' : 'startups'}.` : "Essayez de modifier vos filtres pour voir plus de résultats."}</p>
                    </div>
                )}

                {!networkApi.loading && currentList.length > visibleCount && (
                    <div ref={loadMoreRef} className="mt-8">
                        {loadingMore ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <CardSkeleton key={`load-more-${i}`} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center">
                                <Button onClick={handleLoadMore}>Charger plus</Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NetworkPage;

