import { DiscussionType, Reaction, Sort, Tags } from '@/enums';
import { api } from '@/utils/kyInstance';
import { toast } from 'sonner';
import { z } from 'zod';

const saasSchema = z.object({
  id: z.string(),
  name: z.string(),
  logoUrl: z.string(),
  domain: z.string(),
}).nullable();

// Schéma réutilisable pour les profils dans les discussions (données brutes du backend)
const discussionProfileSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  avatar: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  highlight: z.string().nullable().optional(),
  createdAt: z.string(),
  followedBy: z.number(),
  following: z.number().optional(),
  postsCount: z.number().optional(),
  isFollowing: z.boolean(),
  countryCode: z.string().nullable().optional(),
  ecosystemRoles: z.array(z.string()).optional(),
  streak: z.number().optional(),
}).nullable();

// Schéma réutilisable pour les profils transformés (après traitement frontend)
const transformedProfileSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  avatar: z.string(),
  bio: z.string().optional(),
  highlight: z.string().optional(),
  createdAt: z.string(),
  followedBy: z.number(),
  following: z.number().optional(),
  postsCount: z.number().optional(),
  isFollowing: z.boolean(),
  countryCode: z.string().nullable().optional(),
  ecosystemRoles: z.array(z.string()).optional(),
  streak: z.number().optional(),
}).nullable();

type DiscussionProfile = z.infer<typeof discussionProfileSchema>;

const mapDiscussionProfile = (profile: DiscussionProfile) => {
  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    avatar: profile.avatar ?? '',
    createdAt: profile.createdAt,
    highlight: profile.highlight ?? undefined,
    bio: profile.bio ?? undefined,
    followedBy: profile.followedBy,
    following: profile.following ?? 0,
    postsCount: profile.postsCount ?? 0,
    isFollowing: profile.isFollowing,
    countryCode: profile.countryCode ?? undefined,
    ecosystemRoles: profile.ecosystemRoles ?? [],
    streak: profile.streak ?? 0,
  };
};

const discussionListItemSchema = z.object({
  id: z.string(),
  question: z.string(),
  context: z.string().optional(),
  tags: z.array(z.string()),
  upvoteCount: z.number(),
  hasUpvote: z.boolean(),
  answerCount: z.number(),
  viewCount: z.number(),
  createdAt: z.string(),
  saas: saasSchema.optional(),
  profile: discussionProfileSchema,
});

const fetchDiscussionsResponseSchema = z.object({
  success: z.boolean(),
  data: z.union([
    z.array(discussionListItemSchema),
    z.object({
      items: z.array(discussionListItemSchema),
      total: z.number().optional(),
      page: z.number(),
      pageSize: z.number(),
      hasMore: z.boolean(),
    }),
  ]),
});

const createDiscussionResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.string(),
  }),
});

const updateDiscussionResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.string(),
  }),
});

// Schéma correspondant à ce que le backend retourne réellement
const fetchDiscussionResponseSchemaRaw = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.string(),
    profileId: z.string(),
    question: z.string(),
    context: z.string().optional().nullable(),
    tags: z.array(z.string()),
    _count: z.object({
      upvotes: z.number(),
      answers: z.number(),
      views: z.number(),
    }),
    upvotes: z.array(z.object({
      id: z.string(),
    })),
    reactions: z.array(
      z.object({
        profileId: z.string(),
        reaction: z.nativeEnum(Reaction),
      }),
    ),
    createdAt: z.string(),
    updatedAt: z.string(),
    options: z.array(z.string()),
    type: z.nativeEnum(DiscussionType),
    content: z.string().nullable(),
    pollVotes: z.array(z.object({
      option: z.string(),
      profileId: z.string(),
    })).optional(),
    pollResults: z.record(z.string(), z.number()).optional(),
    hasVoted: z.boolean().optional(),
    profile: discussionProfileSchema,
    answers: z.array(
      z.object({
        id: z.string(),
        profileId: z.string(),
        content: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
        upvotes: z.array(z.object({
          id: z.string(),
        })),
        _count: z.object({
          upvotes: z.number(),
        }),
        reactions: z.array(
          z.object({
            profileId: z.string(),
            reaction: z.nativeEnum(Reaction),
          }),
        ),
        replies: z.array(
          z.object({
            id: z.string(),
            profileId: z.string(),
            content: z.string(),
            createdAt: z.string(),
            updatedAt: z.string(),
            reactions: z.array(
              z.object({
                profileId: z.string(),
                reaction: z.nativeEnum(Reaction),
              }),
            ),
            upvotes: z.array(
              z.object({
                profileId: z.string(),
              }),
            ),
            profile: discussionProfileSchema,
          }),
        ),
        profile: discussionProfileSchema,
      }),
    ),
  }),
});

// Schéma transformé pour correspondre à ce que le frontend attend
const fetchDiscussionResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.string(),
    isAuthor: z.boolean(),
    question: z.string(),
    context: z.string().optional().nullable(),
    tags: z.array(z.string()),
    upvoteCount: z.number(),
    answerCount: z.number(),
    viewCount: z.number(),
    hasUpvote: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
    options: z.array(z.string()),
    pollResults: z.record(z.string(), z.number()).optional(),
    hasVoted: z.boolean().optional(),
    hasReacted: z.array(z.nativeEnum(Reaction)),
    reactions: z.array(
      z.object({
        profileIds: z.array(z.string()),
        type: z.nativeEnum(Reaction),
        count: z.number(),
      }),
    ),
    type: z.nativeEnum(DiscussionType),
    content: z.string().nullable(),
    profile: transformedProfileSchema,
    answers: z.array(
      z.object({
        id: z.string(),
        isAuthor: z.boolean(),
        content: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
        creatorId: z.string(),
        hasUpvote: z.boolean(),
        upvoteCount: z.number(),
        hasReacted: z.array(z.nativeEnum(Reaction)),
        reactions: z.array(
          z.object({
            profileIds: z.array(z.string()),
            type: z.nativeEnum(Reaction),
            count: z.number(),
          }),
        ),
        replies: z.array(
          z.object({
            id: z.string(),
            isAuthor: z.boolean(),
            content: z.string(),
            createdAt: z.string(),
            updatedAt: z.string(),
            creatorId: z.string(),
            hasUpvote: z.boolean(),
            upvoteCount: z.number(),
            hasReacted: z.array(z.nativeEnum(Reaction)),
            reactions: z.array(
              z.object({
                profileIds: z.array(z.string()),
                type: z.nativeEnum(Reaction),
                count: z.number(),
              }),
            ),
            profile: transformedProfileSchema,
          }),
        ),
        profile: transformedProfileSchema,
      }),
    ),
  }),
});

const createAnswerResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.string(),
  }),
});

export type DiscussionInfer = z.infer<typeof discussionListItemSchema>;

export type SpecificDiscussionInfer = z.infer<
  typeof fetchDiscussionResponseSchema
>['data'];

export type DiscussionAnswerInfer = z.infer<
  typeof fetchDiscussionResponseSchema
>['data']['answers'][0];

export const fetchDiscussions = async ({
  sort,
  offset,
  tag,
  search,
  limit = 10,
  profileId,
}: {
  sort: Sort;
  offset: number;
  tag?: Tags;
  search?: string;
  limit?: number;
  profileId?: string;
}) => {
  try {
    const response = await api.get(
      `discussion?sort=${sort}&offset=${offset}&limit=${limit}${
        tag ? `&tag=${tag}` : ''
      }${search ? `&search=${search}` : ''}${
        profileId ? `&profileId=${profileId}` : ''
      }`,
    );
    const payload: any = await response.json();
    const parse = fetchDiscussionsResponseSchema.parse(payload);
    return Array.isArray(parse.data) ? parse.data : parse.data.items;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      toast.error('Unable to fetch discussions: Error ONE-1');
    } else if (error.name === 'HTTPError') {
      toast.error('Unable to fetch discussions: Error ONE-2');
    } else {
      toast.error('Unable to fetch discussions: Error ONE-3');
    }
    throw Error('Unable to fetch discussions');
  }
};

export const createDiscussion = async ({
  question,
  tags,
  type,
  content,
  options,
  saas,
}: {
  question: string;
  tags: string[];
  type: DiscussionType;
  content: string;
  options: string[];
  saas?: {
    id: string;
    name: string;
    logoUrl: string;
    domain: string;
  } | null;
}) => {
  const optionalField: any = {};

  if (type === DiscussionType.POLL || type === DiscussionType.POLL_MULTIPLE) {
    optionalField['options'] = options;
  }
  if (content && content.length > 0) {
    optionalField['content'] = content;
  }
  if (saas && saas.domain) {
    optionalField['context'] = saas.domain;
  }
  try {
    const response = await api.post('discussion',
      {
        json: { question, tags, type, ...optionalField },
      },
    );
    const payload: any = await response.json();
    const parsed = createDiscussionResponseSchema.parse(payload);
    return parsed.data;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      toast.error('Unable to fetch discussions: Error ONE-1');
    } else if (error.name === 'HTTPError') {
      toast.error('Unable to create discussion: Error ONE-2');
    } else {
      toast.error('Unable to create discussion: Error ONE-3');
    }
    throw Error('Unable to create discussion');
  }
};

export const fetchDiscussion = async ({ id, currentProfileId }: { id: string; currentProfileId: string }) => {
  try {
    const response = await api.get(`discussion/${id}`,
    );
    const payload: any = await response.json();
    const rawParsed = fetchDiscussionResponseSchemaRaw.parse(payload);
    
    // Transformer les données brutes en format attendu par le frontend
    // currentProfileId est maintenant passé en paramètre pour calculer correctement hasUpvote/hasReacted
    
    // Transformer les réactions de la discussion
    const reactionsByType = new Map<Reaction, string[]>();
    rawParsed.data.reactions.forEach((r) => {
      if (!reactionsByType.has(r.reaction)) {
        reactionsByType.set(r.reaction, []);
      }
      reactionsByType.get(r.reaction)!.push(r.profileId);
    });
    
    const reactions = Array.from(reactionsByType.entries()).map(([type, profileIds]) => ({
      profileIds,
      type,
      count: profileIds.length,
    }));
    
    const hasReacted = rawParsed.data.reactions
      .filter((r) => r.profileId === currentProfileId)
      .map((r) => r.reaction);
    
    // Transformer les réponses
    const transformedAnswers = rawParsed.data.answers.map((answer) => {
      const answerReactionsByType = new Map<Reaction, string[]>();
      answer.reactions.forEach((r) => {
        if (!answerReactionsByType.has(r.reaction)) {
          answerReactionsByType.set(r.reaction, []);
        }
        answerReactionsByType.get(r.reaction)!.push(r.profileId);
      });
      
      const answerReactions = Array.from(answerReactionsByType.entries()).map(([type, profileIds]) => ({
        profileIds,
        type,
        count: profileIds.length,
      }));
      
      const answerHasReacted = answer.reactions
        .filter((r) => r.profileId === currentProfileId)
        .map((r) => r.reaction);
      
      // Transformer les replies
      const transformedReplies = answer.replies.map((reply) => {
        const replyReactionsByType = new Map<Reaction, string[]>();
        reply.reactions.forEach((r) => {
          if (!replyReactionsByType.has(r.reaction)) {
            replyReactionsByType.set(r.reaction, []);
          }
          replyReactionsByType.get(r.reaction)!.push(r.profileId);
        });
        
        const replyReactions = Array.from(replyReactionsByType.entries()).map(([type, profileIds]) => ({
          profileIds,
          type,
          count: profileIds.length,
        }));
        
        const replyHasReacted = reply.reactions
          .filter((r) => r.profileId === currentProfileId)
          .map((r) => r.reaction);
        
        const replyHasUpvote = reply.upvotes.some(
          (upvote) => upvote.profileId === currentProfileId
        );
        
        return {
          id: reply.id,
          isAuthor: reply.profileId === currentProfileId,
          content: reply.content,
          createdAt: reply.createdAt,
          updatedAt: reply.updatedAt,
          creatorId: reply.profileId,
          hasUpvote: replyHasUpvote,
          upvoteCount: reply.upvotes.length,
          hasReacted: replyHasReacted,
          reactions: replyReactions,
          profile: mapDiscussionProfile(reply.profile),
        };
      });
      
      return {
        id: answer.id,
        isAuthor: answer.profileId === currentProfileId,
        content: answer.content,
        createdAt: answer.createdAt,
        updatedAt: answer.updatedAt,
        creatorId: answer.profileId,
        hasUpvote: answer.upvotes.length > 0,
        upvoteCount: answer._count.upvotes,
        hasReacted: answerHasReacted,
        reactions: answerReactions,
        replies: transformedReplies,
        profile: mapDiscussionProfile(answer.profile),
      };
    });
    
    // Construire l'objet final transformé
    const transformedData = {
      id: rawParsed.data.id,
      isAuthor: rawParsed.data.profileId === currentProfileId,
      question: rawParsed.data.question,
      context: rawParsed.data.context || undefined,
      tags: rawParsed.data.tags,
      upvoteCount: rawParsed.data._count.upvotes,
      answerCount: rawParsed.data._count.answers,
      viewCount: rawParsed.data._count.views,
      hasUpvote: rawParsed.data.upvotes.length > 0,
      createdAt: rawParsed.data.createdAt,
      updatedAt: rawParsed.data.updatedAt,
      options: rawParsed.data.options,
      pollResults: rawParsed.data.pollResults || {},
      hasVoted: rawParsed.data.hasVoted || false,
      hasReacted,
      reactions,
      type: rawParsed.data.type,
      content: rawParsed.data.content,
      profile: mapDiscussionProfile(rawParsed.data.profile),
      answers: transformedAnswers,
    };
    
    // Valider avec le schéma final
    const parsed = fetchDiscussionResponseSchema.parse({ success: true, data: transformedData });
    return parsed.data;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      toast.error('Unable to fetch discussion: Error ONE-1');
    } else if (error.name === 'HTTPError') {
      if (error.response.status === 404) {
        throw error;
      }
      toast.error('Unable to fetch discussion: Error ONE-2');
    } else {
      toast.error('Unable to fetch discussion: Error ONE-3');
    }
    throw Error('Unable to fetch discussion');
  }
};

export const updateDiscussion = async ({
  id,
  question,
  tags,
  content,
  options,
  context,
}: {
  id: string;
  question?: string;
  tags?: string[];
  content?: string;
  options?: string[];
  context?: string | null;
}) => {
  const json: Record<string, unknown> = {};

  if (typeof question === 'string') {
    json.question = question;
  }
  if (Array.isArray(tags)) {
    json.tags = tags;
  }
  if (typeof content === 'string') {
    json.content = content;
  }
  if (Array.isArray(options)) {
    json.options = options;
  }
  if (typeof context === 'string') {
    json.context = context;
  }
  if (context === null) {
    json.context = null;
  }

  try {
    const response = await api.put(`discussion/${id}`,
      {
        json,
      },
    );
    const payload: any = await response.json();
    const parsed = updateDiscussionResponseSchema.parse(payload);
    return parsed.data;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      toast.error('Unable to update discussion: Error ONE-1');
    } else if (error.name === 'HTTPError') {
      toast.error('Unable to update discussion: Error ONE-2');
    } else {
      toast.error('Unable to update discussion: Error ONE-3');
    }
    throw Error('Unable to update discussion');
  }
};

export const createAnswer = async ({
  content,
  discussionId,
}: {
  content: string;
  discussionId: string;
}) => {
  try {
    const response = await api.post(`discussions/${discussionId}/answers`,
      {
        json: { content },
      },
    );
    const payload: any = await response.json();
    const parsed = createAnswerResponseSchema.parse(payload);
    return parsed.data;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      toast.error('Unable to create answer: Error ONE-1');
    } else if (error.name === 'HTTPError') {
      toast.error('Unable to create answer: Error ONE-2');
    } else {
      toast.error('Unable to create answer: Error ONE-3');
    }
    throw Error('Unable to create answer');
  }
};

export const createUpvoteDiscussion = async ({ id }: { id: string }) => {
  try {
    await api.post(`discussions/${id}/upvote`,
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      toast.error('Unable to upvote discussion: Error ONE-1');
    } else if (error.name === 'HTTPError') {
      toast.error('Unable to upvote discussion: Error ONE-2');
    } else {
      toast.error('Unable to upvote discussion: Error ONE-3');
    }
    throw Error('Unable to upvote discussion');
  }
};

export const deleteUpvoteDiscussion = async ({ id }: { id: string }) => {
  try {
    await api.delete(`discussions/${id}/upvote`,
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      toast.error('Unable to delete upvote discussion: Error ONE-1');
    } else if (error.name === 'HTTPError') {
      toast.error('Unable to delete upvote discussion: Error ONE-2');
    } else {
      toast.error('Unable to delete upvote discussion: Error ONE-3');
    }
    throw Error('Unable to delete upvote discussion');
  }
};

export const createReactionAnswer = async ({
  discussionId,
  answerId,
  type,
}: {
  discussionId: string;
  answerId: string;
  type: Reaction;
}) => {
  try {
    await api.post(`discussions/${discussionId}/answers/${answerId}/reaction`,
      {
        json: { reaction: type },
      },
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      toast.error('Unable to create reaction discussion: Error ONE-1');
    } else if (error.name === 'HTTPError') {
      toast.error('Unable to create reaction discussion: Error ONE-2');
    } else {
      toast.error('Unable to create reaction discussion: Error ONE-3');
    }
    throw Error('Unable to create reaction discussion');
  }
};

export const deleteReactionAnswer = async ({
  discussionId,
  answerId,
  type,
}: {
  discussionId: string;
  answerId: string;
  type: Reaction;
}) => {
  try {
    await api.delete(`discussions/${discussionId}/answers/${answerId}/reaction`,
      {
        json: { reaction: type },
      },
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      toast.error('Unable to delete reaction discussion: Error ONE-1');
    } else if (error.name === 'HTTPError') {
      toast.error('Unable to delete reaction discussion: Error ONE-2');
    } else {
      toast.error('Unable to delete reaction discussion: Error ONE-3');
    }
    throw Error('Unable to delete reaction discussion');
  }
};

export const createUpvoteAnswer = async ({
  discussionId,
  answerId,
}: {
  discussionId: string;
  answerId: string;
}) => {
  try {
    await api.post(`discussions/${discussionId}/answers/${answerId}/upvote`,
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      toast.error('Unable to upvote answer: Error ONE-1');
    } else if (error.name === 'HTTPError') {
      toast.error('Unable to upvote answer: Error ONE-2');
    } else {
      toast.error('Unable to upvote answer: Error ONE-3');
    }
    throw Error('Unable to upvote answer');
  }
};

export const deleteUpvoteAnswer = async ({
  discussionId,
  answerId,
}: {
  discussionId: string;
  answerId: string;
}) => {
  try {
    await api.delete(`discussions/${discussionId}/answers/${answerId}/upvote`,
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      toast.error('Unable to delete upvote answer: Error ONE-1');
    } else if (error.name === 'HTTPError') {
      toast.error('Unable to delete upvote answer: Error ONE-2');
    } else {
      toast.error('Unable to delete upvote answer: Error ONE-3');
    }
    throw Error('Unable to delete upvote answer');
  }
};

export const createReply = async ({
  discussionId,
  answerId,
  content,
}: {
  discussionId: string;
  answerId: string;
  content: string;
}) => {
  try {
    const response = await api.post(`discussions/${discussionId}/answers/${answerId}/replies`,
      {
        json: { content },
      },
    );
    const payload: any = await response.json();
    return payload;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      toast.error('Unable to create reply: Error ONE-1');
    } else if (error.name === 'HTTPError') {
      toast.error('Unable to create reply: Error ONE-2');
    } else {
      toast.error('Unable to create reply: Error ONE-3');
    }
    throw Error('Unable to create reply');
  }
};

export const createReactionReply = async ({
  discussionId,
  answerId,
  replyId,
  type,
}: {
  discussionId: string;
  answerId: string;
  replyId: string;
  type: Reaction;
}) => {
  try {
    await api.post(`discussions/${discussionId}/answers/${answerId}/replies/${replyId}/reaction`,
      {
        json: { reaction: type },
      },
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      toast.error('Unable to create reaction reply: Error ONE-1');
    } else if (error.name === 'HTTPError') {
      toast.error('Unable to create reaction reply: Error ONE-2');
    } else {
      toast.error('Unable to create reaction reply: Error ONE-3');
    }
    throw Error('Unable to create reaction reply');
  }
};

export const deleteReactionReply = async ({
  discussionId,
  answerId,
  replyId,
  type,
}: {
  discussionId: string;
  answerId: string;
  replyId: string;
  type: Reaction;
}) => {
  try {
    await api.delete(`discussions/${discussionId}/answers/${answerId}/replies/${replyId}/reaction`,
      {
        json: { reaction: type },
      },
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      toast.error('Unable to delete reaction reply: Error ONE-1');
    } else if (error.name === 'HTTPError') {
      toast.error('Unable to delete reaction reply: Error ONE-2');
    } else {
      toast.error('Unable to delete reaction reply: Error ONE-3');
    }
    throw Error('Unable to delete reaction reply');
  }
};

export const createUpvoteReply = async ({
  discussionId,
  answerId,
  replyId,
}: {
  discussionId: string;
  answerId: string;
  replyId: string;
}) => {
  try {
    await api.post(`discussions/${discussionId}/answers/${answerId}/replies/${replyId}/upvote`,
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      toast.error('Unable to create upvote reply: Error ONE-1');
    } else if (error.name === 'HTTPError') {
      toast.error('Unable to create upvote reply: Error ONE-2');
    } else {
      toast.error('Unable to create upvote reply: Error ONE-3');
    }
    throw Error('Unable to create upvote reply');
  }
};

export const deleteUpvoteReply = async ({
  discussionId,
  answerId,
  replyId,
}: {
  discussionId: string;
  answerId: string;
  replyId: string;
}) => {
  try {
    await api.delete(`discussions/${discussionId}/answers/${answerId}/replies/${replyId}/upvote`,
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      toast.error('Unable to delete upvote reply: Error ONE-1');
    } else if (error.name === 'HTTPError') {
      toast.error('Unable to delete upvote reply: Error ONE-2');
    } else {
      toast.error('Unable to delete upvote reply: Error ONE-3');
    }
    throw Error('Unable to delete upvote reply');
  }
};

// =============== Answer CRUD Operations ===============

export const updateAnswer = async ({
  discussionId,
  answerId,
  content,
}: {
  discussionId: string;
  answerId: string;
  content: string;
}) => {
  try {
    const response = await api.put(`discussions/${discussionId}/answers/${answerId}`,
      {
        json: { content },
      },
    );
    const payload: any = await response.json();
    return payload;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      toast.error('Unable to update answer: Error ONE-1');
    } else if (error.name === 'HTTPError') {
      toast.error('Unable to update answer: Error ONE-2');
    } else {
      toast.error('Unable to update answer: Error ONE-3');
    }
    throw Error('Unable to update answer');
  }
};

export const deleteAnswer = async ({
  discussionId,
  answerId,
}: {
  discussionId: string;
  answerId: string;
}) => {
  try {
    await api.delete(`discussions/${discussionId}/answers/${answerId}`,
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      toast.error('Unable to delete answer: Error ONE-1');
    } else if (error.name === 'HTTPError') {
      toast.error('Unable to delete answer: Error ONE-2');
    } else {
      toast.error('Unable to delete answer: Error ONE-3');
    }
    throw Error('Unable to delete answer');
  }
};

// =============== Reply CRUD Operations ===============

export const updateReply = async ({
  discussionId,
  answerId,
  replyId,
  content,
}: {
  discussionId: string;
  answerId: string;
  replyId: string;
  content: string;
}) => {
  try {
    const response = await api.put(`discussions/${discussionId}/answers/${answerId}/replies/${replyId}`,
      {
        json: { content },
      },
    );
    const payload: any = await response.json();
    return payload;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      toast.error('Unable to update reply: Error ONE-1');
    } else if (error.name === 'HTTPError') {
      toast.error('Unable to update reply: Error ONE-2');
    } else {
      toast.error('Unable to update reply: Error ONE-3');
    }
    throw Error('Unable to update reply');
  }
};

export const deleteReply = async ({
  discussionId,
  answerId,
  replyId,
}: {
  discussionId: string;
  answerId: string;
  replyId: string;
}) => {
  try {
    await api.delete(`discussions/${discussionId}/answers/${answerId}/replies/${replyId}`,
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      toast.error('Unable to delete reply: Error ONE-1');
    } else if (error.name === 'HTTPError') {
      toast.error('Unable to delete reply: Error ONE-2');
    } else {
      toast.error('Unable to delete reply: Error ONE-3');
    }
    throw Error('Unable to delete reply');
  }
};

// =============== Poll Vote Operations ===============

export const createPollVote = async ({
  discussionId,
  options,
}: {
  discussionId: string;
  options: string[];
}) => {
  try {
    await api.post(`discussions/${discussionId}/poll-vote`,
      {
        json: { options },
      },
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      toast.error('Unable to vote in poll: Error ONE-1');
    } else if (error.name === 'HTTPError') {
      toast.error('Unable to vote in poll: Error ONE-2');
    } else {
      toast.error('Unable to vote in poll: Error ONE-3');
    }
    throw Error('Unable to vote in poll');
  }
};
