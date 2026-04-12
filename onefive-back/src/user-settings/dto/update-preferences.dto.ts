import { IsOptional, IsIn, IsString, IsEnum } from 'class-validator';
import { Theme, DateFormat } from '@prisma/client';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsEnum(Theme)
  theme?: Theme;

  @IsOptional()
  @IsIn(['fr', 'en']) // Only FR and EN supported for now
  language?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsEnum(DateFormat)
  dateFormat?: DateFormat;
}
