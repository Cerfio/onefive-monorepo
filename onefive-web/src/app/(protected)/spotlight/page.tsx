'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useInfiniteQuery, useQuery, useMutation } from '@tanstack/react-query';
import {
  listSpotlightFavorites,
  toggleSpotlightFavorite,
  getSpotlightSocialProof,
} from '@/queries/spotlightFavorites';
import { toast } from 'sonner';
import { LoadScript } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Share2, Filter, Loader2, Bookmark, Map, List, LayoutGrid, X } from 'lucide-react';
import { Button } from '@/components/base/buttons/button';
import { Badge } from '@/components/base/badges/badges';
import { Tooltip } from '@/components/base/tooltip/tooltip';

import { listSpotlight } from '@/queries/spotlight';
import { ProviderType, SpotType } from '@/sharing-enum/spotlight/spotlight.enum';
import Navbar from '@/components/navbar';

import onefiveLogo from '@/images/onefiveLogo.png';
import eventbriteLogo from '@/images/EventBriteLogo.webp';
import meetupLogo from '@/images/meetupLogo.png';

import {
  SpotlightFilters,
  SpotlightSearch,
  SpotlightMap,
  SpotlightNotifications,
  CardShimmer,
  CardEvent,
  CardIncubator,
  CardContest,
  CardCoworking
} from './components';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5 
       
    } 
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    transition: { duration: 0.3 } 
  }
};

const _headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6 
       
    } 
  }
};

const mapVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { 
      duration: 0.8 
       
    } 
  }
};

// Types
interface MapCenter {
  lat: number;
  lng: number;
}

interface PurpleIcon {
  url: string;
  scaledSize: google.maps.Size;
}

// Filtres disponibles avec améliorations
const _filterOptions = {
  dateRange: [
    { value: 'all', label: 'Toutes les dates' },
    { value: 'today', label: 'Aujourd\'hui' },
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'next-month', label: 'Mois prochain' }
  ],
  pricing: [
    { value: 'all', label: 'Tous les prix' },
    { value: 'free', label: 'Gratuit' },
    { value: 'paid', label: 'Payant' },
    { value: 'donation', label: 'Donation' }
  ],
  placeType: [
    { value: 'all', label: 'Tous les types' },
    { value: 'event', label: 'Événements' },
    { value: 'incubator', label: 'Incubateurs' },
    { value: 'coworking', label: 'Coworking' },
    { value: 'workshop', label: 'Ateliers' },
    { value: 'conference', label: 'Conférences' }
  ],
  sector: [
    { value: 'all', label: 'Tous les secteurs' },
    { value: 'tech', label: 'Tech' },
    { value: 'health', label: 'Santé' },
    { value: 'finance', label: 'Finance' },
    { value: 'green', label: 'GreenTech' },
    { value: 'education', label: 'Éducation' },
    { value: 'art', label: 'Art & Culture' },
    { value: 'social', label: 'Impact Social' }
  ],
  sortBy: [
    { value: 'recent', label: 'Plus récent' },
    { value: 'name', label: 'Nom (A-Z)' },
    { value: 'distance', label: 'Distance' },
    { value: 'popularity', label: 'Popularité' },
    { value: 'price', label: 'Prix' },
    { value: 'date', label: 'Date' }
  ],
  distance: [
    { value: '5', label: '5 km' },
    { value: '10', label: '10 km' },
    { value: '25', label: '25 km' },
    { value: '50', label: '50 km' },
    { value: '100', label: '100 km' }
  ]
};

// Utils optimisés
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const formatDateRange = (beginDateStr: string, endDateStr: string): string => {
  const beginDate = new Date(beginDateStr);
  const endDate = new Date(endDateStr);

  const dateOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };

  const userLocale = navigator.language;
  const formatter = new Intl.DateTimeFormat(userLocale, dateOptions);

  const beginDateString = formatter.format(beginDate);
  const endDateString = formatter.format(endDate);

  return `${beginDateString} - ${endDateString} (votre heure locale)`;
};

const findProviderImage = (provider: ProviderType): string | null => {
  switch (provider) {
    case ProviderType.ONEFIVE:
      return onefiveLogo.src;
    case ProviderType.EVENTBRITE:
      return eventbriteLogo.src;
    case ProviderType.MEETUP:
      return meetupLogo.src;
    default:
      return null;
  }
};

// Hook personnalisé pour l'intersection observer
const useIntersectionObserver = (callback: () => void, deps: any[] = []) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callback();
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current = observer;

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, deps);

  return targetRef;
};

const Spotlight = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [_isPending, startTransition] = useTransition();
  
  // État local avec synchronisation URL
  const [search, setSearch] = useState(() => searchParams.get('q') || '');
  const [purpleIcon, setPurpleIcon] = useState<PurpleIcon | null>(null);
  const [_isMapLoading, setIsMapLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  
  // Filtres avancés avec état URL
  const [dateFilter, setDateFilter] = useState(() => searchParams.get('date') || 'all');
  const [pricingFilter, setPricingFilter] = useState(() => searchParams.get('pricing') || 'all');
  const [typeFilter, setTypeFilter] = useState(() => searchParams.get('type') || 'all');
  const [sectorFilter, setSectorFilter] = useState(() => searchParams.get('sector') || 'all');
  const [sortBy, setSortBy] = useState(() => searchParams.get('sort') || 'recent');
  const [distanceFilter, setDistanceFilter] = useState(() => searchParams.get('distance') || '25');
  
  // États d'interaction
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const raw = localStorage.getItem('spotlight-favorites');
      return raw ? new Set<string>(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });
  type SavedSearch = {
    id: string;
    label: string;
    search: string;
    dateFilter: string;
    pricingFilter: string;
    typeFilter: string;
    sectorFilter: string;
  };
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('spotlight-saved-searches');
      return raw ? (JSON.parse(raw) as SavedSearch[]) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('spotlight-saved-searches', JSON.stringify(savedSearches));
    } catch {
      /* ignore */
    }
  }, [savedSearches]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [hoveredSpotId, setHoveredSpotId] = useState<string | null>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  // Onglet « Sauvegardés » : n'afficher que les spots mis en favori.
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchOnMapMove, setSearchOnMapMove] = useState(true);

  // Persist favorites across refreshes (localStorage = cache instantané).
  useEffect(() => {
    try {
      localStorage.setItem('spotlight-favorites', JSON.stringify([...favorites]));
    } catch {
      // ignore storage errors (quota / private mode)
    }
  }, [favorites]);

  // Source de vérité = backend (persistance cross-device + preuve sociale).
  const { data: serverFavorites } = useQuery({
    queryKey: ['spotlight-favorites'],
    queryFn: listSpotlightFavorites,
    staleTime: 1000 * 60 * 5,
  });
  useEffect(() => {
    if (serverFavorites) setFavorites(new Set(serverFavorites));
  }, [serverFavorites]);

  const toggleFavoriteMut = useMutation({ mutationFn: toggleSpotlightFavorite });
  
  const [mapCenter, setMapCenter] = useState<MapCenter>({
    lat: searchParams.get('lat') ? parseFloat(searchParams.get('lat') as string) : 48.833395046212416,
    lng: searchParams.get('lng') ? parseFloat(searchParams.get('lng') as string) : 2.3718554331289976
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const getDateRangeForFilter = useCallback(
    (value: string): { beginDate?: string; endDate?: string } => {
      if (value === 'all') return {};

      const now = new Date();
      const start = new Date(now);
      const end = new Date(now);

      if (value === 'today') {
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
      } else if (value === 'week') {
        end.setDate(end.getDate() + 7);
      } else if (value === 'month') {
        end.setMonth(end.getMonth() + 1);
      } else if (value === 'next-month') {
        start.setMonth(start.getMonth() + 1);
        end.setMonth(end.getMonth() + 2);
      } else {
        return {};
      }

      return {
        beginDate: start.toISOString(),
        endDate: end.toISOString(),
      };
    },
    []
  );

  // Synchronisation avec l'URL optimisée
  useEffect(() => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      const setParam = (key: string, value: string, defaultValue: string) => {
        if (value !== defaultValue) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      };

      setParam('q', search, '');
      setParam('date', dateFilter, 'all');
      setParam('pricing', pricingFilter, 'all');
      setParam('type', typeFilter, 'all');
      setParam('sector', sectorFilter, 'all');
      setParam('sort', sortBy, 'recent');
      setParam('distance', distanceFilter, '25');
      setParam('lat', mapCenter.lat.toString(), '48.833395046212416');
      setParam('lng', mapCenter.lng.toString(), '2.3718554331289976');
      
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [search, dateFilter, pricingFilter, typeFilter, sectorFilter, sortBy, distanceFilter, mapCenter, pathname, router, searchParams]);

  // Query avec pagination infinie
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['spotlight', mapCenter.lat, mapCenter.lng, dateFilter, pricingFilter, typeFilter, sectorFilter, sortBy, distanceFilter],
    queryFn: ({ pageParam = 0 }) =>
      listSpotlight({
        latitude: mapCenter.lat,
        longitude: mapCenter.lng,
        take: 10,
        skip: pageParam as number,
        ...(typeFilter !== 'all' ? { spot: [typeFilter] } : {}),
        ...(sectorFilter !== 'all' ? { expertiseDomains: [sectorFilter] } : {}),
        ...(pricingFilter !== 'all' ? { cost: [pricingFilter] } : {}),
        ...getDateRangeForFilter(dateFilter),
      }),
    getNextPageParam: (lastPage, allPages) => {
      // Logique pour déterminer s'il y a une page suivante
      return lastPage.payload && lastPage.payload.length === 10 ? allPages.length * 10 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Intersection observer pour la pagination infinie
  const loadMoreRef = useIntersectionObserver(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage]);

  // Sauvegarder les recherches récentes
  useEffect(() => {
    if (search && !recentSearches.includes(search)) {
      setRecentSearches(prev => [search, ...prev.slice(0, 4)]);
    }
  }, [search]);

  // Only request geolocation when no lat/lng provided in URL (avoids overwriting shared links)
  useEffect(() => {
    const hasUrlCoords = searchParams.get('lat') && searchParams.get('lng');
    if (hasUrlCoords) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMapCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error('Geolocation error:', error.code, error.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000
      }
    );
  }, []);

  // Handlers optimisés avec useCallback
  const handlePlaceChanged = useCallback(() => {
    if (!autocompleteRef.current) return;
    
    const place = autocompleteRef.current.getPlace();
    const location = place.geometry?.location;
    
    if (!location) {
      handleSearch(place.name || '');
      return;
    }
    
    setSearch((place.name || '') + (place.formatted_address || ''));
    setMapCenter({ lat: location.lat(), lng: location.lng() });
  }, []);

  const handleSearch = useCallback((currentSearch?: string) => {
    if (!mapRef.current) return;
    
    const autocompleteService = new window.google.maps.places.AutocompleteService();
    autocompleteService.getPlacePredictions(
      { input: currentSearch || search },
      (predictions, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          predictions &&
          predictions.length > 0
        ) {
          setSearch(predictions[0].description);
          const placeId = predictions[0].place_id;
          const placesService = new google.maps.places.PlacesService(mapRef.current!);
          
          placesService.getDetails({ placeId }, (place, status) => {
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              place?.geometry?.location
            ) {
              setMapCenter({
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              });
            } else {
              console.error('Error fetching place details', status);
            }
          });
        } else {
          console.error('Error fetching predictions', status);
        }
      }
    );
  }, [search]);

  const handleCenterChanged = useMemo(
    () =>
      debounce(() => {
        if (!mapRef.current) return;
        
        const newCenter = mapRef.current.getCenter()?.toJSON();
        if (!newCenter) return;
        
        const { lat, lng } = newCenter;

        if (
          searchOnMapMove &&
          (Math.abs(mapCenter.lat - lat) > 0.0001 ||
            Math.abs(mapCenter.lng - lng) > 0.0001)
        ) {
          setMapCenter({ lat, lng });
        }
      }, 500),
    [mapCenter.lat, mapCenter.lng, searchOnMapMove]
  );

  const handleShareLocation = useCallback(() => {
    if (!mapRef.current) return;
    
    const { lat, lng } = mapRef.current.getCenter()?.toJSON() || mapCenter;
    const shareUrl = `${process.env.NEXT_PUBLIC_URL_PUBLIC}/spotlight?lat=${lat}&lng=${lng}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Spotlight OneFive',
        text: 'Découvrez les événements et incubateurs près de chez vous !',
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Lien copié dans le presse-papiers');
    }
  }, [mapCenter]);

  const handleMapLoad = useCallback(() => {
    setPurpleIcon({
      url:
        'data:image/svg+xml;charset=UTF-8,' +
        encodeURIComponent(
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#7F56D9" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>'
        ),
      scaledSize: new window.google.maps.Size(34, 48)
    });
    setIsMapLoading(false);
  }, []);

  const handleAutocompleteLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  }, []);

  const handleMapRef = useCallback((map: google.maps.Map | null) => {
    mapRef.current = map;
  }, []);

  const _handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (value.length > 0) {
      if (!isSearching) setIsSearching(true);
    } else {
      if (isSearching) setIsSearching(false);
    }
  }, [isSearching]);

  const handleFavorite = useCallback((spotId: string, spotName: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(spotId)) {
        newSet.delete(spotId);
        toast.success(`${spotName} retiré des favoris`);
      } else {
        newSet.add(spotId);
        toast.success(`${spotName} ajouté aux favoris`);
      }
      return newSet;
    });
    // Persistance backend (toggle idempotent côté serveur).
    toggleFavoriteMut.mutate(spotId);
  }, [toggleFavoriteMut]);

  const handleSaveSearch = useCallback(() => {
    const parts = [
      search.trim(),
      typeFilter !== 'all' ? typeFilter : '',
      sectorFilter !== 'all' ? sectorFilter : '',
      pricingFilter !== 'all' ? pricingFilter : '',
    ].filter(Boolean);
    const label = parts.length > 0 ? parts.join(' · ') : 'Tous les spots';
    setSavedSearches(prev => {
      if (prev.some(s => s.label === label)) {
        toast.info('Recherche déjà sauvegardée');
        return prev;
      }
      toast.success('Recherche sauvegardée');
      return [
        { id: Date.now().toString(), label, search, dateFilter, pricingFilter, typeFilter, sectorFilter },
        ...prev,
      ].slice(0, 10);
    });
  }, [search, dateFilter, pricingFilter, typeFilter, sectorFilter]);

  const applySavedSearch = useCallback((s: SavedSearch) => {
    setSearch(s.search);
    setDateFilter(s.dateFilter);
    setPricingFilter(s.pricingFilter);
    setTypeFilter(s.typeFilter);
    setSectorFilter(s.sectorFilter);
    toast.success('Recherche appliquée');
  }, []);

  const clearFilters = useCallback(() => {
    setDateFilter('all');
    setPricingFilter('all');
    setTypeFilter('all');
    setSectorFilter('all');
    setSortBy('recent');
    setDistanceFilter('25');
    toast.success('Filtres effacés');
  }, []);

  const handleShareSpot = useCallback((spotId: string, spotName: string) => {
    const shareUrl = `${process.env.NEXT_PUBLIC_URL_PUBLIC}/spotlight?lat=${mapCenter.lat}&lng=${mapCenter.lng}&spot=${spotId}`;
    if (navigator.share) {
      navigator.share({
        title: `Spotlight OneFive - ${spotName}`,
        text: `Découvrez ${spotName} sur OneFive !`,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Lien copié dans le presse-papiers');
    }
  }, [mapCenter.lat, mapCenter.lng]);

  // Filtrage des données optimisé avec useMemo
  const filteredData = useMemo(() => {
    if (!data?.pages) return [];
    
    const allData = data.pages.flatMap(page => page.payload || []);
    
    const filtered = allData.filter((spot: any) => {
      const matchesType = typeFilter === 'all' || spot.spot === typeFilter;
      const searchValue = search.trim().toLowerCase();
      const matchesSearch =
        searchValue.length === 0 ||
        (spot.name || '').toLowerCase().includes(searchValue) ||
        (spot.highlight || '').toLowerCase().includes(searchValue) ||
        (spot.address || '').toLowerCase().includes(searchValue);
      const matchesFavorite = !showFavoritesOnly || favorites.has(spot.id);

      return matchesType && matchesSearch && matchesFavorite;
    });

    // Tri
    if (sortBy === 'name') {
      filtered.sort((a: any, b: any) => a.name.localeCompare(b.name));
    } else if (sortBy === 'distance') {
      // Tri par distance (à implémenter)
    } else if (sortBy === 'popularity') {
      // Tri par popularité (à implémenter)
    } else if (sortBy === 'price') {
      // Tri par prix (à implémenter)
    } else if (sortBy === 'date') {
      // Tri par date
      filtered.sort((a: any, b: any) => {
        const dateA = a.event?.beginDate ? new Date(a.event.beginDate).getTime() : 0;
        const dateB = b.event?.beginDate ? new Date(b.event.beginDate).getTime() : 0;
        return dateB - dateA;
      });
    } else {
      // Tri par date (par défaut)
      filtered.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    return filtered;
  }, [data?.pages, typeFilter, sortBy, search, showFavoritesOnly, favorites]);

  // Preuve sociale réseau : combien de mes connexions ont mis chaque spot visible en favori.
  const visibleSpotIds = useMemo(
    () => filteredData.map((s: any) => s.id),
    [filteredData],
  );
  const { data: socialProof = {} } = useQuery({
    queryKey: ['spotlight-social-proof', visibleSpotIds],
    queryFn: () => getSpotlightSocialProof(visibleSpotIds),
    enabled: visibleSpotIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const spotsOnMap = useMemo(() =>
    filteredData.filter((spot: any) => spot.location?.lat && spot.location?.lng).length,
    [filteredData]
  );

  const hasActiveFilters = dateFilter !== 'all' || pricingFilter !== 'all' || typeFilter !== 'all' || sectorFilter !== 'all' || sortBy !== 'recent' || distanceFilter !== '25';

  if (isError) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-screen bg-gray-50"
        role="alert"
        aria-live="polite"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center bg-white p-8 rounded-xl shadow-lg border border-gray-200"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-4"
            aria-hidden="true"
          >
            <MapPin className="h-12 w-12 mx-auto text-red-500" />
          </motion.div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Erreur de chargement
          </h2>
          <p className="text-gray-500">
            Impossible de charger les données du spotlight
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <LoadScript
      libraries={['places', 'geometry']}
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}
      onLoad={handleMapLoad}
      onError={() => {}}
    >
      <div className="min-h-screen bg-[#FCFCFD]">
        {/* Navbar */}
        <div className="w-full">
          <Navbar />
        </div>
        
        <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-8 py-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }} 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
          >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.1, duration: 0.6 }} 
                className="text-2xl font-bold text-[#101828]"
              >
                Spotlight OneFive
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.2, duration: 0.6 }} 
                className="text-[#475467] mt-1"
              >
                Découvrez les événements, incubateurs et opportunités près de chez vous
              </motion.p>
              {filteredData.length > 0 && (
                <motion.p 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: 0.3, duration: 0.6 }} 
                  className="text-sm text-[#667085] mt-2"
                >
                  {filteredData.length} résultat{filteredData.length > 1 ? 's' : ''} trouvé{filteredData.length > 1 ? 's' : ''}
                  {spotsOnMap < filteredData.length && ` · ${spotsOnMap} sur la carte`}
                </motion.p>
              )}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {([
                    dateFilter !== 'all' && { key: 'date', label: `Date : ${dateFilter}`, clear: () => setDateFilter('all') },
                    pricingFilter !== 'all' && { key: 'pricing', label: `Prix : ${pricingFilter}`, clear: () => setPricingFilter('all') },
                    typeFilter !== 'all' && { key: 'type', label: `Type : ${typeFilter}`, clear: () => setTypeFilter('all') },
                    sectorFilter !== 'all' && { key: 'sector', label: `Secteur : ${sectorFilter}`, clear: () => setSectorFilter('all') },
                    distanceFilter !== '25' && { key: 'distance', label: `${distanceFilter} km`, clear: () => setDistanceFilter('25') },
                    sortBy !== 'recent' && { key: 'sort', label: `Tri : ${sortBy}`, clear: () => setSortBy('recent') },
                  ].filter(Boolean) as { key: string; label: string; clear: () => void }[]).map((chip) => (
                    <button
                      key={chip.key}
                      onClick={chip.clear}
                      className="inline-flex items-center gap-1 rounded-full bg-[#EDEEFB] px-2.5 py-1 text-xs font-medium text-[#4149A8] transition-colors hover:bg-[#e0e2f8]"
                      aria-label={`Retirer le filtre ${chip.label}`}
                    >
                      {chip.label}
                      <X className="h-3 w-3" />
                    </button>
                  ))}
                  <button
                    onClick={clearFilters}
                    className="text-xs text-[#667085] underline transition-colors hover:text-[#475467]"
                  >
                    Tout effacer
                  </button>
                </div>
              )}
              {savedSearches.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1 text-xs font-medium text-[#98A2B3]">Mes recherches</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {savedSearches.map((s) => (
                      <span
                        key={s.id}
                        className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs"
                      >
                        <button
                          onClick={() => applySavedSearch(s)}
                          className="font-medium text-[#475467] hover:text-[#5E6AD2]"
                        >
                          {s.label}
                        </button>
                        <button
                          onClick={() => setSavedSearches((prev) => prev.filter((x) => x.id !== s.id))}
                          className="text-gray-300 hover:text-gray-500"
                          aria-label="Retirer la recherche sauvegardée"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: 0.3, duration: 0.6 }} 
              className="flex items-center gap-4"
            >
              <Tooltip title="Afficher les filtres">
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  color="secondary"
                  className="gap-2"
                  aria-label="Afficher les filtres"
                  iconLeading={<Filter className="h-4 w-4" data-icon />}
                >
                  Filtres
                  {hasActiveFilters && (
                    <Badge type="pill-color" color="gray" size="sm" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                      !
                    </Badge>
                  )}
                </Button>
              </Tooltip>
              <Tooltip title="Sauvegarder cette recherche">
                <Button
                  onClick={handleSaveSearch}
                  color="secondary"
                  className="gap-2"
                  aria-label="Sauvegarder cette recherche"
                  iconLeading={<Bookmark className="h-4 w-4" data-icon />}
                >
                  Sauvegarder
                </Button>
              </Tooltip>
              <Tooltip title="Partager ma position">
                <Button
                  onClick={handleShareLocation}
                  color="secondary"
                  className="gap-2"
                  aria-label="Partager ma position"
                  iconLeading={<Share2 className="h-4 w-4" data-icon />}
                >
                  Partager
                </Button>
              </Tooltip>
            </motion.div>
          </div>
        </motion.div>

                {/* Search Section */}
        <motion.div 
          variants={cardVariants}
          className="mb-6"
        >
          <SpotlightSearch
            search={search}
            setSearch={setSearch}
            autocompleteRef={autocompleteRef}
            onPlaceChanged={handlePlaceChanged}
            onAutocompleteLoad={handleAutocompleteLoad}
            onSearch={handleSearch}
            isSearching={isSearching}
            resultsCount={filteredData.length}
            recentSearches={recentSearches}
          />
        </motion.div>

        {/* Section des filtres */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 overflow-hidden"
            >
              <SpotlightFilters
                dateFilter={dateFilter}
                setDateFilter={setDateFilter}
                pricingFilter={pricingFilter}
                setPricingFilter={setPricingFilter}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                sectorFilter={sectorFilter}
                setSectorFilter={setSectorFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                distanceFilter={distanceFilter}
                setDistanceFilter={setDistanceFilter}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
              />
            </motion.div>
          )}
        </AnimatePresence>

                {/* Mobile toggle: Liste / Carte */}
        <div className="flex lg:hidden mb-4 gap-2">
          <Button
            color={!showMap ? 'primary' : 'secondary'}
            className="flex-1 gap-2"
            onClick={() => setShowMap(false)}
            iconLeading={<List className="h-4 w-4" data-icon />}
          >
            Liste ({filteredData.length})
          </Button>
          <Button
            color={showMap ? 'primary' : 'secondary'}
            className="flex-1 gap-2"
            onClick={() => setShowMap(true)}
            iconLeading={<Map className="h-4 w-4" data-icon />}
          >
            Carte ({spotsOnMap})
          </Button>
        </div>

                {/* Layout principal avec carte et résultats */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Liste des résultats */}
          <div className={`flex-1 ${showMap ? 'hidden lg:block' : ''}`}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-xs text-[#475467]">
                <input
                  type="checkbox"
                  checked={searchOnMapMove}
                  onChange={(e) => setSearchOnMapMove(e.target.checked)}
                />
                Chercher quand je déplace la carte
              </label>
              <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFavoritesOnly((v) => !v)}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                  showFavoritesOnly
                    ? 'border-[#5E6AD2] bg-[#EDEEFB] text-[#4149A8]'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
                aria-pressed={showFavoritesOnly}
              >
                <Bookmark className={`h-3.5 w-3.5 ${showFavoritesOnly ? 'fill-[#5E6AD2] text-[#5E6AD2]' : ''}`} />
                Sauvegardés{favorites.size > 0 ? ` (${favorites.size})` : ''}
              </button>
              <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5">
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded-md px-2 py-1 ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                  aria-label="Vue liste"
                >
                  <List className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`rounded-md px-2 py-1 ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                  aria-label="Vue grille"
                >
                  <LayoutGrid className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              </div>
            </div>
            <motion.div
              variants={containerVariants}
              className="space-y-6"
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                    aria-live="polite"
                    aria-label="Chargement des résultats"
                  >
                    {Array.from({ length: 3 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <CardShimmer />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-6'}
                    role="region"
                    aria-label="Résultats de recherche"
                  >
                    {filteredData.map((spot: any, index: number) => (
                      <motion.div
                        key={spot.id}
                        id={`spot-${spot.id}`}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ 
                          scale: 1.02,
                          transition: { duration: 0.2 }
                        }}
                        onMouseEnter={() => setHoveredSpotId(spot.id)}
                        onMouseLeave={() => setHoveredSpotId(null)}
                        className={`relative transform transition-all duration-200 rounded-xl ${
                          selectedSpotId === spot.id
                            ? 'ring-2 ring-[#5E6AD2] ring-offset-2'
                            : ''
                        }`}
                        role="article"
                        aria-labelledby={`spot-title-${spot.id}`}
                      >
                        {socialProof[spot.id] > 0 && (
                          <div className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full bg-[#5E6AD2] px-2 py-0.5 text-xs font-medium text-white shadow-sm">
                            {socialProof[spot.id]} de ton réseau
                          </div>
                        )}
                        {spot.spot === SpotType.INCUBATOR || spot.spot === SpotType.ACCELERATOR ? (
                          <CardIncubator
                            spot={spot}
                            formatDateRange={formatDateRange}
                            findProviderImage={findProviderImage}
                            isFavorite={favorites.has(spot.id)}
                            onFavorite={handleFavorite}
                            onShare={handleShareSpot}
                          />
                        ) : spot.spot === SpotType.EVENT ? (
                          <CardEvent
                            spot={spot}
                            formatDateRange={formatDateRange}
                            findProviderImage={findProviderImage}
                            isFavorite={favorites.has(spot.id)}
                            onFavorite={handleFavorite}
                            onShare={handleShareSpot}
                          />
                        ) : spot.spot === SpotType.CONTEST ? (
                          <CardContest
                            spot={spot}
                            formatDateRange={formatDateRange}
                            findProviderImage={findProviderImage}
                            isFavorite={favorites.has(spot.id)}
                            onFavorite={handleFavorite}
                            onShare={handleShareSpot}
                          />
                        ) : spot.spot === SpotType.COWORKINGSPACE ? (
                          <CardCoworking
                            spot={spot}
                            findProviderImage={findProviderImage}
                            isFavorite={favorites.has(spot.id)}
                            onFavorite={handleFavorite}
                            onShare={handleShareSpot}
                          />
                        ) : null}
                      </motion.div>
                    ))}
                    
                    {/* Load More Trigger */}
                    {hasNextPage && (
                      <div ref={loadMoreRef} className="flex justify-center py-8">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2 text-gray-500"
                        >
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Chargement de plus de résultats...</span>
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Empty State */}
              {!isLoading && filteredData.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200"
                  role="status"
                  aria-live="polite"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      repeatType: "reverse" as const
                    }}
                    className="mb-4"
                    aria-hidden="true"
                  >
                    <Search className="h-16 w-16 mx-auto text-gray-300" />
                  </motion.div>
                  <h2 className="text-xl font-semibold text-gray-700 mb-2">
                    Aucun spot trouvé
                  </h2>
                  <p className="text-gray-500">
                    Essayez de modifier vos filtres ou de changer de localisation
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Carte à droite */}
          <motion.div 
            variants={mapVariants}
            className={`w-full lg:w-1/2 ${!showMap ? 'hidden lg:block' : ''}`}
          >
            <SpotlightMap
              mapCenter={mapCenter}
              filteredData={filteredData}
              purpleIcon={purpleIcon}
              onCenterChanged={handleCenterChanged}
              onMapRef={handleMapRef}
              hoveredSpotId={hoveredSpotId}
              selectedSpotId={selectedSpotId}
              onSpotClick={(spotId) => {
                setSelectedSpotId(prev => prev === spotId ? null : spotId);
                const element = document.getElementById(`spot-${spotId}`);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              onSpotShare={handleShareSpot}
            />
          </motion.div>
        </div>
      </div>
        </div>

      {/* Notifications */}
      <SpotlightNotifications
        onNotificationAction={() => {}}
      />
    </LoadScript>
  );
};

export default Spotlight; 