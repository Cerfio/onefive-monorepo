"use client";
import React from "react";
import { NavigationMenuDemo } from "@/components/navigation-menu-demo";
import Footer from "@/components/footer";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

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
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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
            We reserve the right to terminate or suspend access to our Platform immediately, without prior notice or liability, for any reason whatsoever.
          </p>

          <h2>9. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the Platform.
          </p>

          <h2>10. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at{' '}
            <a href="mailto:legal@onefive.app" className="text-[#5E6AD2] hover:underline">
              legal@onefive.app
            </a>
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
              href="/faq" 
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