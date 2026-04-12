import { IsEnum, IsUUID } from 'class-validator';
import { ReactionType } from '@prisma/client';

export class DiscussionAnswerReplyReactionParamDto {
  @IsUUID()
  discussionId: string;

  @IsUUID()
  answerId: string;

  @IsUUID()
  replyId: string;
}

export class CreateDiscussionAnswerReplyReactionBodyDto {
  @IsEnum(ReactionType)
  reaction: ReactionType;
}
