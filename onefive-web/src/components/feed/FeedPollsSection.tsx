'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BarChart2 } from 'lucide-react';
import { fetchDiscussions, createPollVote } from '@/queries/discussion';
import { Sort } from '@/enums';

/**
 * Sondages inline dans le feed : surface les sondages récents de la communauté
 * (discussions de type POLL) avec vote directement depuis le feed.
 */
export const FeedPollsSection = () => {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['feed-polls'],
    queryFn: () => fetchDiscussions({ sort: Sort.NEWEST, offset: 0, limit: 20 }),
    staleTime: 1000 * 60 * 2,
  });

  const polls = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    return list
      .filter((d: any) => d?.type === 'POLL' || (d?.options?.length ?? 0) >= 2)
      .slice(0, 2);
  }, [data]);

  const voteMut = useMutation({
    mutationFn: ({ id, option }: { id: string; option: string }) =>
      createPollVote({ discussionId: id, options: [option] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed-polls'] });
      toast.success('Vote enregistré');
    },
    onError: () => toast.error('Erreur lors du vote'),
  });

  if (polls.length === 0) return null;

  return (
    <div className="mb-4 space-y-3">
      {polls.map((d: any) => {
        const results: Record<string, number> = d.pollResults || {};
        const total = Object.values(results).reduce((s, v) => s + (v as number), 0);
        return (
          <div key={d.id} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-[#5E6AD2]" />
              <Link href={`/discussion/${d.id}`} className="text-sm font-semibold text-[#101828] hover:underline">
                {d.question}
              </Link>
            </div>
            <div className="space-y-1.5">
              {(d.options as string[]).map((opt) => {
                const count = results[opt] || 0;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                if (d.hasVoted) {
                  return (
                    <div key={opt} className="relative overflow-hidden rounded-lg border border-gray-200 px-3 py-2 text-sm">
                      <div className="absolute inset-y-0 left-0 bg-[#EDEEFB]" style={{ width: `${pct}%` }} />
                      <div className="relative flex justify-between">
                        <span className="text-gray-700">{opt}</span>
                        <span className="font-medium text-[#4149A8]">{pct}%</span>
                      </div>
                    </div>
                  );
                }
                return (
                  <button
                    key={opt}
                    onClick={() => voteMut.mutate({ id: d.id, option: opt })}
                    disabled={voteMut.isPending}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:border-[#5E6AD2] hover:bg-[#EDEEFB]/40"
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-gray-400">
              {total} vote{total > 1 ? 's' : ''}
            </p>
          </div>
        );
      })}
    </div>
  );
};
