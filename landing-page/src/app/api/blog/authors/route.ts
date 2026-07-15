import { NextResponse } from "next/server";
import { unstable_cache as cache } from "next/cache";
import { getPayloadClient } from "@/lib/payload";

const getBlogAuthors = cache(
  async () => {
    // Les auteurs sont les membres de l'équipe.
    const payload = await getPayloadClient();
    return payload.find({ collection: "team", limit: 100 });
  },
  ["blog-authors"],
  { revalidate: 86400 } // Revalider une fois par jour
);

export async function GET() {
  try {
    const data = await getBlogAuthors();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching blog authors:", error);
    return NextResponse.json(
      { error: "Failed to fetch authors" },
      { status: 500 }
    );
  }
}
