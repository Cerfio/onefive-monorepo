import { NextResponse } from "next/server";

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
    console.log({ tags });
    // Submit to PayloadCMS via HTTP request
    const payloadResponse = await fetch(
      `${process.env.PAYLOAD_URL}/api/article-suggestions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${process.env.PAYLOAD_API_KEY}`,
        },
        body: JSON.stringify({
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
        }),
      }
    );

    if (!payloadResponse.ok) {
      const errorData = await payloadResponse.json();
      console.log("errorData", errorData);
      throw new Error(
        errorData.message || "Erreur lors de la soumission à PayloadCMS"
      );
    }

    // Log the submission
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
