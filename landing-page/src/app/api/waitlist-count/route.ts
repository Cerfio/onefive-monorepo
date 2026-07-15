import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";

// Cache simple en mémoire pour éviter les changements trop fréquents
let cachedData: { count: number; timestamp: number } | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

function shouldUpdateCache(): boolean {
  if (!cachedData) return true;
  const now = Date.now();
  return now - cachedData.timestamp > CACHE_DURATION;
}

export async function GET() {
  try {
    // Récupérer le nombre total d'utilisateurs dans la waitlist
    const payload = await getPayloadClient();
    const data = await payload.find({
      collection: "waitlist",
      limit: 1,
      depth: 0,
    });

    const realCount = data.totalDocs || 0;

    // Vérifier si on doit mettre à jour le cache
    const now = Date.now();
    let displayedCount: number;

    if (!cachedData || shouldUpdateCache()) {
      // Le nombre réel d'inscrits, et rien d'autre : ce compteur est affiché
      // comme un fait, et /payload-api/waitlist expose le même total.
      displayedCount = realCount;

      // Mettre à jour le cache
      cachedData = {
        count: displayedCount,
        timestamp: now,
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

    // Pas de repli chiffré : mieux vaut ne rien afficher qu'un nombre inventé.
    return NextResponse.json({
      count: null,
      formattedCount: null,
      success: false,
      error: "Failed to fetch count",
    });
  }
}
