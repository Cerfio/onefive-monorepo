'use client';
import { useCallback, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { flushSync } from 'react-dom';
import { Card, CardFooter } from '@/components/ui';
import { usePost } from '../../hooks/queries';
import {
  PostHeader,
  PostInteractions,
  PostContent,
  PostControls,
  PostSkeleton,
} from '.';
import PostTags from './PostTags';
import CommentsList from '../comment/CommentsList';
import { EditPost } from '../EditPost';
import PostReactionsModal from './PostReactionsModal';
import RepostWithThoughtsModal from './RepostWithThoughtsModal';
import { selfProfile } from '@/queries/profile';
import { useDeletePost } from '../../hooks/mutations/useDeletePost';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/base/dialog/alert-dialog';
import { cn } from '@/lib/utils';
import CommentSkeleton from '../comment/CommentSkeleton';
import type { OptimisticPostType } from '../../types/optimistic';
import { PendingPostIndicator } from './PendingPostIndicator';
import { Tags } from '@/enums';
import { decodeBuildInPublicData } from '@/utils/buildInPublic';
import NestedRepostContent from './NestedRepostContent';

interface PostProps {
  post?: OptimisticPostType;
  postId?: string;
  className?: string;
  showComments?: boolean;
  compact?: boolean;
  onTagClick?: (tag: Tags) => void;
  isNestedRepost?: boolean;
}

const Post: React.FC<PostProps> = ({
  post: initialPost,
  postId,
  className = '',
  showComments = false,
  compact: _compact = false,
  onTagClick,
  isNestedRepost = false,
}) => {
  // Only fetch if we don't have initialPost data
  const shouldFetch = !initialPost && !!postId;
  const {
    data: fetchedPost,
    isLoading,
    error,
  } = usePost(shouldFetch ? postId : '');
  const post = (initialPost || fetchedPost) as OptimisticPostType | undefined;
  const [showCommentsState, setShowComments] = useState<boolean>(showComments);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [openPostReactions, setOpenPostReactions] = useState(false);
  const [openRepostWithThoughts, setOpenRepostWithThoughts] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const isPending = !!post?.isPending;

  // Decode build in public data for header badge
  const { buildInPublicData } = decodeBuildInPublicData(post?.content || '');

  // Fetch current user's profile to determine ownership
  const { data: meProfile } = useQuery({
    queryKey: ['selfProfile'],
    queryFn: selfProfile,
    staleTime: 5 * 60 * 1000,
    enabled: !!post, // only when we have a post
  });

  const toggleComments = useCallback(() => {
    flushSync(() => {
      setShowComments(true);
    });
    commentInputRef.current?.focus();
  }, []);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleSaveEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  const authorId = post?.author?.id;
  const canEdit = Boolean(
    post &&
    !isPending &&
    meProfile?.id &&
    authorId &&
    meProfile.id === authorId
  );
  const { mutateAsync: deletePost, isLoading: isDeleting } = useDeletePost();
  const [openDelete, setOpenDelete] = useState(false);

  // Don't allow opening reactions modal for posts without valid ID
  const canOpenReactions = Boolean(post?.id && !isPending);

  // Get the real post ID (resolve tempId if needed)
  const realPostId = post?.id && !post.id.startsWith('temp-post-') ? post.id : null;

  // Check if post can be deleted (has valid ID and is not pending)
  const canDelete = Boolean(realPostId && !isPending);

  const handleDelete = useCallback(async () => {
    if (!post) return;
    setOpenDelete(true);
  }, [post]);

  // Check if this is a repost without content
  const isRepostWithoutContent = !!post?.repostedPost && (!post.content || post.content.trim().length === 0);

  if (!initialPost && isLoading) {
    return (
      <div className="space-y-4 w-full border-l border-r">
        <PostSkeleton
          className={showComments ? 'rounded-t-none border-t-0' : ''}
        />
        {showComments && (
          <div className="flex flex-col gap-2 mx-5">
            <CommentSkeleton />
            <CommentSkeleton />
            <CommentSkeleton />
            <CommentSkeleton />
            <CommentSkeleton />
            <CommentSkeleton />
          </div>
        )}
      </div>
    );
  }

  if (!initialPost && error) {
    return (
      <div className={`bg-red-50 rounded-lg p-4 mb-4 ${className}`}>
        <p className="text-red-600">Failed to load post</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 mb-4 ${className}`}>
        <p className="text-gray-600">Post not found</p>
      </div>
    );
  }

  if (isEditing) {
    return (
      <EditPost
        post={post}
        onCancel={handleCancelEdit}
        onSave={handleSaveEdit}
      />
    );
  }

  return (
    <>
      <Card
        className={cn(
          'overflow-hidden gap-1',
          showComments &&
            'rounded-t-none rounded-b-none border-b-0 border-t-0',
          isPending && 'opacity-60 saturate-50'
        )}
      >
        <PostHeader
          id={post.author?.id ?? 'pending-author'}
          avatar={post.author?.avatar ?? ''}
          about={post.author?.about ?? ''}
          name={post.author?.name ?? 'Utilisateur inconnu'}
          createdAt={post.createdAt}
          updatedAt={post.updatedAt}
          displayReason={post.displayReason}
          streak={post.author?.streak}
          highlight={post.author?.highlight}
          countryCode={post.author?.countryCode}
          ecosystemRoles={post.author?.ecosystemRoles}
          followers={post.author?.followers}
          following={post.author?.following}
          posts={post.author?.posts}
          isFollowing={post.author?.isFollowing}
          buildInPublicData={buildInPublicData || undefined}
          isRepost={!!post.repostedPost}
          content={post.content ?? ''}
        />
        <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this post?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your post.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                disabled={isDeleting || !canDelete}
                onClick={async () => {
                  if (!realPostId) {
                    console.error('Cannot delete post: no valid ID available');
                    return;
                  }
                  await deletePost(realPostId);
                  setOpenDelete(false);
                }}
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {isRepostWithoutContent && !isNestedRepost && post.repostedPost?.id ? (
          // Pour un repost sans contenu, afficher le post original complet
          <div className="mt-0">
            <NestedRepostContent postId={post.repostedPost.id} onTagClick={onTagClick} />
          </div>
        ) : (
          <>
            <PostContent
              content={post.content ?? ''}
              mediaUrls={post.mediaUrls}
              repostedPost={post.repostedPost as any}
              onTagClick={onTagClick}
            />
            {post.tags && post.tags.length > 0 && (
              <div className="px-4 pb-2">
                <PostTags tags={post.tags} className="p-0" onTagClick={onTagClick} />
              </div>
            )}
          </>
        )}
        {!isNestedRepost && (
          <CardFooter className="border-t p-0 flex flex-col">
            {isPending && <PendingPostIndicator />}
            <div className="w-full px-4 pt-2">
              <PostInteractions
                reactions={post.reactions}
                reactionCount={post.reactionCount ?? 0}
                commentCount={post.commentCount ?? 0}
                repostCount={post.repostCount ?? 0}
                toggleComment={toggleComments}
                onOpenReactions={() => canOpenReactions && realPostId && setOpenPostReactions(true)}
                disabled={isPending}
              />
            </div>
          <div className="w-full mt-1 px-4 ">
            <PostControls
              isReposted={post.isReposted ?? false}
              isBookmarked={post.isBookmarked ?? false}
              toggleComment={toggleComments}
              currentReaction={post.userReaction}
              postId={realPostId || post.id}
              createdAt={post.createdAt}
              onRepostWithThoughts={() => setOpenRepostWithThoughts(true)}
              onEdit={canEdit ? handleEdit : undefined}
              onDelete={canEdit && canDelete ? handleDelete : undefined}
              disabled={isPending}
            />
          </div>
            {showCommentsState && (
              <div className="w-full px-4 mt-4 border-t">
                <CommentsList
                  postId={realPostId || post.id}
                  commentCount={post.commentCount ?? 0}
                  commentInputRef={commentInputRef}
                  isPostPage={showComments}
                />
              </div>
            )}
          </CardFooter>
        )}
      </Card>
      {canOpenReactions && realPostId && (
        <PostReactionsModal
          open={openPostReactions}
          onOpenChange={setOpenPostReactions}
          postId={realPostId}
          reactions={post.reactions}
          reactionCount={post.reactionCount}
        />
      )}
      {realPostId && (
        <RepostWithThoughtsModal
          open={openRepostWithThoughts}
          onOpenChange={setOpenRepostWithThoughts}
          postId={realPostId}
        />
      )}
    </>
  );
};

export default Post;
