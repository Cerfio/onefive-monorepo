import { IsString, IsOptional } from 'class-validator';

export class ListCategoriesDto {
  @IsOptional()
  @IsString()
  transactionId?: string;
}

export class ListCategoriesResponseDto {
  data: {
    categories: Array<{
      id: string;
      name: string;
      createdAt: string;
      updatedAt: string;
    }>;
  };
}
