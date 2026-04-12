export const FEED_MIX_CONFIG = {
  PAGE_SIZE: 5,
  quotas: {
    RELATION: 2,
    FOLLOWED_HASHTAG: 1,
    TRENDING: 1,
    LOCATION_BASED: 1,
  },
  fallbackOrder: ['RELATION', 'FOLLOWED_HASHTAG', 'TRENDING', 'LOCATION_BASED'],
};
