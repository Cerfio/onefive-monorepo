'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import Navbar from '@/components/navbar';
import { Avatar } from '@/components/base/avatar/avatar';
import {
  getCrmPipeline,
  setCrmStage,
  CRM_STAGES,
  type CrmPipelineEntry,
} from '@/queries/crm';

export default function RelationshipsPage() {
  const queryClient = useQueryClient();
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['crm-pipeline'],
    queryFn: getCrmPipeline,
  });

  const moveMut = useMutation({
    mutationFn: ({ contactId, stage }: { contactId: string; stage: string }) =>
      setCrmStage(contactId, stage),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crm-pipeline'] }),
  });

  const byStage = useMemo(() => {
    const map: Record<string, CrmPipelineEntry[]> = {};
    for (const s of CRM_STAGES) map[s.value] = [];
    for (const e of entries) (map[e.stage] ??= []).push(e);
    return map;
  }, [entries]);

  return (
    <div className="min-h-screen bg-[#FCFCFD]">
      <div className="w-full max-w-screen-xl mx-auto">
        <Navbar />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-full bg-[#5E6AD2]/10 p-2">
            <Users className="h-6 w-6 text-[#5E6AD2]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#101828]">Mes relations</h1>
            <p className="text-sm text-[#475467]">
              Suivez vos contacts par étape. Ajoutez une note ou un rappel depuis un profil pour l&apos;ajouter ici.
            </p>
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-400">Chargement…</p>
        ) : entries.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <p className="font-medium text-[#101828]">Aucun contact dans votre pipeline</p>
            <p className="mt-1 text-sm text-[#475467]">
              Depuis le profil d&apos;un membre, ajoutez une note ou un rappel : il apparaîtra ici.
            </p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {CRM_STAGES.map((stage) => (
              <div key={stage.value} className="w-72 flex-shrink-0">
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-sm font-semibold text-[#101828]">{stage.label}</span>
                  <span className="text-xs text-gray-400">{byStage[stage.value]?.length ?? 0}</span>
                </div>
                <div className="space-y-2 rounded-xl bg-gray-50 p-2 min-h-24">
                  {(byStage[stage.value] ?? []).map((c) => (
                    <div key={c.contactProfileId} className="rounded-lg border border-gray-200 bg-white p-3">
                      <Link href={`/profile/${c.contactProfileId}`} className="flex items-center gap-2">
                        <Avatar
                          src={c.avatar ? `${process.env.NEXT_PUBLIC_API_URL}/file/${c.avatar}` : undefined}
                          alt={c.name}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#101828]">{c.name}</p>
                          {c.highlight && (
                            <p className="truncate text-xs text-gray-500">{c.highlight}</p>
                          )}
                        </div>
                      </Link>
                      <select
                        value={c.stage}
                        onChange={(e) =>
                          moveMut.mutate({ contactId: c.contactProfileId, stage: e.target.value })
                        }
                        className="mt-2 w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600"
                      >
                        {CRM_STAGES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
