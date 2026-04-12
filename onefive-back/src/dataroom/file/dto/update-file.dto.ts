import { IsString, IsOptional, IsUUID } from 'class-validator';
import { SanitizeText } from '../../../common/decorators/sanitize.decorator';

export class UpdateFileDto {
  @IsString()
  @IsOptional()
  @SanitizeText()
  name?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  transactionId?: string;
}

export class UpdateFileResponseDto {
  data: {
    id: string;
    name: string;
    categoryId?: string;
  };
}
