'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { Badge } from '@/components/base/badges/badges';
import { ProfilePostItem } from '@/features/post/hooks/queries/useProfilePosts';
import { ProfilePostReactions } from './ProfilePostReactions';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

import { tags as tagList } from '@/constant';
import { cn } from '@/lib/utils';
import { decodeBuildInPublicData, hasBuildInPublicData } from '@/utils/buildInPublic';
import ProjectAvatar from '@/features/post/components/post/ProjectAvatar';
import PostTypeBadge from '@/features/post/components/post/PostTypeBadge';

// Composant pour gérer l'affichage des médias avec détection de type
const MediaContent: React.FC<{
  mediaUrl: string;
  mediaCount: number;
}> = ({ mediaUrl, mediaCount }) => {
  const [mediaType, setMediaType] = useState<'video' | 'image' | 'unknown'>('unknown');

  const detectMediaType = async (url: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');

      if (contentType?.startsWith('video/')) {
        setMediaType('video');
      } else if (contentType?.startsWith('image/')) {
        setMediaType('image');
      } else {
        // Fallback basé sur l'extension
        const isVideo = url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') || url.includes('.avi');
        setMediaType(isVideo ? 'video' : 'image');
      }
    } catch (error) {
      console.warn('Failed to detect media type for:', url, error);
      // Fallback basé sur l'extension
      const isVideo = url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') || url.includes('.avi');
      setMediaType(isVideo ? 'video' : 'image');
    }
  };

  useEffect(() => {
    if (mediaUrl) {
      detectMediaType(mediaUrl);
    }
  }, [mediaUrl]);

  return (
    <div className="mb-3 rounded-lg overflow-hidden relative">
      {mediaType === 'video' ? (
        <video
          src={mediaUrl}
          className="w-full h-48 object-cover"
          preload="metadata"
          onError={(e) => {
            console.error('Video failed to load:', mediaUrl, e);
            (e.target as HTMLVideoElement).style.display = 'none';
          }}
        >
          Your browser does not support the video tag.
        </video>
      ) : mediaType === 'image' ? (
        <img
          src={mediaUrl}
          alt="Post media"
          className="w-full h-48 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
      {mediaCount > 1 && (
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          +{mediaCount - 1}
        </div>
      )}
    </div>
  );
};

interface ProfilePostCardProps {
  post: ProfilePostItem;
}

export function ProfilePostCard({ post }: ProfilePostCardProps) {
  // Decode build in public data if present
  const { visibleContent, buildInPublicData } = decodeBuildInPublicData(post.content || '');
  const isBuildInPublic = hasBuildInPublicData(post.content || '');

  // Fonction helper pour afficher les tags correctement
  const renderTags = (tags: string[] | null | undefined) => {
    if (!tags || !Array.isArray(tags) || tags.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1">
        {tags.slice(0, 3).map((tag, tagIndex) => {
          const tagData = tagList.find((t) => t.enum === tag);
          if (!tagData) return null;
          return (
            <Badge
              key={`tag-${tag}-${tagIndex}`}
              type="pill-color"
              color="brand"
              size="sm"
              className={cn(
                tagData.bgColor,
                tagData.textColor,
                tagData.hoverBgColor,
              )}
            >
              {tagData.title} {tagData.icon}
            </Badge>
          );
        })}
        {tags.length > 3 && (
          <Badge type="color" color="gray" size="sm">
            +{tags.length - 3}
          </Badge>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <Link href={`/feed/${post.id}`} className="block">
        {/* Header avec badges en haut à droite */}
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Contenu du post */}
          <p className="text-gray-800 text-sm line-clamp-3 flex-1">
            {visibleContent || post.content}
          </p>
          
          {/* Badge du projet et type pour les posts Build in Public - en haut à droite */}
          {isBuildInPublic && buildInPublicData && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Badge du projet */}
              {buildInPublicData.projectId || buildInPublicData.projectName ? (
                buildInPublicData.projectId ? (
                  <Link 
                    href={`/startups/${buildInPublicData.projectId}`}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ProjectAvatar 
                      projectId={buildInPublicData.projectId}
                      projectName={buildInPublicData.projectName}
                      size="sm"
                    />
                    <span className="font-medium">{buildInPublicData.projectName}</span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600">
                    <ProjectAvatar 
                      projectId={buildInPublicData.projectId || ''}
                      projectName={buildInPublicData.projectName}
                      size="sm"
                    />
                    <span className="font-medium">{buildInPublicData.projectName}</span>
                  </div>
                )
              ) : null}
              {/* Badge de type */}
              {buildInPublicData.type && (
                <PostTypeBadge buildInPublicData={buildInPublicData} />
              )}
            </div>
          )}
        </div>

        {/* Médias si présents */}
        {post.mediaUrls && post.mediaUrls.length > 0 && post.mediaUrls[0] && (
          <MediaContent key={post.mediaUrls[0]} mediaUrl={post.mediaUrls[0]} mediaCount={post.mediaUrls.length} />
        )}

        {/* Tags */}
        <div className="mb-3">
          {renderTags(post.tags)}
        </div>

        {/* Stats et actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ProfilePostReactions
              reactions={post.reactions}
              reactionCount={post.reactionCount}
              commentCount={post.commentCount}
            />
            {(post.viewsCount ?? 0) > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Eye className="w-3 h-3" />
                <span>{post.viewsCount}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">
              {(() => {
                try {
                  const createdDate = new Date(post.createdAt);
                  if (isNaN(createdDate.getTime())) {
                    return 'Date inconnue';
                  }
                  return formatDistanceToNow(createdDate, { addSuffix: true, locale: fr });
                } catch {
                  return 'Date inconnue';
                }
              })()}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

