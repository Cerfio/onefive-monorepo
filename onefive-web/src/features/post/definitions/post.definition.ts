import { Reaction, Tags } from '@/enums';
import { z } from 'zod';

export const tempReactionSchema = z.object({
  like: z.number().optional(),
  love: z.number().optional(),
  support: z.number().optional(),
  insightful: z.number().optional(),
  funny: z.number().optional(),
  celebrate: z.number().optional(),
});

export type tempReactionType = z.infer<typeof tempReactionSchema>;
export const postSchema = z.object({
  author: z.object({
    id: z.string(),
    name: z.string(),
    about: z.string(),
    avatar: z.string(),
  }),
  id: z.string(),
  content: z.string(),
  mediaUrls: z.array(z.string()),
  tags: z.array(z.nativeEnum(Tags)),
  reactions: tempReactionSchema.optional(),
  reactionCount: z.number(),
  commentCount: z.number(),
  repostCount: z.number(),
  userReaction: z.nativeEnum(Reaction).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type PostType = z.infer<typeof postSchema>;
