import { IsString, IsBoolean, IsOptional, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';

// DTO pour initier la sync LinkedIn d'une startup
export class InitiateCompanySyncDto {
  @IsString()
  linkedinUrl: string;
}

// DTO pour appliquer les champs sélectionnés
export class ApplyCompanySyncFieldsDto {
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  syncName?: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  syncTagline?: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  syncDescription?: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  syncWebsite?: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  syncLogo?: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  syncCover?: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  syncLocation?: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  syncFoundedDate?: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  syncIndustries?: boolean;
}

// Response DTO pour la comparaison
export class CompanyComparisonResponseDto {
  current: {
    name: string;
    tagline?: string | null;
    bio?: string | null;
    description?: string | null;
    website?: string | null;
    logo?: string | null;
    coverImage?: string | null;
    countryCode: string;
    city: string;
    foundedDate?: string | null;
    categories: string[];
  };

  linkedin: {
    name: string;
    tagline?: string | null;
    description?: string | null;
    website?: string | null;
    logo?: string | null;
    backgroundCover?: string | null;
    countryCode?: string | null;
    city?: string | null;
    foundedYear?: number | null;
    industries: string[];
    employeeCount?: number | null;
    followerCount?: number | null;
    linkedinUrl?: string | null;
  };
}

// Response DTO pour le statut de sync
export class CompanySyncStatusResponseDto {
  canSync: boolean;
  hasPreviousSync: boolean;
  nextSyncAvailableAt?: Date;
  hoursRemaining?: number;
  lastSyncedAt?: Date;
}
