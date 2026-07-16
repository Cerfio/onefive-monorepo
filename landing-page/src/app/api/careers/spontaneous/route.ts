import { NextResponse } from "next/server";
import { z } from "zod";
import { getPayloadClient } from "@/lib/payload";

// Mirror the `resumes` collection's upload constraints so a too-large or
// wrong-type file returns a specific 400 here instead of throwing deep inside
// Payload and surfacing as a generic 500.
const MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const applicationSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  preferredDepartment: z.string().trim().min(1).max(100),
  currentRole: z.string().trim().min(1).max(200),
  yearsOfExperience: z.coerce.number().min(0).max(50),
  message: z.string().trim().min(1).max(5000),
  phone: z.string().max(50).optional(),
  linkedin: z.string().max(500).optional(),
  github: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // 1. Validate the CV file up front — before any DB/storage write.
    const resumeFile = formData.get("resume");
    if (!resumeFile || !(resumeFile instanceof File)) {
      return NextResponse.json(
        { error: "Resume file is required" },
        { status: 400 }
      );
    }
    if (resumeFile.size > MAX_RESUME_BYTES) {
      return NextResponse.json(
        { error: "Resume must be under 5 MB" },
        { status: 400 }
      );
    }
    if (!ALLOWED_RESUME_TYPES.includes(resumeFile.type)) {
      return NextResponse.json(
        { error: "Resume must be a PDF, DOC or DOCX file" },
        { status: 400 }
      );
    }

    // 2. Validate the applicant fields — again before touching storage, so a bad
    // email doesn't leave an orphaned CV in R2 (the old flow uploaded first).
    const parsed = applicationSchema.safeParse({
      firstName: formData.get("firstName")?.toString() ?? "",
      lastName: formData.get("lastName")?.toString() ?? "",
      email: formData.get("email")?.toString() ?? "",
      preferredDepartment: formData.get("preferredDepartment")?.toString() ?? "",
      currentRole: formData.get("currentRole")?.toString() ?? "",
      yearsOfExperience: formData.get("yearsOfExperience")?.toString() ?? "",
      message: formData.get("message")?.toString() ?? "",
      phone: formData.get("phone")?.toString() ?? "",
      linkedin: formData.get("linkedin")?.toString() ?? "",
      github: formData.get("github")?.toString() ?? "",
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid application data", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      firstName,
      lastName,
      preferredDepartment: department,
      currentRole: position,
      yearsOfExperience,
      message,
      phone,
      linkedin,
      github,
    } = parsed.data;
    const email = parsed.data.email.toLowerCase();

    const payload = await getPayloadClient();

    // 3. Dedupe by email BEFORE uploading. `spontaneous-applications.email` is
    // unique, so a repeat applicant would otherwise upload a CV, then 500 on the
    // application insert — leaving an orphaned resume and never getting through.
    const existing = await payload.find({
      collection: "spontaneous-applications",
      where: { email: { equals: email } },
      limit: 1,
      depth: 0,
    });
    if (existing.docs && existing.docs.length > 0) {
      return NextResponse.json(
        {
          error:
            "An application with this email already exists. We already have your details.",
        },
        { status: 409 }
      );
    }

    // 4. Upload the CV to the private `resumes` bucket.
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

    // 5. Create the application. If this fails, roll back the resume we just
    // uploaded so a failed submit never leaves a dangling CV behind.
    let application;
    try {
      application = await payload.create({
        collection: "spontaneous-applications",
        data: {
          firstName,
          lastName,
          email,
          phone: phone || "",
          preferredDepartment: department,
          currentRole: position,
          yearsOfExperience,
          socialProfiles: {
            linkedin: linkedin || "",
            github: github || "",
          },
          message,
          resume: resume.id,
          status: "new",
          submittedAt: new Date().toISOString(),
        } as never,
      });
    } catch (appError) {
      await payload
        .delete({ collection: "resumes", id: resume.id })
        .catch((cleanupError) =>
          console.error(
            "Failed to roll back orphaned resume after application error:",
            cleanupError
          )
        );
      throw appError;
    }

    // 6. Link the application back onto the resume (bidirectional relation).
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
