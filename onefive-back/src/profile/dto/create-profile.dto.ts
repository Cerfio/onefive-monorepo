import {
  IsEnum,
  IsISO8601,
  IsString,
  IsOptional,
  IsArray,
  IsIn,
} from 'class-validator';
import { SanitizeText } from '../../common/decorators/sanitize.decorator';

export enum GenderSalutationPreference {
  MALE = 0,
  FEMALE = 1,
  OTHER = 2,
}

export class CreateProfileBodyDto {
  @IsString()
  @IsOptional()
  code: string;

  @IsString()
  @SanitizeText()
  city: string;

  @IsString()
  countryCode: string;

  @IsISO8601()
  dateOfBirth: string;

  @IsString()
  @SanitizeText()
  firstName: string;

  @IsString()
  @SanitizeText()
  lastName: string;

  @IsString({ each: true })
  @IsOptional()
  followProfileIds: string[];

  @IsString({ each: true })
  @IsOptional()
  followStartupIds: string[];

  @IsString()
  gender: string;

  @IsEnum(GenderSalutationPreference)
  genderSalutationPreference: GenderSalutationPreference;

  @IsString({ each: true })
  @IsOptional()
  tagFollowing: string[];

  @IsArray()
  @IsIn(
    [
      'FOUNDER',
      'BUSINESS_ANGEL',
      'VENTURE_CAPITALIST',
      'INSTITUTIONAL_INVESTOR',
      'MENTOR',
      'STRATEGIC_ADVISOR',
      'STUDENT_ENTREPRENEUR',
      'SERVICE_PROVIDER',
      'MEDIA',
      'INCUBATOR_ACCELERATOR',
      'RECRUITER_HR',
      'OTHER',
    ],
    { each: true },
  )
  @IsOptional()
  ecosystemRoles: string[];

  @IsString()
  @IsOptional()
  referredByCode?: string;
}
