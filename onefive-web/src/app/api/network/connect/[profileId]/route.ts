import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const resolvedParams = await params;
    // Forward the request to the backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:50050';
    const backendResponse = await fetch(`${backendUrl}/network/connect/${resolvedParams.profileId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization headers if needed
        ...Object.fromEntries(
          request.headers.entries()
        ),
      },
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend responded with status: ${backendResponse.status}`);
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}