import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { EmailHeader, EmailFooter } from "./components";

const baseUrl = process.env.FRONTEND_URL || "";
const appUrl = baseUrl.replace(/\/$/, "");

export interface VerificationCodeEmailProps {
  code?: string;
  userEmail?: string;
  verificationUrl?: string;
}

const Square = ({ digit }: { digit: string }) => (
  <td
    style={{
      width: "64px",
      height: "72px",
      textAlign: "center",
      verticalAlign: "middle",
      borderRadius: "12px",
      border: "2px solid #E5E7EB",
      backgroundColor: "#F9FAFB",
      paddingLeft: "8px",
      paddingRight: "8px",
      fontSize: "48px",
      fontWeight: "700",
      color: "#111827",
      lineHeight: "1",
      fontFamily:
        "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}
  >
    {digit}
  </td>
);

export const VerificationCodeEmail = ({
  code = "1234",
  userEmail = "",
  verificationUrl = `${appUrl}/auth/confirm/email?code=${encodeURIComponent(code)}`,
}: VerificationCodeEmailProps) => {
  const digits = code.slice(0, 4).padEnd(4, " ");
  return (
    <Html>
      <Head />
      <Preview>Welcome to Onefive — verify your email address</Preview>
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
              Verify your email
            </Text>

            <Text
              style={{
                fontSize: "16px",
                color: "#6B7280",
                lineHeight: "1.6",
                marginTop: "0",
                marginBottom: "32px",
              }}
            >
              Use the code below or the button to confirm your email address and
              finish setting up your Onefive account.
            </Text>

            <Section style={{ margin: "40px 0" }}>
              <table
                style={{
                  margin: "0 auto",
                  borderSpacing: "12px",
                  borderCollapse: "separate",
                }}
              >
                <tbody>
                  <tr>
                    <Square digit={digits[0] ?? " "} />
                    <Square digit={digits[1] ?? " "} />
                    <Square digit={digits[2] ?? " "} />
                    <Square digit={digits[3] ?? " "} />
                  </tr>
                </tbody>
              </table>
            </Section>

            <Text
              style={{
                fontSize: "14px",
                color: "#6B7280",
                lineHeight: "1.6",
                marginTop: "32px",
                marginBottom: "32px",
                textAlign: "center",
                fontWeight: "600",
              }}
            >
              This code will expire in 20 minutes
            </Text>

            <Hr
              style={{
                border: "none",
                borderTop: "1px solid #E5E7EB",
                margin: "32px 0",
              }}
            />

            <Text
              style={{
                fontSize: "16px",
                color: "#6B7280",
                lineHeight: "1.6",
                marginTop: "0",
                marginBottom: "24px",
              }}
            >
              Prefer one click? Use the button below to verify your email:
            </Text>

            <Section style={{ textAlign: "center", margin: "32px 0" }}>
              <Button
                href={verificationUrl}
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
                Verify my email
              </Button>
            </Section>

            <Text
              style={{
                fontSize: "14px",
                color: "#9CA3AF",
                lineHeight: "1.6",
                marginTop: "32px",
                marginBottom: "0",
              }}
            >
              If you didn&apos;t create an Onefive account, you can safely ignore
              this email.
            </Text>
          </Section>

          <EmailFooter baseUrl={baseUrl} userEmail={userEmail} />
        </Container>
      </Body>
    </Html>
  );
};

export default VerificationCodeEmail;
