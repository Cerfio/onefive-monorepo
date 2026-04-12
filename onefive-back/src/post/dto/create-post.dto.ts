import {
  IsString,
  IsOptional,
  IsArray,
  MaxLength,
  IsNumber,
  ValidateNested,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  SanitizeHtml,
  SanitizeArray,
} from '../../common/decorators/sanitize.decorator';
import {
  VALIDATION_LIMITS,
  VALIDATION_MESSAGES,
} from '../../common/constants/validation-limits.constants';

export class PostMediaDto {
  @IsString()
  @MaxLength(VALIDATION_LIMITS.POST.MEDIA_URL_MAX)
  url: string;

  @IsString()
  @MaxLength(VALIDATION_LIMITS.POST.MEDIA_MIME_TYPE_MAX)
  mimeType: string;

  @IsString()
  @MaxLength(VALIDATION_LIMITS.POST.MEDIA_FILE_NAME_MAX)
  fileName: string;

  @IsNumber()
  size: number;
}

export class CreatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.POST.CONTENT_MAX, {
    message: VALIDATION_MESSAGES.CONTENT_TOO_LONG,
  })
  @SanitizeHtml()
  content?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(VALIDATION_LIMITS.POST.MEDIAS_MAX_COUNT, {
    message: VALIDATION_MESSAGES.MEDIAS_TOO_MANY,
  })
  @ValidateNested({ each: true })
  @Type(() => PostMediaDto)
  medias?: PostMediaDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(VALIDATION_LIMITS.POST.TAGS_MAX_COUNT, {
    message: VALIDATION_MESSAGES.TAGS_TOO_MANY,
  })
  @IsString({ each: true })
  @SanitizeArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  repostedPostId?: string;
}
