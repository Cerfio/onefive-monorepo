import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";

export async function GET() {
  try {
    const payload = await getPayloadClient();

    // Récupérer toutes les releases
    const data = await payload.find({
      collection: "releases",
      limit: 100,
      sort: "-date",
      depth: 1,
    });

    // Transformer au format souhaité pour l'export
    const formattedData = data.docs.map((release: any) => ({
      version: release.version,
      date: new Date(release.date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      summary: release.summary,
      changes: release.changes || [],
      isLatest: release.isLatest || false,
    }));

    // Set des headers pour forcer le téléchargement
    return new NextResponse(JSON.stringify(formattedData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="changelog.json"',
      },
    });
  } catch (error) {
    console.error("Error generating JSON:", error);
    return NextResponse.json(
      { error: "Failed to generate changelog JSON" },
      { status: 500 }
    );
  }
}
