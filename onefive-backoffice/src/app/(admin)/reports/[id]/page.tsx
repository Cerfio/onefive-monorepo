'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useConfirm } from '@/components/application/modals/confirm-dialog';
import { Button } from '@/components/base/buttons/button';
import { Badge } from '@/components/base/badges/badges';
import { TableSkeleton } from '@/components/application/table/table-skeleton';
import { ArrowLeft } from '@untitledui/icons';
import { Avatar, resolveAvatarUrl } from '@/components/application/avatar/avatar';

type ReportResourcePreview = {
  content: string;
  author?: { firstName: string; lastName: string; userId: string; avatarId: string | null };
  parent?: { id: string; content?: string; link?: string };
  createdAt: string;
  link: string;
};

type ReportDetail = {
  id: string;
  resourceType: string;
  resourceId: string;
  reason: string;
  message: string | null;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  resolvedAt: string | null;
  createdAt: string;
  reporter: {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    avatarId: string | null;
  };
  resourcePreview?: ReportResourcePreview | null;
};

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

const REASON_LABELS: Record<string, string> = {
  SPAM: 'Spam',
  HARASSMENT: 'Harcèlement',
  INAPPROPRIATE_CONTENT: 'Contenu inapproprié',
  MISINFORMATION: 'Désinformation',
  IMPERSONATION: 'Usurpation',
  OTHER: 'Autre',
};

const RESOURCE_LABELS: Record<string, string> = {
  PROFILE: 'Profil',
  POST: 'Post',
  POST_COMMENT: 'Commentaire',
  POST_COMMENT_REPLY: 'Réponse (post)',
  DISCUSSION: 'Discussion',
  DISCUSSION_ANSWER: 'Réponse (discussion)',
  DISCUSSION_ANSWER_REPLY: 'Réponse (sous-discussion)',
};

const RESOURCE_ROUTES: Record<string, string> = {
  POST: '/posts',
  DISCUSSION: '/discussions',
  PROFILE: '/users',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border-secondary py-3 last:border-0">
      <span className="text-sm font-medium text-tertiary">{label}</span>
      <span className="text-right text-sm text-primary">{children}</span>
    </div>
  );
}

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const confirm = useConfirm();

  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api
        .get(`admin/reports/${id}`)
        .json<{ data: ReportDetail }>();
      setReport(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleResolve = async () => {
    const ok = await confirm({
      title: 'Résoudre ce signalement ?',
      description: 'Le signalement sera marqué comme résolu.',
      confirmLabel: 'Résoudre',
    });
    if (!ok) return;
    try {
      await api.patch(`admin/reports/${id}/resolve`);
      toast.success('Signalement résolu');
      await load();
    } catch {
      toast.error('Erreur lors de la résolution');
    }
  };

  const handleDismiss = async () => {
    const ok = await confirm({
      title: 'Rejeter ce signalement ?',
      description: 'Le signalement sera marqué comme rejeté.',
      confirmLabel: 'Rejeter',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.patch(`admin/reports/${id}/dismiss`);
      toast.success('Signalement rejeté');
      await load();
    } catch {
      toast.error('Erreur lors du rejet');
    }
  };

  if (loading) {
    return (
      <div>
        <div className="mb-6 h-5 w-48 animate-pulse rounded bg-secondary" />
        <TableSkeleton columns={2} rows={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-sm text-error-primary">{error}</p>
        <Button color="secondary" onClick={load}>Réessayer</Button>
      </div>
    );
  }

  if (!report) return null;

  const resourceRoute = RESOURCE_ROUTES[report.resourceType];

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-tertiary">
        <Link href="/reports" className="inline-flex items-center gap-1.5 transition-colors hover:text-primary">
          <ArrowLeft className="size-4" />
          Signalements
        </Link>
        <span>/</span>
        <span className="font-medium text-primary">Détail</span>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-primary">Signalement</h1>
        {report.status === 'PENDING' && (
          <div className="flex gap-2">
            <Button color="primary" size="sm" onClick={handleResolve}>
              Résoudre
            </Button>
            <Button color="secondary" size="sm" onClick={handleDismiss}>
              Rejeter
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
        <div className="flex items-center gap-4 border-b border-border-secondary px-6 py-4">
          <Avatar
            src={resolveAvatarUrl(report.reporter.avatarId)}
            firstName={report.reporter.firstName}
            lastName={report.reporter.lastName}
            size="lg"
          />
          <div>
            <Link
              href={`/users/${report.reporter.userId}`}
              className="text-base font-semibold text-primary hover:text-brand-primary hover:underline"
            >
              {report.reporter.firstName} {report.reporter.lastName}
            </Link>
            <p className="text-sm text-tertiary">Auteur du signalement</p>
          </div>
        </div>
        <div className="px-6 py-2">
          <InfoRow label="Statut">
            <Badge color={STATUS_COLORS[report.status] || 'gray'} size="sm">
              {STATUS_LABELS[report.status] || report.status}
            </Badge>
          </InfoRow>
          <InfoRow label="Raison">{REASON_LABELS[report.reason] || report.reason}</InfoRow>
          <InfoRow label="Type de ressource">
            <Badge color="gray" size="sm">
              {RESOURCE_LABELS[report.resourceType] || report.resourceType}
            </Badge>
          </InfoRow>
          <InfoRow label="Ressource signalée">
            {report.resourcePreview?.link ? (
              <Link
                href={report.resourcePreview.link}
                className="text-brand-primary hover:underline"
              >
                Voir la ressource
              </Link>
            ) : resourceRoute ? (
              <Link
                href={`${resourceRoute}/${report.resourceId}`}
                className="text-brand-primary hover:underline"
              >
                Voir la ressource
              </Link>
            ) : (
              <span className="font-mono text-xs">{report.resourceId}</span>
            )}
          </InfoRow>
          <InfoRow label="Date">{formatDate(report.createdAt)}</InfoRow>
          {report.resolvedAt && (
            <InfoRow label="Résolu le">{formatDate(report.resolvedAt)}</InfoRow>
          )}
        </div>
        {report.resourcePreview && (
          <div className="border-t border-border-secondary px-6 py-4">
            <p className="mb-2 text-xs font-semibold uppercase text-quaternary">
              Contenu signalé
            </p>
            <div className="rounded-lg border border-border-secondary bg-secondary/30 p-4">
              {report.resourcePreview.parent && (
                <div className="mb-3 border-b border-border-secondary pb-3">
                  <p className="mb-1 text-xs font-medium text-quaternary">
                    {report.resourceType === 'POST_COMMENT' ||
                    report.resourceType === 'POST_COMMENT_REPLY'
                      ? 'Post parent'
                      : 'Contexte'}
                  </p>
                  <p className="line-clamp-3 text-sm text-tertiary">
                    {report.resourcePreview.parent.content}
                  </p>
                  {report.resourcePreview.parent.link && (
                    <Link
                      href={report.resourcePreview.parent.link}
                      className="mt-1 inline-block text-xs text-brand-primary hover:underline"
                    >
                      Voir le post/discussion →
                    </Link>
                  )}
                </div>
              )}
              <div>
                <p className="mb-1 text-xs font-medium text-quaternary">
                  {report.resourceType === 'POST_COMMENT' ||
                  report.resourceType === 'POST_COMMENT_REPLY'
                    ? 'Commentaire signalé'
                    : report.resourceType === 'POST'
                      ? 'Contenu du post'
                      : 'Contenu'}
                </p>
                {report.resourcePreview.author && (
                  <div className="mb-2 flex items-center gap-2">
                    <Avatar
                      src={resolveAvatarUrl(report.resourcePreview.author.avatarId)}
                      firstName={report.resourcePreview.author.firstName}
                      lastName={report.resourcePreview.author.lastName}
                      size="sm"
                    />
                    <span className="text-xs text-tertiary">
                      Par{' '}
                      <Link
                        href={`/users/${report.resourcePreview.author.userId}`}
                        className="text-brand-primary hover:underline"
                      >
                        {report.resourcePreview.author.firstName}{' '}
                        {report.resourcePreview.author.lastName}
                      </Link>
                    </span>
                  </div>
                )}
                <p className="whitespace-pre-wrap text-sm text-primary">
                  {report.resourcePreview.content}
                </p>
                {report.resourcePreview.createdAt && (
                  <p className="mt-0.5 text-xs text-quaternary">
                    {formatDate(report.resourcePreview.createdAt)}
                  </p>
                )}
                <Link
                  href={report.resourcePreview.link}
                  className="mt-2 inline-block text-xs text-brand-primary hover:underline"
                >
                  Voir sur la plateforme →
                </Link>
              </div>
            </div>
          </div>
        )}
        {report.message && (
          <div className="border-t border-border-secondary px-6 py-4">
            <p className="mb-1 text-xs font-semibold uppercase text-quaternary">Message</p>
            <p className="whitespace-pre-line text-sm text-secondary">{report.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
