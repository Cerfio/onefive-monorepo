'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/kyInstance';
import { useProfile } from '@/queries/profile';
import { useProfileStartups } from '@/queries/startup';
import { Avatar } from '@/components/base/avatar/avatar';
import { Button } from '@/components/base/buttons/button';

const INTENTION_LABELS: Record<string, string> = {
  RAISING: 'Je lève',
  INVESTING: "J'investis",
  HIRING: 'Je recrute',
  JOB_SEEKING: 'Je cherche un poste',
  COFOUNDER: 'Je cherche un associé',
  MENTORING: 'Je mentore',
};

interface ConversationContextPanelProps {
  profileId: string | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Panneau latéral de contexte sur l'interlocuteur d'une conversation :
 * profil (titre, ville, intention), connexions communes, et raccourci vers
 * le profil complet. Aide à savoir « à qui je parle ».
 */
export const ConversationContextPanel = ({ profileId, open, onClose }: ConversationContextPanelProps) => {
  const router = useRouter();
  const { data: profile } = useProfile(open && profileId ? profileId : undefined);

  const { data: mutuals } = useQuery({
    queryKey: ['mutual-connections', profileId],
    queryFn: async () => {
      const res = await api.get(`profiles/${profileId}/mutual-connections`);
      const json = (await res.json()) as { data: { count: number } };
      return json.data;
    },
    enabled: open && !!profileId,
    staleTime: 1000 * 60 * 5,
  });

  // Startup(s) de l'interlocuteur — savoir « à quelle boîte je parle ».
  const { data: startups } = useProfileStartups(
    open && profileId ? profileId : undefined,
  );

  const p = profile as any;
  const intentions: string[] = useMemo(() => p?.intentions ?? [], [p]);
  const displayName = p
    ? p.name || `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || 'Membre'
    : '';

  if (!open || !profileId) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto border-l border-secondary bg-primary p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-primary">À propos</span>
          <Button iconLeading={X} color="tertiary" size="sm" onClick={onClose} aria-label="Fermer" />
        </div>

        {!p ? (
          <p className="text-sm text-tertiary">Chargement…</p>
        ) : (
          <div className="flex flex-col items-center text-center">
            <Avatar src={p.avatar ?? undefined} alt={displayName} firstName={p.firstName} lastName={p.lastName} size="lg" />
            <p className="mt-3 font-semibold text-primary">{displayName}</p>
            {p.highlight && <p className="text-sm text-tertiary">{p.highlight}</p>}
            {(p.city || p.location) && (
              <p className="mt-1 text-xs text-tertiary">{p.location || p.city}</p>
            )}

            {intentions.length > 0 && (
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                {intentions.map((i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    {INTENTION_LABELS[i] ?? i}
                  </span>
                ))}
              </div>
            )}

            {typeof mutuals?.count === 'number' && mutuals.count > 0 && (
              <p className="mt-3 text-xs text-tertiary">
                {mutuals.count} connexion{mutuals.count > 1 ? 's' : ''} en commun
              </p>
            )}

            {Array.isArray(startups) && startups.length > 0 && (
              <div className="mt-4 w-full space-y-2">
                <p className="text-left text-xs font-medium uppercase tracking-wide text-tertiary">
                  Startup{startups.length > 1 ? 's' : ''}
                </p>
                {startups.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => router.push(`/startup/${s.id}`)}
                    className="flex w-full items-center gap-2 rounded-lg border border-secondary p-2 text-left transition-colors hover:bg-secondary/40"
                  >
                    <Avatar src={s.logo ?? undefined} alt={s.name} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-primary">{s.name}</span>
                      {(s.position || s.tagline) && (
                        <span className="block truncate text-xs text-tertiary">{s.position || s.tagline}</span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {p.bio && (
              <p className="mt-4 text-left text-sm text-secondary whitespace-pre-line">{p.bio}</p>
            )}

            <Button
              color="secondary"
              size="sm"
              className="mt-5 w-full"
              onClick={() => router.push(`/profile/${profileId}`)}
            >
              Voir le profil complet
            </Button>
          </div>
        )}
      </aside>
    </div>
  );
};
