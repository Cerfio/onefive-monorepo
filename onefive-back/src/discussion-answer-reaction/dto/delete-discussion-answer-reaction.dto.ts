import { IsEnum, IsUUID } from 'class-validator';
import { ReactionType } from '@prisma/client';

export class DeleteDiscussionAnswerReactionParamDto {
  @IsUUID()
  answerId: string;

  @IsUUID()
  discussionId: string;
}

export class DeleteDiscussionAnswerReactionBodyDto {
  @IsEnum(ReactionType)
  reaction: ReactionType;
}
