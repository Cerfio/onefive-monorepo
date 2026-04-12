import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class ListDataroomDto {
  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  profileId: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === ''
      ? undefined
      : parseInt(value, 10),
  )
  @IsNumber()
  @Min(0)
  skip?: number;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === ''
      ? undefined
      : parseInt(value, 10),
  )
  @IsNumber()
  @Min(1)
  @Max(100)
  take?: number;

  @IsOptional()
  @IsIn(['createdAt_asc', 'createdAt_desc'])
  orderBy?: 'createdAt_asc' | 'createdAt_desc';
}

export class ListDataroomResponseDto {
  data: {
    items: DataroomDataDto[];
    total?: number;
    page?: number;
    pageSize?: number;
    hasMore?: boolean;
  };
}

export class DataroomDataDto {
  id: string;
  startupId: string;
  name?: string;
  logo?: string;
  notificationCount: number;
  createdAt: string;
  updatedAt: string;
  isOwner: boolean;
  memberCount: number;
  documentCount: number;
  viewCount: number;
  lastActivity: string;
}
