import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsEnum,
  IsEmail,
} from 'class-validator';
import { StartupMemberRoleType } from '@prisma/client';
import {
  SanitizeText,
  SanitizeHtml,
} from '../../common/decorators/sanitize.decorator';

export class CreateFounderDto {
  @IsOptional()
  @IsString()
  profileId?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @SanitizeText()
  firstName?: string;

  @IsOptional()
  @IsString()
  @SanitizeText()
  lastName?: string;

  @IsNotEmpty()
  @IsString()
  @SanitizeText()
  position: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  equity: number;

  @IsOptional()
  @IsEnum(StartupMemberRoleType)
  role: StartupMemberRoleType = StartupMemberRoleType.ADMIN;

  @IsOptional()
  @IsString()
  @SanitizeHtml()
  message?: string;
}
