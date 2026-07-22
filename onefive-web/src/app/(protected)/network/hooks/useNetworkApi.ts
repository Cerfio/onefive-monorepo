import { Person, Startup, ActivityEvent } from '../types';
import { toast } from 'sonner';
import { api } from '@/utils/kyInstance';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface UseNetworkApiOptions {
  view: 'discover' | 'network';
  subView?: 'connections' | 'feed';
  search?: string;
  intention?: string;
  role?: string;
  location?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}

interface UseNetworkApiReturn {
  people: Person[];
  startups: Startup[];
  activity: ActivityEvent[];
  loading: boolean;
  error: string | null;
  hasMorePeople: boolean;
  fetchMorePeople: () => void;
  isFetchingMorePeople: boolean;
  hasMoreStartups: boolean;
  fetchMoreStartups: () => void;
  isFetchingMoreStartups: boolean;
  refetchPeople: () => void;
  refetchStartups: () => void;
  refetchActivity: () => void;
}

// Fonctions API pour les appels réseau
const fetchNetworkPeople = async (options: UseNetworkApiOptions): Promise<Person[]> => {
  try {
    const params = new URLSearchParams({
      view: options.view,
      ...(options.subView && { subView: options.subView }),
      ...(options.search && { search: options.search }),
      ...(options.intention && { intention: options.intention }),
      ...(options.role && { role: options.role }),
      ...(options.location && { location: options.location }),
      ...(options.sort && { sort: options.sort }),
      ...(options.limit && { limit: options.limit.toString() }),
      ...(options.offset && { offset: options.offset.toString() }),
    });

    const response = await api.get(`network/people?${params}`);

    if (!response.ok) {
      throw new Error('Failed to fetch people');
    }

    const result = await response.json() as ApiResponse<Person[]>;

    if (result.success) {
      return result.data ?? [];
    }
    throw new Error(result.error ?? 'Failed to fetch people');
  } catch {
    throw new Error('Failed to fetch people');
  }
};

const fetchNetworkStartups = async (options: UseNetworkApiOptions): Promise<Startup[]> => {
  try {
    const params = new URLSearchParams({
      view: options.view,
      ...(options.search && { search: options.search }),
      ...(options.intention && { intention: options.intention }),
      ...(options.location && { location: options.location }),
      ...(options.sort && { sort: options.sort }),
      ...(options.limit && { limit: options.limit.toString() }),
      ...(options.offset && { offset: options.offset.toString() }),
    });

    const response = await api.get(`network/startups?${params}`);

    if (!response.ok) {
      throw new Error('Failed to fetch startups');
    }

    const result = await response.json() as ApiResponse<Startup[]>;

    if (result.success) {
      return result.data ?? [];
    }
    throw new Error(result.error ?? 'Failed to fetch startups');
  } catch {
    throw new Error('Failed to fetch startups');
  }
};

const fetchNetworkActivity = async (options: UseNetworkApiOptions): Promise<ActivityEvent[]> => {
  try {
    const params = new URLSearchParams({
      ...(options.limit && { limit: options.limit.toString() }),
      ...(options.offset && { offset: options.offset.toString() }),
    });

    const response = await api.get(`network/activity?${params}`);

    if (!response.ok) {
      throw new Error('Failed to fetch activity');
    }

    const result = await response.json() as ApiResponse<ActivityEvent[]>;

    if (result.success) {
      return result.data ?? [];
    }
    throw new Error(result.error ?? 'Failed to fetch activity');
  } catch {
    throw new Error('Failed to fetch activity');
  }
};

export const useNetworkApi = (options: UseNetworkApiOptions): UseNetworkApiReturn => {
  const pageSize = options.limit ?? 20;

  // Query paginée pour les personnes - toujours active
  const peopleQuery = useInfiniteQuery({
    queryKey: ['network-people', options],
    queryFn: ({ pageParam = 0 }) =>
      fetchNetworkPeople({ ...options, offset: pageParam }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === pageSize ? allPages.length * pageSize : undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    networkMode: 'online', // Ne pas faire de requêtes quand offline
  });

  // Query paginée pour les startups - toujours active
  const startupsQuery = useInfiniteQuery({
    queryKey: ['network-startups', options],
    queryFn: ({ pageParam = 0 }) =>
      fetchNetworkStartups({ ...options, offset: pageParam }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === pageSize ? allPages.length * pageSize : undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    networkMode: 'online',
  });

  // Query pour l'activité - seulement quand c'est demandé
  const activityQuery = useQuery({
    queryKey: ['network-activity', options],
    queryFn: () => fetchNetworkActivity(options),
    enabled: options.subView === 'feed', // Uniquement quand on regarde l'activité
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    networkMode: 'online',
  });

  // Calcul de l'état de chargement global
  const isLoading = peopleQuery.isLoading || startupsQuery.isLoading ||
                   (options.subView === 'feed' && activityQuery.isLoading);

  const error = (peopleQuery.error as Error)?.message || (startupsQuery.error as Error)?.message ||
               (activityQuery.error as Error)?.message || null;

  return {
    people: peopleQuery.data?.pages.flat() ?? [],
    startups: startupsQuery.data?.pages.flat() ?? [],
    activity: activityQuery.data ?? [],
    loading: isLoading,
    error,
    hasMorePeople: peopleQuery.hasNextPage ?? false,
    fetchMorePeople: peopleQuery.fetchNextPage,
    isFetchingMorePeople: peopleQuery.isFetchingNextPage,
    hasMoreStartups: startupsQuery.hasNextPage ?? false,
    fetchMoreStartups: startupsQuery.fetchNextPage,
    isFetchingMoreStartups: startupsQuery.isFetchingNextPage,
    refetchPeople: peopleQuery.refetch,
    refetchStartups: startupsQuery.refetch,
    refetchActivity: activityQuery.refetch,
  };
};

// Hook spécifique pour les actions de connexion
export const useNetworkActions = () => {
  const queryClient = useQueryClient();

  const sendConnectionRequestMutation = useMutation({
    mutationFn: async (profileId: string) => {
      const response = await api.post(`network/connect/${profileId}`);
      const result = await response.json() as ApiResponse<any>;

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to send connection request');
      }
    },
    onSuccess: () => {
      toast.success('Demande de connexion envoyée avec succès');
      // Invalider les queries pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['network-people'] });
      queryClient.invalidateQueries({ queryKey: ['network-activity'] });
    },
    onError: (error: any) => {
      toast.error(`Erreur lors de l'envoi de la demande: ${error.message}`);
    },
  });

  return {
    sendConnectionRequest: sendConnectionRequestMutation.mutateAsync,
    isConnecting: sendConnectionRequestMutation.isPending,
  };
};