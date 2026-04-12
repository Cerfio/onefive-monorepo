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
import { getPostUrl, hasFrontendUrl } from '@/lib/frontend-url';
import { ArrowUpRight } from '@untitledui/icons';

type PostComment = {
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
  _count: { reactions: number; replies: number };
};

type PostDetail = {
  id: string;
  content: string;
  isHidden: boolean;
  medias: unknown[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    userId: string;
    avatarId: string | null;
  } | null;
  repostedPost: {
    id: string;
    content: string;
    author: { firstName: string; lastName: string } | null;
  } | null;
  comments: PostComment[];
  reactions: { reaction: string }[];
  _count: {
    comments: number;
    reactions: number;
    views: number;
    reposts: number;
    bookmarks: number;
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

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const confirm = useConfirm();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api
        .get(`admin/posts/${id}`)
        .json<{ data: PostDetail }>();
      setPost(response.data ?? null);
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
    if (!post) return;
    try {
      await api.patch(`admin/posts/${id}/hide`, {
        json: { isHidden: !post.isHidden },
      });
      toast.success(post.isHidden ? 'Post affiché' : 'Post masqué');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Supprimer ce post ?',
      description: 'Le post et tous ses commentaires seront supprimés définitivement.',
      confirmLabel: 'Supprimer',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`admin/posts/${id}`);
      toast.success('Post supprimé');
      router.push('/posts');
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

  if (error || !post) {
    return (
      <div className="space-y-4">
        <Breadcrumbs className="mb-4">
          <Breadcrumbs.Item href="/posts">Posts</Breadcrumbs.Item>
          <Breadcrumbs.Item>Post</Breadcrumbs.Item>
        </Breadcrumbs>
        <p className="text-sm text-error-primary">{error ?? 'Post introuvable'}</p>
      </div>
    );
  }

  const reactionGroups = groupReactions(post.reactions ?? []);

  return (
    <div className="space-y-6">
      <Breadcrumbs className="mb-4">
        <Breadcrumbs.Item href="/posts">Posts</Breadcrumbs.Item>
        <Breadcrumbs.Item>Post</Breadcrumbs.Item>
      </Breadcrumbs>

      <SectionHeader.Root>
        <SectionHeader.Group>
          <div className="flex items-center gap-3">
            <Button
              color="secondary"
              size="sm"
              iconLeading={ArrowLeft}
              onClick={() => router.push('/posts')}
            >
              Retour
            </Button>
            <div>
              <SectionHeader.Heading>Détail du post</SectionHeader.Heading>
              <SectionHeader.Subheading>ID : {post.id}</SectionHeader.Subheading>
            </div>
          </div>
          <SectionHeader.Actions>
            {hasFrontendUrl() && (
              <Button
                color="secondary"
                size="sm"
                iconTrailing={ArrowUpRight}
                href={getPostUrl(post.id)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Voir sur l&apos;app
              </Button>
            )}
            {post.isHidden && (
              <Badge color="warning" size="sm">Masqué</Badge>
            )}
            <Button color="secondary" size="sm" onClick={handleToggleHide}>
              {post.isHidden ? 'Afficher' : 'Masquer'}
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
              <p className="text-xs font-semibold uppercase text-quaternary">Contenu</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-primary">
                {post.content || '(vide)'}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-quaternary">Auteur</p>
              <div className="mt-1 flex items-center gap-3">
                {post.author ? (
                  <>
                    <Avatar
                      src={resolveAvatarUrl(post.author.avatarId)}
                      firstName={post.author.firstName}
                      lastName={post.author.lastName}
                      size="sm"
                    />
                    <Link
                      href={`/users/${post.author.userId}`}
                      className="text-sm font-medium text-brand-primary hover:text-brand-primary_hover"
                    >
                      {post.author.firstName} {post.author.lastName}
                    </Link>
                  </>
                ) : (
                  <span className="text-sm text-tertiary">Anonyme</span>
                )}
              </div>
            </div>

            {post.medias && post.medias.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase text-quaternary">Médias</p>
                <p className="mt-1 text-sm text-tertiary">
                  {post.medias.length} fichier(s) attaché(s)
                </p>
              </div>
            )}

            {post.tags && post.tags.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase text-quaternary">Tags</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} color="gray" size="sm">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-tertiary">
              <span>
                Créé le{' '}
                {new Date(post.createdAt).toLocaleString('fr-FR', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
              <span>
                Modifié le{' '}
                {new Date(post.updatedAt).toLocaleString('fr-FR', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Engagement stats */}
        <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
          <p className="mb-3 text-xs font-semibold uppercase text-quaternary">Engagement</p>
          <div className="flex flex-wrap gap-2">
            <Badge color="gray" size="sm">{post._count?.comments ?? 0} commentaires</Badge>
            <Badge color="gray" size="sm">{post._count?.reactions ?? 0} réactions</Badge>
            <Badge color="gray" size="sm">{post._count?.views ?? 0} vues</Badge>
            <Badge color="gray" size="sm">{post._count?.reposts ?? 0} reposts</Badge>
            <Badge color="gray" size="sm">{post._count?.bookmarks ?? 0} favoris</Badge>
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

        {/* Repost source */}
        {post.repostedPost && (
          <div className="rounded-xl border border-secondary bg-secondary_subtle p-6">
            <p className="mb-3 text-xs font-semibold uppercase text-quaternary">
              Post original (repost)
            </p>
            <div className="space-y-2">
              <p className="text-sm text-primary">
                {post.repostedPost.content?.slice(0, 200) || '(vide)'}
                {(post.repostedPost.content?.length ?? 0) > 200 ? '…' : ''}
              </p>
              <p className="text-xs text-tertiary">
                Par{' '}
                {post.repostedPost.author
                  ? `${post.repostedPost.author.firstName} ${post.repostedPost.author.lastName}`
                  : 'Anonyme'}
              </p>
              <Link
                href={`/posts/${post.repostedPost.id}`}
                className="text-sm font-medium text-brand-primary hover:text-brand-primary_hover"
              >
                Voir le post original →
              </Link>
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
          <div className="border-b border-border-secondary px-6 py-4">
            <h2 className="text-sm font-semibold text-primary">
              Commentaires ({post._count?.comments ?? 0})
              {((post.comments?.length ?? 0) < (post._count?.comments ?? 0)) && (
                <span className="ml-1.5 text-xs font-normal text-quaternary">
                  — {post.comments?.length ?? 0} affichés
                </span>
              )}
            </h2>
          </div>
          {(post.comments?.length ?? 0) === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-quaternary">Aucun commentaire.</p>
          ) : (
            <ul className="divide-y divide-border-secondary">
              {(post.comments ?? []).map((comment) => (
                <li key={comment.id} className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <Avatar
                      src={resolveAvatarUrl(comment.author?.avatarId)}
                      firstName={comment.author?.firstName}
                      lastName={comment.author?.lastName}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {comment.author ? (
                          <Link
                            href={`/users/${comment.author.userId}`}
                            className="text-sm font-medium text-brand-primary hover:underline"
                          >
                            {comment.author.firstName} {comment.author.lastName}
                          </Link>
                        ) : (
                          <span className="text-sm font-medium text-tertiary">Anonyme</span>
                        )}
                        <span className="text-xs text-quaternary">
                          {new Date(comment.createdAt).toLocaleString('fr-FR', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                        {(comment._count?.reactions ?? 0) > 0 && (
                          <Badge color="gray" size="sm">
                            {comment._count?.reactions} réac.
                          </Badge>
                        )}
                        {(comment._count?.replies ?? 0) > 0 && (
                          <Badge color="gray" size="sm">
                            {comment._count?.replies} rép.
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-secondary">{comment.content}</p>
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
