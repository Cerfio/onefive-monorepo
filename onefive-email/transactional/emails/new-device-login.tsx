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

interface NewDeviceLoginEmailProps {
  firstName?: string;
  userEmail?: string;
  deviceInfo?: string;
  location?: string;
  ipAddress?: string;
  loginTime?: string;
  sessionsUrl?: string;
}

export const NewDeviceLoginEmail = ({
  firstName = "there",
  userEmail = "",
  deviceInfo = "Unknown Device",
  location = "Unknown Location",
  ipAddress = "",
  loginTime = new Date().toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }),
  sessionsUrl = `${appUrl}/settings/sessions`,
}: NewDeviceLoginEmailProps) => (
  <Html>
      <Head />
      <Preview>New sign-in to your OneFive account</Preview>
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
              New sign-in detected 🔐
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
              Hi {firstName}, we noticed a new sign-in to your OneFive account
              from a device we don&apos;t recognize.
            </Text>

            {/* Device Info Box */}
            <Section
              style={{
                backgroundColor: "#F9FAFB",
                borderRadius: "12px",
                padding: "24px",
                marginBottom: "24px",
                border: "1px solid #E5E7EB",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td
                      style={{
                        padding: "8px 0",
                        fontSize: "14px",
                        color: "#6B7280",
                        width: "120px",
                      }}
                    >
                      📱 Device
                    </td>
                    <td
                      style={{
                        padding: "8px 0",
                        fontSize: "14px",
                        color: "#111827",
                        fontWeight: "500",
                      }}
                    >
                      {deviceInfo}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "8px 0",
                        fontSize: "14px",
                        color: "#6B7280",
                      }}
                    >
                      📍 Location
                    </td>
                    <td
                      style={{
                        padding: "8px 0",
                        fontSize: "14px",
                        color: "#111827",
                        fontWeight: "500",
                      }}
                    >
                      {location}
                    </td>
                  </tr>
                  {ipAddress && (
                    <tr>
                      <td
                        style={{
                          padding: "8px 0",
                          fontSize: "14px",
                          color: "#6B7280",
                        }}
                      >
                        🌐 IP Address
                      </td>
                      <td
                        style={{
                          padding: "8px 0",
                          fontSize: "14px",
                          color: "#111827",
                          fontWeight: "500",
                        }}
                      >
                        {ipAddress}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td
                      style={{
                        padding: "8px 0",
                        fontSize: "14px",
                        color: "#6B7280",
                      }}
                    >
                      🕐 Time
                    </td>
                    <td
                      style={{
                        padding: "8px 0",
                        fontSize: "14px",
                        color: "#111827",
                        fontWeight: "500",
                      }}
                    >
                      {loginTime}
                    </td>
                  </tr>
                </tbody>
              </table>
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
              If this was you, no action is needed. If you don&apos;t recognize
              this activity, please secure your account immediately by revoking
              this session.
            </Text>

            {/* CTA Button */}
            <Section style={{ textAlign: "center", margin: "32px 0" }}>
              <Button
                href={sessionsUrl}
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
                Review Your Sessions
              </Button>
            </Section>

            <Hr
              style={{
                border: "none",
                borderTop: "1px solid #E5E7EB",
                margin: "32px 0",
              }}
            />

            {/* Security Tips */}
            <Section
              style={{
                backgroundColor: "#FEF3C7",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "24px",
              }}
            >
              <Text
                style={{
                  fontSize: "14px",
                  color: "#92400E",
                  lineHeight: "1.6",
                  margin: "0",
                  fontWeight: "500",
                }}
              >
                🛡️ Security Tips:
              </Text>
              <Text
                style={{
                  fontSize: "13px",
                  color: "#92400E",
                  lineHeight: "1.6",
                  marginTop: "8px",
                  marginBottom: "0",
                }}
              >
                • Use a strong, unique password
                {"\n"}• Don&apos;t share your login credentials
                {"\n"}• Sign out from devices you don&apos;t use anymore
              </Text>
            </Section>

            <Text
              style={{
                fontSize: "14px",
                color: "#9CA3AF",
                lineHeight: "1.6",
                marginTop: "0",
                marginBottom: "0",
              }}
            >
              If you believe your account has been compromised, please contact
              us at{" "}
              <a
                href="mailto:support@onefive.fr"
                style={{ color: "#6B7280", textDecoration: "underline" }}
              >
                support@onefive.fr
              </a>
            </Text>
          </Section>

          <EmailFooter baseUrl={baseUrl} userEmail={userEmail} />
        </Container>
      </Body>
    </Html>
);

export default NewDeviceLoginEmail;
