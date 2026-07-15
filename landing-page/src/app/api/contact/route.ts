import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, category, message } =
      await request.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !category || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

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
