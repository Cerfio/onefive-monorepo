import { NextResponse } from "next/server";
import { z } from "zod";

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

    // Vérifier si l'email existe déjà dans la liste des abonnés
    const checkExisting = await fetch(
      `${process.env.PAYLOAD_URL}/api/newsletter?where[email][equals]=${encodeURIComponent(email)}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${process.env.PAYLOAD_API_KEY}`,
        },
      }
    );

    const existingData = await checkExisting.json();

    // Si l'email existe déjà, on renvoie quand même un succès
    if (existingData.docs && existingData.docs.length > 0) {
      return NextResponse.json({ 
        success: true,
        message: "Thank you for subscribing to our newsletter!",
      });
    }

    // Envoyer les données à PayloadCMS ou à votre service de newsletter
    const payloadResponse = await fetch(
      `${process.env.PAYLOAD_URL}/api/newsletter`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${process.env.PAYLOAD_API_KEY}`,
        },
        body: JSON.stringify({
          email,
          status: "active",
          subscribedAt: new Date().toISOString(),
        }),
      }
    );

    if (!payloadResponse.ok) {
      const errorData = await payloadResponse.json();
      throw new Error(
        errorData.message ||
          "Error during newsletter subscription"
      );
    }

    return NextResponse.json({ 
      success: true,
      message: "Thank you for subscribing to our newsletter!"
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe to newsletter" },
      { status: 500 }
    );
  }
} 