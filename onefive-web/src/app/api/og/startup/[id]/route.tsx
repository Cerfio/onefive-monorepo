import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:50050';

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
    } catch {
      if (i === retries) return null;
    }
  }
  return null;
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const res = await fetch(`${API_URL}/seo/startup/${id}`);
    if (!res.ok) return new Response('Not found', { status: 404 });
    const { data } = await res.json();

    const coverDataUrl = data.coverImage
      ? await imageToDataURL(data.coverImage)
      : null;

    const name = data.name || 'Startup';
    const tagline = data.tagline || '';
    const categories: string[] = (data.categories || []).slice(0, 4);
    const members = String(data.stats?.members ?? 0);
    const followers = String(data.stats?.followers ?? 0);
    const city = data.city || '';
    const countryCode = data.countryCode || '';
    const location = [city, countryCode].filter(Boolean).join(', ');

    return new ImageResponse(
      (
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
            {/* Banner: cover image or gradient */}
            {coverDataUrl ? (
              <div style={{ display: 'flex', height: '170px', width: '100%' }}>
                <img src={coverDataUrl} width="1140" height="170" style={{ width: '1140px', height: '170px' }} />
              </div>
            ) : (
              <div
                style={{
                  height: '170px',
                  background: 'linear-gradient(to right, #8b5cf6, #a855f7, #ec4899)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '36px',
                    fontWeight: 700,
                    color: 'white',
                  }}
                >
                  {name.charAt(0)}
                </div>
              </div>
            )}

            {/* Content */}
            <div
              style={{
                padding: '30px 40px',
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', fontSize: 46, fontWeight: 700, color: '#101828' }}>
                  {name}
                </div>
                {tagline ? (
                  <div style={{ display: 'flex', fontSize: 24, color: '#475467', marginTop: '8px' }}>
                    {tagline.length > 80 ? tagline.slice(0, 80) + '...' : tagline}
                  </div>
                ) : null}
                {categories.length > 0 ? (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                    {categories.map((cat: string) => (
                      <span
                        key={cat}
                        style={{
                          backgroundColor: '#f5f3ff',
                          color: '#6d28d9',
                          padding: '6px 16px',
                          borderRadius: '9999px',
                          fontSize: '18px',
                          fontWeight: 500,
                        }}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Bottom stats */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '20px',
                }}
              >
                <div style={{ display: 'flex', gap: '30px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: 28, fontWeight: 700, color: '#101828' }}>{members}</span>
                    <span style={{ fontSize: 18, color: '#475467' }}>membres</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: 28, fontWeight: 700, color: '#101828' }}>{followers}</span>
                    <span style={{ fontSize: 18, color: '#475467' }}>abonnés</span>
                  </div>
                </div>
                {location ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475467', fontSize: 18 }}>
                    {location}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: 18, fontWeight: 600, color: '#6d28d9' }}>onefive.app</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 },
    );
  } catch {
    return new Response('Failed to generate OG image', { status: 500 });
  }
}
