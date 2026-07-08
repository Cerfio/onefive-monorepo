import { MetadataRoute } from 'next';

const BASE_URL = 'https://onefive.app';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:50050';

async function fetchSitemapData(endpoint: string) {
  try {
    const res = await fetch(`${API_URL}/seo/sitemap/${endpoint}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [startups, profiles, discussions, spots, posts] = await Promise.all([
    fetchSitemapData('startups'),
    fetchSitemapData('profiles'),
    fetchSitemapData('discussions'),
    fetchSitemapData('spots'),
    fetchSitemapData('posts'),
  ]);

  const startupUrls: MetadataRoute.Sitemap = startups.map(
    (s: { id: string; updatedAt: string }) => ({
      url: `${BASE_URL}/startup/${s.id}`,
      lastModified: s.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }),
  );

  const profileUrls: MetadataRoute.Sitemap = profiles.map(
    (p: { id: string; updatedAt: string }) => ({
      url: `${BASE_URL}/profile/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }),
  );

  const discussionUrls: MetadataRoute.Sitemap = discussions.map(
    (d: { id: string; updatedAt: string }) => ({
      url: `${BASE_URL}/discussion/${d.id}`,
      lastModified: d.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.6,
    }),
  );

  const spotUrls: MetadataRoute.Sitemap = spots.map(
    (s: { id: string }) => ({
      url: `${BASE_URL}/spotlight/${s.id}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }),
  );

  const postUrls: MetadataRoute.Sitemap = posts.map(
    (p: { id: string; updatedAt: string }) => ({
      url: `${BASE_URL}/post/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }),
  );

  return [
    {
      url: BASE_URL,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...startupUrls,
    ...profileUrls,
    ...discussionUrls,
    ...spotUrls,
    ...postUrls,
  ];
}
