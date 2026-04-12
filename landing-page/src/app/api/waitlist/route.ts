import { NextResponse } from "next/server";
import { z } from "zod";

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

    // Vérifier si l'email existe déjà dans la liste d'attente
    const checkExisting = await fetch(
      `${process.env.PAYLOAD_URL}/api/waitlist?where[email][equals]=${encodeURIComponent(email)}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${process.env.PAYLOAD_API_KEY}`,
        },
      }
    );

    const existingData = await checkExisting.json();

    // Si l'email existe déjà, on renvoie quand même un succès
    // mais on inclut une propriété cachée pour le client
    if (existingData.docs && existingData.docs.length > 0) {
      return NextResponse.json({ 
        success: true,
        message: "Merci pour votre inscription à notre liste d'attente !",
        // Cette propriété sera utilisée côté client pour gérer l'UI sans révéler d'info sensible
        _alreadyExists: true
      });
    }

    // Envoyer les données à PayloadCMS
    const payloadResponse = await fetch(
      `${process.env.PAYLOAD_URL}/api/waitlist`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${process.env.PAYLOAD_API_KEY}`,
        },
        body: JSON.stringify({
          email,
          job,
          source,
          goal,
          status: "pending",
          submittedAt: new Date().toISOString(),
        }),
      }
    );

    if (!payloadResponse.ok) {
      const errorData = await payloadResponse.json();
      throw new Error(
        errorData.message ||
          "Erreur lors de l'enregistrement à la liste d'attente"
      );
    }

    return NextResponse.json({ 
      success: true,
      message: "Merci pour votre inscription à notre liste d'attente !"
    });
  } catch (error) {
    console.error("Waitlist submission error:", error);
    return NextResponse.json(
      { error: "Failed to join waitlist" },
      { status: 500 }
    );
  }
}
