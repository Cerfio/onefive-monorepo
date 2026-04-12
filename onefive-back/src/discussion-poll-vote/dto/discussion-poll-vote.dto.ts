import {
  IsUUID,
  IsString,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { VALIDATION_LIMITS } from '../../common/constants/validation-limits.constants';

export class DiscussionPollVoteParamDto {
  @IsUUID()
  discussionId: string;
}

export class CreateDiscussionPollVoteBodyDto {
  @IsArray()
  @ArrayMinSize(VALIDATION_LIMITS.DISCUSSION.POLL_VOTE_OPTIONS_MIN)
  @ArrayMaxSize(VALIDATION_LIMITS.DISCUSSION.OPTIONS_MAX_COUNT)
  @IsString({ each: true })
  options: string[];
}
