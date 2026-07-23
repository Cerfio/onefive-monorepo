import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class ListFilesDto {
  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsString()
  dataroomId: string;

  @IsOptional()
  @IsString()
  profileId: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

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

export class ListFilesResponseDto {
  data: {
    items?: Array<{
      id: string;
      name: string;
      size: number;
      mimetype: string;
      storageId: string;
      viewCount?: number;
      category: {
        id: string;
        name: string;
      };
      uploadedBy: string;
      createdAt: string;
      updatedAt: string;
    }>;
    files: Array<{
      id: string;
      name: string;
      size: number;
      mimetype: string;
      storageId: string;
      viewCount?: number;
      category: {
        id: string;
        name: string;
      };
      uploadedBy: string;
      createdAt: string;
      updatedAt: string;
    }>;
    total: number;
    page?: number;
    pageSize?: number;
    hasMore?: boolean;
  };
}
