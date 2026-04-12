import { IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ProfileVisibility } from '@prisma/client';

export class UpdatePrivacyDto {
  @IsOptional()
  @IsEnum(ProfileVisibility)
  profileVisibility?: ProfileVisibility;

  @IsOptional()
  @IsBoolean()
  showEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  showPhone?: boolean;

  @IsOptional()
  @IsBoolean()
  allowMessages?: boolean;

  @IsOptional()
  @IsBoolean()
  showActivity?: boolean;

  @IsOptional()
  @IsBoolean()
  searchVisibility?: boolean;

  @IsOptional()
  @IsBoolean()
  dataProcessing?: boolean;

  @IsOptional()
  @IsBoolean()
  analyticsSharing?: boolean;
}
