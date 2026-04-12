import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { StartupMemberRoleType } from '@prisma/client';
import { SanitizeText } from '../../common/decorators/sanitize.decorator';

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  @SanitizeText()
  position?: string;

  @IsOptional()
  @IsEnum(StartupMemberRoleType)
  role?: StartupMemberRoleType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  equity?: number;

  @IsOptional()
  @IsBoolean()
  isFounder?: boolean;
}
