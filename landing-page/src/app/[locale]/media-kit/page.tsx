"use client";
import React from "react";
import { NavigationMenuDemo } from "@/components/navigation-menu-demo";
import Footer from "@/components/footer";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Download,
  Image as ImageIcon,
  Palette,
  Type,
  Package,
  Camera,
  Info,
  Play,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import Builder from "@/components/builder";

const MediaKitPage = () => {
  // Couleurs des rôles de l'écosystème
  const ecosystemRoles = [
    { emoji: '🚀', color: '#E67E22', name: 'Founder', hex: '#E67E22', rgb: '230, 126, 34' },
    { emoji: '💰', color: '#2ECC71', name: 'Business Angel', hex: '#2ECC71', rgb: '46, 204, 113' },
    { emoji: '📊', color: '#3498DB', name: 'Venture Capitalist', hex: '#3498DB', rgb: '52, 152, 219' },
    { emoji: '🏢', color: '#A569BD', name: 'Institutional Investor', hex: '#A569BD', rgb: '165, 105, 189' },
    { emoji: '🧑‍🏫', color: '#D35400', name: 'Mentor', hex: '#D35400', rgb: '211, 84, 0' },
    { emoji: '🧐', color: '#B8860B', name: 'Strategic Advisor', hex: '#B8860B', rgb: '184, 134, 11' },
    { emoji: '📚', color: '#9B59B6', name: 'Student Entrepreneur', hex: '#9B59B6', rgb: '155, 89, 182' },
    { emoji: '🔧', color: '#1ABC9C', name: 'Service Provider', hex: '#1ABC9C', rgb: '26, 188, 156' },
    { emoji: '📰', color: '#C0392B', name: 'Media', hex: '#C0392B', rgb: '192, 57, 43' },
    { emoji: '🏘️', color: '#7F8C8D', name: 'Incubator / Accelerator', hex: '#7F8C8D', rgb: '127, 140, 141' },
    { emoji: '🧑‍💼', color: '#5D6D7E', name: 'Recruiter / HR', hex: '#5D6D7E', rgb: '93, 109, 126' },
    { emoji: '👤', color: '#95A5A6', name: 'Other', hex: '#95A5A6', rgb: '149, 165, 166' },
  ];

  const brandAssets = {
    logos: [
      {
        title: "Primary Logo",
        preview: "/brand/logo-primary.svg",
        formats: ["SVG", "PNG", "EPS"],
        size: "2.5 MB",
        link: "/downloads/onefive-primary-logos.zip",
      },
      {
        title: "Symbol Only",
        preview: "/brand/logo-symbol.svg",
        formats: ["SVG", "PNG", "EPS"],
        size: "1.8 MB",
        link: "/downloads/onefive-symbol.zip",
      },
      // ... autres variantes
    ],
    colors: [
      {
        name: "Primary Blue",
        hex: "#5E6AD2",
        rgb: "94, 106, 210",
      },
      // ... autres couleurs
    ],
    photos: [
      {
        title: "Team Photos",
        preview: "/media/team.jpg",
        size: "15.2 MB",
        count: "12 images",
        link: "/downloads/onefive-team-photos.zip",
      },
      // ... autres photos
    ],
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-12 mt-16">

        {/* Quick Links */}
        <div className="grid grid-cols-4 gap-6 mb-16">
          {[
            { icon: ImageIcon, label: "Logos" },
            { icon: Palette, label: "Brand Colors" },
            { icon: Palette, label: "Role Colors" },
            { icon: Camera, label: "Photos" },
            { icon: Type, label: "Typography" },
          ].map((item) => (
            <a
              key={item.label}
              href={`#${item.label.toLowerCase()}`}
              className="flex items-center gap-3 p-4 rounded-xl border hover:border-[#5E6AD2] transition-all"
            >
              <item.icon className="w-5 h-5 text-[#5E6AD2]" />
              <span className="font-medium">{item.label}</span>
            </a>
          ))}
        </div>

        {/* Logos Section */}
        <section id="logos" className="mb-16">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Logo Package</h2>
              <p className="text-muted-foreground">
                Download our logo in various formats and variations
              </p>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download All Logos
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {brandAssets.logos.map((logo) => (
              <div
                key={logo.title}
                className="p-6 rounded-xl border bg-white hover:border-[#5E6AD2] transition-all"
              >
                <div className="bg-gray-50 rounded-lg p-8 mb-4 flex items-center justify-center">
                  <Image
                    src={logo.preview}
                    alt={logo.title}
                    width={120}
                    height={120}
                    className="object-contain"
                  />
                </div>
                <h3 className="font-medium mb-2">{logo.title}</h3>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span>{logo.formats.join(", ")}</span>
                  <span>{logo.size}</span>
                </div>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Brand Colors */}
        <section id="colors" className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Brand Colors</h2>
          <div className="grid grid-cols-4 gap-6">
            {brandAssets.colors.map((color) => (
              <div key={color.name} className="p-4 rounded-xl border">
                <div
                  className="w-full h-24 rounded-lg mb-4"
                  style={{ backgroundColor: color.hex }}
                />
                <h3 className="font-medium mb-1">{color.name}</h3>
                <div className="text-sm text-muted-foreground">
                  <p>HEX: {color.hex}</p>
                  <p>RGB: {color.rgb}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ecosystem Role Colors */}
        <section id="role colors" className="mb-16">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Ecosystem Role Colors</h2>
              <p className="text-muted-foreground">
                Official colors for each profile role in the Onefive ecosystem
              </p>
            </div>
          </div>

          {/* Role badges preview */}
          <div className="p-6 rounded-xl border bg-white mb-8">
            <h3 className="font-medium mb-4">Badge Preview</h3>
            <div className="flex flex-wrap gap-3">
              {ecosystemRoles.map((role) => (
                <span
                  key={role.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border"
                  style={{ 
                    borderColor: role.color, 
                    backgroundColor: `${role.color}15`, 
                    color: role.color 
                  }}
                >
                  <span>{role.emoji}</span>
                  <span>{role.name}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Role colors grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {ecosystemRoles.map((role) => (
              <div key={role.name} className="p-4 rounded-xl border hover:border-[#5E6AD2] transition-all">
                <div
                  className="w-full aspect-square rounded-lg mb-3 flex items-center justify-center text-3xl"
                  style={{ backgroundColor: role.color }}
                >
                  {role.emoji}
                </div>
                <h3 className="font-medium text-sm mb-1 truncate" title={role.name}>
                  {role.name}
                </h3>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p className="font-mono">{role.hex}</p>
                  <p>RGB: {role.rgb}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Usage info */}
          <div className="mt-8 p-6 rounded-xl bg-gray-50 border">
            <h3 className="font-medium mb-3">Usage Guidelines</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Use 15% opacity background with full color text and border for badges</li>
              <li>• Each role has a unique color to ensure visual distinction</li>
              <li>• Colors are optimized for readability on both light and dark backgrounds</li>
              <li>• Always pair the emoji with the role color for consistency</li>
            </ul>
          </div>
        </section>

        {/* Photos */}
        <section id="photos" className="mb-16">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Photo Gallery</h2>
              <p className="text-muted-foreground">
                High-resolution photos of our team, office, and events
              </p>
            </div>
            <Button disabled variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download All Photos
            </Button>
          </div>

          {/* Coming Soon message */}
          <div className="p-12 rounded-xl border bg-gray-50 text-center">
            <div className="flex justify-center mb-4">
              <Camera className="w-12 h-12 text-[#5E6AD2]" />
            </div>
            <h3 className="text-xl font-medium mb-2">Coming Soon</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Our photo gallery is currently being curated. Check back soon for
              high-quality images of our team, office, and events.
            </p>
          </div>

          {/*
          <div className="grid grid-cols-2 gap-6">
            {brandAssets.photos.map((album) => (
              <div
                key={album.title}
                className="rounded-xl border overflow-hidden"
              >
                <div className="relative h-64">
                  <Image
                    src={album.preview}
                    alt={album.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-medium mb-2">{album.title}</h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>{album.count}</span>
                    <span>{album.size}</span>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Album
                  </Button>
                </div>
              </div>
            ))}
          </div>
          */}
        </section>

        {/* Typography */}
        <section id="typography" className="mb-16">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Typography</h2>
              <p className="text-muted-foreground">
                Our brand fonts and typography guidelines
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 rounded-xl border">
              <h3 className="font-medium mb-4">Primary Font: Marianne</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-4xl font-bold mb-2">Display Bold</p>
                  <p className="text-muted-foreground text-sm">
                    Use for main headlines
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-semibold mb-2">
                    Heading Semibold
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Use for section headers
                  </p>
                </div>
                <div>
                  <p className="text-base mb-2">Body Regular</p>
                  <p className="text-muted-foreground text-sm">
                    Use for body text
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-xl border">
              <h3 className="font-medium mb-4">Type Scale</h3>
              <div className="space-y-4">
                <div className="text-5xl">Display</div>
                <div className="text-4xl">H1 - 36px</div>
                <div className="text-3xl">H2 - 30px</div>
                <div className="text-2xl">H3 - 24px</div>
                <div className="text-xl">H4 - 20px</div>
                <div className="text-base">Body - 16px</div>
                <div className="text-sm">Small - 14px</div>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Voice */}
        <section id="brand-voice" className="mb-16">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Brand Voice</h2>
              <p className="text-muted-foreground">
                How we communicate and express our brand
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 rounded-xl border">
              <h3 className="font-medium mb-4">Tone of Voice</h3>
              <ul className="space-y-4">
                <li>
                  <p className="font-medium mb-1">
                    Professional but Approachable
                  </p>
                  <p className="text-muted-foreground text-sm">
                    We're experts who speak human
                  </p>
                </li>
                <li>
                  <p className="font-medium mb-1">Clear and Direct</p>
                  <p className="text-muted-foreground text-sm">
                    No jargon or unnecessary complexity
                  </p>
                </li>
                <li>
                  <p className="font-medium mb-1">Inspiring and Positive</p>
                  <p className="text-muted-foreground text-sm">
                    Focus on possibilities and solutions
                  </p>
                </li>
              </ul>
            </div>
            <div className="p-6 rounded-xl border">
              <h3 className="font-medium mb-4">Writing Examples</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-1">Headlines</p>
                  <p className="text-muted-foreground text-sm italic">
                    "Transform Your Startup Journey"
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">Call-to-Actions</p>
                  <p className="text-muted-foreground text-sm italic">
                    "Start Building Today"
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">Body Copy</p>
                  <p className="text-muted-foreground text-sm italic">
                    "We help founders turn their vision into reality."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Media Assets */}
        <section id="social-media" className="mb-16">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Social Media Assets</h2>
              <p className="text-muted-foreground">
                Templates and guidelines for social media presence
              </p>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download All Templates
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {[
              {
                platform: "LinkedIn",
                size: "1200x628px",
                preview: "/social/linkedin.jpg",
              },
              {
                platform: "Twitter",
                size: "1200x675px",
                preview: "/social/twitter.jpg",
              },
              {
                platform: "Instagram",
                size: "1080x1080px",
                preview: "/social/instagram.jpg",
              },
            ].map((template) => (
              <div
                key={template.platform}
                className="p-6 rounded-xl border bg-white hover:border-[#5E6AD2] transition-all"
              >
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <Image
                    src={template.preview}
                    alt={template.platform}
                    width={200}
                    height={200}
                    className="object-cover rounded-lg"
                  />
                </div>
                <h3 className="font-medium mb-2">
                  {template.platform} Templates
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Optimal size: {template.size}
                </p>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Video Resources */}
        <section id="video" className="mb-16">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Video Resources</h2>
              <p className="text-muted-foreground">
                Motion graphics and video assets
              </p>
            </div>
            <Button disabled variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download All Videos
            </Button>
          </div>

          {/* Coming Soon message */}
          <div className="p-12 rounded-xl border bg-gray-50 text-center">
            <div className="flex justify-center mb-4">
              <Play className="w-12 h-12 text-[#5E6AD2]" />
            </div>
            <h3 className="text-xl font-medium mb-2">Coming Soon</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              We&apos;re currently preparing our video resources. Check back
              soon for logo animations and brand footage.
            </p>
          </div>

          {/*
          <div className="grid grid-cols-2 gap-6">
            {[
              {
                title: "Logo Animation",
                duration: "10s",
                format: "MP4, MOV",
                size: "24MB",
              },
              {
                title: "B-Roll Footage",
                duration: "2min",
                format: "MP4",
                size: "156MB",
              },
            ].map((video) => (
              <div
                key={video.title}
                className="p-6 rounded-xl border bg-white hover:border-[#5E6AD2] transition-all"
              >
                <div className="bg-gray-50 rounded-lg p-8 mb-4 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#5E6AD2] flex items-center justify-center">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="font-medium mb-2">{video.title}</h3>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span>{video.duration}</span>
                  <span>{video.format}</span>
                  <span>{video.size}</span>
                </div>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
          */}
        </section>

        {/* Usage Guidelines */}
        <section className="bg-gray-50 rounded-2xl p-8">
          <div className="flex items-start gap-4 mb-6">
            <Info className="w-6 h-6 text-[#5E6AD2]" />
            <div>
              <h2 className="text-xl font-bold mb-2">Usage Guidelines</h2>
              <p className="text-muted-foreground">
                Please follow these guidelines when using our brand assets
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-medium mb-3">Do&apos;s</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Use the provided assets as they are</li>
                <li>✓ Maintain clear space around the logo</li>
                <li>✓ Use approved color combinations</li>
                <li>✓ Credit Onefive when using photos</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-3">Don&apos;ts</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✗ Modify or distort the logo</li>
                <li>✗ Use unapproved colors</li>
                <li>✗ Remove or change elements</li>
                <li>✗ Use assets for commercial purposes</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Media Contact</h2>
          <p className="text-muted-foreground mb-4">
            For press inquiries, please contact:
          </p>
          <a
            href="mailto:press@onefive.app"
            className="text-[#5E6AD2] hover:underline text-lg font-medium"
          >
            press@onefive.app
          </a>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default function MediaKit() {
  return (
    <Builder
      title="Media Kit"
      description="Download official Onefive brand assets, logos, photos, and guidelines."
      image={null}
      displayJoinWaitlist={false}
      body={<MediaKitPage />}
      badge="Media Kit"
    />
  );
}
