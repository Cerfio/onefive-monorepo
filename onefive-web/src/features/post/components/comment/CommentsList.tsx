import { Button } from '@/components/base/buttons/button';
import { Fragment, memo } from 'react';
import CommentForm from './CommentForm';
import Comment from './Comment';
import Link from 'next/link';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { usePostComments } from '../../hooks/queries/usePostComments';
import CommentSkeleton from './CommentSkeleton';

interface Props {
  postId: string;
  commentCount: number;
  commentInputRef: React.RefObject<HTMLTextAreaElement | null>;
  isPostPage?: boolean;
}

const CommentsList: React.FC<Props> = ({
  postId,
  commentCount,
  commentInputRef,
  isPostPage,
}) => {
  const {
    data: comments,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetching,
  } = usePostComments(postId, true, isPostPage);
  const triggerRef = useInfiniteScroll(
    fetchNextPage,
    hasNextPage ?? (false && isPostPage),
    isFetching ?? false,
    '500px',
  );

  if (error) {
    return (
      <div className="mt-4 pt-3 border-t w-full">
        <div className="text-center py-4 text-red-500">
          Failed to load comments
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-3 w-full">
      <CommentForm
        ref={commentInputRef}
        postId={postId}
        onCommentCreated={() => {
          // Optionnel: scroll vers le nouveau commentaire ou autre logique
        }}
      />
      <div className="space-y-4">
        {isLoading && (
          <>
            <CommentSkeleton />
            <CommentSkeleton />
            <CommentSkeleton />
          </>
        )}
        {comments?.pages.map((page, index) => (
          <Fragment key={index}>
            {page.comments.map((comment) => (
              <Comment key={comment.id} comment={comment} />
            ))}
          </Fragment>
        ))}
        {isPostPage && <div ref={triggerRef} style={{ height: '1px' }} />}
        {!isPostPage && commentCount > 0 && (
          <Link href={`/feed/${postId}`} className="w-full flex justify-center">
            <Button color="tertiary" size="sm" className="text-xs w-fit px-16">
              View all {commentCount} comments
            </Button>
          </Link>
        )}
        {isFetching && isPostPage && (
          <>
            <CommentSkeleton />
            <CommentSkeleton />
            <CommentSkeleton />
          </>
        )}
        {/* {!hasNextPage &&
          comments?.pages.length &&
          comments?.pages.length > 0 && (
            <div className="text-center py-2 text-gray-500 text-sm">
              No more comments
            </div>
          )} */}
        {comments?.pages[0]?.comments.length === 0 && !isLoading && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(CommentsList);
