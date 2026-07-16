import { NextResponse } from "next/server";
import { z } from "zod";
import { getPayloadClient } from "@/lib/payload";

// userEmail is optional, but when present a bad address must 400 here rather
// than throw at Payload's `email` field (→ 500). Empty string is coerced to
// undefined so an omitted email doesn't trip the format check.
const feedbackSchema = z.object({
  category: z.string().trim().min(1).max(100),
  feedbackText: z.string().trim().min(1).max(5000),
  userEmail: z
    .string()
    .trim()
    .max(200)
    .email()
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export async function POST(request: Request) {
  try {
    const result = feedbackSchema.safeParse(await request.json());

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: result.error.format() },
        { status: 400 }
      );
    }

    const { category, feedbackText, userEmail } = result.data;
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
