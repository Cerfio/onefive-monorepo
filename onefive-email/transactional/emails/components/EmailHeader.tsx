import { Img, Link, Section } from "@react-email/components";
import * as React from "react";

interface EmailHeaderProps {
  baseUrl?: string;
  logoWidth?: number;
  logoHeight?: number;
}

export const EmailHeader = ({
  baseUrl = "",
  logoWidth = 48,
  logoHeight = 48,
}: EmailHeaderProps) => (
  <Section
    style={{
      backgroundColor: "#ffffff",
      padding: "40px 48px 32px",
      textAlign: "center",
    }}
  >
    <Link href={baseUrl || "/"}>
      <Img
        src={`${baseUrl}/static/onefive.png`}
        width={logoWidth}
        height={logoHeight}
        alt="Onefive"
        style={{ margin: "0 auto" }}
      />
    </Link>
  </Section>
);
