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
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const res = await fetch(`${API_URL}/seo/post/${id}`);
    if (!res.ok) return new Response('Not found', { status: 404 });
    const { data } = await res.json();

    const authorName = [data.author.firstName, data.author.lastName]
      .filter(Boolean)
      .join(' ');

    const avatarDataUrl = data.author.avatarId
      ? await imageToDataURL(`${API_URL}/file/${data.author.avatarId}`)
      : null;

    const logoUrl = `${req.nextUrl.origin}/onefive-logo-square.png`;
    const content = data.content
      ? data.content.length > 220
        ? data.content.slice(0, 220).trimEnd() + '...'
        : data.content
      : '';

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
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Thin gradient accent */}
            <div
              style={{
                height: '6px',
                background: 'linear-gradient(to right, #8b5cf6, #a855f7, #ec4899)',
                display: 'flex',
              }}
            />

            {/* Content */}
            <div
              style={{
                padding: '40px 48px',
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                justifyContent: 'space-between',
              }}
            >
              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {avatarDataUrl ? (
                  <img
                    src={avatarDataUrl}
                    width="56"
                    height="56"
                    style={{ borderRadius: '50%', border: '2px solid #e2e8f0' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: 700,
                      color: 'white',
                    }}
                  >
                    {authorName.charAt(0) || '?'}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 26, fontWeight: 700, color: '#101828' }}>
                    {authorName}
                  </span>
                  {data.author.highlight && (
                    <span style={{ fontSize: 17, color: '#475467' }}>
                      {data.author.highlight}
                    </span>
                  )}
                </div>
              </div>

              {/* Post content */}
              <div style={{ display: 'flex', flex: 1, marginTop: '24px' }}>
                <span
                  style={{
                    fontSize: 28,
                    color: '#344054',
                    lineHeight: 1.45,
                    overflow: 'hidden',
                  }}
                >
                  {content}
                </span>
              </div>

              {/* Tags + stats */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '20px',
                }}
              >
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {(data.tags || []).slice(0, 4).map((tag: string) => (
                    <span
                      key={tag}
                      style={{
                        backgroundColor: '#f5f3ff',
                        color: '#6d28d9',
                        padding: '4px 14px',
                        borderRadius: '9999px',
                        fontSize: '16px',
                        fontWeight: 500,
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: 24, fontWeight: 700, color: '#101828' }}>
                      {data.stats.reactions}
                    </span>
                    <span style={{ fontSize: 16, color: '#475467' }}>reactions</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: 24, fontWeight: 700, color: '#101828' }}>
                      {data.stats.comments}
                    </span>
                    <span style={{ fontSize: 16, color: '#475467' }}>comments</span>
                  </div>
                </div>
              </div>

              {/* Branding */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '12px',
                }}
              >
                <img src={logoUrl} width="24" height="24" />
                <span style={{ fontSize: 16, fontWeight: 600, color: '#6d28d9' }}>
                  onefive.app
                </span>
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
