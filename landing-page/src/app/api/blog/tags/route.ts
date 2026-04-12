import { NextResponse } from "next/server";
import { unstable_cache as cache } from "next/cache";

const getBlogTags = cache(
  async () => {
    const response = await fetch(
      `${process.env.PAYLOAD_URL}/api/tags?limit=100`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${process.env.PAYLOAD_API_KEY}`,
        },
        next: { revalidate: 86400 }, // Revalider une fois par jour
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch tags from PayloadCMS");
    }

    return response.json();
  },
  ["blog-tags"],
  { revalidate: 86400 } // Revalider une fois par jour
);

export async function GET() {
  try {
    const data = await getBlogTags();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching blog tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
} 