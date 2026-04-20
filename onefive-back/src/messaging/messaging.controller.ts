import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SessionGuard } from '../common/guards/session-guard/session.guard';
import { FastifyRequestUserId } from 'src/types/fastify-request-user-id';
import { PrismaService } from '../prisma/prisma.service';

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

// Gateway pour notifications WebSocket
import { MessagingGateway } from './messaging.gateway';

// DTOs
import {
  CreateConversationDto,
  SendMessageDto,
  UpdateMessageDto,
  CreateReactionDto,
  ListConversationsDto,
  GetMessagesDto,
} from './dto';
import { ApiResponseDto } from '../common/dto';

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
    private readonly messagingGateway: MessagingGateway,
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
    await this.messagingGateway.notifyNewMessage(
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
      await this.messagingGateway.notifyMessageEdited(
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
      await this.messagingGateway.notifyMessageDeleted(
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
    await this.messagingGateway.notifyMessageRead(
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
      await this.messagingGateway.notifyReactionAdded(result.conversationId, {
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
      await this.messagingGateway.notifyReactionRemoved(result.conversationId, {
        messageId,
        emoji: decodedEmoji,
        profileId,
      });
    }

    return { success: true, data: result };
  }
}
