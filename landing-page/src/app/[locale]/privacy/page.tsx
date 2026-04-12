"use client";
import React from "react";
import { NavigationMenuDemo } from "@/components/navigation-menu-demo";
import Footer from "@/components/footer";
import { ArrowLeft, Shield, Lock, Eye, UserCheck, Bell, RefreshCw } from "lucide-react";
import Link from "next/link";

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
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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
            We implement robust security measures to protect your data, including encryption, secure servers, and regular security audits.
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
            Our services are not intended for children under 13. We do not knowingly collect data from children.
          </p>

          <h2>8. International Data Transfers</h2>
          <p>
            Your data may be processed in countries outside your own. We ensure appropriate safeguards are in place for these transfers.
          </p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this policy periodically. We will notify you of significant changes via email or platform notifications.
          </p>

          <h2>10. Contact Us</h2>
          <p>
            For privacy-related inquiries, contact our Data Protection Officer at{' '}
            <a href="mailto:privacy@onefive.app" className="text-[#5E6AD2] hover:underline">
              privacy@onefive.app
            </a>
          </p>
        </div>

        {/* Privacy Controls */}
        <div className="mt-12 p-6 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Privacy Preferences</h3>
              <p className="text-muted-foreground">
                Manage your data and privacy settings
              </p>
            </div>
            <RefreshCw className="w-5 h-5 text-[#5E6AD2]" />
          </div>
          <div className="flex gap-4">
            <Link 
              href="/settings/privacy" 
              className="text-[#5E6AD2] hover:underline"
            >
              Manage Settings
            </Link>
            <Link 
              href="/data-request" 
              className="text-[#5E6AD2] hover:underline"
            >
              Request Data Export
            </Link>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="mt-6 p-6 border rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-[#5E6AD2]" />
            <h3 className="font-semibold">Stay Informed</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            We'll notify you about important privacy policy updates and security alerts.
          </p>
          <Link 
            href="/settings/notifications" 
            className="text-[#5E6AD2] hover:underline text-sm"
          >
            Manage Notification Preferences
          </Link>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PrivacyPage; 