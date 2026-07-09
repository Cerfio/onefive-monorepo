'use client';

import Link from 'next/link';
import { Heart, MessageCircle, Eye, ImageIcon } from 'lucide-react';
import { useStartupPosts } from '@/queries/startup';
import { Avatar } from '@/components/base/avatar/avatar';

/**
 * Section « Publications de l'équipe » du profil startup : agrège les posts des
 * membres (Post n'a pas de startupId). Câble le TODO posts de StartupFullView.
 */
export const StartupPostsSection = ({ startupId }: { startupId: string }) => {
  const { data: posts, isLoading } = useStartupPosts(startupId, 10);

  if (isLoading) return null;
  if (!posts || posts.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-[#101828]">
        Publications de l'équipe
      </h3>
      <div className="space-y-3">
        {posts.map((post) => {
          const excerpt =
            post.content.length > 220
              ? `${post.content.slice(0, 220)}…`
              : post.content;
          return (
            <Link
              key={post.id}
              href={`/post/${post.id}`}
              className="block rounded-xl border border-gray-100 p-4 transition-colors hover:border-[#5E6AD2]/40 hover:bg-gray-50/60"
            >
              <div className="mb-2 flex items-center gap-2">
                <Avatar
                  src={post.author.avatar ?? undefined}
                  alt={post.author.name}
                  size="xs"
                />
                <span className="text-sm font-medium text-[#101828]">{post.author.name}</span>
                <span className="text-xs text-gray-400">
                  · {new Date(post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </span>
              </div>
              {excerpt && (
                <p className="whitespace-pre-line text-sm text-gray-700">{excerpt}</p>
              )}
              <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{post.reactionsCount}</span>
                <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{post.commentsCount}</span>
                <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{post.viewsCount}</span>
                {post.mediasCount > 0 && (
                  <span className="flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5" />{post.mediasCount}</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
