import { useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import { createPostComment } from '../../post.api';
import type { PostType } from '../../post.api';
import type { CommentType } from '../../definitions/comment.definition';
import { toast } from 'sonner';
import { upsertNormalizedComment, removeNormalizedComment } from '../../state/commentsStore';
import { useMe } from '@/hooks/useUser';

interface CreateCommentType {
  content: string;
  parentId?: string;
  postId: string;
}

// Map pour gérer les timeouts des commentaires pending
const pendingTimers = new Map<string, ReturnType<typeof setTimeout>>();

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  const { data: me } = useMe();

  return useMutation({
    mutationFn: async (data: CreateCommentType) => {
      const { content, parentId, postId } = data;
      // retourne le commentaire créé (supposons que l'API le renvoie)
      const res = await createPostComment(postId, { content, parentId });
      return res;
    },
  onMutate: async ({ postId, content, parentId }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['post', postId] }),
        queryClient.cancelQueries({ queryKey: ['feed'] }),
        queryClient.cancelQueries({ queryKey: ['comments', postId] }),
      ]);

      const previousPost = queryClient.getQueryData<PostType>(['post', postId]);
      const previousFeeds = queryClient.getQueriesData(['feed']);
      const previousComments = queryClient.getQueriesData({ queryKey: ['comments', postId] });

      const inc = (post: PostType): PostType => ({
        ...post,
        commentCount: (post.commentCount ?? 0) + 1,
      });

      if (previousPost) {
        queryClient.setQueryData<PostType>(['post', postId], inc(previousPost));
      }

      previousFeeds.forEach(([key, data]) => {
        if (!data) return;
        const feed = data as any; // infinite query shape
        if (feed.pages && Array.isArray(feed.pages)) {
          const newPages = feed.pages.map((page: any) => {
            if (!page?.items) return page;
            return {
              ...page,
              items: page.items.map((p: PostType) => (p.id === postId ? inc(p) : p)),
            };
          });
          queryClient.setQueryData(key as QueryKey, { ...feed, pages: newPages });
        }
      });

      // Création d'un commentaire ou d'une reply optimiste
      const optimisticId = `optimistic-${(typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`;
      const now = new Date().toISOString();
      const displayName = me ? `${me.firstName} ${me.lastName}` : 'You';
      
      // Enrichir avec les données du profil courant
      const meAny = me as any;
      const profileData = {
        countryCode: meAny?.countryCode,
        countryName: meAny?.countryName,
        about: meAny?.highlight || meAny?.bio,
        bio: meAny?.bio,
        ecosystemRoles: meAny?.ecosystemRoles || [],
        isFollowing: false, // c'est notre propre profil
        stats: {
          followers: meAny?.followedBy || 0,
          following: meAny?.following || 0,
          posts: meAny?.postCount || 0,
        },
        streak: meAny?.streak || 0,
        badges: [],
      };
      
      const baseComment: Partial<CommentType> = {
        id: optimisticId,
        postId,
        content,
        createdAt: now,
        updatedAt: now,
        parentId: null,
        author: displayName,
        avatar: me?.avatar || '',
        replies: [],
        reactions: undefined,
        reactionCount: 0,
        commentCount: 0,
        profileId: me?.id || 'me',
        ...profileData,
        // @ts-expect-error optimistic pending flag
        isPending: true,
      };
      // Shape pour une reply (doit correspondre à replySchema)
      const baseReply: any = {
        id: optimisticId,
        author: displayName,
        avatar: me?.avatar || '',
        content,
        parentId: parentId ?? null,
        createdAt: now,
        reactions: [],
        reactionCount: 0,
        postId,
        profileId: me?.id || 'me',
        ...profileData,
        isPending: true,
      };

      previousComments.forEach(([key, data]) => {
        if (!data) return;
        const wrap: any = data;
        if (!(wrap.pages && Array.isArray(wrap.pages))) return;
        const newPages = wrap.pages.map((page: any, pageIndex: number) => {
          if (!page?.comments) return page;
          // Insertion top-level
            if (!parentId && pageIndex === 0) {
              return {
                ...page,
                comments: [baseComment, ...page.comments],
              };
            }
          // Insertion reply dans le parent
          if (parentId) {
            return {
              ...page,
              comments: page.comments.map((c: any) => {
                if (c.id !== parentId) return c;
                return {
                  ...c,
                  replies: [...(Array.isArray(c.replies) ? c.replies : []), baseReply],
                };
              }),
            };
          }
          return page;
        });
        queryClient.setQueryData(key as QueryKey, { ...wrap, pages: newPages });
      });

      // Normalisation (E)
      if (!parentId) {
        upsertNormalizedComment({ ...(baseComment as any) });
      } else {
        // On normalise la reply comme un commentaire à part si besoin (drapeau parentId)
        upsertNormalizedComment({ ...(baseReply as any) });
      }

      // Timeout auto (C)
      const TIMEOUT_MS = 20000; // 20s
      const timer = setTimeout(() => {
        // retirer l'optimiste si toujours présent
        const commentsData = queryClient.getQueriesData({ queryKey: ['comments', postId] });
        let found = false;
        commentsData.forEach(([key, data]) => {
          if (!data) return;
            const wrap: any = data;
            if (wrap.pages && Array.isArray(wrap.pages)) {
              const newPages = wrap.pages.map((page: any) => {
                if (!page?.comments) return page;
                const hasDirect = page.comments.some((c: any) => c.id === optimisticId && c.isPending);
                let mutated = false;
                let comments = page.comments;
                if (hasDirect) {
                  comments = page.comments.filter((c: any) => c.id !== optimisticId);
                  found = true;
                  mutated = true;
                } else {
                  comments = page.comments.map((c: any) => {
                    if (!c.replies) return c;
                    const hasReply = c.replies.some((r: any) => r.id === optimisticId && r.isPending);
                    if (!hasReply) return c;
                    found = true;
                    mutated = true;
                    return { ...c, replies: c.replies.filter((r: any) => r.id !== optimisticId) };
                  });
                }
                return mutated ? { ...page, comments } : page;
              });
              if (found) {
                queryClient.setQueryData(key as QueryKey, { ...wrap, pages: newPages });
              }
            }
        });
        if (found) {
          // décrémenter les compteurs si on avait incrémenté
          const postData = queryClient.getQueryData<PostType>(['post', postId]);
          if (postData) {
            queryClient.setQueryData<PostType>(['post', postId], {
              ...postData,
              commentCount: Math.max(0, (postData.commentCount ?? 1) - 1),
            });
          }
          const feeds = queryClient.getQueriesData(['feed']);
          feeds.forEach(([key, data]) => {
            if (!data) return;
            const feed: any = data;
            if (feed.pages && Array.isArray(feed.pages)) {
              const newPages = feed.pages.map((page: any) => {
                if (!page?.items) return page;
                return {
                  ...page,
                  items: page.items.map((p: PostType) => p.id === postId ? { ...p, commentCount: Math.max(0, (p.commentCount ?? 1) - 1) } : p),
                };
              });
              queryClient.setQueryData(key as QueryKey, { ...feed, pages: newPages });
            }
          });
          removeNormalizedComment(optimisticId);
          toast.error('Commentaire expiré (connexion lente ?)', {
            action: {
              label: 'Retry',
              onClick: () => {
                // relance mutation
                queryClient.invalidateQueries({ queryKey: ['comments', postId] });
              },
            },
          });
        }
      }, TIMEOUT_MS);
      pendingTimers.set(optimisticId, timer);

      return { previousPost, previousFeeds, previousComments, optimisticId, postId, parentId };
    },
    onError: (err, variables, context) => {
      const { postId } = variables;
      if (!context) return;
      if (context.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
      if (context.previousFeeds) {
        context.previousFeeds.forEach(([key, data]) => {
          queryClient.setQueryData(key as QueryKey, data);
        });
      }
      if (context.previousComments) {
        context.previousComments.forEach(([key, data]) => {
          queryClient.setQueryData(key as QueryKey, data);
        });
      }
      if (context.optimisticId) {
        const t = pendingTimers.get(context.optimisticId);
        if (t) clearTimeout(t);
        pendingTimers.delete(context.optimisticId);
        removeNormalizedComment(context.optimisticId);
      }
      toast.error('Échec de la création du commentaire', {
        action: {
          label: 'Retry',
          onClick: () => {
            // relancer avec les mêmes variables
            // On utilise mutate plutôt que mutateAsync ici (fire & forget)
            (window as any).__retryCreateComment?.(variables);
          },
        },
      });
    },
    onSuccess: (apiResponse: any, variables, context) => {
      // Nettoyer le timer du commentaire optimiste
      if (context?.optimisticId) {
        const t = pendingTimers.get(context.optimisticId);
        if (t) clearTimeout(t);
        pendingTimers.delete(context.optimisticId);
      }
      
      // La réponse de l'API ne contient que les champs de base (id, postId, content, etc.)
      // mais pas les champs enrichis (author, avatar, replies, reactions, etc.)
      // On invalide la requête pour recharger les commentaires avec toutes les données
      const { postId } = variables;
      
      // Supprimer le commentaire optimiste avant de refetch pour éviter les doublons
      if (context?.optimisticId) {
        const commentsData = queryClient.getQueriesData({ queryKey: ['comments', postId] });
        commentsData.forEach(([key, data]) => {
          if (!data) return;
          const wrap: any = data;
          if (wrap.pages && Array.isArray(wrap.pages)) {
            const newPages = wrap.pages.map((page: any) => {
              if (!page?.comments) return page;
              // Supprimer le commentaire optimiste direct
              const filteredComments = page.comments.filter((c: any) => c.id !== context.optimisticId);
              if (filteredComments.length !== page.comments.length) {
                return { ...page, comments: filteredComments };
              }
              // Supprimer le commentaire optimiste dans les replies
              return {
                ...page,
                comments: page.comments.map((c: any) => {
                  if (!c.replies || c.replies.length === 0) return c;
                  const filteredReplies = c.replies.filter((r: any) => r.id !== context.optimisticId);
                  if (filteredReplies.length !== c.replies.length) {
                    return { ...c, replies: filteredReplies };
                  }
                  return c;
                }),
              };
            });
            queryClient.setQueryData(key as QueryKey, { ...wrap, pages: newPages });
          }
        });
        removeNormalizedComment(context.optimisticId);
      }
      
      // Refetch les commentaires pour obtenir le vrai commentaire avec toutes les données
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onSettled: (_data, error, variables, _context) => {
      // Réduction invalidations (D): n'invalider que si absence de finalComment ou en cas d'erreur
      if (error) {
        queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
        queryClient.invalidateQueries({ queryKey: ['post', variables.postId] });
      }
    },
  });
};
