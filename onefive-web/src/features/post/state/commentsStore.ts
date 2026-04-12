// Lightweight normalization store (E)
// This is intentionally simple; can be swapped for Zustand or another state manager later.
import type { CommentType } from '../definitions/comment.definition';

// In-memory map; not reactive by itself, but can be leveraged for future selectors.
const commentsMap = new Map<string, any>();

export const upsertNormalizedComment = (comment: CommentType | any) => {
  if (!comment?.id) return;
  commentsMap.set(comment.id, comment);
};

export const removeNormalizedComment = (id: string) => {
  commentsMap.delete(id);
};

export const getNormalizedComment = (id: string) => commentsMap.get(id);

export const listNormalizedComments = () => Array.from(commentsMap.values());
