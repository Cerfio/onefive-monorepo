"use client";
import React from "react";
import { NavigationMenuDemo } from "@/components/navigation-menu-demo";
import Footer from "@/components/footer";
import {
  ArrowLeft,
  Cookie,
  Shield,
  Settings,
  Clock,
//   Toggle,
  Info,
} from "lucide-react";
import Link from "next/link";

const CookiesPage = () => {
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
          <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-muted-foreground">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Quick Summary */}
        <div className="grid grid-cols-2 gap-6 mb-12 p-6 bg-gray-50 rounded-xl">
          <div className="flex items-start gap-3">
            <Cookie className="w-5 h-5 text-[#5E6AD2] mt-1" />
            <div>
              <h3 className="font-medium mb-1">Essential Cookies</h3>
              <p className="text-sm text-muted-foreground">
                Required for basic site functionality
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-[#5E6AD2] mt-1" />
            <div>
              <h3 className="font-medium mb-1">Your Choice</h3>
              <p className="text-sm text-muted-foreground">
                Control non-essential cookies
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-[#5E6AD2] mt-1" />
            <div>
              <h3 className="font-medium mb-1">Cookie Duration</h3>
              <p className="text-sm text-muted-foreground">
                Most expire within 30 days
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Settings className="w-5 h-5 text-[#5E6AD2] mt-1" />
            <div>
              <h3 className="font-medium mb-1">Cookie Settings</h3>
              <p className="text-sm text-muted-foreground">
                Easily manage your preferences
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <h2>What Are Cookies?</h2>
          <p>
            Cookies are small text files that are placed on your device when you
            visit our website. They help us provide you with a better experience
            by:
          </p>
          <ul>
            <li>Remembering your preferences</li>
            <li>Understanding how you use our site</li>
            <li>Keeping you signed in</li>
            <li>Protecting your security</li>
          </ul>

          <h2>Types of Cookies We Use</h2>

          <h3>1. Essential Cookies</h3>
          <p>
            These cookies are necessary for the website to function properly.
            They enable core functionality such as security, network management,
            and accessibility. You may not opt-out of these cookies.
          </p>

          <h3>2. Performance Cookies</h3>
          <p>
            These cookies help us understand how visitors interact with our
            website by collecting and reporting information anonymously. This
            helps us improve our website&apos;s functionality.
          </p>

          <h3>3. Functionality Cookies</h3>
          <p>
            These cookies enable the website to provide enhanced functionality
            and personalization. They may be set by us or by third-party
            providers whose services we have added to our pages.
          </p>

          <h3>4. Targeting Cookies</h3>
          <p>
            These cookies may be set through our site by our advertising
            partners. They may be used by those companies to build a profile of
            your interests and show you relevant adverts on other sites.
          </p>

          <h2>Cookie Duration</h2>
          <ul>
            <li>
              <strong>Session Cookies:</strong> These cookies are temporary and
              expire once you close your browser
            </li>
            <li>
              <strong>Persistent Cookies:</strong> These cookies remain on your
              device for a set period
            </li>
            <li>
              <strong>Third-Party Cookies:</strong> These cookies are placed by
              third-party services
            </li>
          </ul>

          <h2>Managing Cookies</h2>
          <p>
            You can control and/or delete cookies as you wish. You can delete
            all cookies that are already on your computer and you can set most
            browsers to prevent them from being placed.
          </p>
        </div>

        {/* Cookie Controls */}
        <div className="mt-12 p-6 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Cookie Preferences</h3>
              <p className="text-muted-foreground">
                Customize your cookie settings
              </p>
            </div>
            {/* <Toggle className="w-5 h-5 text-[#5E6AD2]" /> */}
          </div>
          <div className="flex gap-4">
            <Link
              href="/settings/cookies"
              className="text-[#5E6AD2] hover:underline"
            >
              Manage Cookie Settings
            </Link>
            <Link href="/privacy" className="text-[#5E6AD2] hover:underline">
              View Privacy Policy
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 p-6 border rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-5 h-5 text-[#5E6AD2]" />
            <h3 className="font-semibold">Need More Information?</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            If you have questions about our cookie policy or how we use cookies,
            please contact us.
          </p>
          <Link
            href="/contact"
            className="text-[#5E6AD2] hover:underline text-sm"
          >
            Contact Support
          </Link>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CookiesPage;
