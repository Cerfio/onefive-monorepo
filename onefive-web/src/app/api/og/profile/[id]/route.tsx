import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { fetchProfileForOg, ProfileData } from '@/lib/profile-og-data';

export const runtime = 'edge';

function truncate(str: string | undefined | null, max: number): string {
  if (!str) return '';
  return str.length > max ? str.slice(0, max).trimEnd() + '...' : str;
}

const imageToDataURL = async (url: string, retries = 2): Promise<string | null> => {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url);
      if (response.status === 429 && i < retries) {
        await new Promise((r) => setTimeout(r, 500 * (i + 1)));
        continue;
      }
      if (!response.ok) throw new Error(`${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const contentType = response.headers.get('content-type') || 'image/png';
      return `data:${contentType};base64,${base64}`;
    } catch (error) {
      if (i === retries) {
        console.error(`Could not convert image to data URL: ${url}`, error);
        return null;
      }
    }
  }
  return null;
};

function ProfileCard({
  profile,
  flagUrl,
  coverDataUrl,
}: {
  profile: ProfileData;
  flagUrl: string | null;
  coverDataUrl: string | null;
}) {
  const hasExperience = profile.experience.length > 0 && profile.experience[0]?.title;
  const bio = truncate(profile.bio, 130);
  const name = profile.name || 'Anonyme';

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fcfcfd',
        padding: '30px',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          width: '1140px',
          height: '570px',
          backgroundColor: 'white',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Banner */}
        {coverDataUrl ? (
          <div style={{ display: 'flex', height: '170px', width: '100%' }}>
            <img
              src={coverDataUrl}
              width="1140"
              height="170"
              style={{ width: '1140px', height: '170px' }}
            />
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              height: '170px',
              width: '100%',
              background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899)',
            }}
          />
        )}

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            padding: '0 40px 24px 40px',
            marginTop: '-50px',
            flexDirection: 'column',
          }}
        >
          {/* Avatar + name row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px' }}>
            <div style={{ display: 'flex', flexShrink: 0 }}>
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  width="110"
                  height="110"
                  style={{ borderRadius: '50%', border: '4px solid white' }}
                />
              ) : (
                <div
                  style={{
                    width: '110px',
                    height: '110px',
                    borderRadius: '50%',
                    border: '4px solid white',
                    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '44px',
                    fontWeight: 700,
                    color: 'white',
                  }}
                >
                  {name.charAt(0)}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingBottom: '8px' }}>
              <span style={{ fontSize: 44, fontWeight: 700, color: '#101828', lineHeight: 1.1 }}>
                {name}
              </span>
              {flagUrl ? (
                <img
                  src={flagUrl}
                  width="36"
                  height="24"
                  style={{ borderRadius: '3px' }}
                />
              ) : null}
            </div>
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flex: 1, marginTop: '10px', gap: '30px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '8px' }}>
              {profile.title ? (
                <div style={{ display: 'flex', fontSize: 22, color: '#475467', fontWeight: 500 }}>
                  {truncate(profile.title, 75)}
                </div>
              ) : null}

              {profile.roles.length > 0 ? (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {profile.roles.map((role: string) => (
                    <span
                      key={role}
                      style={{
                        backgroundColor: '#f5f3ff',
                        color: '#6d28d9',
                        padding: '4px 14px',
                        borderRadius: '9999px',
                        fontSize: '16px',
                        fontWeight: 500,
                      }}
                    >
                      {role}
                    </span>
                  ))}
                </div>
              ) : null}

              {hasExperience ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <span style={{ fontSize: 19, color: '#344054' }}>
                    {profile.experience[0].title}
                    {profile.experience[0].company ? ` @ ${profile.experience[0].company}` : ''}
                  </span>
                </div>
              ) : null}

              {bio ? (
                <div style={{ display: 'flex', marginTop: '2px' }}>
                  <span style={{ fontSize: 18, color: '#667085', lineHeight: 1.4 }}>
                    {bio}
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Stats + branding */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '16px',
              marginTop: '6px',
            }}
          >
            <div style={{ display: 'flex', gap: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: 26, fontWeight: 700, color: '#101828' }}>
                  {String(profile.stats.followers ?? 0)}
                </span>
                <span style={{ fontSize: 17, color: '#475467' }}>abonnés</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: 26, fontWeight: 700, color: '#101828' }}>
                  {String(profile.stats.posts ?? 0)}
                </span>
                <span style={{ fontSize: 17, color: '#475467' }}>posts</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: 18, fontWeight: 600, color: '#6d28d9' }}>onefive.app</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const profileData = await fetchProfileForOg(id);

    if (!profileData) {
      return new Response('Profile not found', { status: 404 });
    }

    const flagPngUrl = profileData.countryCode
      ? `https://flagcdn.com/w80/${profileData.countryCode.toLowerCase()}.png`
      : null;

    const [avatarDataUrl, flagDataUrl, coverDataUrl] = await Promise.all([
      profileData.avatar ? imageToDataURL(profileData.avatar) : Promise.resolve(null),
      flagPngUrl ? imageToDataURL(flagPngUrl) : Promise.resolve(null),
      profileData.cover ? imageToDataURL(profileData.cover) : Promise.resolve(null),
    ]);

    const profileWithDataUrls: ProfileData = {
      ...profileData,
      avatar: avatarDataUrl || '',
    };

    return new ImageResponse(
      (
        <ProfileCard
          profile={profileWithDataUrls}
          flagUrl={flagDataUrl}
          coverDataUrl={coverDataUrl}
        />
      ),
      { width: 1200, height: 630 },
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error(`OG profile image error: ${msg}`);
    return new Response('Failed to generate OG image', { status: 500 });
  }
}
