import { memo, useMemo } from 'react';
import {
  CardHeader,
} from '@/components/ui';
import { ClockIcon, Repeat2 } from 'lucide-react';
import { formatDistance } from 'date-fns';
import Link from 'next/link';
import { PostDisplayReasonType } from '../../post.api';
import PostDisplayBadge from './PostDisplayBadge';
import PostTypeBadge from './PostTypeBadge';
import { UserMiniProfile } from '@/components/base/avatar/user-mini-profile';
import { PostAuthorActions } from './PostAuthorActions';
import { BuildInPublicData } from '@/components/feed/BuildInPublicPost';
import ProjectAvatar from './ProjectAvatar';
import { Avatar } from '@/components/base/avatar/avatar';
import { useNavigateToConversation } from '@/hooks/useNavigateToConversation';

interface Props {
  id: string;
  avatar: string;
  about: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  displayReason: PostDisplayReasonType;
  streak?: number;
  isFollowing?: boolean;
  showActions?: boolean;
  highlight?: string | null;
  countryCode?: string | null;
  ecosystemRoles?: string[];
  followers?: number;
  following?: number;
  posts?: number;
  buildInPublicData?: BuildInPublicData;
  isRepost?: boolean;
  content?: string;
}

const PostHeader: React.FC<Props> = ({
  id,
  avatar,
  about,
  name,
  createdAt,
  updatedAt,
  displayReason,
  streak,
  isFollowing = false,
  showActions = false,
  highlight,
  countryCode,
  ecosystemRoles,
  followers,
  following,
  posts,
  buildInPublicData,
  isRepost = false,
  content,
}) => {
  const { navigateToConversation } = useNavigateToConversation();

  const [firstName, lastName] = useMemo(() => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return ['', ''];
    }
    return [parts[0], parts.slice(1).join(' ')];
  }, [name]);

  const formattedCreateAt = useMemo(() => {
    try {
      const createdDate = new Date(createdAt);
      if (isNaN(createdDate.getTime())) {
        return 'Date inconnue';
      }
      return formatDistance(createdDate, new Date(), {
        addSuffix: false,
        includeSeconds: false,
      });
    } catch {
      return 'Date inconnue';
    }
  }, [createdAt]);

  // Check if post was edited (and after the 15-minute grace period)
  const isEdited = useMemo(() => {
    try {
      if (createdAt === updatedAt) return false;
      const createdDate = new Date(createdAt);
      const updatedDate = new Date(updatedAt);

      if (isNaN(createdDate.getTime()) || isNaN(updatedDate.getTime())) {
        return false;
      }

      const fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds
      return (updatedDate.getTime() - createdDate.getTime()) > fifteenMinutes;
    } catch {
      return false;
    }
  }, [createdAt, updatedAt]);
  const isRepostWithoutContent = isRepost && (!content || content.trim().length === 0);

  return (
    <CardHeader className="pb-3 px-4">
      {isRepostWithoutContent && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Repeat2 className="w-4 h-4" />
          <Avatar 
            size="xs" 
            src={avatar} 
            alt={name} 
            initials={name.split(' ').map(n => n[0]).join('').substring(0, 2)}
          />
          <span className="font-medium text-gray-900">{name}</span>
          <span>a reposté</span>
        </div>
      )}
      {!isRepostWithoutContent && (
        <div className="flex justify-between items-start">
        <div className="flex items-start gap-3">
          <UserMiniProfile
            profileId={id}
            firstName={firstName}
            lastName={lastName}
            avatar={avatar}
            highlight={highlight ?? undefined}
            bio={about || undefined}
            streak={streak}
            size="md"
            countryCode={countryCode ?? undefined}
            isFollowing={isFollowing}
            ecosystemRoles={ecosystemRoles}
            stats={{
              followers: followers ?? 0,
              following: following ?? 0,
              posts: posts ?? 0,
            }}
            onMessage={() => navigateToConversation(id)}
          />
          <div className="flex-1">
            <Link href={`/profile/${id}`} className="font-medium text-sm hover:underline">
              {name}
            </Link>
            <p className="text-xs text-muted-foreground">{highlight || about}</p>

            <span className="flex items-center text-xs text-gray-500">
              {formattedCreateAt}
              {isEdited && (
                <>
                  <span className="mx-1">•</span>
                  <span className="text-gray-400 italic">(modifié)</span>
                </>
              )}
              <span className="mx-1">•</span>
              <ClockIcon className="w-3 h-3" />
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Badge du projet pour tous les posts Build in Public */}
          {buildInPublicData && (buildInPublicData?.projectId || buildInPublicData?.projectName) && (
            <>
              {buildInPublicData.projectId ? (
                <Link 
                  href={`/startups/${buildInPublicData.projectId}`}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
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
              )}
            </>
          )}
          {/* Badge de type de post (Launch, Update, Milestone, Metrics) */}
          {buildInPublicData?.type ? (
            <PostTypeBadge buildInPublicData={buildInPublicData} />
          ) : (
            /* Badge de raison d'affichage (Recommandé, etc.) - seulement si pas de type Build in Public */
            <PostDisplayBadge displayReason={displayReason} />
          )}
        </div>
      </div>
      )}
      {showActions && (
        <div className="px-4 pb-3">
          <PostAuthorActions
            profileId={id}
            authorName={name}
            isFollowing={isFollowing}
          />
        </div>
      )}
    </CardHeader>
  );
};

export default memo(PostHeader);