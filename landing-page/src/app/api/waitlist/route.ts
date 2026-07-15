import { NextResponse } from "next/server";
import { z } from "zod";
import { getPayloadClient } from "@/lib/payload";

// Schéma de validation avec Zod
const waitlistSchema = z.object({
  email: z.string().email("Veuillez entrer une adresse email valide"),
  job: z.string().min(1, "Veuillez sélectionner votre métier"),
  source: z.string().min(1, "Veuillez indiquer comment vous nous avez connus"),
  goal: z.string().min(1, "Veuillez sélectionner votre objectif principal"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Valider les données reçues
    const result = waitlistSchema.safeParse(body);

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

    const { email, job, source, goal } = result.data;
    const payload = await getPayloadClient();

    // Vérifier si l'email existe déjà dans la liste d'attente
    const existingData = await payload.find({
      collection: "waitlist",
      where: { email: { equals: email } },
      limit: 1,
      depth: 0,
    });

    // Si l'email existe déjà, on renvoie quand même un succès
    // mais on inclut une propriété cachée pour le client
    if (existingData.docs && existingData.docs.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Merci pour votre inscription à notre liste d'attente !",
        // Cette propriété sera utilisée côté client pour gérer l'UI sans révéler d'info sensible
        _alreadyExists: true,
      });
    }

    // Enregistrer dans Payload
    await payload.create({
      collection: "waitlist",
      data: {
        email,
        job,
        source,
        goal,
        status: "pending",
        submittedAt: new Date().toISOString(),
      } as never,
    });

    return NextResponse.json({
      success: true,
      message: "Merci pour votre inscription à notre liste d'attente !",
    });
  } catch (error) {
    console.error("Waitlist submission error:", error);
    return NextResponse.json(
      { error: "Failed to join waitlist" },
      { status: 500 }
    );
  }
}
