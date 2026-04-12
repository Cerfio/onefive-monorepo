import { NextResponse } from "next/server";

// Cache simple en mémoire pour éviter les changements trop fréquents
let cachedData: { count: number; timestamp: number } | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

function shouldUpdateCache(): boolean {
  if (!cachedData) return true;
  const now = Date.now();
  return (now - cachedData.timestamp) > CACHE_DURATION;
}

export async function GET() {
  try {
    // Récupérer le nombre total d'utilisateurs dans la waitlist
    const response = await fetch(
      `${process.env.PAYLOAD_URL}/api/waitlist?limit=1&depth=0`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${process.env.PAYLOAD_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch waitlist count");
    }

    const data = await response.json();
    const realCount = data.totalDocs || 0;

    // Vérifier si on doit mettre à jour le cache
    const now = Date.now();
    let displayedCount: number;

    if (!cachedData || shouldUpdateCache()) {
      // Base fixe + nombre réel d'inscrits (800 + realCount)
      displayedCount = 800 + realCount;

      // Mettre à jour le cache
      cachedData = {
        count: displayedCount,
        timestamp: now
      };
    } else {
      // Utiliser les données en cache
      displayedCount = cachedData.count;
    }

    // Formater le nombre (ex: 4231 -> "4,231")
    const formattedCount = displayedCount.toLocaleString();

    return NextResponse.json({
      count: displayedCount,
      formattedCount,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching waitlist count:", error);

    // En cas d'erreur, retourner les données en cache si disponibles
    if (cachedData && !shouldUpdateCache()) {
      return NextResponse.json({
        count: cachedData.count,
        formattedCount: cachedData.count.toLocaleString(),
        success: false,
        error: "Failed to fetch count, using cache",
      });
    }

    // Fallback final
    const fallbackCount = 750;
    return NextResponse.json({
      count: fallbackCount,
      formattedCount: fallbackCount.toString(),
      success: false,
      error: "Failed to fetch count",
    });
  }
}
