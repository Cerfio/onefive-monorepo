import { getPrisma } from "@/lib/prisma.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const BodyWebhookEmail = z.object({
  created_at: z.string(),
  data: z.object({
    created_at: z.string(),
    email_id: z.string(),
    from: z.string(),
    subject: z.string(),
    to: z.array(z.string()),
  }),
  type: z.string(),
});

export async function POST(request: Request) {
  let payloadParsed: z.infer<typeof BodyWebhookEmail>;

  try {
    const payload = await request.json();
    payloadParsed = BodyWebhookEmail.parse(payload);
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Missing required fields", code: 400, errors: error },
      { status: 400 }
    );
  }
  try {
    const prisma = getPrisma();
    const resendEmail = await prisma.resendEmail.findUnique({
      where: { resendId: payloadParsed.data.email_id },
    });

    if (!resendEmail) {
      return Response.json(
        { message: "ResendEmail not found", code: 404 },
        { status: 404 }
      );
    }

    const currentLogs = (resendEmail.logs as any[]) || [];
    const updatedJobLogs = [...currentLogs, payloadParsed];

    await prisma.resendEmail.update({
      where: { id: resendEmail.id },
      data: { logs: updatedJobLogs },
    });

    return Response.json({ message: "OK", code: 200 }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Internal server error", code: 500 },
      { status: 500 }
    );
  }
}
