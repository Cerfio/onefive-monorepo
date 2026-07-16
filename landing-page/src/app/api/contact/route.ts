import { NextResponse } from "next/server";
import { z } from "zod";
import { getPayloadClient } from "@/lib/payload";

// Validated in the route so a malformed email returns a clean 400 instead of
// reaching Payload's `type: 'email'` field, which throws and surfaces as a 500.
// Length caps keep a public, unauthenticated endpoint from storing unbounded text.
const contactSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  category: z.string().trim().min(1).max(100),
  message: z.string().trim().min(1).max(5000),
});

export async function POST(request: Request) {
  try {
    const result = contactSchema.safeParse(await request.json());

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: result.error.format() },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, category, message } = result.data;
    const payload = await getPayloadClient();

    await payload.create({
      collection: "contact",
      data: {
        firstName,
        lastName,
        email,
        category,
        message,
        status: "new",
        submittedAt: new Date().toISOString(),
      } as never,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit the form" },
      { status: 500 }
    );
  }
}
