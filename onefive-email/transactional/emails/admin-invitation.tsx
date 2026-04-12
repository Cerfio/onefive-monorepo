import {
  Body,
  Button,
  Container,
  Font,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";
import { EmailHeader, EmailFooter } from "./components";

const baseUrl = process.env.FRONTEND_URL || "";
const appUrl = baseUrl.replace(/\/$/, "");

interface AdminInvitationEmailProps {
  inviterName?: string;
  roleName?: string;
  acceptUrl?: string;
  expiresIn?: string;
}

export const AdminInvitationEmail = ({
  inviterName = "A team member",
  roleName = "Admin",
  acceptUrl = `${appUrl}/accept-invitation`,
  expiresIn = "48 hours",
}: AdminInvitationEmailProps) => (
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
      <Preview>You've been invited to join the OneFive admin team</Preview>
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
              You've been invited 🛡️
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
              <strong>{inviterName}</strong> has invited you to join the{" "}
              <strong>OneFive admin team</strong> as{" "}
              <strong>{roleName}</strong>.
            </Text>

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
                Your role
              </Text>
              <Text
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#111827",
                  margin: "0",
                }}
              >
                {roleName}
              </Text>
            </Section>

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
                Accept invitation
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
              This invitation will expire in <strong>{expiresIn}</strong>. If
              you weren&apos;t expecting this email, you can safely ignore it —
              no account will be created without your action.
            </Text>
          </Section>

          <EmailFooter baseUrl={baseUrl} />
        </Container>
      </Body>
    </Html>
  </Tailwind>
);

export default AdminInvitationEmail;
