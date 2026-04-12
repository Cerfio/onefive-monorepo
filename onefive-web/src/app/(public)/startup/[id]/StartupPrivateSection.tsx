'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  TrendingUp,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { getCookie } from 'cookies-next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthGate } from '@/components/seo/AuthGate';

interface StartupPrivateSectionProps {
  startupName: string;
}

export function StartupPrivateSection({ startupName }: StartupPrivateSectionProps) {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    setIsAuth(!!getCookie('is_authenticated'));
  }, []);

  const handleRequestAuth = () => {
    window.location.href = '/signup';
  };

  return (
    <>
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Team placeholder */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden p-0 bg-card rounded-xl border shadow-sm">
            <div className="border-b border-gray-100 px-6 pt-6 pb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-violet-600" />
                <h2 className="text-lg font-semibold text-[#101828]">Équipe</h2>
              </div>
            </div>
            <div className="p-6">
              <AuthGate onRequestAuth={handleRequestAuth} label="Inscrivez-vous pour découvrir l'équipe">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-2 rounded-lg border border-gray-100 p-4"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-500">
                        <span className="text-sm font-bold text-white">?</span>
                      </div>
                      <div className="h-3 w-16 rounded bg-gray-200" />
                      <div className="h-2 w-12 rounded bg-gray-100" />
                    </div>
                  ))}
                </div>
              </AuthGate>
            </div>
          </Card>
        </div>

        {/* Funding placeholder */}
        <div className="lg:col-span-1">
          <Card className="overflow-hidden p-0 bg-card rounded-xl border shadow-sm">
            <div className="border-b border-gray-100 px-6 pt-6 pb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold text-[#101828]">Levée de fonds</h2>
              </div>
            </div>
            <div className="p-6">
              <AuthGate onRequestAuth={handleRequestAuth} label="Accédez aux données de funding">
                <div className="space-y-4">
                  <div className="rounded-lg bg-green-50 p-4 text-center">
                    <div className="h-8 w-24 mx-auto rounded bg-green-200" />
                    <p className="mt-2 text-sm text-green-600">Total levé</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded bg-gray-100" />
                    <div className="h-3 w-3/4 rounded bg-gray-50" />
                  </div>
                </div>
              </AuthGate>
            </div>
          </Card>
        </div>

        {/* Links placeholder */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden p-0 bg-card rounded-xl border shadow-sm">
            <div className="border-b border-gray-100 px-6 pt-6 pb-4">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-violet-600" />
                <h2 className="text-lg font-semibold text-[#101828]">Liens</h2>
              </div>
            </div>
            <div className="p-6">
              <AuthGate onRequestAuth={handleRequestAuth} label="Connectez-vous pour accéder aux liens">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
                      <ExternalLink className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#101828]">Site web</p>
                      <p className="text-xs text-[#475467]">••••••••••••</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <svg className="h-5 w-5 fill-[#0A66C2]" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#101828]">LinkedIn</p>
                      <p className="text-xs text-[#475467]">••••••••••••</p>
                    </div>
                  </div>
                </div>
              </AuthGate>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom CTA when not authenticated (client-only to avoid hydration mismatch) */}
      {isAuth === false && (
        <div className="mt-12 flex flex-col items-center gap-6 rounded-2xl border border-violet-100 bg-gradient-to-b from-violet-50 to-white p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#101828]">
            Vous voulez en savoir plus sur {startupName} ?
          </h2>
          <p className="max-w-md text-[#475467]">
            Rejoignez Onefive pour accéder aux profils complets, contacter les
            founders, et explorer tout l&apos;écosystème startup.
          </p>
          <div className="flex gap-3">
            <Button
              className="bg-violet-600 px-8 hover:bg-violet-700"
              size="lg"
              onClick={handleRequestAuth}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Créer mon compte
            </Button>
            <Button variant="outline" size="lg" onClick={handleRequestAuth}>
              Se connecter
            </Button>
          </div>
          <p className="text-xs text-gray-400">
            Gratuit — Rejoignez 5 000+ founders
          </p>
        </div>
      )}

    </>
  );
}
