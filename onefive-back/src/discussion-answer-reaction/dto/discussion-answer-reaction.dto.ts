import { IsEnum, IsUUID } from 'class-validator';
import { ReactionType } from '@prisma/client';

export class DiscussionAnswerReactionParamDto {
  @IsUUID()
  discussionId: string;

  @IsUUID()
  answerId: string;
}

export class CreateDiscussionAnswerReactionBodyDto {
  @IsEnum(ReactionType)
  reaction: ReactionType;
}
