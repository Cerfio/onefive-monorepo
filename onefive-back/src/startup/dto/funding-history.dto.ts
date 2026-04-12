import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  IsArray,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StartupFundingRound } from '@prisma/client';
import {
  SanitizeText,
  SanitizeHtml,
} from '../../common/decorators/sanitize.decorator';

// DTO pour un investisseur
export class FundingInvestorDto {
  @IsEnum(['person', 'company'])
  type: 'person' | 'company';

  @IsString()
  id: string;

  @IsString()
  @SanitizeText()
  name: string;

  @IsOptional()
  @IsString()
  @SanitizeText()
  firstName?: string;

  @IsOptional()
  @IsString()
  @SanitizeText()
  lastName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  @SanitizeHtml()
  description?: string;
}

export class CreateFundingHistoryDto {
  @IsDateString()
  date: string;

  @IsNumber()
  @Min(0)
  amountRaised: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valuation?: number;

  @IsEnum(StartupFundingRound)
  round: StartupFundingRound;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FundingInvestorDto)
  investors?: FundingInvestorDto[];

  @IsOptional()
  @IsString()
  @SanitizeText()
  leadInvestor?: string;

  @IsOptional()
  @IsString()
  @SanitizeText()
  instrument?: string;

  @IsOptional()
  @IsString()
  @SanitizeHtml()
  notes?: string;
}

export class UpdateFundingHistoryDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amountRaised?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valuation?: number;

  @IsOptional()
  @IsEnum(StartupFundingRound)
  round?: StartupFundingRound;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FundingInvestorDto)
  investors?: FundingInvestorDto[];

  @IsOptional()
  @IsString()
  @SanitizeText()
  leadInvestor?: string;

  @IsOptional()
  @IsString()
  @SanitizeText()
  instrument?: string;

  @IsOptional()
  @IsString()
  @SanitizeHtml()
  notes?: string;
}
