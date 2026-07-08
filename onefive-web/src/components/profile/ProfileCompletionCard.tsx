'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/base/card/card';
import { Check, ArrowRight } from 'lucide-react';

interface ProfileCompletionCardProps {
  profileData: any;
  onEditHeader: () => void;
  onEditAbout: () => void;
  onEditSkills: () => void;
}

/**
 * Carte de complétion de profil (profil personnel uniquement) : montre les
 * sections restant à remplir avec un raccourci vers l'édition. Persiste tant
 * que le profil n'est pas complet — la relance après l'onboarding.
 */
export const ProfileCompletionCard = ({
  profileData,
  onEditHeader,
  onEditAbout,
  onEditSkills,
}: ProfileCompletionCardProps) => {
  const has = (v: unknown) => (Array.isArray(v) ? v.length > 0 : !!v && String(v).trim().length > 0);

  const items = [
    { label: 'Ajouter une photo de profil', done: has(profileData?.avatar), action: onEditHeader },
    { label: 'Renseigner un titre', done: has(profileData?.title), action: onEditHeader },
    { label: 'Écrire une bio', done: has(profileData?.bio), action: onEditHeader },
    { label: 'Indiquer votre intention du moment', done: has(profileData?.intentions), action: onEditHeader },
    { label: 'Ajouter des compétences', done: has(profileData?.skills), action: onEditSkills },
    { label: 'Ajouter une expérience', done: has(profileData?.allExperiences || profileData?.experience), action: onEditAbout },
    { label: 'Ajouter une formation', done: has(profileData?.allEducations || profileData?.education), action: onEditAbout },
    { label: 'Ajouter un lien social', done: has(profileData?.socials), action: onEditHeader },
  ];

  const doneCount = items.filter((i) => i.done).length;
  const pct = Math.round((doneCount / items.length) * 100);

  if (pct === 100) return null;

  const missing = items.filter((i) => !i.done);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Complétez votre profil</span>
          <span className="text-sm font-semibold text-[#5E6AD2]">{pct}%</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-[#5E6AD2] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mb-3 text-sm text-gray-500">
          Un profil complet est {`plus visible et inspire confiance`}.
        </p>
        <div className="space-y-1">
          {missing.slice(0, 4).map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-gray-300" />
              <span className="flex-1">{item.label}</span>
              <ArrowRight className="h-4 w-4 text-gray-300" />
            </button>
          ))}
          {doneCount > 0 && (
            <p className="flex items-center gap-1.5 px-2 pt-2 text-xs text-gray-400">
              <Check className="h-3.5 w-3.5 text-green-500" />
              {doneCount} / {items.length} complétés
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
