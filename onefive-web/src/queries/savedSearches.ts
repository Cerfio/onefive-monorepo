import { api } from '@/utils/kyInstance';

export interface SavedSearchFilters {
  search: string;
  dateFilter: string;
  pricingFilter: string;
  typeFilter: string;
  sectorFilter: string;
}

export interface SavedSearchRecord {
  id: string;
  label: string;
  filters: SavedSearchFilters;
}

interface RawSavedSearch {
  id: string;
  label: string;
  filters: Partial<SavedSearchFilters> | null;
}

const normalize = (r: RawSavedSearch): SavedSearchRecord => ({
  id: r.id,
  label: r.label,
  filters: {
    search: r.filters?.search ?? '',
    dateFilter: r.filters?.dateFilter ?? 'all',
    pricingFilter: r.filters?.pricingFilter ?? 'all',
    typeFilter: r.filters?.typeFilter ?? 'all',
    sectorFilter: r.filters?.sectorFilter ?? 'all',
  },
});

export const listSavedSearches = async (): Promise<SavedSearchRecord[]> => {
  const res = await api.get('spotlight/saved-searches');
  const json = (await res.json()) as { success: boolean; data: RawSavedSearch[] };
  return json.success ? (json.data ?? []).map(normalize) : [];
};

export const createSavedSearch = async (
  label: string,
  filters: SavedSearchFilters,
): Promise<SavedSearchRecord> => {
  const res = await api.post('spotlight/saved-searches', { json: { label, filters } });
  const json = (await res.json()) as { success: boolean; data: RawSavedSearch };
  return normalize(json.data);
};

export const deleteSavedSearch = async (id: string): Promise<void> => {
  await api.delete(`spotlight/saved-searches/${id}`);
};
