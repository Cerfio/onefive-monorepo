import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, category, message } = await request.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !category || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Submit to PayloadCMS via HTTP request
    const payloadResponse = await fetch(`${process.env.PAYLOAD_URL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${process.env.PAYLOAD_API_KEY}`, // Si une authentification est nécessaire
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        category,
        message,
        status: 'new',
        submittedAt: new Date().toISOString(),
      }),
    });

    if (!payloadResponse.ok) {
      const errorData = await payloadResponse.json();
      throw new Error(errorData.message || 'Erreur lors de la soumission à PayloadCMS');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit the form" },
      { status: 500 }
    );
  }
}
