import { api } from '@/utils/kyInstance';

export const listSpotlightFavorites = async (): Promise<string[]> => {
  const res = await api.get('spotlight/favorites');
  const json = (await res.json()) as { data: string[] };
  return json.data;
};

export const toggleSpotlightFavorite = async (
  spotId: string,
): Promise<{ favorited: boolean }> => {
  const res = await api.post(`spotlight/favorites/${spotId}/toggle`);
  const json = (await res.json()) as { data: { favorited: boolean } };
  return json.data;
};

export const getSpotlightSocialProof = async (
  spotIds: string[],
): Promise<Record<string, number>> => {
  if (spotIds.length === 0) return {};
  const res = await api.post('spotlight/social-proof', { json: { spotIds } });
  const json = (await res.json()) as { data: Record<string, number> };
  return json.data;
};
