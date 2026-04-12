import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { EmailHeader, EmailFooter } from "./components";

const baseUrl = process.env.FRONTEND_URL || "";

interface PasswordChangedEmailProps {
  firstName?: string;
  userEmail?: string;
  supportUrl?: string;
}

export const PasswordChangedEmail = ({
  firstName = "there",
  userEmail = "",
  supportUrl = "mailto:support@onefive.fr",
}: PasswordChangedEmailProps) => (
  <Html>
      <Head />
      <Preview>Your OneFive password has been changed</Preview>
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
              Password changed 🔒
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
              Hi {firstName}, your OneFive account password was just
              successfully changed.
            </Text>

            <Section
              style={{
                backgroundColor: "#FEF3C7",
                borderRadius: "12px",
                padding: "20px 24px",
                marginBottom: "32px",
                border: "1px solid #FDE68A",
              }}
            >
              <Text
                style={{
                  fontSize: "14px",
                  color: "#92400E",
                  margin: "0",
                  lineHeight: "1.6",
                }}
              >
                ⚠️ If you didn&apos;t make this change, your account may be
                compromised. Please contact us immediately using the link below.
              </Text>
              <Link
                href={supportUrl}
                style={{
                  color: "#92400E",
                  textDecoration: "underline",
                  fontSize: "14px",
                  display: "block",
                  marginTop: "12px",
                }}
              >
                support@onefive.fr
              </Link>
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
              This is an automated security notification. No action is required
              if you initiated this change.
            </Text>
          </Section>

          <EmailFooter baseUrl={baseUrl} userEmail={userEmail} />
        </Container>
      </Body>
    </Html>
);

export default PasswordChangedEmail;
