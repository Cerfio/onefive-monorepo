import { z } from 'zod';
import { Reaction } from '@/enums';
import { tempReactionSchema } from './post.definition';

export const reactionSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  reaction: z.nativeEnum(Reaction),
});

export const replySchema = z.object({
  id: z.string(),
  author: z.string(),
  avatar: z.string(),
  content: z.string(),
  parentId: z.string().nullable(),
  createdAt: z.string().datetime(),
  reactions: z.array(reactionSchema),
  reactionCount: z.number().int().min(0),
  postId: z.string().optional(),
  profileId: z.string().optional(),
  userReaction: z.nativeEnum(Reaction).nullable().optional(),
  countryCode: z.string().optional(),
  countryName: z.string().optional(),
  about: z.string().optional(),
  bio: z.string().optional(),
  ecosystemRoles: z.array(z.string()).optional(),
  isFollowing: z.boolean().optional(),
  stats: z.object({
    followers: z.number(),
    following: z.number(),
    posts: z.number(),
  }).optional(),
  streak: z.number().optional(),
  badges: z.array(z.any()).optional(),
});
export type ReplyType = z.infer<typeof replySchema>;

export const commentSchema = z.object({
  postId: z.string(),
  id: z.string(),
  author: z.string(),
  avatar: z.string(),
  content: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  parentId: z.string().nullable(),
  replies: z.array(replySchema),
  reactions: tempReactionSchema.optional(),
  reactionCount: z.number().int().min(0),
  commentCount: z.number().int().min(0),
  profileId: z.string(),
  userReaction: z.nativeEnum(Reaction).nullable().optional(),
  countryCode: z.string().optional(),
  countryName: z.string().optional(),
  about: z.string().optional(),
  bio: z.string().optional(),
  ecosystemRoles: z.array(z.string()).optional(),
  isFollowing: z.boolean().optional(),
  stats: z.object({
    followers: z.number(),
    following: z.number(),
    posts: z.number(),
  }).optional(),
  streak: z.number().optional(),
  badges: z.array(z.any()).optional(),
});
export const commentListSchema = z.array(commentSchema).min(0);
export type CommentListType = z.infer<typeof commentListSchema>;
export type CommentType = z.infer<typeof commentSchema>;
