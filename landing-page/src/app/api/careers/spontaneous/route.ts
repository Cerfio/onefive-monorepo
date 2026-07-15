import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";

export async function POST(request: Request) {
  try {
    // Pour le téléchargement de fichiers, nous devons d'abord obtenir les données du formulaire
    const formData = await request.formData();

    // Vérifier si le fichier CV existe
    const resumeFile = formData.get("resume");
    if (!resumeFile || !(resumeFile instanceof File)) {
      return NextResponse.json(
        { error: "Resume file is required" },
        { status: 400 }
      );
    }

    // 1. Extraire les données du candidat
    const firstName = formData.get("firstName")?.toString() || "";
    const lastName = formData.get("lastName")?.toString() || "";
    const email = formData.get("email")?.toString() || "";
    const department = formData.get("preferredDepartment")?.toString() || "";
    const position = formData.get("currentRole")?.toString() || "";

    const payload = await getPayloadClient();

    // 2. Télécharger d'abord le fichier CV à la collection Resumes
    const resumeBuffer = Buffer.from(await resumeFile.arrayBuffer());

    const resume = await payload.create({
      collection: "resumes",
      data: {
        firstName,
        lastName,
        email,
        department,
        position,
        status: "new",
      } as never,
      file: {
        data: resumeBuffer,
        mimetype: resumeFile.type,
        name: resumeFile.name,
        size: resumeBuffer.length,
      },
    });

    // 3. Créer la candidature avec référence au CV téléchargé
    const application = await payload.create({
      collection: "spontaneous-applications",
      data: {
        firstName,
        lastName,
        email,
        phone: formData.get("phone")?.toString() || "",
        preferredDepartment: department,
        currentRole: position,
        yearsOfExperience: formData.get("yearsOfExperience")?.toString() || "",
        socialProfiles: {
          linkedin: formData.get("linkedin")?.toString() || "",
          github: formData.get("github")?.toString() || "",
        },
        message: formData.get("message")?.toString() || "",
        resume: resume.id, // Référence au CV téléchargé
        status: "new",
        submittedAt: new Date().toISOString(),
      } as never,
    });

    // 4. Mettre à jour le CV pour y associer la candidature (relation bidirectionnelle)
    await payload.update({
      collection: "resumes",
      id: resume.id,
      data: {
        application: application.id,
      } as never,
    });

    return NextResponse.json({
      success: true,
      message:
        "Thank you for your application! We'll review it and get back to you soon.",
    });
  } catch (error) {
    console.error("Application submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit application. Please try again later." },
      { status: 500 }
    );
  }
}
