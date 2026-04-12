'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Button } from '@/components/base/buttons/button';
import { DiscussionCard } from '@/app/(protected)/discussions/components/DiscussionCard';
import { useProfileDiscussions } from '@/features/discussion/hooks/queries/useProfileDiscussions';
import { Loader2 } from 'lucide-react';

interface ProfileDiscussionsProps {
  profileId: string;
  isCurrentUser?: boolean;
}

export function ProfileDiscussions({ profileId, isCurrentUser = false }: ProfileDiscussionsProps) {
  const [showAll, setShowAll] = useState(false);
  
  // Charge 5 discussions initialement, puis 20 si on clique sur "Voir tous"
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProfileDiscussions(profileId, showAll ? 20 : 5);

  // Toutes les discussions aplaties
  const allDiscussions = data?.pages.flat() ?? [];

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#5E6AD2] mb-2" />
          <p className="text-gray-500">Chargement des discussions...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 rounded-lg border border-red-200 p-4">
        <p className="text-red-600">
          Erreur lors du chargement des discussions: {error instanceof Error ? error.message : 'Une erreur est survenue'}
        </p>
      </div>
    );
  }

  if (allDiscussions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <p className="text-gray-500">Aucune discussion pour le moment</p>
          <p className="text-sm text-gray-400 mt-1">Commencez à discuter pour partager vos questions!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {isCurrentUser ? 'Mes discussions' : 'Discussions'}
        </h2>
        <span className="text-sm text-gray-500">
          {allDiscussions.length} discussion{allDiscussions.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Liste des discussions */}
      <AnimatePresence mode="popLayout">
        <div className="space-y-3">
          {allDiscussions.map((discussion: any) => (
            <DiscussionCard key={discussion.id} discussion={discussion} />
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
            {isCurrentUser ? 'Voir toutes mes discussions' : 'Voir toutes les discussions'}
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

      {/* Message quand il n'y a plus de discussions */}
      {showAll && !hasNextPage && allDiscussions.length > 5 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            {isCurrentUser ? 'Vous avez vu toutes vos discussions' : 'Toutes les discussions ont été chargées'}
          </p>
        </div>
      )}
    </div>
  );
}

