import { Module } from '@nestjs/common';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { MessagingGateway } from './messaging.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerProvider } from '../common/logger/logger.provider';
import { SessionsModule } from '../sessions/sessions.module';
import { ProfileConnectionModule } from '../profile-connection/profile-connection.module';

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

@Module({
  imports: [PrismaModule, SessionsModule, ProfileConnectionModule],
  controllers: [MessagingController],
  providers: [
    LoggerProvider,
    MessagingService,
    MessagingGateway,
    ListConversationsHandler,
    GetConversationMessagesHandler,
    CreateConversationHandler,
    SendMessageHandler,
    MarkAsReadHandler,
    DeleteMessageHandler,
    UpdateMessageHandler,
    CreateReactionHandler,
    DeleteReactionHandler,
  ],
  exports: [MessagingService, MessagingGateway],
})
export class MessagingModule {}
