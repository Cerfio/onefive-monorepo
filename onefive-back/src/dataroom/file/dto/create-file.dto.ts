import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsBoolean,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';
import { SanitizeText } from '../../../common/decorators/sanitize.decorator';
import { VALIDATION_LIMITS, VALIDATION_MESSAGES } from '../../../common/constants/validation-limits.constants';

export class FileDataDto {
  @IsString()
  storageId: string;

  @IsString()
  @MaxLength(VALIDATION_LIMITS.DATAROOM.FILE_NAME_MAX)
  @SanitizeText()
  name: string;

  @IsNumber()
  size: number;

  @IsString()
  @MaxLength(VALIDATION_LIMITS.DATAROOM.FILE_MIME_TYPE_MAX)
  mimetype: string;

  @IsString()
  category: string;
}

export class CreateFileDto {
  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsString()
  dataroomId: string;

  @IsString()
  profileId: string;

  @IsArray()
  @ArrayMaxSize(VALIDATION_LIMITS.DATAROOM.FILES_MAX_COUNT, {
    message: VALIDATION_MESSAGES.FILES_TOO_MANY,
  })
  files: FileDataDto[];
}

export class CreateFileResponseDto {
  data: {
    files: Array<{
      id: string;
      name: string;
      size: number;
      mimetype: string;
      storageId: string;
    }>;
  };
}
