import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { VALIDATION_LIMITS } from '../../common/constants/validation-limits.constants';

export class CreateReactionDto {
  @IsNotEmpty()
  @IsString()
  messageId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.MESSAGING.REACTION_EMOJI_MAX)
  emoji: string;
}
