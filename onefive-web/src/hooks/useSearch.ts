import { useQuery } from '@tanstack/react-query';
import { fetchSearchBarSuggestions, fetchSearchResults, SearchBarResult, SearchResult } from '@/queries/search';

/**
 * Hook for quick search suggestions in the navbar
 */
export const useSearchBarSuggestions = (query: string, limit: number = 10) => {
  return useQuery<SearchBarResult>({
    queryKey: ['searchbar', query, limit],
    queryFn: () => fetchSearchBarSuggestions(query, limit),
    enabled: !!query && query.trim().length >= 2,
    staleTime: 30000, // 30 seconds
    cacheTime: 60000, // 1 minute
  });
};

/**
 * Hook for full search results page
 */
export const useSearchResults = (query: string, limit: number = 20) => {
  return useQuery<SearchResult>({
    queryKey: ['search', query, limit],
    queryFn: () => fetchSearchResults(query, limit),
    enabled: !!query && query.trim().length >= 2,
    staleTime: 60000, // 1 minute
    cacheTime: 300000, // 5 minutes
  });
};
