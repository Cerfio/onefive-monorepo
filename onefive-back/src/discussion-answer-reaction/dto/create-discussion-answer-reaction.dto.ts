import { IsEnum, IsUUID } from 'class-validator';
import { ReactionType } from '@prisma/client';

export class CreateDiscussionAnswerReactionParamDto {
  @IsUUID()
  answerId: string;

  @IsUUID()
  discussionId: string;
}

export class CreateDiscussionAnswerReactionBodyDto {
  @IsEnum(ReactionType)
  reaction: ReactionType;
}
