import { z } from 'zod';

export const minifiedProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string(),
  bio: z.string(),
  followers: z.number(),
  following: z.number(),
  joinedAt: z.string().datetime(),
});

export type minifiedProfileType = z.infer<typeof minifiedProfileSchema>;
