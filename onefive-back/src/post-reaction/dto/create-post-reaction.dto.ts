import { IsEnum } from 'class-validator';
import { ReactionType } from '@prisma/client';

export class CreatePostReactionDto {
  @IsEnum(ReactionType)
  reaction: ReactionType;
}
