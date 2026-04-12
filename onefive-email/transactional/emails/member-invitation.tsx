import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { EmailHeader, EmailFooter } from "./components";

const baseUrl = process.env.FRONTEND_URL || "";
const appUrl = baseUrl.replace(/\/$/, "");

interface MemberInvitationEmailProps {
  inviterName?: string;
  startupName?: string;
  startupLogo?: string;
  position?: string;
  message?: string;
  acceptUrl?: string;
  declineUrl?: string;
}

export const MemberInvitationEmail = ({
  inviterName = "John Doe",
  startupName = "Startup Name",
  startupLogo,
  position = "Team Member",
  message = "",
  acceptUrl = `${appUrl}/invitations/accept`,
  declineUrl = `${appUrl}/invitations/decline`,
}: MemberInvitationEmailProps) => (
  <Html>
      <Head />
      <Preview>You've been invited to join {startupName}'s team</Preview>
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
            padding: "40px 20px",
          }}
        >
          <Section
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              padding: "40px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <EmailHeader />
            
            <Text
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#111827",
                margin: "32px 0 16px 0",
                textAlign: "center",
              }}
            >
              Join the team! 👋
            </Text>

            {startupLogo && (
              <Section style={{ textAlign: "center", margin: "0 0 20px 0" }}>
                <Img
                  src={startupLogo}
                  alt={`${startupName} logo`}
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

            <Text
              style={{
                fontSize: "16px",
                color: "#4B5563",
                margin: "0 0 24px 0",
                lineHeight: "1.6",
                textAlign: "center",
              }}
            >
              {inviterName} has invited you to join {startupName}&apos;s team.
            </Text>

            <Section
              style={{
                backgroundColor: "#F9FAFB",
                borderRadius: "12px",
                padding: "24px",
                margin: "0 0 24px 0",
                textAlign: "center",
              }}
            >
              <Text
                style={{
                  fontSize: "14px",
                  color: "#6B7280",
                  margin: "0 0 8px 0",
                }}
              >
                Your role
              </Text>
              <Text
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#111827",
                  margin: "0",
                }}
              >
                {position}
              </Text>
            </Section>

            {message && (
              <Section
                style={{
                  backgroundColor: "#EEF2FF",
                  borderRadius: "12px",
                  padding: "16px",
                  margin: "0 0 24px 0",
                  borderLeft: "4px solid #6366F1",
                }}
              >
                <Text
                  style={{
                    fontSize: "14px",
                    color: "#4338CA",
                    margin: "0",
                    fontStyle: "italic",
                  }}
                >
                  "{message}"
                </Text>
              </Section>
            )}

            <Section style={{ textAlign: "center", margin: "32px 0" }}>
              <Button
                href={acceptUrl}
                style={{
                  backgroundColor: "#4F46E5",
                  color: "#FFFFFF",
                  padding: "14px 32px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  textDecoration: "none",
                  display: "inline-block",
                  marginRight: "12px",
                }}
              >
                Accept Invitation
              </Button>
              <Button
                href={declineUrl}
                style={{
                  backgroundColor: "#FFFFFF",
                  color: "#6B7280",
                  padding: "14px 32px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  textDecoration: "none",
                  display: "inline-block",
                  border: "1px solid #E5E7EB",
                }}
              >
                Decline
              </Button>
            </Section>

            <Hr style={{ borderColor: "#E5E7EB", margin: "32px 0" }} />

            <Text
              style={{
                fontSize: "12px",
                color: "#9CA3AF",
                textAlign: "center",
                margin: "0",
              }}
            >
              This invitation will expire in 7 days. If you don't have a Onefive account yet, you'll be able to create one when accepting.
            </Text>

            <EmailFooter />
          </Section>
        </Container>
      </Body>
    </Html>
);

export default MemberInvitationEmail;
