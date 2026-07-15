import { NextResponse } from "next/server";
import { z } from "zod";
import { getPayloadClient } from "@/lib/payload";

// Schéma de validation avec Zod
const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Valider les données reçues
    const result = newsletterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: result.error.format(),
        },
        { status: 400 }
      );
    }

    const { email } = result.data;
    const payload = await getPayloadClient();

    // Vérifier si l'email existe déjà dans la liste des abonnés
    const existingData = await payload.find({
      collection: "newsletter",
      where: { email: { equals: email } },
      limit: 1,
      depth: 0,
    });

    // Si l'email existe déjà, on renvoie quand même un succès
    if (existingData.docs && existingData.docs.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Thank you for subscribing to our newsletter!",
      });
    }

    // Enregistrer dans Payload
    await payload.create({
      collection: "newsletter",
      data: {
        email,
        status: "active",
        subscribedAt: new Date().toISOString(),
      } as never,
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for subscribing to our newsletter!",
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe to newsletter" },
      { status: 500 }
    );
  }
}
