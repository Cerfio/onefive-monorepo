import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";

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

    const payload = await getPayloadClient();

    await payload.create({
      collection: "feedback",
      data: {
        category,
        feedbackText,
        userEmail,
        status: "new",
        priority: "medium",
        submittedAt: new Date().toISOString(),
      } as never,
    });

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
