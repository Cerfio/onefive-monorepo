'use client';

import { memo, useState, useEffect, useCallback } from 'react';
import {
  HoverCard,
  HoverCardContent,
} from '@/components/ui';
import { HoverCardTrigger } from '@radix-ui/react-hover-card';
import Link from 'next/link';
import { Avatar } from '@/components/base/avatar/avatar';
import { Button } from '@/components/base/buttons/button';
import { MessageCircle, UserPlus, Edit, UserMinus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Flag } from '@/components/ui/flag';
import NumberFlow from '@number-flow/react';
import { Tooltip } from '@/components/base/tooltip/tooltip';
import { useToggleProfileFollow } from '@/hooks/useFollow';
import { useQueryClient } from '@tanstack/react-query';
import { selfProfileType } from '@/queries/profile';
import { PROFILE_ROLE_METADATA, ProfileRole } from '@/sharing-enum/profile';
import React from 'react';

export interface UserMiniProfileProps {
  /** ID unique du profil utilisateur */
  profileId?: string;
  /** Prénom */
  firstName?: string;
  /** Nom */
  lastName?: string;
  /** URL de l'avatar */
  avatar?: string;
  /** Titre/position (ex: "CEO @ OneFive") */
  highlight?: string;
  /** Biographie */
  bio?: string;
  /** Code pays ISO (ex: "FR") */
  countryCode?: string;
  /** Nom du pays */
  countryName?: string;
  /** État de follow initial */
  isFollowing?: boolean;
  /** Stats du profil */
  stats?: { followers: number; following: number; posts: number };
  /** Nombre de jours consécutifs d'activité */
  streak?: number;
  /** Rôles dans l'écosystème (ex: ["FOUNDER", "MENTOR"]) */
  ecosystemRoles?: string[];
  /** Badges du profil */
  badges?: { icon: string; label: string }[];
  /** Taille de l'avatar */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Callback au follow/unfollow */
  onFollow?: (isFollowing: boolean) => void;
  /** Callback au clic sur message */
  onMessage?: () => void;
  /** Callback personnalisé pour mettre à jour le cache */
  onCacheUpdate?: (profileId: string, isFollowing: boolean, followersDelta: number) => void;
  /** Désactiver le hover card */
  disableHoverCard?: boolean;
  /** Classe CSS additionnelle */
  className?: string;
}

/**
 * Composant réutilisable pour afficher un mini-profil utilisateur avec HoverCard.
 * 
 * @example
 * ```tsx
 * <UserMiniProfile
 *   profileId="123"
 *   firstName="John"
 *   lastName="Doe"
 *   avatar="/avatar.jpg"
 *   highlight="CEO @ Company"
 *   isFollowing={false}
 *   stats={{ followers: 100, following: 50, posts: 10 }}
 * />
 * ```
 */
const UserMiniProfile = memo(({
  profileId,
  firstName = '',
  lastName = '',
  avatar,
  highlight,
  bio = '',
  countryCode,
  countryName: _countryName,
  isFollowing = false,
  stats = { followers: 0, following: 0, posts: 0 },
  streak = 0,
  ecosystemRoles = [],
  badges = [],
  size = 'md',
  onFollow,
  onMessage,
  onCacheUpdate,
  disableHoverCard = false,
  className,
}: UserMiniProfileProps) => {
  const [showFullBio, setShowFullBio] = useState(false);
  const [following, setFollowing] = useState(isFollowing);
  const [localFollowers, setLocalFollowers] = useState(stats.followers);
  const queryClient = useQueryClient();

  const followProfile = useToggleProfileFollow();
  
  // Récupérer le profil de l'utilisateur connecté pour savoir si c'est son propre profil
  const currentUser = queryClient.getQueryData(['selfProfile']) as selfProfileType | undefined;
  const isOwnProfile = currentUser && profileId && currentUser.id === profileId;

  // Synchroniser l'état local avec les props (pour réagir aux changements du cache)
  useEffect(() => {
    setFollowing(isFollowing);
  }, [isFollowing]);

  useEffect(() => {
    setLocalFollowers(stats.followers);
  }, [stats.followers]);

  // Fonction par défaut pour mettre à jour les caches courants
  const defaultCacheUpdate = useCallback((newFollowingState: boolean) => {
    const queryCache = queryClient.getQueryCache();
    const followersDelta = newFollowingState ? 1 : -1;

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
      queryClient.setQueryData(query.queryKey, (oldData: any) => {
        if (!oldData || !profileId) return oldData;
        
        return {
          ...oldData,
          profile: updateProfile(oldData.profile),
          answers: oldData.answers?.map((answer: any) => ({
            ...answer,
            profile: updateProfile(answer.profile),
            replies: answer.replies?.map((reply: any) => ({
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

    // Update 'posts' queries (feed)
    const postsQueries = queryCache.findAll({ queryKey: ['posts'] });
    postsQueries.forEach((query) => {
      queryClient.setQueryData(query.queryKey, (oldData: any) => {
        if (!oldData) return oldData;
        
        if (oldData.pages) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => 
              Array.isArray(page) 
                ? page.map((post: any) => ({
                    ...post,
                    profile: updateProfile(post.profile),
                    author: updateProfile(post.author),
                  }))
                : page
            ),
          };
        }
        
        return oldData;
      });
    });

    // Update 'post-comments' queries
    const postCommentsQueries = queryCache.findAll({ queryKey: ['post-comments'] });
    postCommentsQueries.forEach((query) => {
      queryClient.setQueryData(query.queryKey, (oldData: any) => {
        if (!oldData) return oldData;
        
        const updateComment = (comment: any) => {
          if (!comment) return comment;
          const isTargetProfile = comment.profileId === profileId;
          return {
            ...comment,
            isFollowing: isTargetProfile ? newFollowingState : comment.isFollowing,
            stats: isTargetProfile && comment.stats ? {
              ...comment.stats,
              followers: Math.max(0, (comment.stats.followers || 0) + followersDelta),
            } : comment.stats,
            replies: comment.replies?.map((reply: any) => {
              const isReplyTargetProfile = reply.profileId === profileId;
              return {
                ...reply,
                isFollowing: isReplyTargetProfile ? newFollowingState : reply.isFollowing,
                stats: isReplyTargetProfile && reply.stats ? {
                  ...reply.stats,
                  followers: Math.max(0, (reply.stats.followers || 0) + followersDelta),
                } : reply.stats,
              };
            }),
          };
        };
        
        // Handle array format
        if (Array.isArray(oldData)) {
          return oldData.map(updateComment);
        }
        
        return oldData;
      });
    });

    // Update 'post-reactions' queries
    const postReactionsQueries = queryCache.findAll({ queryKey: ['post-reactions'] });
    postReactionsQueries.forEach((query) => {
      queryClient.setQueryData(query.queryKey, (oldData: any) => {
        if (!oldData) return oldData;
        
        // Handle infinite query format
        if (oldData.pages) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              items: page.items?.map((reaction: any) => {
                if (reaction.profile?.id !== profileId && reaction.profileId !== profileId) return reaction;
                return {
                  ...reaction,
                  profile: {
                    ...reaction.profile,
                    isFollowing: newFollowingState,
                    followers: Math.max(0, (reaction.profile?.followers || 0) + followersDelta),
                  },
                };
              }),
            })),
          };
        }
        
        return oldData;
      });
    });

    // Update profile queries
    const profileQueries = queryCache.findAll({ queryKey: ['profile'] });
    profileQueries.forEach((query) => {
      queryClient.setQueryData(query.queryKey, (oldData: any) => {
        if (!oldData || oldData.id !== profileId) return oldData;
        return updateProfile(oldData);
      });
    });
  }, [queryClient, profileId]);

  const handleFollowClick = useCallback(() => {
    if (!profileId) return;
    
    const newFollowingState = !following;
    const followersDelta = newFollowingState ? 1 : -1;
    
    // Update local state immediately
    setFollowing(newFollowingState);
    setLocalFollowers(prev => Math.max(0, prev + followersDelta));
    
    // Call API
    followProfile.toggle(profileId, following);
    
    // Update caches
    if (onCacheUpdate) {
      onCacheUpdate(profileId, newFollowingState, followersDelta);
    } else {
      defaultCacheUpdate(newFollowingState);
    }
    
    // Call callback
    onFollow?.(newFollowingState);
  }, [profileId, following, followProfile, onCacheUpdate, defaultCacheUpdate, onFollow]);
  
  const fullName = `${firstName} ${lastName}`.trim() || 'Utilisateur';
  const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || '?';
  const fallbackRoleLabel = ecosystemRoles?.length
    ? PROFILE_ROLE_METADATA[ecosystemRoles[0] as ProfileRole]?.shortLabelMale
    : undefined;
  const displayHighlight = highlight || bio || fallbackRoleLabel || 'Membre';
  const bioMaxLength = 80;
  
  const truncatedBio = bio && bio.length > bioMaxLength && !showFullBio 
    ? bio.slice(0, bioMaxLength) + '…' 
    : bio;

  // Si pas de profileId ou hover card désactivé, afficher juste l'avatar
  if (!profileId || disableHoverCard) {
    return (
      <Avatar
        size={size}
        src={avatar || undefined}
        alt={`${fullName} avatar`}
        initials={initials}
        className={`shrink-0 ${className || ''}`}
      />
    );
  }

  return (
    <HoverCard openDelay={300} closeDelay={150}>
      <HoverCardTrigger asChild>
        <Link
          href={`/profile/${profileId}`}
          aria-label={`Voir le profil de ${fullName}`}
          className={`relative w-fit focus:outline-none focus:ring-2 focus:ring-[#5E6AD2] rounded-full cursor-pointer ${className || ''}`}
        >
          <Avatar
            size={size}
            src={avatar || undefined}
            alt={`${fullName} avatar`}
            initials={initials}
            className="shrink-0 transition-transform hover:scale-105"
          />
        </Link>
      </HoverCardTrigger>
      <HoverCardContent
        asChild
        className="rounded-xl shadow-xl border border-gray-200 p-4 w-80 bg-white focus:outline-none z-60"
        sideOffset={12}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.22 }}
        >
          <div className="flex flex-col gap-2">
            {/* Header avec avatar et infos principales */}
            <div className="flex items-center gap-3">
              <Link href={`/profile/${profileId}`} className="w-fit">
                <Avatar
                  size="xl"
                  src={avatar || undefined}
                  alt={`${fullName} avatar`}
                  initials={initials}
                  className="border-2 border-[#5E6AD2]/30"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link href={`/profile/${profileId}`} className="w-full block">
                    <div className="font-semibold text-base text-[#101828] truncate flex items-center gap-2">
                      {fullName}
                      {countryCode && (
                        <Flag 
                          countryCode={countryCode} 
                          width={20} 
                          height={14} 
                          className="ml-1" 
                        />
                      )}
                    </div>
                    <p className="text-xs text-[#5E6AD2] font-medium truncate">
                      {displayHighlight}
                    </p>
                  </Link>
                  {badges.map((badge, i) => (
                    <Tooltip key={badge.label + i} title={badge.label}>
                      <span className="text-lg" aria-label={badge.label}>
                        {badge.icon}
                      </span>
                    </Tooltip>
                  ))}
                </div>
                {streak !== undefined && (
                  <Tooltip title="Nombre de jours consécutifs d'activité sur la plateforme">
                    <span className={`flex items-center gap-1 font-medium text-xs cursor-pointer select-none mt-1 ${streak > 0 ? 'text-orange-500' : 'text-gray-400'}`}>
                      🔥 <NumberFlow value={streak} /> {streak > 1 ? 'jours' : 'jour'}
                    </span>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* Ecosystem Roles */}
            {ecosystemRoles && ecosystemRoles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {ecosystemRoles.slice(0, 2).map((role) => {
                  const metadata = PROFILE_ROLE_METADATA[role as ProfileRole];
                  if (!metadata) return null;
                  return (
                    <Tooltip key={role} title={metadata.longLabelMale}>
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-default"
                        style={{
                          backgroundColor: `${metadata.color}15`,
                          color: metadata.color,
                          border: `1px solid ${metadata.color}30`,
                        }}
                      >
                        <span>{metadata.emoji}</span>
                        <span className="truncate max-w-[120px]">{metadata.shortLabelMale}</span>
                      </span>
                    </Tooltip>
                  );
                })}
              </div>
            )}

            {/* Bio */}
            {bio && (
              <div className="text-sm text-gray-700 mt-1">
                {truncatedBio}
                {bio.length > bioMaxLength && !showFullBio && (
                  <button
                    className="ml-1 text-xs text-[#5E6AD2] underline hover:text-[#4A5BC0] focus:outline-none"
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowFullBio(true);
                    }}
                    tabIndex={0}
                  >
                    Voir plus
                  </button>
                )}
                {showFullBio && bio.length > bioMaxLength && (
                  <button
                    className="ml-1 text-xs text-[#5E6AD2] underline hover:text-[#4A5BC0] focus:outline-none"
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowFullBio(false);
                    }}
                    tabIndex={0}
                  >
                    Réduire
                  </button>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center space-x-4 text-xs text-gray-500 border-t pt-2 mt-2">
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-[#101828]">
                  <NumberFlow value={stats.following} />
                </span>
                <span>Abonnements</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-[#101828]">
                  <NumberFlow value={localFollowers} />
                </span>
                <span>Abonnés</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-[#101828]">
                  <NumberFlow value={stats.posts} />
                </span>
                <span>Posts</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-3">
              {isOwnProfile ? (
                <Link href={`/profile/${profileId}`} className="w-full">
                  <Button
                    size="sm"
                    color="secondary"
                    className="w-full"
                    iconLeading={<Edit className="h-4 w-4" data-icon />}
                  >
                    Voir mon profil
                  </Button>
                </Link>
              ) : (
                <>
                  <Button
                    size="sm"
                    color={following ? 'secondary' : 'primary'}
                    className="flex-1"
                    aria-pressed={following}
                    disabled={followProfile.isLoading}
                    onClick={handleFollowClick}
                    iconLeading={following 
                      ? <UserMinus className="h-4 w-4" data-icon /> 
                      : <UserPlus className="h-4 w-4" data-icon />
                    }
                  >
                    {followProfile.isLoading ? '...' : (following ? 'Suivi' : 'Suivre')}
                  </Button>
                  <Button
                    size="sm"
                    color="secondary"
                    className="flex-1"
                    onClick={() => onMessage?.()}
                    aria-label={`Envoyer un message à ${fullName}`}
                    iconLeading={<MessageCircle className="h-4 w-4" data-icon />}
                  >
                    Message
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </HoverCardContent>
    </HoverCard>
  );
});

UserMiniProfile.displayName = 'UserMiniProfile';

export { UserMiniProfile };
export default UserMiniProfile;
