'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/base/card/card';
import { Sparkles } from 'lucide-react';

const INTENTION_LABELS: Record<string, string> = {
  RAISING: 'En levée de fonds',
  INVESTING: 'Investit activement',
  HIRING: 'Recrute',
  JOB_SEEKING: 'Ouvert à de nouvelles opportunités',
  COFOUNDER: "Cherche un·e associé·e",
  MENTORING: 'Propose du mentorat',
};

/**
 * Highlights auto : un résumé « qui vend » dérivé des données du profil
 * (intention du moment, rôle, expérience, réseau, compétences clés).
 * Masqué s'il n'y a rien de pertinent à mettre en avant.
 */
export const ProfileHighlightsCard = ({ profileData }: { profileData: any }) => {
  const highlights: string[] = [];

  (profileData?.intentions ?? []).forEach((i: string) => {
    if (INTENTION_LABELS[i]) highlights.push(INTENTION_LABELS[i]);
  });

  const exp = profileData?.allExperiences ?? profileData?.experience ?? [];
  if (exp.length > 0) {
    const current = exp[0];
    if (current?.title && current?.company) {
      highlights.push(`${current.title} @ ${current.company}`);
    }
  }

  const connections = profileData?.stats?.connections ?? profileData?.connections;
  if (typeof connections === 'number' && connections > 0) {
    highlights.push(`${connections} connexion${connections > 1 ? 's' : ''} dans l'écosystème`);
  }

  const skills = (profileData?.skills ?? []).slice(0, 3);
  if (skills.length > 0) {
    highlights.push(skills.join(' · '));
  }

  const achievements = profileData?.achievements ?? [];
  if (achievements.length > 0 && achievements[0]?.title) {
    highlights.push(`🏆 ${achievements[0].title}`);
  }

  if (highlights.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#5E6AD2]" />
          Highlights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {highlights.slice(0, 5).map((h, i) => (
            <span
              key={i}
              className="inline-flex items-center rounded-full bg-[#EDEEFB] px-3 py-1 text-sm font-medium text-[#4149A8]"
            >
              {h}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
