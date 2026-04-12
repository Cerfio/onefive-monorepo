'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Button } from '@/components/base/buttons/button';
import Post from '@/features/post/components/post/Post';
import { useProfilePosts } from '@/features/post/hooks/queries/useProfilePosts';
import { Loader2 } from 'lucide-react';

interface ProfilePostsProps {
  profileId: string;
}

export function ProfilePosts({ profileId }: ProfilePostsProps) {
  const [showAll, setShowAll] = useState(false);
  
  // Charge 5 posts initialement, puis 20 si on clique sur "Voir tous"
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProfilePosts(profileId, showAll ? 20 : 5);

  // Tous les posts aplatis
  const allPosts = data?.pages.flatMap((page: any) => page.items) ?? [];

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#5E6AD2] mb-2" />
          <p className="text-gray-500">Chargement des posts...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 rounded-lg border border-red-200 p-4">
        <p className="text-red-600">
          Erreur lors du chargement des posts: {error instanceof Error ? error.message : 'Une erreur est survenue'}
        </p>
      </div>
    );
  }

  if (allPosts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <p className="text-gray-500">Aucun post pour le moment</p>
          <p className="text-sm text-gray-400 mt-1">Commencez à publier pour partager vos idées!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Mes posts
        </h2>
        <span className="text-sm text-gray-500">
          {allPosts.length} post{allPosts.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Liste des posts */}
      <AnimatePresence mode="popLayout">
        <div className="space-y-4">
          {allPosts.map((post) => (
            <Post 
              key={post.id} 
              post={post}
            />
          ))}
        </div>
      </AnimatePresence>

      {/* Bouton pour charger plus */}
      {!showAll && hasNextPage && (
        <div className="text-center pt-2">
          <Button
            color="secondary"
            size="md"
            onClick={() => setShowAll(true)}
            className="min-w-[160px]"
          >
            Voir tous mes posts
          </Button>
        </div>
      )}

      {/* Pagination infinie quand on est en mode "voir tous" */}
      {showAll && hasNextPage && (
        <div className="text-center pt-2">
          <Button
            color="secondary"
            size="sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="min-w-[120px]"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Chargement...
              </>
            ) : (
              'Charger plus'
            )}
          </Button>
        </div>
      )}

      {/* Message quand il n'y a plus de posts */}
      {showAll && !hasNextPage && allPosts.length > 5 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">Vous avez vu tous vos posts</p>
        </div>
      )}
    </div>
  );
}

