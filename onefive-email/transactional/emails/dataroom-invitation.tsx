import {
  Body,
  Button,
  Container,
  Font,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";
import { EmailHeader, EmailFooter } from "./components";

const baseUrl = process.env.FRONTEND_URL || "";
const appUrl = baseUrl.replace(/\/$/, "");

interface DataroomInvitationEmailProps {
  firstname?: string;
  inviterName?: string;
  dataroomName?: string;
  startupLogo?: string;
  acceptUrl?: string;
}

export const DataroomInvitationEmail = ({
  firstname = "there",
  inviterName = "A team member",
  dataroomName = "a dataroom",
  startupLogo,
  acceptUrl = appUrl || "/",
}: DataroomInvitationEmailProps) => (
  <Tailwind>
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>You&apos;ve been invited to access a dataroom on OneFive</Preview>
      <Body
        style={{
          backgroundColor: "#F3F4F6",
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          margin: 0,
          padding: 0,
        }}
      >
        <Container
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
          }}
        >
          <EmailHeader baseUrl={baseUrl} />

          <Section style={{ padding: "0 48px 48px" }}>
            <Text
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#111827",
                marginTop: "0",
                marginBottom: "16px",
                lineHeight: "1.3",
              }}
            >
              Dataroom access 📁
            </Text>

            <Text
              style={{
                fontSize: "16px",
                color: "#6B7280",
                lineHeight: "1.6",
                marginTop: "0",
                marginBottom: "24px",
              }}
            >
              Hi {firstname}, <strong>{inviterName}</strong> has invited you to
              access the dataroom <strong>&ldquo;{dataroomName}&rdquo;</strong>{" "}
              on OneFive.
            </Text>

            {startupLogo && (
              <Section style={{ textAlign: "center", margin: "0 0 24px 0" }}>
                <Img
                  src={startupLogo}
                  alt="Startup logo"
                  width="72"
                  height="72"
                  style={{
                    borderRadius: "12px",
                    objectFit: "cover",
                    display: "inline-block",
                  }}
                />
              </Section>
            )}

            <Section
              style={{
                backgroundColor: "#F9FAFB",
                borderRadius: "12px",
                padding: "24px",
                marginBottom: "32px",
                border: "1px solid #E5E7EB",
              }}
            >
              <Text
                style={{
                  fontSize: "13px",
                  color: "#9CA3AF",
                  margin: "0 0 6px 0",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontWeight: "600",
                }}
              >
                Dataroom
              </Text>
              <Text
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#111827",
                  margin: "0",
                }}
              >
                {dataroomName}
              </Text>
            </Section>

            <Text
              style={{
                fontSize: "16px",
                color: "#6B7280",
                lineHeight: "1.6",
                marginTop: "0",
                marginBottom: "24px",
              }}
            >
              Create your OneFive account to access the shared documents.
            </Text>

            <Section style={{ textAlign: "center", margin: "32px 0" }}>
              <Button
                href={acceptUrl}
                style={{
                  backgroundColor: "#111827",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontSize: "16px",
                  fontWeight: "600",
                  textDecoration: "none",
                  textAlign: "center",
                  display: "inline-block",
                  padding: "14px 32px",
                  lineHeight: "1.4",
                }}
              >
                Access dataroom
              </Button>
            </Section>

            <Hr
              style={{
                border: "none",
                borderTop: "1px solid #E5E7EB",
                margin: "32px 0",
              }}
            />

            <Text
              style={{
                fontSize: "14px",
                color: "#9CA3AF",
                lineHeight: "1.6",
                marginTop: "0",
                marginBottom: "0",
              }}
            >
              If you weren&apos;t expecting this invitation, you can safely
              ignore this email.
            </Text>
          </Section>

          <EmailFooter baseUrl={baseUrl} />
        </Container>
      </Body>
    </Html>
  </Tailwind>
);

export default DataroomInvitationEmail;
