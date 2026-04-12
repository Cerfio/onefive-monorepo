import { IsString, IsOptional, MaxLength } from 'class-validator';
import { SanitizeHtml } from '../../common/decorators/sanitize.decorator';
import { VALIDATION_LIMITS } from '../../common/constants/validation-limits.constants';

export class CreatePostCommentDto {
  @IsString()
  @MaxLength(VALIDATION_LIMITS.POST_COMMENT.CONTENT_MAX)
  @SanitizeHtml()
  content: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}
