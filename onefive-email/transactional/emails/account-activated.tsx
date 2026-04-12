import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { EmailHeader, EmailFooter } from "./components";

const baseUrl = process.env.FRONTEND_URL || "";
const appUrl = baseUrl.replace(/\/$/, "");

interface AccountActivatedEmailProps {
  firstName?: string;
  userEmail?: string;
  loginUrl?: string;
}

export const AccountActivatedEmail = ({
  firstName = "there",
  userEmail = "",
  loginUrl = `${appUrl}/signin`,
}: AccountActivatedEmailProps) => (
  <Html>
      <Head />
      <Preview>Your OneFive account is now active! 🎉</Preview>
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
              Welcome aboard, {firstName}! 🚀
            </Text>

            <Text
              style={{
                fontSize: "16px",
                color: "#6B7280",
                lineHeight: "1.6",
                marginTop: "0",
                marginBottom: "16px",
              }}
            >
              Great news — your OneFive account has been activated! You now have
              full access to the platform.
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
              Here&apos;s what you can do next:
            </Text>

            <Section
              style={{
                backgroundColor: "#F9FAFB",
                borderRadius: "12px",
                padding: "24px",
                marginBottom: "32px",
              }}
            >
              <Text
                style={{
                  fontSize: "14px",
                  color: "#111827",
                  lineHeight: "1.8",
                  margin: "0",
                }}
              >
                ✅ Complete your profile with your experiences
                {"\n"}✅ Connect with other entrepreneurs
                {"\n"}✅ Share your first post
                {"\n"}✅ Explore startups in the ecosystem
              </Text>
            </Section>

            <Section style={{ textAlign: "center", margin: "32px 0" }}>
              <Button
                href={loginUrl}
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
                Go to OneFive
              </Button>
            </Section>

            <Text
              style={{
                fontSize: "14px",
                color: "#9CA3AF",
                lineHeight: "1.6",
                marginTop: "32px",
                marginBottom: "0",
                textAlign: "center",
              }}
            >
              Thank you for being part of the OneFive community.
            </Text>
          </Section>

          <EmailFooter baseUrl={baseUrl} userEmail={userEmail} />
        </Container>
      </Body>
    </Html>
);

export default AccountActivatedEmail;
