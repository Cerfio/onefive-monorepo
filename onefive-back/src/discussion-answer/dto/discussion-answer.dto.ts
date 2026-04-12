import { IsUUID, IsString, MaxLength, MinLength } from 'class-validator';
import { SanitizeHtml } from '../../common/decorators/sanitize.decorator';
import { VALIDATION_LIMITS } from '../../common/constants/validation-limits.constants';

export class DiscussionAnswerParamDto {
  @IsUUID()
  discussionId: string;
}

export class AnswerParamDto {
  @IsUUID()
  discussionId: string;

  @IsUUID()
  answerId: string;
}

export class CreateDiscussionAnswerBodyDto {
  @IsString()
  @MaxLength(VALIDATION_LIMITS.DISCUSSION_ANSWER.CONTENT_MAX)
  @MinLength(VALIDATION_LIMITS.DISCUSSION_ANSWER.CONTENT_MIN)
  @SanitizeHtml()
  content: string;
}

export class UpdateDiscussionAnswerBodyDto {
  @IsString()
  @MaxLength(VALIDATION_LIMITS.DISCUSSION_ANSWER.CONTENT_MAX)
  @MinLength(VALIDATION_LIMITS.DISCUSSION_ANSWER.CONTENT_MIN)
  @SanitizeHtml()
  content: string;
}
