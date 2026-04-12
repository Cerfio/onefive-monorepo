import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsNumber,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';
import { VALIDATION_LIMITS } from '../../common/constants/validation-limits.constants';

export enum FundraisingType {
  STRUCTURED = 'structured',
  ROLLING = 'rolling',
  NONE = 'none',
}

export enum FundraisingInstrument {
  SAFE = 'SAFE',
  BSA_AIR = 'BSA AIR',
  EQUITY = 'Equity',
}

export class StructuredRoundDto {
  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.FUNDING_TEXT_MAX)
  targetAmount: string;

  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.FUNDING_TEXT_MAX)
  minTicket: string;

  @IsEnum(FundraisingInstrument)
  instrument: FundraisingInstrument;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.FUNDING_TEXT_MAX)
  cap?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.FUNDING_TEXT_MAX)
  discount?: string;

  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.FUNDING_DEADLINE_MAX)
  deadline: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.FUNDING_DECK_URL_MAX)
  deckUrl?: string;
}

export class RollingInvestmentDto {
  @IsEnum(FundraisingInstrument)
  instrument: FundraisingInstrument;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.FUNDING_TEXT_MAX)
  cap?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.FUNDING_TEXT_MAX)
  discount?: string;
}

export class UpdateFundingDto {
  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.FUNDING_TEXT_MAX)
  totalRaised?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.FUNDING_TEXT_MAX)
  lastRound?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(VALIDATION_LIMITS.STARTUP.FUNDING_INVESTORS_MAX_COUNT)
  @IsString({ each: true })
  @MaxLength(VALIDATION_LIMITS.STARTUP.FUNDING_INVESTOR_NAME_MAX, { each: true })
  investors?: string[];

  @IsOptional()
  @IsEnum(FundraisingType)
  fundraisingType?: FundraisingType;

  @IsOptional()
  structuredRound?: StructuredRoundDto;

  @IsOptional()
  rollingInvestment?: RollingInvestmentDto;
}
