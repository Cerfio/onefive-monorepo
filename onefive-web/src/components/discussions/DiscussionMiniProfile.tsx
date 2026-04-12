'use client';

import { memo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { SpecificDiscussionInfer } from '@/queries/discussion';
import { UserMiniProfile, UserMiniProfileProps } from '@/components/base/avatar/user-mini-profile';
import { useNavigateToConversation } from '@/hooks/useNavigateToConversation';

/**
 * Composant MiniProfile spécialisé pour les discussions.
 * Wrapper autour de UserMiniProfile avec la logique de cache spécifique aux discussions.
 */
const DiscussionMiniProfile = memo((props: UserMiniProfileProps) => {
  const queryClient = useQueryClient();
  const { navigateToConversation } = useNavigateToConversation();

  // Logique de mise à jour du cache spécifique aux discussions
  const handleCacheUpdate = useCallback((profileId: string, newFollowingState: boolean, followersDelta: number) => {
    const queryCache = queryClient.getQueryCache();

    const updateProfile = (profile: any) => {
      if (!profile || profile.id !== profileId) return profile;
      return {
        ...profile,
        isFollowing: newFollowingState,
        followedBy: Math.max(0, (profile.followedBy || 0) + followersDelta),
      };
    };

    // Update 'discussion' (detail) queries
    const discussionQueries = queryCache.findAll({ queryKey: ['discussion'] });
    discussionQueries.forEach((query) => {
      queryClient.setQueryData(query.queryKey, (oldData: SpecificDiscussionInfer | undefined) => {
        if (!oldData || !profileId) return oldData;
        
        return {
          ...oldData,
          profile: updateProfile(oldData.profile),
          answers: oldData.answers.map((answer) => ({
            ...answer,
            profile: updateProfile(answer.profile),
            replies: answer.replies.map((reply) => ({
              ...reply,
              profile: updateProfile(reply.profile),
            })),
          })),
        };
      });
    });

    // Update 'discussions' (list) queries - infinite query format
    const discussionsQueries = queryCache.findAll({ queryKey: ['discussions'] });
    discussionsQueries.forEach((query) => {
      queryClient.setQueryData(query.queryKey, (oldData: any) => {
        if (!oldData) return oldData;
        
        // Handle infinite query format
        if (oldData.pages) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => 
              Array.isArray(page) 
                ? page.map((discussion: any) => ({
                    ...discussion,
                    profile: updateProfile(discussion.profile),
                  }))
                : page
            ),
          };
        }
        
        // Handle regular array format
        if (Array.isArray(oldData)) {
          return oldData.map((discussion: any) => ({
            ...discussion,
            profile: updateProfile(discussion.profile),
          }));
        }
        
        return oldData;
      });
    });
  }, [queryClient]);

  return (
    <UserMiniProfile
      {...props}
      onCacheUpdate={handleCacheUpdate}
      onMessage={props.profileId ? () => navigateToConversation(props.profileId!) : undefined}
    />
  );
});

DiscussionMiniProfile.displayName = 'DiscussionMiniProfile';

export default DiscussionMiniProfile;
