import { api } from '@/utils/kyInstance';
import { ProfilePostItem } from '@/features/post/hooks/queries/useProfilePosts';
import { DiscussionInfer } from './discussion';

// Types for SearchBar (quick suggestions)
export interface SearchBarPerson {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  highlight: string | null;
  countryCode: string | null;
}

export interface SearchBarCompany {
  id: string;
  name: string;
  logo: string | null;
  description: string | null;
  tagline: string | null;
}

export interface SearchBarDiscussion {
  id: string;
  question: string;
  answerCount: number;
}

export interface SearchBarResult {
  people: SearchBarPerson[];
  companies: SearchBarCompany[];
  discussions: SearchBarDiscussion[];
}

// Types for full Search
export interface SearchPerson {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  highlight: string | null;
  bio: string | null;
  countryCode: string | null;
  ecosystemRoles?: string[];
  relationshipStatus?: string | null;
}

export interface SearchCompany {
  id: string;
  name: string;
  logo: string | null;
  description: string | null;
  tagline: string | null;
  website: string | null;
}

// Use the same type as ProfilePostCard expects
export type SearchPost = ProfilePostItem;

// Use the same type as DiscussionCard expects
export type SearchDiscussion = DiscussionInfer;

export interface SearchResult {
  people: SearchPerson[];
  companies: SearchCompany[];
  posts: SearchPost[];
  discussions: SearchDiscussion[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

/**
 * Fetch quick search suggestions for the navbar
 */
export const fetchSearchBarSuggestions = async (
  query: string,
  limit: number = 10
): Promise<SearchBarResult> => {
  if (!query || query.trim().length < 2) {
    return { people: [], companies: [], discussions: [] };
  }

  const params = new URLSearchParams();
  params.append('q', query.trim());
  params.append('limit', limit.toString());

  const response = await api.get(`search/searchbar?${params}`);
  const result = (await response.json()) as ApiResponse<SearchBarResult>;

  if (!result.success) {
    throw new Error(result.error || 'Failed to search');
  }

  return result.data;
};

/**
 * Fetch full search results with all content types
 */
export const fetchSearchResults = async (
  query: string,
  limit: number = 20
): Promise<SearchResult> => {
  if (!query || query.trim().length < 2) {
    return { people: [], companies: [], posts: [], discussions: [] };
  }

  const params = new URLSearchParams();
  params.append('q', query.trim());
  params.append('limit', limit.toString());

  const response = await api.get(`search?${params}`);
  const result = (await response.json()) as ApiResponse<SearchResult>;

  if (!result.success) {
    throw new Error(result.error || 'Failed to search');
  }

  return result.data;
};
