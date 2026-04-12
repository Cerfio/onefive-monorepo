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

interface VerificationCodeEmailProps {
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
    }}
  >
    <Text
      style={{
        fontSize: "48px",
        fontWeight: "700",
        color: "#111827",
        margin: 0,
        lineHeight: "1",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {digit}
    </Text>
  </td>
);

export const VerificationCodeEmail = ({
  code = "1234",
  userEmail = "",
  verificationUrl = `${appUrl}/auth/confirm/email?code=${code}`,
}: VerificationCodeEmailProps) => (
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
      <Preview>Welcome to Onefive - Verify your email address</Preview>
      <Body
        style={{
          backgroundColor: "#F3F4F6",
          fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
          {/* Header avec logo */}
          <EmailHeader baseUrl={baseUrl} />

          {/* Contenu principal */}
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
              Welcome to Onefive! 👋
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
              We&apos;re excited to have you join our community of entrepreneurs. To get started, please verify your email address using the code below:
            </Text>

            {/* Code de vérification */}
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
                    <Square digit={code[0]} />
                    <Square digit={code[1]} />
                    <Square digit={code[2]} />
                    <Square digit={code[3]} />
                  </tr>
                </tbody>
              </table>
            </Section>

            <Text
              style={{
                fontSize: "14px",
                color: "#9CA3AF",
                lineHeight: "1.6",
                marginTop: "32px",
                marginBottom: "32px",
                textAlign: "center",
              }}
            >
              This code will expire in <strong style={{ color: "#6B7280" }}>20 minutes</strong>
            </Text>

            {/* Divider */}
            <Hr style={{ border: "none", borderTop: "1px solid #E5E7EB", margin: "32px 0" }} />

            <Text
              style={{
                fontSize: "16px",
                color: "#6B7280",
                lineHeight: "1.6",
                marginTop: "0",
                marginBottom: "24px",
              }}
            >
              Alternatively, you can verify your email by clicking the button below:
            </Text>

            {/* Bouton CTA */}
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
                Verify Email Address
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
              If you didn&apos;t create an account with Onefive, you can safely ignore this email.
            </Text>
          </Section>

          {/* Footer */}
          <EmailFooter baseUrl={baseUrl} userEmail={userEmail} />
        </Container>
      </Body>
    </Html>
  </Tailwind>
);

export default VerificationCodeEmail;
