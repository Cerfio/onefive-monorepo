import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogService } from 'logstash-winston-3';
import { Log } from '../common/logger/logger.decorator';
import { HttpStatus } from '@nestjs/common';
import {
  PaginatedResponseDto,
  CursorPaginatedResponseDto,
} from '../common/dto';
import {
  ConversationNotFoundException,
  MessageNotFoundException,
  UnauthorizedConversationAccessException,
  UnauthorizedMessageEditException,
  ConversationAlreadyExistsException,
  MessagingGetException,
  MessagingCreateException,
  MessagingUpdateException,
  MessagingDeleteException,
  MessagingException,
} from './messaging.exception';

// Valid AttachmentType enum values (subset of MessageType).
const ATTACHMENT_TYPES = ['IMAGE', 'FILE', 'AUDIO', 'VIDEO'];

// Extension par mimeType pour donner un nom d'affichage lisible aux pièces
// jointes (le modèle File ne stocke pas le nom d'origine — pas de migration).
const MIME_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    'pptx',
  'text/csv': 'csv',
  'text/plain': 'txt',
  'application/zip': 'zip',
};

/**
 * Nom d'affichage d'une pièce jointe. Le nom de fichier d'origine n'est pas
 * persisté (File n'a pas de colonne name), on dérive donc un libellé + extension
 * depuis le type/mimeType. Les images sont rendues inline, le nom y est secondaire.
 */
function attachmentDisplayName(type: string, mimeType: string): string {
  const ext = MIME_EXTENSION[mimeType];
  const isImage = type === 'IMAGE' || mimeType.startsWith('image/');
  const base = isImage ? 'Image' : 'Document';
  return ext ? `${base}.${ext}` : isImage ? 'Image' : 'Fichier';
}

@Injectable()
export class MessagingService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  private async resolveProfileId({
    transactionId,
    profileIdentifier,
  }: {
    transactionId: string;
    profileIdentifier: string;
  }): Promise<string> {
    const profile = await this.prisma.profile.findFirst({
      where: {
        OR: [{ id: profileIdentifier }, { userId: profileIdentifier }],
      },
      select: { id: true },
    });

    if (!profile) {
      MessagingException.throw(
        this.logger,
        { transactionId, profileIdentifier },
        'Profile not found',
        HttpStatus.BAD_REQUEST,
      );
      throw new Error('Profile resolution failed');
    }

    return profile.id;
  }

  private async resolveProfileIds({
    profileIdentifiers,
  }: {
    profileIdentifiers: string[];
  }): Promise<string[]> {
    const uniqueIdentifiers = [...new Set(profileIdentifiers)];
    if (uniqueIdentifiers.length === 0) {
      return [];
    }

    const profiles = await this.prisma.profile.findMany({
      where: {
        OR: [
          { id: { in: uniqueIdentifiers } },
          { userId: { in: uniqueIdentifiers } },
        ],
      },
      select: { id: true, userId: true },
    });

    const profileIdByIdentifier = new Map<string, string>();
    profiles.forEach((profile) => {
      profileIdByIdentifier.set(profile.id, profile.id);
      profileIdByIdentifier.set(profile.userId, profile.id);
    });

    const resolved = uniqueIdentifiers
      .map((identifier) => profileIdByIdentifier.get(identifier))
      .filter((id): id is string => Boolean(id));

    return [...new Set(resolved)];
  }

  // ==================== CONVERSATIONS ====================

  @Log()
  async listConversations({
    transactionId,
    profileId,
    limit = 20,
    skip = 0,
    search,
  }: {
    transactionId: string;
    profileId: string;
    limit?: number;
    skip?: number;
    search?: string;
  }) {
    try {
      const currentProfileId = await this.resolveProfileId({
        transactionId,
        profileIdentifier: profileId,
      });

      const conversations = await this.prisma.conversation.findMany({
        where: {
          participants: {
            some: {
              profileId: currentProfileId,
              leftAt: null,
            },
          },
          ...(search && {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              {
                participants: {
                  some: {
                    profile: {
                      OR: [
                        {
                          firstName: { contains: search, mode: 'insensitive' },
                        },
                        { lastName: { contains: search, mode: 'insensitive' } },
                      ],
                    },
                  },
                },
              },
            ],
          }),
        },
        include: {
          participants: {
            where: { leftAt: null },
            include: {
              profile: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarId: true,
                  avatar: true,
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip,
      });

      // Batch unread count — 1 query au lieu de N
      const conversationIds = conversations.map((c) => c.id);
      const unreadMessages =
        conversationIds.length > 0
          ? await this.prisma.message.findMany({
              where: {
                conversationId: { in: conversationIds },
                senderId: { not: currentProfileId },
                readBy: { none: { profileId: currentProfileId } },
              },
              select: { conversationId: true },
            })
          : [];
      const unreadMap = new Map<string, number>();
      for (const msg of unreadMessages) {
        unreadMap.set(
          msg.conversationId,
          (unreadMap.get(msg.conversationId) || 0) + 1,
        );
      }

      const conversationsWithUnread = conversations.map((conv) => {
        const unreadCount = unreadMap.get(conv.id) || 0;

        const lastMessage = conv.messages[0];
        const otherParticipants = conv.participants.filter(
          (p) => p.profileId !== currentProfileId,
        );

        return {
          id: conv.id,
          type: conv.type,
          name:
            conv.name ||
            otherParticipants
              .map((p) => `${p.profile.firstName} ${p.profile.lastName}`)
              .join(', '),
          participants: otherParticipants.map((p) => ({
            id: p.profile.id,
            firstName: p.profile.firstName,
            lastName: p.profile.lastName,
            avatarUrl: p.profile.avatar?.bucket
              ? `${process.env.STORAGE_URL}/${p.profile.avatar.bucket}`
              : null,
          })),
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                content: lastMessage.content,
                type: lastMessage.type,
                senderId: lastMessage.senderId,
                senderName: `${lastMessage.sender.firstName} ${lastMessage.sender.lastName}`,
                createdAt: lastMessage.createdAt,
              }
            : null,
          unreadCount,
          updatedAt: conv.updatedAt,
          createdAt: conv.createdAt,
        };
      });

      const total = await this.prisma.conversation.count({
        where: {
          participants: {
            some: {
              profileId: currentProfileId,
              leftAt: null,
            },
          },
        },
      });

      return PaginatedResponseDto.fromOffset({
        items: conversationsWithUnread,
        skip,
        limit,
        total,
      });
    } catch (error) {
      MessagingGetException.throw(this.logger, {
        transactionId,
        profileId,
        error,
      });
    }
  }

  @Log()
  async getConversationById({
    transactionId,
    profileId,
    conversationId,
  }: {
    transactionId: string;
    profileId: string;
    conversationId: string;
  }) {
    try {
      const currentProfileId = await this.resolveProfileId({
        transactionId,
        profileIdentifier: profileId,
      });

      const conversation = await this.prisma.conversation.findFirst({
        where: {
          id: conversationId,
          participants: {
            some: {
              profileId: currentProfileId,
              leftAt: null,
            },
          },
        },
        include: {
          participants: {
            where: { leftAt: null },
            include: {
              profile: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarId: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });

      if (!conversation) {
        ConversationNotFoundException.throw(this.logger, {
          transactionId,
          profileId,
          conversationId,
        });
      }

      return conversation;
    } catch (error) {
      if (error.status === 404) throw error;
      MessagingGetException.throw(this.logger, {
        transactionId,
        profileId,
        conversationId,
        error,
      });
    }
  }

  @Log()
  async createConversation({
    transactionId,
    profileId,
    participantIds,
    name,
    type,
    initialMessage,
  }: {
    transactionId: string;
    profileId: string;
    participantIds: string[];
    name?: string;
    type?: 'DIRECT' | 'GROUP';
    initialMessage?: string;
  }) {
    try {
      const currentProfileId = await this.resolveProfileId({
        transactionId,
        profileIdentifier: profileId,
      });
      const resolvedParticipantIds = await this.resolveProfileIds({
        profileIdentifiers: participantIds,
      });
      const allParticipants = [
        ...new Set([currentProfileId, ...resolvedParticipantIds]),
      ];
      const conversationType =
        type || (allParticipants.length === 2 ? 'DIRECT' : 'GROUP');

      // For direct conversations, check if one already exists
      if (conversationType === 'DIRECT' && allParticipants.length === 2) {
        const existingConversation = await this.prisma.conversation.findFirst({
          where: {
            type: 'DIRECT',
            AND: allParticipants.map((pId) => ({
              participants: {
                some: {
                  profileId: pId,
                  leftAt: null,
                },
              },
            })),
          },
          include: {
            participants: {
              where: { leftAt: null },
              include: {
                profile: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatarId: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        });

        if (existingConversation) {
          return {
            ...existingConversation,
            isExisting: true,
          };
        }
      }

      // Create new conversation
      const conversation = await this.prisma.conversation.create({
        data: {
          type: conversationType,
          name: conversationType === 'GROUP' ? name : null,
          participants: {
            create: allParticipants.map((pId) => ({
              profileId: pId,
              isAdmin: pId === currentProfileId,
            })),
          },
          ...(initialMessage && {
            messages: {
              create: {
                senderId: currentProfileId,
                content: initialMessage,
                type: 'TEXT',
                status: 'SENT',
              },
            },
          }),
        },
        include: {
          participants: {
            include: {
              profile: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarId: true,
                  avatar: true,
                },
              },
            },
          },
          messages: {
            include: {
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      return {
        ...conversation,
        isExisting: false,
      };
    } catch (error) {
      MessagingCreateException.throw(this.logger, {
        transactionId,
        profileId,
        participantIds,
        error,
      });
    }
  }

  // ==================== MESSAGES ====================

  @Log()
  async getMessages({
    transactionId,
    profileId,
    conversationId,
    limit = 50,
    cursor,
    direction = 'before',
  }: {
    transactionId: string;
    profileId: string;
    conversationId: string;
    limit?: number;
    cursor?: string;
    direction?: 'before' | 'after';
  }) {
    try {
      const currentProfileId = await this.resolveProfileId({
        transactionId,
        profileIdentifier: profileId,
      });

      // Verify access to conversation
      const isMember = await this.prisma.conversationMember.findFirst({
        where: {
          conversationId,
          profileId: currentProfileId,
          leftAt: null,
        },
      });

      if (!isMember) {
        UnauthorizedConversationAccessException.throw(this.logger, {
          transactionId,
          profileId,
          conversationId,
        });
      }

      const cursorCondition = cursor
        ? {
            [direction === 'before' ? 'lt' : 'gt']: cursor,
          }
        : undefined;

      const messages = await this.prisma.message.findMany({
        where: {
          conversationId,
          deletedAt: null,
          ...(cursor && {
            id: cursorCondition,
          }),
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarId: true,
              avatar: true,
            },
          },
          replyTo: {
            select: {
              id: true,
              content: true,
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          attachments: {
            include: {
              file: true,
            },
          },
          reactions: {
            select: {
              emoji: true,
              profileId: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          readBy: {
            select: {
              profileId: true,
              readAt: true,
            },
          },
        },
        orderBy: { createdAt: direction === 'before' ? 'desc' : 'asc' },
        take: limit,
      });

      // Format messages
      const formattedMessages = messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        type: msg.type,
        status: msg.status,
        createdAt: msg.createdAt,
        editedAt: msg.editedAt,
        sender: {
          id: msg.sender.id,
          firstName: msg.sender.firstName,
          lastName: msg.sender.lastName,
          avatarUrl: msg.sender.avatar?.bucket
            ? `${process.env.STORAGE_URL}/${msg.sender.avatar.bucket}`
            : null,
          isMe: msg.sender.id === currentProfileId,
        },
        replyTo: msg.replyTo
          ? {
              id: msg.replyTo.id,
              content: msg.replyTo.content,
              senderName: `${msg.replyTo.sender.firstName} ${msg.replyTo.sender.lastName}`,
            }
          : null,
        attachments: msg.attachments.map((att) => ({
          id: att.id,
          type: att.type,
          url:
            att.file.url ||
            `${process.env.STORAGE_URL}/${att.file.bucket}/${att.file.id}`,
          name: attachmentDisplayName(att.type, att.file.mimeType),
          size: att.file.size,
          mimeType: att.file.mimeType,
        })),
        reactions: this.groupReactions(msg.reactions),
        isRead: msg.readBy.some((r) => r.profileId !== msg.senderId),
        readCount: msg.readBy.length,
      }));

      // Reverse if fetching before cursor (so oldest first)
      if (direction === 'before') {
        formattedMessages.reverse();
      }

      return new CursorPaginatedResponseDto({
        items: formattedMessages,
        hasMore: messages.length === limit,
        nextCursor:
          messages.length > 0 ? messages[messages.length - 1].id : null,
      });
    } catch (error) {
      if (error.status === 403) throw error;
      MessagingGetException.throw(this.logger, {
        transactionId,
        profileId,
        conversationId,
        error,
      });
    }
  }

  @Log()
  async sendMessage({
    transactionId,
    profileId,
    conversationId,
    content,
    type = 'TEXT',
    replyToId,
    attachmentId,
  }: {
    transactionId: string;
    profileId: string;
    conversationId: string;
    content?: string;
    type?: string;
    replyToId?: string;
    attachmentId?: string;
  }) {
    try {
      const currentProfileId = await this.resolveProfileId({
        transactionId,
        profileIdentifier: profileId,
      });

      // Verify access to conversation
      const isMember = await this.prisma.conversationMember.findFirst({
        where: {
          conversationId,
          profileId: currentProfileId,
          leftAt: null,
        },
      });

      if (!isMember) {
        UnauthorizedConversationAccessException.throw(this.logger, {
          transactionId,
          profileId,
          conversationId,
        });
      }

      // MessageType and AttachmentType only overlap on IMAGE/FILE/AUDIO/VIDEO.
      // With an attachment, coerce a TEXT/unknown message type to FILE so neither
      // enum is violated; the attachment's own type is always a valid one.
      const messageType =
        attachmentId && !ATTACHMENT_TYPES.includes(type) ? 'FILE' : type;
      const attachmentType = ATTACHMENT_TYPES.includes(messageType)
        ? messageType
        : 'FILE';

      const message = await this.prisma.message.create({
        data: {
          conversationId,
          senderId: currentProfileId,
          content,
          type: messageType as any,
          status: 'SENT',
          replyToId,
          ...(attachmentId && {
            attachments: {
              create: {
                fileId: attachmentId,
                type: attachmentType as any,
              },
            },
          }),
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarId: true,
              avatar: true,
            },
          },
          replyTo: {
            select: {
              id: true,
              content: true,
              sender: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          attachments: {
            include: {
              file: true,
            },
          },
        },
      });

      // Update conversation's updatedAt
      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return {
        id: message.id,
        content: message.content,
        type: message.type,
        status: message.status,
        createdAt: message.createdAt,
        sender: {
          id: message.sender.id,
          firstName: message.sender.firstName,
          lastName: message.sender.lastName,
          avatarUrl: message.sender.avatar?.bucket
            ? `${process.env.STORAGE_URL}/${message.sender.avatar.bucket}`
            : null,
          isMe: true,
        },
        replyTo: message.replyTo
          ? {
              id: message.replyTo.id,
              content: message.replyTo.content,
              senderName: `${message.replyTo.sender.firstName} ${message.replyTo.sender.lastName}`,
            }
          : null,
        attachments: message.attachments.map((att) => ({
          id: att.id,
          type: att.type,
          url:
            att.file.url ||
            `${process.env.STORAGE_URL}/${att.file.bucket}/${att.file.id}`,
          name: attachmentDisplayName(att.type, att.file.mimeType),
          size: att.file.size,
          mimeType: att.file.mimeType,
        })),
        reactions: [],
      };
    } catch (error) {
      if (error.status === 403) throw error;
      MessagingCreateException.throw(this.logger, {
        transactionId,
        profileId,
        conversationId,
        error,
      });
    }
  }

  @Log()
  async updateMessage({
    transactionId,
    profileId,
    messageId,
    content,
  }: {
    transactionId: string;
    profileId: string;
    messageId: string;
    content: string;
  }) {
    try {
      const currentProfileId = await this.resolveProfileId({
        transactionId,
        profileIdentifier: profileId,
      });

      const message = await this.prisma.message.findUnique({
        where: { id: messageId },
      });

      if (!message) {
        MessageNotFoundException.throw(this.logger, {
          transactionId,
          profileId,
          messageId,
        });
      }

      if (message.senderId !== currentProfileId) {
        UnauthorizedMessageEditException.throw(this.logger, {
          transactionId,
          profileId: currentProfileId,
          messageId,
        });
      }

      const updatedMessage = await this.prisma.message.update({
        where: { id: messageId },
        data: {
          content,
          editedAt: new Date(),
        },
      });

      return updatedMessage;
    } catch (error) {
      if (error.status === 404 || error.status === 403) throw error;
      MessagingUpdateException.throw(this.logger, {
        transactionId,
        profileId,
        messageId,
        error,
      });
    }
  }

  @Log()
  async deleteMessage({
    transactionId,
    profileId,
    messageId,
  }: {
    transactionId: string;
    profileId: string;
    messageId: string;
  }) {
    try {
      const currentProfileId = await this.resolveProfileId({
        transactionId,
        profileIdentifier: profileId,
      });

      const message = await this.prisma.message.findUnique({
        where: { id: messageId },
      });

      if (!message) {
        MessageNotFoundException.throw(this.logger, {
          transactionId,
          profileId,
          messageId,
        });
      }

      if (message.senderId !== currentProfileId) {
        UnauthorizedMessageEditException.throw(this.logger, {
          transactionId,
          profileId: currentProfileId,
          messageId,
        });
      }

      await this.prisma.message.update({
        where: { id: messageId },
        data: { deletedAt: new Date() },
      });

      return { success: true, conversationId: message.conversationId };
    } catch (error) {
      if (error.status === 404 || error.status === 403) throw error;
      MessagingDeleteException.throw(this.logger, {
        transactionId,
        profileId,
        messageId,
        error,
      });
    }
  }

  @Log()
  async markAsRead({
    transactionId,
    profileId,
    conversationId,
    messageId,
  }: {
    transactionId: string;
    profileId: string;
    conversationId: string;
    messageId?: string;
  }) {
    try {
      const currentProfileId = await this.resolveProfileId({
        transactionId,
        profileIdentifier: profileId,
      });

      // Verify access to conversation
      const isMember = await this.prisma.conversationMember.findFirst({
        where: {
          conversationId,
          profileId: currentProfileId,
          leftAt: null,
        },
      });

      if (!isMember) {
        UnauthorizedConversationAccessException.throw(this.logger, {
          transactionId,
          profileId,
          conversationId,
        });
      }

      // Get all unread messages in conversation (or specific message)
      const unreadMessages = await this.prisma.message.findMany({
        where: {
          conversationId,
          senderId: { not: currentProfileId },
          readBy: {
            none: { profileId: currentProfileId },
          },
          ...(messageId && { id: messageId }),
        },
        select: { id: true },
      });

      // Create read receipts
      if (unreadMessages.length > 0) {
        await this.prisma.messageRead.createMany({
          data: unreadMessages.map((msg) => ({
            messageId: msg.id,
            profileId: currentProfileId,
          })),
          skipDuplicates: true,
        });

        // Update last read timestamp for the member
        await this.prisma.conversationMember.update({
          where: {
            conversationId_profileId: {
              conversationId,
              profileId: currentProfileId,
            },
          },
          data: { lastReadAt: new Date() },
        });
      }

      return { markedAsRead: unreadMessages.length };
    } catch (error) {
      if (error.status === 403) throw error;
      MessagingUpdateException.throw(this.logger, {
        transactionId,
        profileId,
        conversationId,
        error,
      });
    }
  }

  // ==================== REACTIONS ====================

  @Log()
  async createReaction({
    transactionId,
    profileId,
    messageId,
    emoji,
  }: {
    transactionId: string;
    profileId: string;
    messageId: string;
    emoji: string;
  }) {
    try {
      const currentProfileId = await this.resolveProfileId({
        transactionId,
        profileIdentifier: profileId,
      });

      const message = await this.prisma.message.findUnique({
        where: { id: messageId },
        select: { conversationId: true },
      });

      if (!message) {
        MessageNotFoundException.throw(this.logger, {
          transactionId,
          profileId,
          messageId,
        });
      }

      // Verify access to conversation
      const isMember = await this.prisma.conversationMember.findFirst({
        where: {
          conversationId: message.conversationId,
          profileId: currentProfileId,
          leftAt: null,
        },
      });

      if (!isMember) {
        UnauthorizedConversationAccessException.throw(this.logger, {
          transactionId,
          profileId,
          messageId,
        });
      }

      const reaction = await this.prisma.messageReaction.upsert({
        where: {
          messageId_profileId_emoji: {
            messageId,
            profileId: currentProfileId,
            emoji,
          },
        },
        create: {
          messageId,
          profileId: currentProfileId,
          emoji,
        },
        update: {},
      });

      // Retourner avec le conversationId pour la notification WebSocket
      return { ...reaction, conversationId: message.conversationId };
    } catch (error) {
      if (error.status === 404 || error.status === 403) throw error;
      MessagingCreateException.throw(this.logger, {
        transactionId,
        profileId,
        messageId,
        error,
      });
    }
  }

  @Log()
  async deleteReaction({
    transactionId,
    profileId,
    messageId,
    emoji,
  }: {
    transactionId: string;
    profileId: string;
    messageId: string;
    emoji: string;
  }) {
    try {
      const currentProfileId = await this.resolveProfileId({
        transactionId,
        profileIdentifier: profileId,
      });

      // Récupérer le conversationId avant de supprimer
      const message = await this.prisma.message.findUnique({
        where: { id: messageId },
        select: { conversationId: true },
      });

      if (!message) {
        MessageNotFoundException.throw(this.logger, {
          transactionId,
          profileId,
          messageId,
        });
      }

      // Verify access to conversation (defense-in-depth)
      const isMember = await this.prisma.conversationMember.findFirst({
        where: {
          conversationId: message.conversationId,
          profileId: currentProfileId,
          leftAt: null,
        },
      });

      if (!isMember) {
        UnauthorizedConversationAccessException.throw(this.logger, {
          transactionId,
          profileId,
          conversationId: message.conversationId,
        });
      }

      await this.prisma.messageReaction.delete({
        where: {
          messageId_profileId_emoji: {
            messageId,
            profileId: currentProfileId,
            emoji,
          },
        },
      });

      return { success: true, conversationId: message.conversationId };
    } catch (error) {
      // If not found, just return success (idempotent)
      if (error.code === 'P2025') {
        return { success: true };
      }

      // Re-throw custom exceptions
      if (
        error instanceof MessageNotFoundException ||
        error instanceof UnauthorizedConversationAccessException
      ) {
        throw error;
      }

      MessagingDeleteException.throw(this.logger, {
        transactionId,
        profileId,
        messageId,
        error,
      });
    }
  }

  // ==================== HELPERS ====================

  private groupReactions(
    reactions: Array<{
      emoji: string;
      profileId: string;
      profile: { firstName: string; lastName: string };
    }>,
  ) {
    const grouped: Record<string, { count: number; users: string[] }> = {};

    reactions.forEach((reaction) => {
      if (!grouped[reaction.emoji]) {
        grouped[reaction.emoji] = { count: 0, users: [] };
      }
      grouped[reaction.emoji].count++;
      grouped[reaction.emoji].users.push(
        `${reaction.profile.firstName} ${reaction.profile.lastName}`,
      );
    });

    return Object.entries(grouped).map(([emoji, data]) => ({
      emoji,
      count: data.count,
      users: data.users,
    }));
  }

  /**
   * Vérifier si un profil est membre actif d'une conversation.
   * Utilisé par le SSE events service pour valider l'accès.
   */
  async isConversationMember(
    conversationId: string,
    profileId: string,
  ): Promise<boolean> {
    const member = await this.prisma.conversationMember.findFirst({
      where: {
        conversationId,
        profileId,
        leftAt: null,
      },
      select: { conversationId: true },
    });
    return !!member;
  }

  /**
   * Récupérer les profileId de tous les membres actifs d'une conversation.
   * Utilisé par le SSE events service pour router les notifications.
   */
  async getConversationMemberIds(conversationId: string): Promise<string[]> {
    const members = await this.prisma.conversationMember.findMany({
      where: {
        conversationId,
        leftAt: null,
      },
      select: { profileId: true },
    });
    return members.map((m) => m.profileId);
  }
}
