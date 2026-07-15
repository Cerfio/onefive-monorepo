import { NextResponse } from "next/server";
import { unstable_cache as cache } from "next/cache";
import { getPayloadClient } from "@/lib/payload";

const getBlogCategories = cache(
  async () => {
    const payload = await getPayloadClient();
    return payload.find({ collection: "categories", limit: 100 });
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
