import { NextRequest, NextResponse } from "next/server";
import { unstable_cache as cache } from "next/cache";
import { getPayloadClient } from "@/lib/payload";

const getRecentUpdates = cache(
  async (limit: string) => {
    const payload = await getPayloadClient();

    return payload.find({
      collection: "recent-updates",
      limit: parseInt(limit, 10),
      sort: "order",
      depth: 1,
    });
  },
  ["recent-updates"],
  { revalidate: 3600 }
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "3"; // Par défaut, récupérer 3 mises à jour

    // Utilisation de la fonction mise en cache
    const data = await getRecentUpdates(limit);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching recent updates:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent updates" },
      { status: 500 }
    );
  }
}
