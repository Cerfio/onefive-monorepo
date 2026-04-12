import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';
import { SanitizeHtml } from '../../common/decorators/sanitize.decorator';
import { VALIDATION_LIMITS } from '../../common/constants/validation-limits.constants';

export class DiscussionAnswerReplyParamDto {
  @IsUUID()
  @IsNotEmpty()
  discussionId: string;

  @IsUUID()
  @IsNotEmpty()
  answerId: string;
}

export class ReplyParamDto extends DiscussionAnswerReplyParamDto {
  @IsUUID()
  @IsNotEmpty()
  replyId: string;
}

export class CreateDiscussionAnswerReplyBodyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION_LIMITS.DISCUSSION_REPLY.CONTENT_MAX)
  @SanitizeHtml()
  content: string;
}

export class UpdateDiscussionAnswerReplyBodyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION_LIMITS.DISCUSSION_REPLY.CONTENT_MAX)
  @SanitizeHtml()
  content: string;
}
