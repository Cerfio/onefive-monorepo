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

// The revision date of this text, updated by hand when the text changes. It was
// `new Date()` in a client component, so it silently rendered "today" on every
// view — a legal document that always claimed to have just been revised, and a
// hydration mismatch waiting on a midnight boundary. Last real edit: 2026-04-12.
const LAST_UPDATED = "April 12, 2026";

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
            Last updated: {LAST_UPDATED}
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
              <h3 className="font-medium mb-1">No advertising</h3>
              <p className="text-sm text-muted-foreground">
                No ad or targeting cookies, no data sold
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-[#5E6AD2] mt-1" />
            <div>
              <h3 className="font-medium mb-1">Two cookies</h3>
              <p className="text-sm text-muted-foreground">
                One for your language, one for analytics
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Settings className="w-5 h-5 text-[#5E6AD2] mt-1" />
            <div>
              <h3 className="font-medium mb-1">Your browser decides</h3>
              <p className="text-sm text-muted-foreground">
                Block them and the site still works
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
          </ul>

          <h2>The cookies we actually set</h2>
          <p>
            Two, and this is the whole list. We do not use advertising or
            targeting cookies, and we do not sell or share this data.
          </p>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Purpose</th>
                <th>Set by</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>NEXT_LOCALE</code>
                </td>
                <td>
                  Remembers whether you are reading the site in English or
                  French. Strictly necessary — without it every page reverts to
                  the default language.
                </td>
                <td>Onefive</td>
                <td>Session</td>
              </tr>
              <tr>
                <td>
                  <code>ph_*_posthog</code>
                </td>
                <td>
                  Audience measurement: which pages are visited and how people
                  move through the site, so we know what to improve.
                </td>
                <td>PostHog (EU servers)</td>
                <td>1 year</td>
              </tr>
            </tbody>
          </table>

          <h2>Managing Cookies</h2>
          <p>
            You can control and/or delete cookies as you wish. You can delete
            all cookies that are already on your computer and you can set most
            browsers to prevent them from being placed.
          </p>
        </div>

        {/* There is no consent banner and no cookie settings screen, so the
            "Manage Cookie Settings" link here pointed at /settings/cookies —
            a 404. Offering a control that does not exist is worse than saying
            so plainly. */}
        <div className="mt-12 p-6 bg-gray-50 rounded-xl">
          <h3 className="text-lg font-semibold mb-2">Your choices</h3>
          <p className="text-muted-foreground mb-4">
            We do not have a cookie settings screen yet. Until we do, your
            browser is the control: every browser lets you block or delete
            cookies for a site, and blocking ours costs you nothing but the
            language preference. You can also email us to ask that your
            analytics data be deleted.
          </p>
          <div className="flex gap-4">
            <a
              href="mailto:privacy@onefive.app"
              className="text-[#5E6AD2] hover:underline"
            >
              privacy@onefive.app
            </a>
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
