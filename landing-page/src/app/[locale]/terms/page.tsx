"use client";
import React from "react";
import { NavigationMenuDemo } from "@/components/navigation-menu-demo";
import Footer from "@/components/footer";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// The revision date of this text, updated by hand when the text changes. It was
// `new Date()` in a client component, so it silently rendered "today" on every
// view — a legal document that always claimed to have just been revised, and a
// hydration mismatch waiting on a midnight boundary. Last real edit: 2026-04-12.
const LAST_UPDATED = "April 12, 2026";

const TermsPage = () => {
  return (
    <>
      <NavigationMenuDemo />
      
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Navigation */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#5E6AD2] mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <h2>1. Introduction</h2>
          <p>
            Welcome to Onefive. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully before proceeding.
          </p>

          <h2>2. Definitions</h2>
          <ul>
            <li><strong>&quot;Platform&quot;</strong> refers to Onefive&apos;s website, applications, and services.</li>
            <li><strong>&quot;User&quot;</strong> refers to any individual or entity that accesses or uses the Platform.</li>
            <li><strong>&quot;Content&quot;</strong> refers to any information, text, graphics, or other materials uploaded, downloaded, or appearing on the Platform.</li>
          </ul>

          <h2>3. Account Registration</h2>
          <p>
            To access certain features of the Platform, you must register for an account. You agree to:
          </p>
          <ul>
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Promptly update any changes to your information</li>
            <li>Accept responsibility for all activities that occur under your account</li>
          </ul>

          <h2>4. User Conduct</h2>
          <p>
            When using our Platform, you agree not to:
          </p>
          <ul>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe upon the rights of others</li>
            <li>Share false or misleading information</li>
            <li>Attempt to gain unauthorized access to the Platform</li>
            <li>Interfere with the proper functioning of the Platform</li>
          </ul>

          <h2>5. Content</h2>
          <p>
            Users retain ownership of their Content but grant Onefive a license to use, store, and share that Content in accordance with our Privacy Policy.
          </p>

          <h2>6. Privacy</h2>
          <p>
            Our collection and use of personal information is governed by our{' '}
            <Link href="/privacy" className="text-[#5E6AD2] hover:underline">
              Privacy Policy
            </Link>.
          </p>

          <h2>7. Intellectual Property</h2>
          <p>
            The Platform and its original content, features, and functionality are owned by Onefive and are protected by international copyright, trademark, and other intellectual property laws.
          </p>

          <h2>8. Termination</h2>
          <p>
            We may suspend or terminate access to the Platform where you breach these Terms, where required by law, or where continuing to provide the service would expose Onefive or its users to a security or legal risk. Except where a breach makes immediate action necessary, we will tell you beforehand and give you a reasonable opportunity to respond. You may close your account at any time.
          </p>

          <h2>9. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the Platform.
          </p>

          <h2>10. Governing Law</h2>
          <p>
            These Terms are governed by French law. If you are a consumer, you keep the protection of the mandatory provisions of the law of your country of residence, and you may bring proceedings before the courts of your place of residence. Before going to court you may use the European Commission&apos;s{' '}
            <a
              href="https://ec.europa.eu/consumers/odr"
              className="text-[#5E6AD2] hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              online dispute resolution platform
            </a>.
          </p>

          <h2>11. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at{' '}
            <a href="mailto:legal@onefive.app" className="text-[#5E6AD2] hover:underline">
              legal@onefive.app
            </a>
          </p>

          <h2>12. Legal Notice</h2>
          <p>
            Onefive is published by <strong>YC STRATEGIC VENTURES</strong>, a
            société par actions simplifiée (SAS) with share capital of €1,000,
            registered with the Paris Trade and Companies Register under number
            103&nbsp;274&nbsp;072 (RCS Paris).
          </p>
          <ul>
            <li><strong>Registered office:</strong> 229 rue Saint-Honoré, 75001 Paris, France</li>
            <li><strong>SIRET:</strong> 10327407200018 — <strong>APE:</strong> 62.01Z</li>
            <li><strong>Intra-community VAT:</strong> FR57103274072</li>
            <li><strong>Publication director:</strong> Yannis Coulibaly, President</li>
            <li><strong>Contact:</strong> legal@onefive.app</li>
          </ul>
          <p>
            The site is hosted by <strong>Vercel Inc.</strong>, 440 N Barranca
            Avenue #4133, Covina, CA 91723, United States —{' '}
            <a
              href="https://vercel.com"
              className="text-[#5E6AD2] hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              vercel.com
            </a>. Vercel does not publish a telephone number; it can be reached
            through the contact channels listed on its site.
          </p>
        </div>

        {/* Additional Information */}
        <div className="mt-12 p-6 bg-gray-50 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
          <p className="text-muted-foreground mb-4">
            If you have any questions about our Terms of Service, we&apos;re here to help.
          </p>
          <div className="flex gap-4">
            <Link 
              href="/contact" 
              className="text-[#5E6AD2] hover:underline"
            >
              Contact Support
            </Link>
            <Link
              href="/#faq"
              className="text-[#5E6AD2] hover:underline"
            >
              Visit FAQ
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default TermsPage; 