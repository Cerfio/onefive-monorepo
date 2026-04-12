import {
  PaginatedResponseDto,
  CursorPaginatedResponseDto,
} from '../../common/dto';

/** Conversation data in API responses */
export interface ConversationResponseDto {
  id: string;
  [key: string]: unknown;
}

/** Message data in API responses */
export interface MessageResponseDto {
  id: string;
  [key: string]: unknown;
}

/** Response for list conversations */
export type ListConversationsResponseDto =
  PaginatedResponseDto<ConversationResponseDto>;

/** Response for get messages (cursor pagination) */
export type GetMessagesResponseDto =
  CursorPaginatedResponseDto<MessageResponseDto>;
