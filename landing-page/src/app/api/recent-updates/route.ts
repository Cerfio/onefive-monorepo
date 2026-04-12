import { NextRequest, NextResponse } from "next/server";
import { unstable_cache as cache } from "next/cache";

const getRecentUpdates = cache(async (limit: string) => {
  const fetchOptions = {
    next: {
      revalidate: 3600,
    },
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = await fetch(
    `${process.env.PAYLOAD_URL}/api/recent-updates?limit=${limit}&sort=order`,
    fetchOptions
  );

  if (!response.ok) {
    throw new Error("Failed to fetch recent updates");
  }

  const data = await response.json();
  return data;
});

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
