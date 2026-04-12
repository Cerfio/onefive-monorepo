'use client';

import {
  Briefcase,
  GraduationCap,
  Trophy,
  MessageSquare,
  FileText,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthGate } from '@/components/seo/AuthGate';

interface ProfilePrivateSectionProps {
  profileId: string;
}

export function ProfilePrivateSection({ profileId: _profileId }: ProfilePrivateSectionProps) {
  const handleRequestAuth = () => {
    window.location.href = '/signup';
  };

  return (
    <>
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* About — experiences / education */}
          <Card className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-violet-600" />
                <h2 className="text-lg font-semibold text-[#101828]">
                  Parcours professionnel
                </h2>
              </div>
            </div>
            <div className="p-6">
              <AuthGate
                onRequestAuth={handleRequestAuth}
                label="Connectez-vous pour voir les expériences et formations"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-4 rounded-lg border border-gray-100 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100">
                      <Briefcase className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-medium text-[#101828]">
                        Expérience professionnelle
                      </p>
                      <p className="text-sm text-[#475467]">
                        Découvrez le parcours complet
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 rounded-lg border border-gray-100 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100">
                      <GraduationCap className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-medium text-[#101828]">Formation</p>
                      <p className="text-sm text-[#475467]">
                        Parcours académique et certifications
                      </p>
                    </div>
                  </div>
                </div>
              </AuthGate>
            </div>
          </Card>

          {/* Activity — posts / discussions */}
          <Card className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-violet-600" />
                <h2 className="text-lg font-semibold text-[#101828]">
                  Activité
                </h2>
              </div>
            </div>
            <div className="p-6">
              <AuthGate
                onRequestAuth={handleRequestAuth}
                label="Rejoignez pour voir les publications et discussions"
                blurIntensity={6}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-4">
                    <FileText className="h-5 w-5 text-violet-600" />
                    <div>
                      <p className="text-sm font-medium text-[#101828]">
                        Publications
                      </p>
                      <p className="text-xs text-[#475467]">
                        Posts et partages du profil
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-4">
                    <MessageSquare className="h-5 w-5 text-violet-600" />
                    <div>
                      <p className="text-sm font-medium text-[#101828]">
                        Discussions
                      </p>
                      <p className="text-xs text-[#475467]">
                        Questions et réponses
                      </p>
                    </div>
                  </div>
                </div>
              </AuthGate>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          {/* Achievements */}
          <Card className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-violet-600" />
                <h2 className="text-lg font-semibold text-[#101828]">
                  Réalisations
                </h2>
              </div>
            </div>
            <div className="p-6">
              <AuthGate
                onRequestAuth={handleRequestAuth}
                label="Inscrivez-vous pour découvrir les réalisations"
              >
                <div className="flex flex-col items-center gap-4 rounded-lg border border-gray-100 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100">
                    <Trophy className="h-6 w-6 text-violet-600" />
                  </div>
                  <p className="text-center text-sm text-[#475467]">
                    Badges et accomplissements
                  </p>
                </div>
              </AuthGate>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom CTA banner */}
      <div className="mt-12 flex flex-col items-center gap-6 rounded-2xl border border-violet-100 bg-gradient-to-b from-violet-50 to-white p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#101828]">
          Vous voulez en savoir plus ?
        </h2>
        <p className="max-w-md text-[#475467]">
          Rejoignez Onefive pour accéder aux profils complets, contacter les
          founders et explorer tout l&apos;écosystème startup.
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

    </>
  );
}
