import {
  IsString,
  IsUrl,
  IsOptional,
  IsArray,
  IsBoolean,
  ValidateNested,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import {
  SanitizeText,
  SanitizeHtml,
  SanitizeArray,
} from '../../common/decorators/sanitize.decorator';
import { VALIDATION_LIMITS } from '../../common/constants/validation-limits.constants';

// DTO pour initier le scraping LinkedIn
export class InitiateLinkedInSyncDto {
  @IsOptional()
  @IsString()
  @IsUrl()
  @MaxLength(VALIDATION_LIMITS.STARTUP.LINKEDIN_MAX)
  linkedinUrl?: string;
}

// DTO pour le callback OAuth LinkedIn
export class OAuthLinkedInSyncDto {
  @IsString()
  code: string;
}

// DTO pour compléter l'OAuth avec l'URL LinkedIn manuelle
export class CompleteOAuthLinkedInSyncDto {
  @IsString()
  @IsUrl()
  @MaxLength(VALIDATION_LIMITS.STARTUP.LINKEDIN_MAX)
  linkedinUrl: string;
}

// DTO pour une expérience LinkedIn à synchroniser
export class LinkedInExperienceToSyncDto {
  @IsString()
  @MaxLength(VALIDATION_LIMITS.EXPERIENCE.TITLE_MAX)
  @SanitizeText()
  title: string;

  @IsString()
  @MaxLength(VALIDATION_LIMITS.EXPERIENCE.COMPANY_MAX)
  @SanitizeText()
  company: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.EXPERIENCE.DOMAIN_MAX)
  @SanitizeText()
  domain?: string;

  @IsString()
  @MaxLength(VALIDATION_LIMITS.EXPERIENCE.CITY_MAX)
  @SanitizeText()
  city: string;

  @IsString()
  from: string; // ISO date string

  @IsOptional()
  @IsString()
  to?: string; // ISO date string

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.EXPERIENCE.DESCRIPTION_MAX)
  @SanitizeHtml()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.EXPERIENCE.URL_LINKEDIN_MAX)
  urlLinkedin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.LINKEDIN_SYNC.LOGO_URL_MAX)
  logoUrl?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(VALIDATION_LIMITS.EXPERIENCE.TAGS_MAX_COUNT)
  @IsString({ each: true })
  @MaxLength(VALIDATION_LIMITS.EXPERIENCE.TAG_MAX, { each: true })
  @SanitizeArray()
  tags?: string[];
}

// DTO pour une éducation LinkedIn à synchroniser
export class LinkedInEducationToSyncDto {
  @IsString()
  @MaxLength(VALIDATION_LIMITS.EDUCATION.DEGREE_MAX)
  @SanitizeText()
  degree: string;

  @IsString()
  @MaxLength(VALIDATION_LIMITS.EDUCATION.SCHOOL_MAX)
  @SanitizeText()
  school: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.EDUCATION.DOMAIN_MAX)
  @SanitizeText()
  domain?: string;

  @IsString()
  @MaxLength(VALIDATION_LIMITS.EDUCATION.CITY_MAX)
  @SanitizeText()
  city: string;

  @IsString()
  from: string; // ISO date string

  @IsOptional()
  @IsString()
  to?: string; // ISO date string

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.EDUCATION.DESCRIPTION_MAX)
  @SanitizeHtml()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.EDUCATION.URL_LINKEDIN_MAX)
  urlLinkedin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.LINKEDIN_SYNC.LOGO_URL_MAX)
  logoUrl?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(VALIDATION_LIMITS.EDUCATION.TAGS_MAX_COUNT)
  @IsString({ each: true })
  @MaxLength(VALIDATION_LIMITS.EDUCATION.TAG_MAX, { each: true })
  @SanitizeArray()
  tags?: string[];
}

// DTO pour les champs à synchroniser
export class ApplySyncFieldsDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  syncHeadline?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  syncAvatar?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  syncCover?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  syncBio?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  syncExperiences?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  syncEducation?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  syncSkills?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(VALIDATION_LIMITS.LINKEDIN_SYNC.SELECTED_EXPERIENCES_MAX)
  @ValidateNested({ each: true })
  @Type(() => LinkedInExperienceToSyncDto)
  selectedExperiences?: LinkedInExperienceToSyncDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(VALIDATION_LIMITS.LINKEDIN_SYNC.SELECTED_EDUCATION_MAX)
  @ValidateNested({ each: true })
  @Type(() => LinkedInEducationToSyncDto)
  selectedEducation?: LinkedInEducationToSyncDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(VALIDATION_LIMITS.LINKEDIN_SYNC.SELECTED_SKILLS_MAX)
  @IsString({ each: true })
  @MaxLength(VALIDATION_LIMITS.LINKEDIN_SYNC.SELECTED_SKILL_MAX, { each: true })
  @SanitizeArray()
  selectedSkills?: string[];
}

// Interface pour les données de comparaison
export interface LinkedInComparisonData {
  linkedin: {
    headline?: string | null;
    avatarUrl?: string | null;
    coverUrl?: string | null;
    bio?: string | null;
    linkedinUrl?: string | null;
    experiences: Array<{
      title: string;
      company: string;
      city: string;
      from: string;
      to?: string;
      description?: string;
      urlLinkedin?: string;
      logoUrl?: string;
      tags: string[];
    }>;
    education: Array<{
      degree: string;
      school: string;
      city: string;
      from: string;
      to?: string;
      description?: string;
      urlLinkedin?: string;
      logoUrl?: string;
      tags: string[];
    }>;
    skills: string[];
  };
  current: {
    headline?: string | null;
    avatarUrl?: string | null;
    coverUrl?: string | null;
    bio?: string | null;
    experiences: Array<{
      id: string;
      title: string;
      company: string;
      city: string;
      from: string;
      to?: string;
      description?: string;
      urlLinkedin?: string;
      logoUrl?: string;
      tags: string[];
    }>;
    education: Array<{
      id: string;
      degree: string;
      school: string;
      city: string;
      from: string;
      to?: string;
      description?: string;
      urlLinkedin?: string;
      logoUrl?: string;
      tags: string[];
    }>;
    skills: string[];
  };
  canSync: boolean;
  nextSyncAvailableAt?: Date;
  hoursRemaining?: number;
  syncCount?: number;
  syncLimit?: number;
  periodResetsAt?: Date;
}

/** Résultat quand OAuth réussit mais l'URL LinkedIn n'est pas disponible (vanityName manquant) */
export interface ManualUrlRequiredResult {
  requiresManualUrl: true;
  userInfo: {
    email: string;
    name: string;
    picture?: string;
  };
}

// Réponse OAuth qui indique si l'URL manuelle est requise
export interface OAuthLinkedInSyncResponse {
  success: boolean;
  requiresManualUrl?: boolean;
  userInfo?: {
    email: string;
    name: string;
    picture?: string;
  };
  data?: LinkedInComparisonData;
  error?: string;
}
