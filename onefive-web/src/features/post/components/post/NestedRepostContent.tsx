'use client';
import { usePost } from '../../hooks/queries';
import { PostHeader, PostContent, PostSkeleton } from '.';
import PostTags from './PostTags';
import { Tags } from '@/enums';
import { decodeBuildInPublicData } from '@/utils/buildInPublic';

interface NestedRepostContentProps {
  postId: string;
  onTagClick?: (tag: Tags) => void;
}

const NestedRepostContent: React.FC<NestedRepostContentProps> = ({ postId, onTagClick }) => {
  const { data: nestedPost, isLoading } = usePost(postId);
  
  if (isLoading) {
    return <PostSkeleton />;
  }
  
  if (!nestedPost) {
    return null;
  }
  
  const nestedBuildInPublicData = decodeBuildInPublicData(nestedPost.content || '').buildInPublicData;
  
  return (
    <>
      <PostHeader
        id={nestedPost.author?.id ?? 'pending-author'}
        avatar={nestedPost.author?.avatar ?? ''}
        about={nestedPost.author?.about ?? ''}
        name={nestedPost.author?.name ?? 'Utilisateur inconnu'}
        createdAt={nestedPost.createdAt}
        updatedAt={nestedPost.updatedAt}
        displayReason={nestedPost.displayReason}
        streak={nestedPost.author?.streak}
        highlight={nestedPost.author?.highlight}
        countryCode={nestedPost.author?.countryCode}
        ecosystemRoles={nestedPost.author?.ecosystemRoles}
        followers={nestedPost.author?.followers}
        following={nestedPost.author?.following}
        posts={nestedPost.author?.posts}
        isFollowing={nestedPost.author?.isFollowing}
        buildInPublicData={nestedBuildInPublicData || undefined}
        isRepost={!!nestedPost.repostedPost}
        content={nestedPost.content ?? ''}
      />
      <PostContent
        content={nestedPost.content ?? ''}
        mediaUrls={nestedPost.mediaUrls}
        repostedPost={nestedPost.repostedPost as any}
        onTagClick={onTagClick}
      />
      {nestedPost.tags && nestedPost.tags.length > 0 && (
        <div className="px-4 pb-2">
          <PostTags tags={nestedPost.tags} className="p-0" onTagClick={onTagClick} />
        </div>
      )}
    </>
  );
};

export default NestedRepostContent;

