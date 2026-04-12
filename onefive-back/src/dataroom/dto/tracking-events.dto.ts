import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  IsObject,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  VALIDATION_LIMITS,
  VALIDATION_MESSAGES,
} from '../../common/constants/validation-limits.constants';

export class TrackingEventDto {
  @IsString()
  @MaxLength(VALIDATION_LIMITS.DATAROOM.EVENT_TYPE_MAX)
  eventType: string;

  @IsString()
  dataroomId: string;

  @IsString()
  fileId: string;

  @IsString()
  sessionId: string;

  @IsString()
  timestamp: string;

  @IsOptional()
  @IsNumber()
  sessionDuration?: number;

  @IsOptional()
  @IsObject()
  additionalData?: Record<string, unknown>;
}

export class SaveTrackingEventsDto {
  @IsArray()
  @ArrayMaxSize(VALIDATION_LIMITS.DATAROOM.EVENTS_MAX_COUNT, {
    message: VALIDATION_MESSAGES.EVENTS_TOO_MANY,
  })
  @ValidateNested({ each: true })
  @Type(() => TrackingEventDto)
  events: TrackingEventDto[];

  @IsOptional()
  @IsObject()
  metadata?: {
    timestamp?: string;
    userAgent?: string;
    batchSize?: number;
  };

  @IsOptional()
  @IsString()
  transactionId?: string;
}

export class SaveTrackingEventsResponseDto {
  data: {
    processedEvents: number;
    message: string;
    errors?: string[];
  };
}
