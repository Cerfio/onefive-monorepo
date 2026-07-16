import { NextResponse } from "next/server";
import { z } from "zod";
import { getPayloadClient } from "@/lib/payload";

// A malformed email must return 400, not reach Payload's `email` field (which
// throws → 500). Length caps bound what an unauthenticated caller can store.
const suggestionSchema = z.object({
  title: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(5000),
  email: z.string().trim().email().max(200),
  targetAudience: z.string().max(500).optional(),
  tags: z.any().optional(),
  wantToContribute: z.any().optional(),
  wantToWrite: z.any().optional(),
  writingExperience: z.string().max(2000).optional(),
  sampleArticles: z.string().max(2000).optional(),
});

export async function POST(request: Request) {
  try {
    const result = suggestionSchema.safeParse(await request.json());

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: result.error.format() },
        { status: 400 }
      );
    }

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
    } = result.data;

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
