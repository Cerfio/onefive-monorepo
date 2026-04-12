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

interface FoundingMemberEmailProps {
  firstName?: string;
  userEmail?: string;
  referralCount?: number;
  loginUrl?: string;
}

export const FoundingMemberEmail = ({
  firstName = "there",
  userEmail = "",
  referralCount = 10,
  loginUrl = `${appUrl}/signin`,
}: FoundingMemberEmailProps) => (
  <Html>
      <Head />
      <Preview>
        🏆 Congratulations! You&apos;re now a Founding Member of OneFive
      </Preview>
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
            <Section
              style={{
                textAlign: "center",
                margin: "0 0 32px 0",
              }}
            >
              <Text
                style={{
                  fontSize: "48px",
                  margin: "0 0 8px 0",
                  lineHeight: "1",
                }}
              >
                🏆
              </Text>
            </Section>

            <Text
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#111827",
                marginTop: "0",
                marginBottom: "16px",
                lineHeight: "1.3",
                textAlign: "center",
              }}
            >
              Founding Member Unlocked!
            </Text>

            <Text
              style={{
                fontSize: "16px",
                color: "#6B7280",
                lineHeight: "1.6",
                marginTop: "0",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              Congratulations {firstName}! You&apos;ve successfully referred{" "}
              {referralCount} people to OneFive and earned the prestigious
              Founding Member badge.
            </Text>

            <Section
              style={{
                background:
                  "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)",
                borderRadius: "16px",
                padding: "32px",
                margin: "32px 0",
                textAlign: "center",
                border: "1px solid #C7D2FE",
              }}
            >
              <Text
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#4338CA",
                  margin: "0 0 8px 0",
                }}
              >
                🎖️ Founding Member
              </Text>
              <Text
                style={{
                  fontSize: "14px",
                  color: "#6366F1",
                  margin: "0",
                  lineHeight: "1.6",
                }}
              >
                Your account has been activated and this badge will be
                permanently displayed on your profile.
              </Text>
            </Section>

            <Text
              style={{
                fontSize: "16px",
                color: "#6B7280",
                lineHeight: "1.6",
                marginTop: "0",
                marginBottom: "32px",
              }}
            >
              As a Founding Member, you&apos;re among the first builders of our
              community. Thank you for helping grow the OneFive ecosystem!
            </Text>

            <Section style={{ textAlign: "center", margin: "32px 0" }}>
              <Button
                href={loginUrl}
                style={{
                  backgroundColor: "#4F46E5",
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
                Explore OneFive
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
                textAlign: "center",
              }}
            >
              Keep inviting friends — higher tiers unlock even more perks!
            </Text>
          </Section>

          <EmailFooter baseUrl={baseUrl} userEmail={userEmail} />
        </Container>
      </Body>
    </Html>
);

export default FoundingMemberEmail;
