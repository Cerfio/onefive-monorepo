import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VALIDATION_LIMITS } from '../../common/constants/validation-limits.constants';

class AchievementDataDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION_LIMITS.PROFILE.ACHIEVEMENT_TITLE_MAX)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION_LIMITS.PROFILE.ACHIEVEMENT_DESCRIPTION_MAX)
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.PROFILE.ACHIEVEMENT_DATE_MAX)
  date?: string;
}

export class CreateAchievementDto extends AchievementDataDto {}

export class UpdateAchievementDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @ValidateNested()
  @Type(() => AchievementDataDto)
  data: AchievementDataDto;
}

export class BatchUpdateAchievementsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AchievementDataDto)
  achievements: Array<AchievementDataDto & { id?: string }>;

  @IsArray()
  @IsString({ each: true })
  deleteIds: string[];
}
