import { NextResponse } from "next/server";
import { unstable_cache as cache } from "next/cache";

const getBlogCategories = cache(
  async () => {
    const response = await fetch(
      `${process.env.PAYLOAD_URL}/api/categories?limit=100`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${process.env.PAYLOAD_API_KEY}`,
        },
        next: { revalidate: 86400 }, // Revalider une fois par jour
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch categories from PayloadCMS");
    }

    return response.json();
  },
  ["blog-categories"],
  { revalidate: 86400 } // Revalider une fois par jour
);

export async function GET() {
  try {
    const data = await getBlogCategories();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching blog categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
} 