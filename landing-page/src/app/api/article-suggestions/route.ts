import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";

export async function POST(request: Request) {
  try {
    const {
      title,
      category,
      description,
      targetAudience,
      email,
      tags,
      wantToContribute,
      wantToWrite,
      writingExperience,
      sampleArticles,
    } = await request.json();

    // Validate required fields
    if (!title || !category || !description || !email) {
      return NextResponse.json(
        { error: "Title, category, description and email are required" },
        { status: 400 }
      );
    }

    const payload = await getPayloadClient();

    await payload.create({
      collection: "article-suggestions",
      data: {
        title,
        category,
        description,
        targetAudience,
        email,
        tags,
        wantToContribute,
        wantToWrite,
        writingExperience,
        sampleArticles,
        status: "pending",
        submittedAt: new Date().toISOString(),
      } as never,
    });

    console.log(`Article suggestion received: ${title}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Article suggestion submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit article suggestion" },
      { status: 500 }
    );
  }
}
