import { IsEnum } from 'class-validator';
import { ReactionType } from '@prisma/client';

export class UpdatePostReactionDto {
  @IsEnum(ReactionType)
  reaction: ReactionType;
}
