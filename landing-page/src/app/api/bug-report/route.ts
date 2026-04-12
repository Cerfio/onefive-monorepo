import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { 
      title, 
      category, 
      priority, 
      steps, 
      expected, 
      actual, 
      additional 
    } = await request.json();

    // Validate required fields
    if (!title || !category || !priority || !steps || !expected || !actual) {
      return NextResponse.json(
        { error: "All required fields must be filled" },
        { status: 400 }
      );
    }

    // Submit to PayloadCMS via HTTP request
    const payloadResponse = await fetch(
      `${process.env.PAYLOAD_URL}/api/bug-reports`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${process.env.PAYLOAD_API_KEY}`, // Si une authentification est nécessaire
        },
        body: JSON.stringify({
          title,
          category,
          priority,
          stepsToReproduce: steps,
          expectedBehavior: expected,
          actualBehavior: actual,
          additionalInformation: additional || "",
          status: "new",
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

    // Log the submission
    console.log(`Bug report received: ${title}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bug report submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit bug report" },
      { status: 500 }
    );
  }
} 