'use client';

import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/base/dialog/dialog';
import { Separator } from '@/components/base/separator/separator';
import { SocialButton } from '@/components/base/buttons/social-button';
import OnefiveLogo from '@/assets/images/onefiveLogo.png';

interface SignupWallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignupWallModal({ open, onOpenChange }: SignupWallModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-8">
        <DialogTitle className="sr-only">Rejoignez Onefive</DialogTitle>
        <div className="flex flex-col items-center">
          <Image
            width={61}
            height={69}
            src={OnefiveLogo}
            alt="Onefive"
            className="drop-shadow-lg"
          />

          <h2 className="mt-6 text-xl font-semibold text-gray-900 text-center sm:text-2xl">
            Rejoignez 5 000+ founders
          </h2>
          <p className="mt-2 text-sm text-gray-500 text-center">
            Accédez aux profils complets, contactez les founders et explorez
            l&apos;écosystème.
          </p>

          <div className="mt-6 flex gap-3 w-full justify-center">
            <div className="hover:scale-105 transition-transform">
              <SocialButton
                social="google"
                theme="color"
                size="lg"
                className="w-20 h-11 sm:w-28"
              />
            </div>
            <div className="hover:scale-105 transition-transform">
              <SocialButton
                social="linkedin"
                theme="color"
                size="lg"
                className="w-20 h-11 sm:w-28"
              />
            </div>
            <div className="hover:scale-105 transition-transform">
              <SocialButton
                social="apple"
                theme="color"
                size="lg"
                disabled
                className="w-20 h-11 sm:w-28"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 w-full">
            <Separator className="flex-1 bg-gray-200" />
            <span className="text-gray-500 text-sm px-4">OR</span>
            <Separator className="flex-1 bg-gray-200" />
          </div>

          <div className="mt-6 w-full space-y-4">
            <div>
              <label
                htmlFor="wall-email"
                className="block text-sm font-medium text-gray-900 mb-1.5"
              >
                Email
              </label>
              <input
                id="wall-email"
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-xs outline-none transition-colors placeholder:text-gray-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
            <div>
              <label
                htmlFor="wall-password"
                className="block text-sm font-medium text-gray-900 mb-1.5"
              >
                Password
              </label>
              <input
                id="wall-password"
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-xs outline-none transition-colors placeholder:text-gray-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
          </div>

          <a
            href="/signup"
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-brand-solid px-4 py-2.5 text-base font-medium text-white shadow-xs transition-colors hover:opacity-90"
          >
            Sign up
            <ArrowRight className="h-4 w-4" />
          </a>

          <div className="mt-6 flex justify-center gap-1 text-sm">
            <span className="text-gray-500">Already have an account?</span>
            <a
              href="/signin"
              className="font-semibold text-brand-secondary hover:underline"
            >
              Sign in
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
