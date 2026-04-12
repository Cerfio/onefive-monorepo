import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetPostBookmarkQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  skip?: number = 0;
}

export interface BookmarkedPostResponseDto {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  bookmarkedAt: string;
  tags: string[];
  author: {
    id: string;
    firstName: string;
    lastName: string;
    urlAvatar?: string;
  };
  mediaUrls: string[];
}
