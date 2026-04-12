import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { category, feedbackText, userEmail } = await request.json();

    // Validate required fields
    if (!category || !feedbackText) {
      return NextResponse.json(
        { error: "Category and feedback text are required" },
        { status: 400 }
      );
    }

    // Submit to PayloadCMS via HTTP request
    const payloadResponse = await fetch(
      `${process.env.PAYLOAD_URL}/api/feedback`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${process.env.PAYLOAD_API_KEY}`, // Si une authentification est nécessaire
        },
        body: JSON.stringify({
          category,
          feedbackText,
          userEmail,
          status: "new",
          priority: "medium",
          submittedAt: new Date().toISOString(),
        }),
      }
    );

    if (!payloadResponse.ok) {
      const errorData = await payloadResponse.json();
      throw new Error(
        errorData.message || "Erreur lors de la soumission à PayloadCMS"
      );
    }

    // Optionnellement, vous pouvez journaliser les soumissions ou envoyer des notifications
    console.log(`Feedback received: ${category}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feedback submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
