import { Reaction, Tags } from '@/enums';
import { api } from '@/utils/kyInstance';
import { z } from 'zod';
import { VALIDATION_LIMITS, VALIDATION_MESSAGES } from '@/constants/validation-limits';

export const tempReactionSchema = z.object({
  like: z.number().optional(),
  love: z.number().optional(),
  support: z.number().optional(),
  insightful: z.number().optional(),
  funny: z.number().optional(),
  celebrate: z.number().optional(),
});

export type tempReactionType = z.infer<typeof tempReactionSchema>;

// Enum pour les raisons d'affichage du post
export const PostDisplayReason = {
  RECOMMENDATION: 'recommendation',
  RELATION: 'relation',
  TRENDING: 'trending',
  FOLLOWED_HASHTAG: 'followed_hashtag',
  SPONSORED: 'sponsored',
  YOUR_POST: 'your_post',
  NEW_CONTENT: 'new_content',
  LOCATION_BASED: 'location_based',
  EVENT_RELATED: 'event_related',
  MENTIONED: 'mentioned',
} as const;

export type PostDisplayReasonType = typeof PostDisplayReason[keyof typeof PostDisplayReason];

export const mediaSchema = z.object({
  url: z.string(),
  mimeType: z.string(),
  fileName: z.string(),
  size: z.number().optional(),
});

export type MediaType = z.infer<typeof mediaSchema>;

const repostedPostSchema = z.object({
  id: z.string(),
  author: z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string(),
  }),
  content: z.string(),
  mediaUrls: z.array(z.union([z.string(), mediaSchema])),
  tags: z.array(z.nativeEnum(Tags)),
  createdAt: z.string().datetime(),
  isRepost: z.boolean().optional(), // Flag pour indiquer que B est aussi un repost
});

export const postSchema = z.object({
  author: z.object({
    id: z.string(),
    name: z.string(),
    about: z.string(),
    highlight: z.string().nullable().optional(),
    avatar: z.string(),
    streak: z.number().optional(),
    countryCode: z.string().nullable().optional(),
    ecosystemRoles: z.array(z.string()).optional(),
    createdAt: z.string().optional(),
    followers: z.number().optional(),
    following: z.number().optional(),
    posts: z.number().optional(),
    isFollowing: z.boolean().optional(),
  }),
  id: z.string(),
  content: z.string(),
  mediaUrls: z.array(z.union([z.string(), mediaSchema])),
  tags: z.array(z.nativeEnum(Tags)),
  reactions: tempReactionSchema.optional(),
  reactionCount: z.number(),
  commentCount: z.number(),
  repostCount: z.number(),
  isReposted: z.boolean(),
  isBookmarked: z.boolean().optional().default(false),
  userReaction: z.nativeEnum(Reaction).nullable(),
  displayReason: z.enum([
    PostDisplayReason.RECOMMENDATION,
    PostDisplayReason.RELATION,
    PostDisplayReason.TRENDING,
    PostDisplayReason.FOLLOWED_HASHTAG,
    PostDisplayReason.SPONSORED,
    PostDisplayReason.YOUR_POST,
    PostDisplayReason.NEW_CONTENT,
    PostDisplayReason.LOCATION_BASED,
    PostDisplayReason.EVENT_RELATED,
    PostDisplayReason.MENTIONED
  ]).optional().default(PostDisplayReason.NEW_CONTENT),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  repostedPost: repostedPostSchema.nullable().optional(),
});

export type PostType = z.infer<typeof postSchema>;

export const getPost = async (postId: string) => {
  const response = await api.get(`posts/${postId}`);
  return response.json();
};

export const getFeed = async (params?: { skip?: number; limit?: number; tags?: Tags[] }) => {
  const searchParams = new URLSearchParams();
  if (params?.skip !== undefined) searchParams.set('skip', params.skip.toString());
  if (params?.limit !== undefined) searchParams.set('limit', params.limit.toString());
  if (params?.tags && params.tags.length > 0) searchParams.set('tags', params.tags.join(','));

  const queryString = searchParams.toString();
  const url = `posts/feed${queryString ? `?${queryString}` : ''}`;

  const response = await api.get(url);
  return response.json();
};

export const createPostSchema = z
  .object({
    content: z.string()
      .max(VALIDATION_LIMITS.POST.CONTENT_MAX, VALIDATION_MESSAGES.CONTENT_TOO_LONG)
      .default(''),
    medias: z.array(z.instanceof(File))
      .max(VALIDATION_LIMITS.POST.MEDIAS_MAX_COUNT, VALIDATION_MESSAGES.MEDIAS_TOO_MANY)
      .default([]),
    tags: z
      .array(z.nativeEnum(Tags))
      .min(1, 'Please select at least 1 tag')
      .max(VALIDATION_LIMITS.POST.TAGS_MAX_COUNT, VALIDATION_MESSAGES.TAGS_TOO_MANY),
  })
  .refine(
    (data) => {
      const hasContent = data.content && data.content.trim().length > 0;
      const hasMedia = data.medias && data.medias.length > 0;
      return hasContent || hasMedia;
    },
    {
      message: 'Content or media is required',
    },
  );

export type CreatePostType = z.infer<typeof createPostSchema>;

// Looser schema for editing posts (no tag requirement)
export const editPostSchema = z.object({
  content: z.string()
    .min(1, { message: 'Content is required' })
    .max(VALIDATION_LIMITS.POST.CONTENT_MAX, VALIDATION_MESSAGES.CONTENT_TOO_LONG),
  medias: z.array(z.instanceof(File))
    .max(VALIDATION_LIMITS.POST.MEDIAS_MAX_COUNT, VALIDATION_MESSAGES.MEDIAS_TOO_MANY)
    .optional()
    .default([]),
  tags: z.array(z.nativeEnum(Tags)).optional().default([]),
});
export type EditPostFormValues = z.infer<typeof editPostSchema>;

export const createPost = async (post: CreatePostType) => {
  const hasFiles = post.medias && post.medias.length > 0;

  if (!hasFiles) {
    const response = await api.post('posts', {
      json: {
        content: post.content,
        tags: post.tags,
      },
    });
    return response.json();
  }

  const formData = new FormData();
  formData.append('content', post.content);
  formData.append('tags', JSON.stringify(post.tags));
  post.medias.forEach((file) => formData.append('medias', file));

  const response = await api.post('posts', { body: formData });
  return response.json();
};
export const deletePost = async (postId: string) => {
  const response = await api.delete(`posts/${postId}`);
  return response.json();
};

export const repostPost = async (postId: string) => {
  const response = await api.post(`posts/${postId}/repost`);
  return response.json();
};

export const repostPostWithThoughts = async (
  postId: string,
  thoughts: string,
) => {
  const response = await api.post(`posts/${postId}/repost`, {
    json: { thoughts },
  });
  return response.json();
};

export const getPostComments = async (postId: string, params?: { skip?: number; take?: number; orderBy?: string; order?: string }) => {
  const searchParams = new URLSearchParams();
  if (params?.skip !== undefined) searchParams.set('skip', params.skip.toString());
  if (params?.take !== undefined) searchParams.set('take', params.take.toString());
  if (params?.orderBy) searchParams.set('orderBy', params.orderBy);
  if (params?.order) searchParams.set('order', params.order);

  const queryString = searchParams.toString();
  const url = `post-comments/posts/${postId}${queryString ? `?${queryString}` : ''}`;

  const response = await api.get(url);
  return response.json();
};

export const createPostComment = async (postId: string, data: { content: string; parentId?: string }) => {
  const response = await api.post(`post-comments/posts/${postId}`, {
    json: data,
  });
  return response.json();
};

export const updatePostComment = async (commentId: string, data: { content: string }) => {
  const response = await api.put(`post-comments/${commentId}`, {
    json: data,
  });
  return response.json();
};

export const deletePostComment = async (commentId: string) => {
  const response = await api.delete(`post-comments/${commentId}`);
  return response.json();
};

export const updatePost = async (postId: string, data: { content?: string; tags?: string[] }) => {
  const response = await api.put(`posts/${postId}`, {
    json: data,
  });
  return response.json();
};

export const getProfilePosts = async (profileId: string, params?: { skip?: number; take?: number; orderBy?: string; order?: string }) => {
  const searchParams = new URLSearchParams();
  if (params?.skip !== undefined) searchParams.set('skip', params.skip.toString());
  if (params?.take !== undefined) searchParams.set('take', params.take.toString());
  if (params?.orderBy) searchParams.set('orderBy', params.orderBy);
  if (params?.order) searchParams.set('order', params.order);

  const queryString = searchParams.toString();
  const url = `profile-post/${profileId}${queryString ? `?${queryString}` : ''}`;

  const response = await api.get(url);
  return response.json();
};

// mockPost removed - use real API data via getFeed() or getPost()
