import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:50050';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const res = await fetch(`${API_URL}/seo/discussion/${id}`);
    if (!res.ok) return new Response('Not found', { status: 404 });
    const { data } = await res.json();

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
              padding: '50px',
              boxShadow:
                '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* Top: question */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: 700,
                  }}
                >
                  {data.author.firstName.charAt(0)}
                  {data.author.lastName.charAt(0)}
                </div>
                <div style={{ fontSize: 20, color: '#475467' }}>
                  {data.author.firstName} {data.author.lastName}
                </div>
              </div>

              <div
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  color: '#101828',
                  lineHeight: 1.2,
                  maxHeight: '200px',
                  overflow: 'hidden',
                }}
              >
                {data.question.length > 120
                  ? data.question.slice(0, 120) + '...'
                  : data.question}
              </div>

              {data.tags && data.tags.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    marginTop: '20px',
                    flexWrap: 'wrap',
                  }}
                >
                  {data.tags.slice(0, 5).map((tag: string) => (
                    <span
                      key={tag}
                      style={{
                        backgroundColor: '#f5f3ff',
                        color: '#6d28d9',
                        padding: '6px 16px',
                        borderRadius: '9999px',
                        fontSize: '18px',
                        fontWeight: 500,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
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
                  <span style={{ fontSize: 28, fontWeight: 700, color: '#101828' }}>
                    {data.stats.answers}
                  </span>
                  <span style={{ fontSize: 18, color: '#475467' }}>réponses</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: '#101828' }}>
                    {data.stats.upvotes}
                  </span>
                  <span style={{ fontSize: 18, color: '#475467' }}>votes</span>
                </div>
              </div>
              <div style={{ fontSize: 18, color: '#9ca3af' }}>onefive.app</div>
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
