import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Récupérer toutes les releases
    const response = await fetch(
      `${process.env.PAYLOAD_URL}/api/releases?limit=100&sort=-date`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch releases");
    }

    const data = await response.json();

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
