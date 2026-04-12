import { IsUUID, IsEnum } from 'class-validator';
import { ReactionType } from '@prisma/client';

export class DiscussionReactionParamDto {
  @IsUUID()
  discussionId: string;
}

export class CreateDiscussionReactionBodyDto {
  @IsEnum(ReactionType)
  reaction: ReactionType;
}
