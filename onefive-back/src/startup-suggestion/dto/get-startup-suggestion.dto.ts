import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetStartupSuggestionQueryDto {
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

export interface StartupSuggestionResponseDto {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  categories: string[];
  countryCode: string;
  city: string;
  membersCount: number;
  followersCount: number;
  isFollowed: boolean;
}
