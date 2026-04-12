import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogService } from 'logstash-winston-3';
import { Prisma } from '@prisma/client';
import { ReportResourceType } from '@prisma/client';
import { Log } from '../common/logger/logger.decorator';
import { ReportCreateException } from './report.exception';

export type ReportResourcePreview = {
  content: string;
  author?: {
    firstName: string;
    lastName: string;
    userId: string;
    avatarId: string | null;
  };
  parent?: { id: string; content?: string; link?: string };
  createdAt: string;
  link: string;
};

@Injectable()
export class ReportService {
  constructor(
    private prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async create({
    transactionId,
    data,
  }: {
    transactionId: string;
    data: Prisma.ReportCreateInput;
  }) {
    try {
      return await this.prisma.report.create({ data });
    } catch (error) {
      ReportCreateException.throw(this.logger, { transactionId, error });
    }
  }

  @Log()
  async findExisting({
    transactionId,
    reporterId,
    resourceType,
    resourceId,
  }: {
    transactionId: string;
    reporterId: string;
    resourceType: string;
    resourceId: string;
  }) {
    return this.prisma.report.findFirst({
      where: {
        reporterId,
        resourceType: resourceType as any,
        resourceId,
        status: 'PENDING',
      },
    });
  }

  @Log()
  async list({
    transactionId,
    skip = 0,
    take = 20,
    status,
  }: {
    transactionId: string;
    skip?: number;
    take?: number;
    status?: string;
  }) {
    const where: Prisma.ReportWhereInput = {};
    if (status) where.status = status as any;

    const [data, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: {
            select: {
              id: true,
              userId: true,
              firstName: true,
              lastName: true,
              avatarId: true,
            },
          },
        },
      }),
      this.prisma.report.count({ where }),
    ]);

    return { data, total };
  }

  @Log()
  async findById({
    transactionId,
    reportId,
  }: {
    transactionId: string;
    reportId: string;
  }) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      include: {
        reporter: {
          select: {
            id: true,
            userId: true,
            firstName: true,
            lastName: true,
            avatarId: true,
          },
        },
      },
    });
    if (!report) return null;

    const resourcePreview = await this.fetchResourcePreview(
      report.resourceType,
      report.resourceId,
    );
    return { ...report, resourcePreview };
  }

  private async fetchResourcePreview(
    resourceType: ReportResourceType,
    resourceId: string,
  ): Promise<ReportResourcePreview | null> {
    try {
      switch (resourceType) {
        case 'POST': {
          const post = await this.prisma.post.findUnique({
            where: { id: resourceId },
            include: {
              author: {
                select: {
                  firstName: true,
                  lastName: true,
                  userId: true,
                  avatarId: true,
                },
              },
            },
          });
          if (!post) return null;
          return {
            content: post.content,
            author: post.author
              ? {
                  firstName: post.author.firstName,
                  lastName: post.author.lastName,
                  userId: post.author.userId,
                  avatarId: post.author.avatarId,
                }
              : undefined,
            createdAt: post.createdAt.toISOString(),
            link: `/posts/${post.id}`,
          };
        }
        case 'POST_COMMENT':
        case 'POST_COMMENT_REPLY': {
          const comment = await this.prisma.postComment.findUnique({
            where: { id: resourceId },
            include: {
              author: {
                select: {
                  firstName: true,
                  lastName: true,
                  userId: true,
                  avatarId: true,
                },
              },
              post: { select: { id: true, content: true } },
            },
          });
          if (!comment) return null;
          return {
            content: comment.content,
            author: comment.author
              ? {
                  firstName: comment.author.firstName,
                  lastName: comment.author.lastName,
                  userId: comment.author.userId,
                  avatarId: comment.author.avatarId,
                }
              : undefined,
            parent: {
              id: comment.post.id,
              content: comment.post.content,
              link: `/posts/${comment.post.id}`,
            },
            createdAt: comment.createdAt.toISOString(),
            link: `/posts/${comment.post.id}`,
          };
        }
        case 'DISCUSSION': {
          const discussion = await this.prisma.discussion.findUnique({
            where: { id: resourceId },
            include: {
              author: {
                select: {
                  firstName: true,
                  lastName: true,
                  userId: true,
                  avatarId: true,
                },
              },
            },
          });
          if (!discussion) return null;
          const content = [discussion.question, discussion.content]
            .filter(Boolean)
            .join('\n\n');
          return {
            content: content || '(sans contenu)',
            author: discussion.author
              ? {
                  firstName: discussion.author.firstName,
                  lastName: discussion.author.lastName,
                  userId: discussion.author.userId,
                  avatarId: discussion.author.avatarId,
                }
              : undefined,
            createdAt: discussion.createdAt.toISOString(),
            link: `/discussions/${discussion.id}`,
          };
        }
        case 'DISCUSSION_ANSWER': {
          const answer = await this.prisma.discussionAnswer.findUnique({
            where: { id: resourceId },
            include: {
              author: {
                select: {
                  firstName: true,
                  lastName: true,
                  userId: true,
                  avatarId: true,
                },
              },
              discussion: { select: { id: true, question: true } },
            },
          });
          if (!answer) return null;
          return {
            content: answer.content,
            author: answer.author
              ? {
                  firstName: answer.author.firstName,
                  lastName: answer.author.lastName,
                  userId: answer.author.userId,
                  avatarId: answer.author.avatarId,
                }
              : undefined,
            parent: {
              id: answer.discussion.id,
              content: answer.discussion.question,
              link: `/discussions/${answer.discussion.id}`,
            },
            createdAt: answer.createdAt.toISOString(),
            link: `/discussions/${answer.discussion.id}`,
          };
        }
        case 'DISCUSSION_ANSWER_REPLY': {
          const reply = await this.prisma.discussionAnswerReply.findUnique({
            where: { id: resourceId },
            include: {
              author: {
                select: {
                  firstName: true,
                  lastName: true,
                  userId: true,
                  avatarId: true,
                },
              },
              answer: {
                select: {
                  id: true,
                  content: true,
                  discussion: { select: { id: true } },
                },
              },
            },
          });
          if (!reply) return null;
          const discussionId = reply.answer.discussion.id;
          return {
            content: reply.content,
            author: reply.author
              ? {
                  firstName: reply.author.firstName,
                  lastName: reply.author.lastName,
                  userId: reply.author.userId,
                  avatarId: reply.author.avatarId,
                }
              : undefined,
            parent: {
              id: reply.answer.id,
              content: reply.answer.content,
              link: `/discussions/${discussionId}`,
            },
            createdAt: reply.createdAt.toISOString(),
            link: `/discussions/${discussionId}`,
          };
        }
        case 'PROFILE': {
          const profile = await this.prisma.profile.findFirst({
            where: {
              OR: [{ id: resourceId }, { userId: resourceId }],
            },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              userId: true,
              bio: true,
              avatarId: true,
            },
          });
          if (!profile) return null;
          return {
            content: profile.bio || `${profile.firstName} ${profile.lastName}`,
            author: {
              firstName: profile.firstName,
              lastName: profile.lastName,
              userId: profile.userId,
              avatarId: profile.avatarId,
            },
            createdAt: '',
            link: `/users/${profile.userId}`,
          };
        }
        default:
          return null;
      }
    } catch {
      return null;
    }
  }

  @Log()
  async updateStatus({
    transactionId,
    reportId,
    status,
  }: {
    transactionId: string;
    reportId: string;
    status: 'RESOLVED' | 'DISMISSED';
  }) {
    return this.prisma.report.update({
      where: { id: reportId },
      data: {
        status,
        resolvedAt: new Date(),
      },
    });
  }

  @Log()
  async countPending(): Promise<number> {
    return this.prisma.report.count({ where: { status: 'PENDING' } });
  }

  @Log()
  async findByProfileTarget({
    transactionId,
    profileId,
    userId,
    take = 20,
  }: {
    transactionId: string;
    profileId: string;
    userId: string;
    take?: number;
  }) {
    const [postIds, commentIds, discussionIds, answerIds, replyIds] =
      await Promise.all([
        this.prisma.post.findMany({
          where: { profileId },
          select: { id: true },
        }),
        this.prisma.postComment.findMany({
          where: { profileId },
          select: { id: true },
        }),
        this.prisma.discussion.findMany({
          where: { profileId },
          select: { id: true },
        }),
        this.prisma.discussionAnswer.findMany({
          where: { profileId },
          select: { id: true },
        }),
        this.prisma.discussionAnswerReply.findMany({
          where: { profileId },
          select: { id: true },
        }),
      ]);

    const profileIds = [profileId];
    const resourceIdsByType = {
      PROFILE: [...profileIds, userId],
      POST: postIds.map((p) => p.id),
      POST_COMMENT: commentIds.map((c) => c.id),
      POST_COMMENT_REPLY: commentIds.map((c) => c.id),
      DISCUSSION: discussionIds.map((d) => d.id),
      DISCUSSION_ANSWER: answerIds.map((a) => a.id),
      DISCUSSION_ANSWER_REPLY: replyIds.map((r) => r.id),
    };

    const orConditions: Prisma.ReportWhereInput[] = [];
    for (const [resourceType, ids] of Object.entries(resourceIdsByType)) {
      if (ids.length > 0) {
        orConditions.push({
          resourceType: resourceType as any,
          resourceId: { in: ids },
        });
      }
    }

    if (orConditions.length === 0) {
      return [];
    }

    return this.prisma.report.findMany({
      where: { OR: orConditions },
      orderBy: { createdAt: 'desc' },
      take,
      include: {
        reporter: {
          select: {
            id: true,
            userId: true,
            firstName: true,
            lastName: true,
            avatarId: true,
          },
        },
      },
    });
  }
}
