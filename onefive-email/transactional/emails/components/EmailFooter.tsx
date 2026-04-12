import { Column, Hr, Img, Link, Row, Section, Text } from "@react-email/components";
import * as React from "react";

interface EmailFooterProps {
  baseUrl?: string;
  userEmail?: string;
  teamName?: string;
  tagline?: string;
}

export const EmailFooter = ({
  baseUrl = "",
  userEmail,
  teamName = "The Onefive Team",
  tagline = "The Social Network for Entrepreneurs",
}: EmailFooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <Section
      style={{
        backgroundColor: "#F9FAFB",
        padding: "32px 48px",
        borderTop: "1px solid #E5E7EB",
      }}
    >
      <Text
        style={{
          fontSize: "14px",
          color: "#111827",
          fontWeight: "600",
          marginTop: "0",
          marginBottom: "16px",
        }}
      >
        {teamName}
      </Text>

      <Text
        style={{
          fontSize: "13px",
          color: "#9CA3AF",
          lineHeight: "1.6",
          marginTop: "0",
          marginBottom: "24px",
        }}
      >
        {tagline}
      </Text>

      {/* Liens sociaux */}
      <Section style={{ marginBottom: "24px" }}>
        <Row>
          <Column style={{ width: "32px", paddingRight: "12px" }}>
            <Link href="https://www.linkedin.com/company/onefive">
              <Img
                width="24"
                height="24"
                src={`${baseUrl}/static/linkedin.png`}
                alt="LinkedIn"
              />
            </Link>
          </Column>
          <Column style={{ width: "32px", paddingRight: "12px" }}>
            <Link href="https://x.com/onefive">
              <Img
                width="24"
                height="24"
                src={`${baseUrl}/static/x.png`}
                alt="X (Twitter)"
              />
            </Link>
          </Column>
          <Column style={{ width: "32px", paddingRight: "12px" }}>
            <Link href="https://www.instagram.com/onefive">
              <Img
                width="24"
                height="24"
                src={`${baseUrl}/static/instagram.png`}
                alt="Instagram"
              />
            </Link>
          </Column>
          <Column style={{ width: "32px", paddingRight: "12px" }}>
            <Link href="https://www.youtube.com/@onefive">
              <Img
                width="24"
                height="24"
                src={`${baseUrl}/static/youtube.png`}
                alt="YouTube"
              />
            </Link>
          </Column>
          <Column style={{ width: "32px" }}>
            <Link href="https://www.tiktok.com/@onefive">
              <Img
                width="24"
                height="24"
                src={`${baseUrl}/static/tiktok.png`}
                alt="TikTok"
              />
            </Link>
          </Column>
        </Row>
      </Section>

      <Hr style={{ border: "none", borderTop: "1px solid #E5E7EB", margin: "24px 0" }} />

      {userEmail && (
        <Text
          style={{
            fontSize: "12px",
            color: "#9CA3AF",
            lineHeight: "1.6",
            marginTop: "16px",
            marginBottom: "8px",
          }}
        >
          This email was sent to <span style={{ color: "#6B7280" }}>{userEmail}</span>
        </Text>
      )}

      <Text
        style={{
          fontSize: "12px",
          color: "#9CA3AF",
          lineHeight: "1.6",
          marginTop: "0",
          marginBottom: "0",
        }}
      >
        <Link
          href={`${baseUrl}/unsubscribe`}
          style={{ color: "#6B7280", textDecoration: "underline" }}
        >
          Unsubscribe
        </Link>
        {" · "}
        <Link
          href={`${baseUrl}/privacy`}
          style={{ color: "#6B7280", textDecoration: "underline" }}
        >
          Privacy Policy
        </Link>
        {" · "}
        <Link
          href={`${baseUrl}/terms`}
          style={{ color: "#6B7280", textDecoration: "underline" }}
        >
          Terms
        </Link>
      </Text>

      <Text
        style={{
          fontSize: "12px",
          color: "#9CA3AF",
          lineHeight: "1.6",
          marginTop: "16px",
          marginBottom: "0",
        }}
      >
        © {currentYear} Onefive. All rights reserved.
      </Text>
    </Section>
  );
};
