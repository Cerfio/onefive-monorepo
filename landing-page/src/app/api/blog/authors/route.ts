import { NextResponse } from "next/server";
import { unstable_cache as cache } from "next/cache";

const getBlogAuthors = cache(
  async () => {
    // Récupérer tous les membres de l'équipe qui sont auteurs
    // Vous pourriez ajouter un filtre spécifique si nécessaire
    const response = await fetch(
      `${process.env.PAYLOAD_URL}/api/team?limit=100`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${process.env.PAYLOAD_API_KEY}`,
        },
        next: { revalidate: 86400 }, // Revalider une fois par jour
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch authors from PayloadCMS");
    }

    return response.json();
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