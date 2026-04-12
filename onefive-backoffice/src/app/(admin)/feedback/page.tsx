'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useConfirm } from '@/components/application/modals/confirm-dialog';
import { SearchLg, RefreshCw05, ImageIndentLeft } from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import { Badge } from '@/components/base/badges/badges';
import { SectionHeader } from '@/components/application/section-headers/section-headers';
import { PaginationPageMinimalCenter } from '@/components/application/pagination/pagination';
import { EmptyState } from '@/components/application/empty-state/empty-state';
import { TableSkeleton } from '@/components/application/table/table-skeleton';
import { Avatar, resolveAvatarUrl } from '@/components/application/avatar/avatar';

type FeedbackRow = {
  id: string;
  type: 'BUG' | 'SUGGESTION' | 'COMMENT' | 'FUNCTIONAL';
  message: string;
  url: string | null;
  browserInfo: string | null;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  reporter: {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    avatarId: string | null;
  };
  screenshot: { id: string } | null;
};

const PAGE_SIZE = 20;

const STATUS_COLORS: Record<string, 'warning' | 'success' | 'gray'> = {
  PENDING: 'warning',
  RESOLVED: 'success',
  DISMISSED: 'gray',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  RESOLVED: 'Résolu',
  DISMISSED: 'Rejeté',
};

const TYPE_LABELS: Record<string, string> = {
  BUG: 'Bug',
  SUGGESTION: 'Suggestion',
  COMMENT: 'Commentaire',
  FUNCTIONAL: 'Problème fonctionnel',
};

const TYPE_COLORS: Record<string, 'error' | 'brand' | 'success' | 'warning'> = {
  BUG: 'error',
  SUGGESTION: 'brand',
  COMMENT: 'success',
  FUNCTIONAL: 'warning',
};

export default function FeedbackPage() {
  const confirm = useConfirm();
  const [items, setItems] = useState<FeedbackRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {
        skip: String(page * PAGE_SIZE),
        take: String(PAGE_SIZE),
      };
      if (statusFilter) params.search = statusFilter;
      const response = await api
        .get('admin/feedback', { searchParams: params })
        .json<{ data: FeedbackRow[]; total: number }>();
      setItems(response.data ?? []);
      setTotal(response.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleResolve = async (feedbackId: string) => {
    const ok = await confirm({
      title: 'Résoudre ce feedback ?',
      description: 'Le feedback sera marqué comme résolu.',
      confirmLabel: 'Résoudre',
    });
    if (!ok) return;
    try {
      await api.patch(`admin/feedback/${feedbackId}/resolve`);
      toast.success('Feedback résolu');
      await load();
    } catch {
      toast.error('Erreur lors de la résolution');
    }
  };

  const handleDismiss = async (feedbackId: string) => {
    const ok = await confirm({
      title: 'Rejeter ce feedback ?',
      description: 'Le feedback sera marqué comme rejeté.',
      confirmLabel: 'Rejeter',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.patch(`admin/feedback/${feedbackId}/dismiss`);
      toast.success('Feedback rejeté');
      await load();
    } catch {
      toast.error('Erreur lors du rejet');
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <SectionHeader.Root>
        <SectionHeader.Group>
          <div>
            <SectionHeader.Heading>Feedback</SectionHeader.Heading>
            <SectionHeader.Subheading>
              Bugs, suggestions et retours de la communauté.
            </SectionHeader.Subheading>
          </div>
          <SectionHeader.Actions>
            <Button color="secondary" iconLeading={RefreshCw05} onClick={load}>
              Rafraîchir
            </Button>
          </SectionHeader.Actions>
        </SectionHeader.Group>
      </SectionHeader.Root>

      <div className="mb-4 flex gap-2">
        {['', 'PENDING', 'RESOLVED', 'DISMISSED'].map((s) => (
          <Button
            key={s}
            color={statusFilter === s ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => {
              setStatusFilter(s);
              setPage(0);
            }}
          >
            {s === '' ? 'Tous' : STATUS_LABELS[s] || s}
          </Button>
        ))}
      </div>

      {loading && <TableSkeleton columns={5} rows={6} />}
      {error && <p className="text-sm text-error-primary">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <EmptyState>
          <EmptyState.Header>
            <EmptyState.FeaturedIcon icon={SearchLg} color="gray" theme="modern" />
          </EmptyState.Header>
          <EmptyState.Content>
            <EmptyState.Title>Aucun feedback</EmptyState.Title>
            <EmptyState.Description>
              Aucun feedback trouvé pour ce filtre.
            </EmptyState.Description>
          </EmptyState.Content>
        </EmptyState>
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
            <table className="min-w-full divide-y divide-border-secondary">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    De
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    Message
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-quaternary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-secondary">
                {items.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-secondary">
                    <td className="whitespace-nowrap px-4 py-3">
                      <Link href={`/users/${item.reporter.userId}`} className="flex items-center gap-2.5 group">
                        <Avatar
                          src={resolveAvatarUrl(item.reporter.avatarId)}
                          firstName={item.reporter.firstName}
                          lastName={item.reporter.lastName}
                          size="sm"
                        />
                        <span className="text-sm font-medium text-primary group-hover:text-brand-primary group-hover:underline">
                          {item.reporter.firstName} {item.reporter.lastName}
                        </span>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge color={TYPE_COLORS[item.type] || 'gray'} size="sm">
                        {TYPE_LABELS[item.type] || item.type}
                      </Badge>
                    </td>
                    <td className="max-w-sm px-4 py-3">
                      <Link href={`/feedback/${item.id}`} className="block group">
                        <div className="flex items-start gap-1.5">
                          <p className="flex-1 truncate text-sm text-primary group-hover:text-brand-primary group-hover:underline">{item.message}</p>
                          {item.screenshot && (
                            <span title="Capture d'écran jointe">
                              <ImageIndentLeft className="mt-0.5 size-3.5 shrink-0 text-tertiary" />
                            </span>
                          )}
                        </div>
                        {item.url && (
                          <p className="mt-0.5 truncate text-xs text-tertiary">
                            URL: {item.url}
                          </p>
                        )}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge color={STATUS_COLORS[item.status] || 'gray'} size="sm">
                        {STATUS_LABELS[item.status] || item.status}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-tertiary">
                      {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.status === 'PENDING' && (
                        <div className="flex justify-end gap-1">
                          <Button
                            color="primary"
                            size="sm"
                            onClick={() => handleResolve(item.id)}
                          >
                            Résoudre
                          </Button>
                          <Button
                            color="secondary"
                            size="sm"
                            onClick={() => handleDismiss(item.id)}
                          >
                            Rejeter
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <PaginationPageMinimalCenter
              page={page + 1}
              total={totalPages}
              onPageChange={(p) => setPage(p - 1)}
              className="mt-4"
            />
          )}
        </>
      )}
    </div>
  );
}
