import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "10";
    const page = searchParams.get("page") || "1";

    const payload = await getPayloadClient();

    // Récupération des releases depuis PayloadCMS
    const data = await payload.find({
      collection: "releases",
      limit: parseInt(limit, 10),
      page: parseInt(page, 10),
      sort: "-date",
      depth: 1,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching releases:", error);
    return NextResponse.json(
      { error: "Failed to fetch releases" },
      { status: 500 }
    );
  }
}
