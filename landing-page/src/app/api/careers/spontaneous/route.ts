import { NextResponse } from "next/server";
import { z } from "zod";

// Schéma de validation avec Zod
const applicationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  preferredDepartment: z.string().min(1, "Please select a department"),
  currentRole: z.string().min(1, "Current role is required"),
  yearsOfExperience: z.string().min(1, "Years of experience is required"),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  message: z.string().min(10, "Please provide a more detailed message"),
  resumeId: z.string().min(1, "Resume is required"),
});

export async function POST(request: Request) {
  try {
    // Pour le téléchargement de fichiers, nous devons d'abord obtenir les données du formulaire
    const formData = await request.formData();
    
    // Vérifier si le fichier CV existe
    const resumeFile = formData.get('resume');
    if (!resumeFile || !(resumeFile instanceof File)) {
      return NextResponse.json(
        { error: "Resume file is required" },
        { status: 400 }
      );
    }
    
    // 1. Extraire les données du candidat
    const firstName = formData.get('firstName')?.toString() || '';
    const lastName = formData.get('lastName')?.toString() || '';
    const email = formData.get('email')?.toString() || '';
    const department = formData.get('preferredDepartment')?.toString() || '';
    const position = formData.get('currentRole')?.toString() || '';
    
    // 2. Télécharger d'abord le fichier CV à la collection Resumes
    const fileFormData = new FormData();
    fileFormData.append('file', resumeFile);
    fileFormData.append('firstName', firstName);
    fileFormData.append('lastName', lastName);
    fileFormData.append('email', email);
    fileFormData.append('department', department);
    fileFormData.append('position', position);
    fileFormData.append('status', 'new');
    
    const fileUploadResponse = await fetch(`${process.env.PAYLOAD_URL}/api/resumes`, {
      method: 'POST',
      headers: {
        Authorization: `JWT ${process.env.PAYLOAD_API_KEY}`,
      },
      body: fileFormData,
    });
    
    if (!fileUploadResponse.ok) {
      const fileError = await fileUploadResponse.json();
      throw new Error(fileError.message || 'Failed to upload resume file');
    }
    
    const fileData = await fileUploadResponse.json();
    const resumeId = fileData.id;
    
    // 3. Créer la candidature avec référence au CV téléchargé
    const applicationResponse = await fetch(
      `${process.env.PAYLOAD_URL}/api/spontaneous-applications`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${process.env.PAYLOAD_API_KEY}`,
        },
        body: JSON.stringify({
          firstName: formData.get('firstName'),
          lastName: formData.get('lastName'),
          email: formData.get('email'),
          phone: formData.get('phone') || '',
          preferredDepartment: formData.get('preferredDepartment'),
          currentRole: formData.get('currentRole'),
          yearsOfExperience: formData.get('yearsOfExperience'),
          socialProfiles: {
            linkedin: formData.get('linkedin') || '',
            github: formData.get('github') || '',
          },
          message: formData.get('message'),
          resume: resumeId, // Référence au CV téléchargé
          status: "new",
          submittedAt: new Date().toISOString(),
        }),
      }
    );
    
    if (!applicationResponse.ok) {
      const errorData = await applicationResponse.json();
      throw new Error(
        errorData.message || "Error submitting application"
      );
    }
    
    // 4. Récupérer l'ID de la candidature créée
    const applicationData = await applicationResponse.json();
    const applicationId = applicationData.id;
    
    // 5. Mettre à jour le CV pour y associer la candidature (relation bidirectionnelle)
    await fetch(
      `${process.env.PAYLOAD_URL}/api/resumes/${resumeId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${process.env.PAYLOAD_API_KEY}`,
        },
        body: JSON.stringify({
          application: applicationId,
        }),
      }
    );
    
    return NextResponse.json({
      success: true,
      message: "Thank you for your application! We'll review it and get back to you soon."
    });
    
  } catch (error) {
    console.error("Application submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit application. Please try again later." },
      { status: 500 }
    );
  }
} 