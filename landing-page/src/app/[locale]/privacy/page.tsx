"use client";
import React from "react";
import { NavigationMenuDemo } from "@/components/navigation-menu-demo";
import Footer from "@/components/footer";
import { ArrowLeft, Shield, Lock, Eye, UserCheck, RefreshCw } from "lucide-react";
import Link from "next/link";

// The revision date of this text, updated by hand when the text changes. It was
// `new Date()` in a client component, so it silently rendered "today" on every
// view — a legal document that always claimed to have just been revised, and a
// hydration mismatch waiting on a midnight boundary. Last real edit: 2026-04-12.
const LAST_UPDATED = "April 12, 2026";

const PrivacyPage = () => {
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
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        {/* Key Points Summary */}
        <div className="grid grid-cols-2 gap-6 mb-12 p-6 bg-gray-50 rounded-xl">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-[#5E6AD2] mt-1" />
            <div>
              <h3 className="font-medium mb-1">Data Protection</h3>
              <p className="text-sm text-muted-foreground">Your data is encrypted and securely stored</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-[#5E6AD2] mt-1" />
            <div>
              <h3 className="font-medium mb-1">Privacy First</h3>
              <p className="text-sm text-muted-foreground">We never sell your personal information</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Eye className="w-5 h-5 text-[#5E6AD2] mt-1" />
            <div>
              <h3 className="font-medium mb-1">Transparency</h3>
              <p className="text-sm text-muted-foreground">Clear information about data usage</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <UserCheck className="w-5 h-5 text-[#5E6AD2] mt-1" />
            <div>
              <h3 className="font-medium mb-1">User Control</h3>
              <p className="text-sm text-muted-foreground">Manage your privacy preferences</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <h2>1. Information We Collect</h2>
          <p>
            We collect information to provide better services to our users. This includes:
          </p>
          <ul>
            <li><strong>Account Information:</strong> Name, email, and profile details you provide</li>
            <li><strong>Usage Data:</strong> How you interact with our platform</li>
            <li><strong>Technical Data:</strong> Device information and IP address</li>
            <li><strong>Communication Data:</strong> Messages and feedback you send us</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>
            Your information helps us to:
          </p>
          <ul>
            <li>Provide and improve our services</li>
            <li>Personalize your experience</li>
            <li>Communicate with you about updates and features</li>
            <li>Ensure platform security and prevent fraud</li>
          </ul>

          <h2>3. Data Sharing and Disclosure</h2>
          <p>
            We only share your information in specific circumstances:
          </p>
          <ul>
            <li>With your explicit consent</li>
            <li>To comply with legal obligations</li>
            <li>With service providers who assist our operations</li>
            <li>In case of a business transfer or merger</li>
          </ul>

          <h2>4. Your Privacy Rights</h2>
          <p>
            You have the right to:
          </p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your data</li>
            <li>Object to certain data processing</li>
            <li>Export your data</li>
          </ul>

          <h2>5. Data Security</h2>
          <p>
            Your data is transmitted over HTTPS. Our database is hosted in the United Kingdom (AWS London) and our analytics in the European Union. Access is restricted to what is needed to operate the service.
          </p>

          <h2>6. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to enhance your experience. You can control these through your browser settings. Learn more in our{' '}
            <Link href="/cookies" className="text-[#5E6AD2] hover:underline">
              Cookie Policy
            </Link>.
          </p>

          <h2>7. Children's Privacy</h2>
          <p>
            Our services are not intended for children under 15, the age of digital consent in France. We do not knowingly collect their data, and will delete it if we learn we have.
          </p>

          <h2>8. International Data Transfers</h2>
          <p>
            Your data may be processed in countries outside your own. We ensure appropriate safeguards are in place for these transfers.
          </p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this policy periodically. We will notify you of significant changes via email or platform notifications.
          </p>

          <h2>10. Who is responsible, and how to reach us</h2>
          <p>
            The data controller is <strong>YC STRATEGIC VENTURES</strong>, a SAS
            with share capital of €1,000, RCS Paris 103&nbsp;274&nbsp;072,
            registered office 229 rue Saint-Honoré, 75001 Paris, France.
          </p>
          <p>
            To exercise any of the rights above, or for any question about your
            data, write to{' '}
            <a href="mailto:privacy@onefive.app" className="text-[#5E6AD2] hover:underline">
              privacy@onefive.app
            </a>. We answer within one month. We have not appointed a Data
            Protection Officer — we are not required to — so your request goes
            to the company directly.
          </p>
          <p>
            If you are not satisfied with our answer, you have the right to
            lodge a complaint with the{' '}
            <a
              href="https://www.cnil.fr/en/plaintes"
              className="text-[#5E6AD2] hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              CNIL
            </a>, the French data protection authority, or with the supervisory
            authority of your country of residence.
          </p>
        </div>

        {/* A self-serve privacy dashboard does not exist yet, and the three
            links that stood here (/settings/privacy, /data-request,
            /settings/notifications) all 404'd. A GDPR right that leads nowhere
            is worse than no link: email is the channel that actually works, so
            it is the one offered. */}
        <div className="mt-12 p-6 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <RefreshCw className="w-5 h-5 text-[#5E6AD2]" />
            <h3 className="text-lg font-semibold">Exercising your rights</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Access, correction, deletion, portability, objection — email us and
            we will action it. There is no self-serve privacy dashboard yet;
            when there is, it will be linked here.
          </p>
          <a
            href="mailto:privacy@onefive.app"
            className="text-[#5E6AD2] hover:underline"
          >
            privacy@onefive.app
          </a>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PrivacyPage; 