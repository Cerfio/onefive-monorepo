/**
 * Fetches profile data for OpenGraph meta tags.
 * Uses the public SEO endpoint (no auth required) so crawlers and preview tools can load the image.
 */
export const fetchProfileForOg = async (id: string) => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:50050';
    const response = await fetch(`${apiUrl}/seo/profile/${id}`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    const profile = result.data;

    if (!profile) return null;

    const avatarUrl = profile.avatarId
      ? `${apiUrl}/file/${profile.avatarId}`
      : '';

    return {
      id: profile.id,
      name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
      title: profile.highlight || '',
      avatar: avatarUrl,
      coverImage: profile.coverId ? `${apiUrl}/file/${profile.coverId}` : '',
      cover: profile.coverId ? `${apiUrl}/file/${profile.coverId}` : '',
      quote: profile.bio || '',
      bio: profile.bio || '',
      roles: profile.ecosystemRoles || [],
      countryCode: profile.countryCode || '',
      stats: {
        posts: profile.stats?.posts || 0,
        followers: profile.stats?.followers || 0,
        following: 0,
        connections: 0,
        streak: 0,
      },
      experience: profile.latestExperience
        ? [
            {
              id: '',
              title: profile.latestExperience.title,
              company: profile.latestExperience.company,
              logo: '',
            },
          ]
        : [],
      education: [],
    };
  } catch {
    return null;
  }
};

export type ProfileData = NonNullable<Awaited<ReturnType<typeof fetchProfileForOg>>>; 