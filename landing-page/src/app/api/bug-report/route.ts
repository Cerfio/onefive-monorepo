import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";

export async function POST(request: Request) {
  try {
    const { title, category, priority, steps, expected, actual, additional } =
      await request.json();

    // Validate required fields
    if (!title || !category || !priority || !steps || !expected || !actual) {
      return NextResponse.json(
        { error: "All required fields must be filled" },
        { status: 400 }
      );
    }

    const payload = await getPayloadClient();

    await payload.create({
      collection: "bug-reports",
      data: {
        title,
        category,
        priority,
        stepsToReproduce: steps,
        expectedBehavior: expected,
        actualBehavior: actual,
        additionalInformation: additional || "",
        status: "new",
        submittedAt: new Date().toISOString(),
      } as never,
    });

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
