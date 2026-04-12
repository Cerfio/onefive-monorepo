'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Button } from '@/components/base/buttons/button';
import { Badge } from '@/components/base/badges/badges';
import { useConfirm } from '@/components/application/modals/confirm-dialog';
import { Breadcrumbs } from '@/components/application/breadcrumbs/breadcrumbs';
import { SectionHeader } from '@/components/application/section-headers/section-headers';
import { ArrowLeft } from '@untitledui/icons';
import { TableSkeleton } from '@/components/application/table/table-skeleton';
import { Avatar, resolveAvatarUrl } from '@/components/application/avatar/avatar';
import { getDiscussionUrl, hasFrontendUrl } from '@/lib/frontend-url';
import { ArrowUpRight } from '@untitledui/icons';

type DiscussionAnswer = {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    userId: string;
    avatarId: string | null;
  } | null;
  _count: { reactions: number; upvotes: number; replies: number };
};

type DiscussionDetail = {
  id: string;
  question: string;
  content: string | null;
  context: string | null;
  isHidden: boolean;
  options: string[];
  tags: string[];
  type: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    userId: string;
    avatarId: string | null;
  } | null;
  answers: DiscussionAnswer[];
  reactions: { reaction: string }[];
  _count: {
    answers: number;
    upvotes: number;
    reactions: number;
    views: number;
  };
};

const REACTION_EMOJI: Record<string, string> = {
  THUMBS_UP: '👍', THUMBS_DOWN: '👎', SMILE: '😊', COTILLON: '🎉',
  THINKING: '🤔', LAUGH: '😂', HEART: '❤️', EYES: '👀', ROCKET: '🚀', CRY: '😢',
};

function groupReactions(reactions: { reaction: string }[]) {
  const counts: Record<string, number> = {};
  for (const r of reactions) {
    counts[r.reaction] = (counts[r.reaction] ?? 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

export default function DiscussionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const confirm = useConfirm();
  const [discussion, setDiscussion] = useState<DiscussionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api
        .get(`admin/discussions/${id}`)
        .json<{ data: DiscussionDetail }>();
      setDiscussion(response.data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggleHide = async () => {
    if (!discussion) return;
    try {
      await api.patch(`admin/discussions/${id}/hide`, {
        json: { isHidden: !discussion.isHidden },
      });
      toast.success(discussion.isHidden ? 'Discussion affichée' : 'Discussion masquée');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Supprimer cette discussion ?',
      description: 'La discussion et toutes ses réponses seront supprimées définitivement.',
      confirmLabel: 'Supprimer',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`admin/discussions/${id}`);
      toast.success('Discussion supprimée');
      router.push('/discussions');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <TableSkeleton columns={1} rows={8} />
      </div>
    );
  }

  if (error || !discussion) {
    return (
      <div className="space-y-4">
        <Breadcrumbs className="mb-4">
          <Breadcrumbs.Item href="/discussions">Discussions</Breadcrumbs.Item>
          <Breadcrumbs.Item>Question</Breadcrumbs.Item>
        </Breadcrumbs>
        <p className="text-sm text-error-primary">{error ?? 'Discussion introuvable'}</p>
      </div>
    );
  }

  const reactionGroups = groupReactions(discussion.reactions ?? []);

  return (
    <div className="space-y-6">
      <Breadcrumbs className="mb-4">
        <Breadcrumbs.Item href="/discussions">Discussions</Breadcrumbs.Item>
        <Breadcrumbs.Item>Question</Breadcrumbs.Item>
      </Breadcrumbs>

      <SectionHeader.Root>
        <SectionHeader.Group>
          <div className="flex items-center gap-3">
            <Button
              color="secondary"
              size="sm"
              iconLeading={ArrowLeft}
              onClick={() => router.push('/discussions')}
            >
              Retour
            </Button>
            <div>
              <SectionHeader.Heading>Détail de la discussion</SectionHeader.Heading>
              <SectionHeader.Subheading>ID : {discussion.id}</SectionHeader.Subheading>
            </div>
          </div>
          <SectionHeader.Actions>
            {hasFrontendUrl() && (
              <Button
                color="secondary"
                size="sm"
                iconTrailing={ArrowUpRight}
                href={getDiscussionUrl(discussion.id)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Voir sur l&apos;app
              </Button>
            )}
            {discussion.isHidden && <Badge color="warning" size="sm">Masqué</Badge>}
            <Button color="secondary" size="sm" onClick={handleToggleHide}>
              {discussion.isHidden ? 'Afficher' : 'Masquer'}
            </Button>
            <Button color="primary-destructive" size="sm" onClick={handleDelete}>
              Supprimer
            </Button>
          </SectionHeader.Actions>
        </SectionHeader.Group>
      </SectionHeader.Root>

      <div className="space-y-6">
        {/* Main info */}
        <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase text-quaternary">Question</p>
              <p className="mt-1 text-sm font-medium text-primary">{discussion.question}</p>
            </div>

            {discussion.content && (
              <div>
                <p className="text-xs font-semibold uppercase text-quaternary">Contenu</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-primary">{discussion.content}</p>
              </div>
            )}

            {discussion.context && (
              <div>
                <p className="text-xs font-semibold uppercase text-quaternary">Contexte</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-primary">{discussion.context}</p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <Badge color="gray" size="sm">{discussion.type}</Badge>
            </div>

            {discussion.options && discussion.options.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase text-quaternary">Options (sondage)</p>
                <ul className="mt-2 space-y-1">
                  {discussion.options.map((opt, idx) => (
                    <li key={idx} className="text-sm text-primary">• {opt}</li>
                  ))}
                </ul>
              </div>
            )}

            {discussion.tags && discussion.tags.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase text-quaternary">Tags</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {discussion.tags.map((tag) => (
                    <Badge key={tag} color="gray" size="sm">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold uppercase text-quaternary">Auteur</p>
              <div className="mt-1 flex items-center gap-3">
                {discussion.author ? (
                  <>
                    <Avatar
                      src={resolveAvatarUrl(discussion.author.avatarId)}
                      firstName={discussion.author.firstName}
                      lastName={discussion.author.lastName}
                      size="sm"
                    />
                    <Link
                      href={`/users/${discussion.author.userId}`}
                      className="text-sm font-medium text-brand-primary hover:text-brand-primary_hover"
                    >
                      {discussion.author.firstName} {discussion.author.lastName}
                    </Link>
                  </>
                ) : (
                  <span className="text-sm text-tertiary">Anonyme</span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-tertiary">
              <span>
                Créé le{' '}
                {new Date(discussion.createdAt).toLocaleString('fr-FR', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
              <span>
                Modifié le{' '}
                {new Date(discussion.updatedAt).toLocaleString('fr-FR', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
          <p className="mb-3 text-xs font-semibold uppercase text-quaternary">Statistiques</p>
          <div className="flex flex-wrap gap-2">
            <Badge color="gray" size="sm">{discussion._count?.answers ?? 0} réponses</Badge>
            <Badge color="gray" size="sm">{discussion._count?.upvotes ?? 0} upvotes</Badge>
            <Badge color="gray" size="sm">{discussion._count?.reactions ?? 0} réactions</Badge>
            <Badge color="gray" size="sm">{discussion._count?.views ?? 0} vues</Badge>
          </div>
          {reactionGroups.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {reactionGroups.map(([type, count]) => (
                <span
                  key={type}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-sm"
                >
                  {REACTION_EMOJI[type] ?? '?'} <span className="font-medium">{count}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Answers */}
        <div className="rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
          <div className="border-b border-border-secondary px-6 py-4">
            <h2 className="text-sm font-semibold text-primary">
              Réponses ({discussion._count?.answers ?? 0})
              {((discussion.answers?.length ?? 0) < (discussion._count?.answers ?? 0)) && (
                <span className="ml-1.5 text-xs font-normal text-quaternary">
                  — {discussion.answers?.length ?? 0} affichées
                </span>
              )}
            </h2>
          </div>
          {(discussion.answers?.length ?? 0) === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-quaternary">Aucune réponse.</p>
          ) : (
            <ul className="divide-y divide-border-secondary">
              {(discussion.answers ?? []).map((answer) => (
                <li key={answer.id} className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <Avatar
                      src={resolveAvatarUrl(answer.author?.avatarId)}
                      firstName={answer.author?.firstName}
                      lastName={answer.author?.lastName}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {answer.author ? (
                          <Link
                            href={`/users/${answer.author.userId}`}
                            className="text-sm font-medium text-brand-primary hover:underline"
                          >
                            {answer.author.firstName} {answer.author.lastName}
                          </Link>
                        ) : (
                          <span className="text-sm font-medium text-tertiary">Anonyme</span>
                        )}
                        <span className="text-xs text-quaternary">
                          {new Date(answer.createdAt).toLocaleString('fr-FR', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                        {(answer._count?.upvotes ?? 0) > 0 && (
                          <Badge color="brand" size="sm">
                            👍 {answer._count?.upvotes}
                          </Badge>
                        )}
                        {(answer._count?.reactions ?? 0) > 0 && (
                          <Badge color="gray" size="sm">
                            {answer._count?.reactions} réac.
                          </Badge>
                        )}
                        {(answer._count?.replies ?? 0) > 0 && (
                          <Badge color="gray" size="sm">
                            {answer._count?.replies} rép.
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-secondary">{answer.content}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
