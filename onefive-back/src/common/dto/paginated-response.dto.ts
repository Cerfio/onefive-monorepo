import { IsArray, IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class PaginatedResponseDto<T> {
  @IsArray()
  items: T[];

  @IsOptional()
  @IsNumber()
  total?: number;

  @IsNumber()
  page: number;

  @IsNumber()
  pageSize: number;

  @IsBoolean()
  hasMore: boolean;

  constructor(data: {
    items: T[];
    total?: number;
    page: number;
    pageSize: number;
    hasMore?: boolean;
  }) {
    this.items = data.items;
    this.total = data.total;
    this.page = data.page;
    this.pageSize = data.pageSize;
    this.hasMore =
      data.hasMore ??
      (data.total != null ? data.page * data.pageSize < data.total : false);
  }

  /**
   * Factory for offset-based pagination (skip/limit).
   * Computes `page` from skip/limit. If `total` is not provided,
   * `hasMore` is inferred from items.length === limit.
   */
  static fromOffset<T>(data: {
    items: T[];
    skip: number;
    limit: number;
    total?: number;
  }): PaginatedResponseDto<T> {
    const page = Math.floor(data.skip / data.limit) + 1;
    return new PaginatedResponseDto({
      items: data.items,
      total: data.total,
      page,
      pageSize: data.limit,
      hasMore:
        data.total != null
          ? data.skip + data.limit < data.total
          : data.items.length === data.limit,
    });
  }
}

/**
 * Response DTO for cursor-based pagination (e.g., messaging).
 */
export class CursorPaginatedResponseDto<T> {
  @IsArray()
  items: T[];

  @IsBoolean()
  hasMore: boolean;

  @IsOptional()
  nextCursor?: string | null;

  constructor(data: {
    items: T[];
    hasMore: boolean;
    nextCursor?: string | null;
  }) {
    this.items = data.items;
    this.hasMore = data.hasMore;
    this.nextCursor = data.nextCursor ?? null;
  }
}
