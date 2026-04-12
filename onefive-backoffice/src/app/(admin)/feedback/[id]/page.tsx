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

type FeedbackDetail = {
  id: string;
  type: 'BUG' | 'SUGGESTION' | 'COMMENT' | 'FUNCTIONAL';
  message: string;
  url: string | null;
  browserInfo: string | null;
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
  screenshot: {
    id: string;
    bucket: string;
    mimeType: string;
  } | null;
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

export default function FeedbackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const confirm = useConfirm();

  const [feedback, setFeedback] = useState<FeedbackDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api
        .get(`admin/feedback/${id}`)
        .json<{ data: FeedbackDetail }>();
      setFeedback(response.data);
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
      title: 'Résoudre ce feedback ?',
      description: 'Le feedback sera marqué comme résolu.',
      confirmLabel: 'Résoudre',
    });
    if (!ok) return;
    try {
      await api.patch(`admin/feedback/${id}/resolve`);
      toast.success('Feedback résolu');
      await load();
    } catch {
      toast.error('Erreur lors de la résolution');
    }
  };

  const handleDismiss = async () => {
    const ok = await confirm({
      title: 'Rejeter ce feedback ?',
      description: 'Le feedback sera marqué comme rejeté.',
      confirmLabel: 'Rejeter',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.patch(`admin/feedback/${id}/dismiss`);
      toast.success('Feedback rejeté');
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

  if (!feedback) return null;

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-tertiary">
        <Link href="/feedback" className="inline-flex items-center gap-1.5 transition-colors hover:text-primary">
          <ArrowLeft className="size-4" />
          Feedback
        </Link>
        <span>/</span>
        <span className="font-medium text-primary">Détail</span>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-primary">Feedback</h1>
        {feedback.status === 'PENDING' && (
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
            src={resolveAvatarUrl(feedback.reporter.avatarId)}
            firstName={feedback.reporter.firstName}
            lastName={feedback.reporter.lastName}
            size="lg"
          />
          <div>
            <Link
              href={`/users/${feedback.reporter.userId}`}
              className="text-base font-semibold text-primary hover:text-brand-primary hover:underline"
            >
              {feedback.reporter.firstName} {feedback.reporter.lastName}
            </Link>
            <p className="text-sm text-tertiary">Auteur du feedback</p>
          </div>
        </div>
        <div className="px-6 py-2">
          <InfoRow label="Statut">
            <Badge color={STATUS_COLORS[feedback.status] || 'gray'} size="sm">
              {STATUS_LABELS[feedback.status] || feedback.status}
            </Badge>
          </InfoRow>
          <InfoRow label="Type">
            <Badge color={TYPE_COLORS[feedback.type] || 'gray'} size="sm">
              {TYPE_LABELS[feedback.type] || feedback.type}
            </Badge>
          </InfoRow>
          {feedback.url && (
            <InfoRow label="URL concernée">
              <a href={feedback.url} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">
                {feedback.url}
              </a>
            </InfoRow>
          )}
          <InfoRow label="Date">{formatDate(feedback.createdAt)}</InfoRow>
          {feedback.resolvedAt && (
            <InfoRow label="Résolu le">{formatDate(feedback.resolvedAt)}</InfoRow>
          )}
          {feedback.browserInfo && (
            <InfoRow label="Navigateur">{feedback.browserInfo}</InfoRow>
          )}
        </div>
        <div className="border-t border-border-secondary px-6 py-4">
          <p className="mb-1 text-xs font-semibold uppercase text-quaternary">Message</p>
          <p className="whitespace-pre-line text-sm text-secondary">{feedback.message}</p>
        </div>
        {feedback.screenshot && (
          <div className="border-t border-border-secondary px-6 py-4">
            <p className="mb-3 text-xs font-semibold uppercase text-quaternary">Capture d&apos;écran</p>
            <a
              href={resolveScreenshotUrl(feedback.screenshot.id, feedback.screenshot.bucket) ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <img
                src={resolveScreenshotUrl(feedback.screenshot.id, feedback.screenshot.bucket) ?? ''}
                alt="Capture d'écran du feedback"
                className="max-h-[500px] w-auto rounded-lg border border-secondary object-contain shadow-sm transition-opacity hover:opacity-90"
              />
              <p className="mt-1.5 text-xs text-tertiary">Cliquer pour ouvrir en plein écran</p>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function resolveScreenshotUrl(fileId: string, bucket: string): string | null {
  if (!fileId) return null;
  const storageBase =
    process.env.NEXT_PUBLIC_STORAGE_BASE_URL?.replace(/\/+$/, '') ?? 'http://localhost:4566';
  return `${storageBase}/${bucket}/${fileId}`;
}
