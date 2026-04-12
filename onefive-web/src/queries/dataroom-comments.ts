import { api } from '@/utils/kyInstance';
import { z } from 'zod';

const authorSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  avatar: z.object({ url: z.string().nullable() }).nullable(),
});

const replySchema = z.object({
  id: z.string(),
  content: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  author: authorSchema,
});

const commentSchema = z.object({
  id: z.string(),
  content: z.string(),
  pageNumber: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  author: authorSchema,
  replies: z.array(replySchema),
});

const listCommentsResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    comments: z.array(commentSchema),
    total: z.number(),
  }),
});

const createCommentResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string(),
    content: z.string(),
    pageNumber: z.number().nullable(),
    parentId: z.string().nullable(),
    createdAt: z.string(),
    author: authorSchema,
  }),
});

export type CommentAuthor = z.infer<typeof authorSchema>;
export type CommentReply = z.infer<typeof replySchema>;
export type FileComment = z.infer<typeof commentSchema>;

export const getFileComments = async ({
  dataroomId,
  fileId,
}: {
  dataroomId: string;
  fileId: string;
}) => {
  const response = await api.get(
    `dataroom/${dataroomId}/file/${fileId}/comments`,
  );
  const parsed = listCommentsResponseSchema.parse(await response.json());
  return parsed.data;
};

export const createFileComment = async ({
  dataroomId,
  fileId,
  content,
  pageNumber,
  parentId,
}: {
  dataroomId: string;
  fileId: string;
  content: string;
  pageNumber?: number;
  parentId?: string;
}) => {
  const response = await api.post(
    `dataroom/${dataroomId}/file/${fileId}/comments`,
    {
      json: { content, pageNumber, parentId },
    },
  );
  const parsed = createCommentResponseSchema.parse(await response.json());
  return parsed.data;
};

export const updateFileComment = async ({
  dataroomId,
  fileId,
  commentId,
  content,
}: {
  dataroomId: string;
  fileId: string;
  commentId: string;
  content: string;
}) => {
  const response = await api.put(
    `dataroom/${dataroomId}/file/${fileId}/comments/${commentId}`,
    {
      json: { content },
    },
  );
  return response.json();
};

export const deleteFileComment = async ({
  dataroomId,
  fileId,
  commentId,
}: {
  dataroomId: string;
  fileId: string;
  commentId: string;
}) => {
  const response = await api.delete(
    `dataroom/${dataroomId}/file/${fileId}/comments/${commentId}`,
  );
  return response.json();
};
