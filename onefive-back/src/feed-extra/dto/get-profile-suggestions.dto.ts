import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetProfileSuggestionsQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  skip?: number = 0;
}

export interface ProfileSuggestionResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  urlAvatar?: string;
  bio?: string;
  highlight?: string;
  followersCount: number;
  isFollowed: boolean;
  ecosystemRoles: string[];
  skills: string[];
  countryCode?: string;
}
