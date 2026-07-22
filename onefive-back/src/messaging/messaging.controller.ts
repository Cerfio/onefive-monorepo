import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  PayloadTooLargeException,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Sse,
  UnsupportedMediaTypeException,
  UseGuards,
  MessageEvent,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Throttle } from '@nestjs/throttler';
import type { FastifyRequest } from 'fastify';
import { SessionGuard } from '../common/guards/session-guard/session.guard';
import { FastifyRequestUserId } from 'src/types/fastify-request-user-id';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { FileService } from '../file/file.service';

// Handlers
import { ListConversationsHandler } from './handlers/list-conversations.handler';
import { GetConversationMessagesHandler } from './handlers/get-conversation-messages.handler';
import { CreateConversationHandler } from './handlers/create-conversation.handler';
import { SendMessageHandler } from './handlers/send-message.handler';
import { MarkAsReadHandler } from './handlers/mark-as-read.handler';
import { DeleteMessageHandler } from './handlers/delete-message.handler';
import { UpdateMessageHandler } from './handlers/update-message.handler';
import { CreateReactionHandler } from './handlers/create-reaction.handler';
import { DeleteReactionHandler } from './handlers/delete-reaction.handler';

// Hub SSE pour notifications temps réel
import { MessagingEventsService } from './messaging.events.service';
import { MessagingService } from './messaging.service';

// DTOs
import {
  CreateConversationDto,
  SendMessageDto,
  UpdateMessageDto,
  CreateReactionDto,
  ListConversationsDto,
  GetMessagesDto,
  TypingDto,
} from './dto';
import { ApiResponseDto } from '../common/dto';

// Pièces jointes : images + documents courants, ≤10 Mo.
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const ALLOWED_DOC_MIME_TYPES = new Set<string>([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/csv',
  'text/plain',
  'application/zip',
]);

@Controller('messaging')
@UseGuards(SessionGuard)
export class MessagingController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly listConversationsHandler: ListConversationsHandler,
    private readonly getConversationMessagesHandler: GetConversationMessagesHandler,
    private readonly createConversationHandler: CreateConversationHandler,
    private readonly sendMessageHandler: SendMessageHandler,
    private readonly markAsReadHandler: MarkAsReadHandler,
    private readonly deleteMessageHandler: DeleteMessageHandler,
    private readonly updateMessageHandler: UpdateMessageHandler,
    private readonly createReactionHandler: CreateReactionHandler,
    private readonly deleteReactionHandler: DeleteReactionHandler,
    private readonly messagingService: MessagingService,
    private readonly events: MessagingEventsService,
    private readonly storageService: StorageService,
    private readonly fileService: FileService,
  ) {}

  private async getProfileIdFromUserId(userId: string): Promise<string> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile.id;
  }

  // ==================== SSE STREAM (server -> client) ====================

  /**
   * Stream temps réel des events de messagerie (nouveaux messages, read receipts,
   * réactions, typing, présence). Le cookie de session authentifie la connexion
   * (EventSource envoie les cookies via withCredentials).
   */
  @Sse('events')
  streamEvents(@Req() req: FastifyRequestUserId): Observable<MessageEvent> {
    return from(this.getProfileIdFromUserId(req.userId)).pipe(
      switchMap((profileId) => this.events.subscribe(profileId)),
    );
  }

  /**
   * Snapshot de présence : profileId de mes contacts actuellement en ligne.
   * Le client s'en sert pour initialiser l'indicateur En ligne/Hors ligne à
   * l'ouverture (les events SSE ne portent que les changements ultérieurs).
   */
  @Get('presence')
  async getPresence(
    @Req() req: FastifyRequestUserId,
  ): Promise<ApiResponseDto<{ online: string[] }>> {
    const profileId = await this.getProfileIdFromUserId(req.userId);
    const online = await this.events.getOnlineConnectionIds(profileId);
    return { success: true, data: { online } };
  }

  // ==================== TYPING (client -> server) ====================

  @Post('typing')
  @HttpCode(204)
  @Throttle({
    short: { limit: 5, ttl: 1000 },
    medium: { limit: 20, ttl: 10000 },
    long: { limit: 60, ttl: 60000 },
  })
  async typing(
    @Req() req: FastifyRequestUserId,
    @Body() body: TypingDto,
  ): Promise<void> {
    const profileId = await this.getProfileIdFromUserId(req.userId);

    // Defense-in-depth : ne diffuser que si l'auteur est bien membre
    const isMember = await this.messagingService.isConversationMember(
      body.conversationId,
      profileId,
    );
    if (!isMember) return;

    await this.events.notifyTyping(body.conversationId, profileId, body.state);
  }

  // ==================== ATTACHMENTS (upload avant l'envoi du message) ====================

  /**
   * Uploade une pièce jointe (image ou document, ≤10 Mo) et persiste une ligne
   * File. Renvoie l'`id` à repasser comme `attachmentId` de POST /messages, plus
   * les métadonnées pour l'affichage optimiste côté client.
   */
  @Post('attachments/upload')
  @Throttle({
    short: { limit: 5, ttl: 1000 },
    medium: { limit: 30, ttl: 60000 },
    long: { limit: 100, ttl: 3600000 },
  })
  async uploadAttachment(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
  ): Promise<
    ApiResponseDto<{
      id: string;
      url: string;
      name: string;
      size: number;
      mimeType: string;
      type: 'IMAGE' | 'FILE';
    }>
  > {
    const data = await (
      req as unknown as { file: () => Promise<any> }
    ).file();
    if (!data) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const buffer: Buffer = await data.toBuffer();
    const mimeType: string = data.mimetype;

    if (buffer.length > MAX_ATTACHMENT_BYTES) {
      throw new PayloadTooLargeException('Fichier trop volumineux (max 10 Mo)');
    }

    const isImage = mimeType.startsWith('image/');
    if (!isImage && !ALLOWED_DOC_MIME_TYPES.has(mimeType)) {
      throw new UnsupportedMediaTypeException(
        'Type de fichier non supporté (images et documents uniquement)',
      );
    }

    const bucketName = process.env.R2_BUCKET_NAME || 'onefive-storage';

    const uploaded = await this.storageService.uploadFile({
      transactionId: req.id,
      data: { buffer, filename: data.filename, mimeType, bucketName },
    });

    await this.fileService.create({
      transactionId: req.id,
      data: {
        id: uploaded.id,
        size: buffer.length,
        mimeType,
        bucket: bucketName,
        url: uploaded.url,
      },
    });

    return {
      success: true,
      data: {
        id: uploaded.id,
        url: uploaded.url,
        name: data.filename,
        size: buffer.length,
        mimeType,
        type: isImage ? 'IMAGE' : 'FILE',
      },
    };
  }

  // ==================== CONVERSATIONS ====================

  @Get('conversations')
  async listConversations(
    @Req() req: FastifyRequestUserId,
    @Query() query: ListConversationsDto,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.listConversationsHandler.execute({
      transactionId: req.id,
      profileId: req.userId,
      limit: query.limit,
      skip: query.skip,
      search: query.search,
    });
    return { success: true, data: result };
  }

  @Get('conversations/:conversationId/messages')
  async getConversationMessages(
    @Req() req: FastifyRequestUserId,
    @Param('conversationId') conversationId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
    @Query('direction') direction?: 'before' | 'after',
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.getConversationMessagesHandler.execute({
      transactionId: req.id,
      profileId: req.userId,
      conversationId,
      limit: limit ? parseInt(limit, 10) : undefined,
      cursor,
      direction,
    });
    return { success: true, data: result };
  }

  @Post('conversations')
  @Throttle({
    short: { limit: 2, ttl: 1000 },
    medium: { limit: 5, ttl: 10000 },
    long: { limit: 5, ttl: 60000 },
  }) // 5 conversations/min
  async createConversation(
    @Req() req: FastifyRequestUserId,
    @Body() body: CreateConversationDto,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.createConversationHandler.execute({
      transactionId: req.id,
      profileId: req.userId,
      participantIds: body.participantIds,
      name: body.name,
      type: body.type,
      initialMessage: body.initialMessage,
    });
    return { success: true, data: result };
  }

  // ==================== MESSAGES ====================

  @Post('messages')
  @Throttle({
    short: { limit: 3, ttl: 1000 },
    medium: { limit: 20, ttl: 10000 },
    long: { limit: 30, ttl: 60000 },
  }) // 30 messages/min
  async sendMessage(
    @Req() req: FastifyRequestUserId,
    @Body() body: SendMessageDto,
  ): Promise<ApiResponseDto<unknown>> {
    const profileId = await this.getProfileIdFromUserId(req.userId);
    const result = await this.sendMessageHandler.execute({
      transactionId: req.id,
      profileId,
      conversationId: body.conversationId,
      content: body.content,
      type: body.type,
      replyToId: body.replyToId,
      attachmentId: body.attachmentId,
    });

    // ✅ Notifier les autres participants via WebSocket (exclure par profileId)
    await this.events.notifyNewMessage(
      body.conversationId,
      result,
      profileId,
    );

    return { success: true, data: result };
  }

  @Put('messages/:messageId')
  async updateMessage(
    @Req() req: FastifyRequestUserId,
    @Param('messageId') messageId: string,
    @Body() body: UpdateMessageDto,
  ): Promise<ApiResponseDto<unknown>> {
    const profileId = await this.getProfileIdFromUserId(req.userId);
    const result = await this.updateMessageHandler.execute({
      transactionId: req.id,
      profileId,
      messageId,
      content: body.content,
    });

    // ✅ Notifier les autres participants via WebSocket
    if (result.conversationId) {
      await this.events.notifyMessageEdited(
        result.conversationId,
        result,
      );
    }

    return { success: true, data: result };
  }

  @Delete('messages/:messageId')
  async deleteMessage(
    @Req() req: FastifyRequestUserId,
    @Param('messageId') messageId: string,
  ): Promise<ApiResponseDto<unknown>> {
    const profileId = await this.getProfileIdFromUserId(req.userId);
    const result = await this.deleteMessageHandler.execute({
      transactionId: req.id,
      profileId,
      messageId,
    });

    // ✅ Notifier les autres participants via WebSocket
    if (result.conversationId) {
      await this.events.notifyMessageDeleted(
        result.conversationId,
        messageId,
      );
    }

    return { success: true, data: result };
  }

  // ==================== READ RECEIPTS ====================

  @Post('conversations/:conversationId/read')
  @HttpCode(200)
  async markAsRead(
    @Req() req: FastifyRequestUserId,
    @Param('conversationId') conversationId: string,
    @Body('messageId') messageId?: string,
  ): Promise<ApiResponseDto<unknown>> {
    const profileId = await this.getProfileIdFromUserId(req.userId);
    const result = await this.markAsReadHandler.execute({
      transactionId: req.id,
      profileId,
      conversationId,
      messageId,
    });

    // ✅ Notifier les autres participants via WebSocket (read receipt)
    await this.events.notifyMessageRead(
      conversationId,
      profileId,
      messageId,
    );

    return { success: true, data: result };
  }

  // ==================== REACTIONS ====================

  @Post('messages/:messageId/reactions')
  @Throttle({
    short: { limit: 3, ttl: 1000 },
    medium: { limit: 20, ttl: 10000 },
    long: { limit: 30, ttl: 60000 },
  }) // 30 reactions/min
  async createReaction(
    @Req() req: FastifyRequestUserId,
    @Param('messageId') messageId: string,
    @Body() body: CreateReactionDto,
  ): Promise<ApiResponseDto<unknown>> {
    const profileId = await this.getProfileIdFromUserId(req.userId);
    const result = await this.createReactionHandler.execute({
      transactionId: req.id,
      profileId,
      messageId,
      emoji: body.emoji,
    });

    // ✅ Notifier les autres participants via WebSocket
    if (result.conversationId) {
      await this.events.notifyReactionAdded(result.conversationId, {
        messageId,
        emoji: body.emoji,
        profileId,
      });
    }

    return { success: true, data: result };
  }

  @Delete('messages/:messageId/reactions/:emoji')
  async deleteReaction(
    @Req() req: FastifyRequestUserId,
    @Param('messageId') messageId: string,
    @Param('emoji') emoji: string,
  ): Promise<ApiResponseDto<unknown>> {
    const profileId = await this.getProfileIdFromUserId(req.userId);
    const decodedEmoji = decodeURIComponent(emoji);
    const result = await this.deleteReactionHandler.execute({
      transactionId: req.id,
      profileId,
      messageId,
      emoji: decodedEmoji,
    });

    // ✅ Notifier les autres participants via WebSocket
    if (result.conversationId) {
      await this.events.notifyReactionRemoved(result.conversationId, {
        messageId,
        emoji: decodedEmoji,
        profileId,
      });
    }

    return { success: true, data: result };
  }
}
