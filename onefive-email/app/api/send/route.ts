import { getResend } from "@/lib/resend";

export const dynamic = "force-dynamic";
import { headers } from "next/headers";
import { z } from "zod";
import { VerificationCodeEmail } from "@/emails/verify-email";
import { ResetPasswordEmail } from "@/emails/reset-password";
import { FounderInvitationEmail } from "@/emails/founder-invitation";
import { MemberInvitationEmail } from "@/emails/member-invitation";
import { NewDeviceLoginEmail } from "@/emails/new-device-login";
import { SignupExistingAccountEmail } from "@/emails/signup-existing-account";
import { AccountActivatedEmail } from "@/emails/account-activated";
import { FoundingMemberEmail } from "@/emails/founding-member";
import { AdminInvitationEmail } from "@/emails/admin-invitation";
import { DataroomInvitationEmail } from "@/emails/dataroom-invitation";
import { PasswordChangedEmail } from "@/emails/password-changed";
import { prisma } from "@/lib/prisma.service";

const EmailTypeEnum = z.enum([
  "verification",
  "reset-password",
  "founder-invitation",
  "member-invitation",
  "new-device-login",
  "signup-existing-account",
  "account-activated",
  "founding-member",
  "admin-invitation",
  "dataroom-invitation",
  "password-changed",
]);

const emails = {
  [EmailTypeEnum.Values.verification]: {
    sender: "team@onefive.fr",
    email: VerificationCodeEmail,
    fields: ["code", "verificationUrl"],
    subject: "Your verification code has arrived",
  },
  [EmailTypeEnum.Values["reset-password"]]: {
    sender: "security@onefive.fr",
    email: ResetPasswordEmail,
    fields: ["code", "resetLink"],
    subject: "Reset your OneFive password",
  },
  [EmailTypeEnum.Values["founder-invitation"]]: {
    sender: "team@onefive.fr",
    email: FounderInvitationEmail,
    fields: ["inviterName", "startupName", "position", "equity", "acceptUrl", "declineUrl"],
    subject: "Vous avez été invité comme fondateur",
  },
  [EmailTypeEnum.Values["member-invitation"]]: {
    sender: "team@onefive.fr",
    email: MemberInvitationEmail,
    fields: ["inviterName", "startupName", "position", "acceptUrl", "declineUrl"],
    subject: "Invitation à rejoindre une startup",
  },
  [EmailTypeEnum.Values["new-device-login"]]: {
    sender: "security@onefive.fr",
    email: NewDeviceLoginEmail,
    fields: ["firstName", "deviceInfo", "location", "loginTime"],
    subject: "New sign-in to your OneFive account",
  },
  [EmailTypeEnum.Values["signup-existing-account"]]: {
    sender: "security@onefive.fr",
    email: SignupExistingAccountEmail,
    fields: ["firstName", "signinUrl"],
    subject: "Signup attempt on your OneFive account",
  },
  [EmailTypeEnum.Values["account-activated"]]: {
    sender: "team@onefive.fr",
    email: AccountActivatedEmail,
    fields: ["firstName", "userEmail", "loginUrl"],
    subject: "Your OneFive account is now active! 🎉",
  },
  [EmailTypeEnum.Values["founding-member"]]: {
    sender: "team@onefive.fr",
    email: FoundingMemberEmail,
    fields: ["firstName", "userEmail", "referralCount", "loginUrl"],
    subject: "🏆 You're now a Founding Member of OneFive",
  },
  [EmailTypeEnum.Values["admin-invitation"]]: {
    sender: "team@onefive.fr",
    email: AdminInvitationEmail,
    fields: ["inviterName", "roleName", "acceptUrl"],
    subject: "You've been invited to join the OneFive admin team",
  },
  [EmailTypeEnum.Values["dataroom-invitation"]]: {
    sender: "team@onefive.fr",
    email: DataroomInvitationEmail,
    fields: ["firstname", "inviterName", "dataroomName", "acceptUrl"],
    subject: "You've been invited to access a dataroom on OneFive",
  },
  [EmailTypeEnum.Values["password-changed"]]: {
    sender: "security@onefive.fr",
    email: PasswordChangedEmail,
    fields: ["firstName", "userEmail"],
    subject: "Your OneFive password has been changed",
  },
};

const BodySendEmail = z.object({
  to: z.string().email(),
  type: EmailTypeEnum,
  payload: z.object({}).catchall(z.any()),
  jobId: z.string(),
});

export async function POST(request: Request) {
  try {
    let body: z.infer<typeof BodySendEmail>;
    const headersList = await headers();
    const apiKey = headersList.get("x-api-key");

    /* Check if the API key is valid */
    if (apiKey !== process.env.API_KEY) {
      return Response.json(
        { message: "Please provide a valid API key", code: 401 },
        { status: 401 }
      );
    }

    /* Check if the request has a JSON body and required fields */
    try {
      const res = await request.json();
      body = BodySendEmail.parse(res);
    } catch (error) {
      /* Check if the error is a Zod error */
      if (error instanceof z.ZodError) {
        return Response.json(
          {
            message: "Missing required fields",
            code: 400,
            errors: error.issues,
          },
          { status: 400 }
        );
      }
      /* Check if the error is a JSON error */
      return Response.json(
        { message: "Please provide a valid JSON body", code: 400 },
        { status: 400 }
      );
    }

    /* Check if all required data email fields are present */
    if (emails[body.type].fields) {
      const missingFields = emails[body.type].fields.filter(
        (field) => !Object.keys(body.payload).includes(field)
      );
      if (missingFields.length) {
        return Response.json(
          {
            message: "Missing required fields",
            code: 400,
            errors: missingFields.map((field) => ({
              path: [field],
              message: "Missing required field",
            })),
          },
          { status: 400 }
        );
      }
    }

    const payload = body.payload as Record<string, unknown>;
    const emailProps =
      body.type === EmailTypeEnum.Values.verification
        ? {
            code: String(payload.code ?? ""),
            verificationUrl: String(payload.verificationUrl ?? ""),
            userEmail: body.to,
          }
        : body.type === EmailTypeEnum.Values["reset-password"]
          ? (() => {
              const { code, ...rest } = payload;
              return { ...rest, otp: code };
            })()
          : payload;

    const emailSent = await getResend().emails.send({
      from: `Onefive <${emails[body.type].sender}>`,
      to: body.to,
      subject: emails[body.type].subject,
      react: emails[body.type].email(emailProps as any),
    });

    if (emailSent.error) {
      return Response.json(
        { message: "Email not sent", code: 500, error: emailSent.error },
        { status: 500 }
      );
    }

    await prisma.resendEmail.create({
      data: {
        email: body.to,
        resendId: emailSent.data?.id || "",
        type: body.type,
        logs: [],
        jobId: body.jobId,
      },
    });
    return Response.json(
      { message: "Email sent", code: 200, success: emailSent.data?.id },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Internal Server Error", code: 500, error },
      { status: 500 }
    );
  }
}
