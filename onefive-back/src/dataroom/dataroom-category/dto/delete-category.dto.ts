import { IsString, IsOptional } from 'class-validator';

export class DeleteCategoryDto {
  @IsOptional()
  @IsString()
  transactionId?: string;
}

export class DeleteCategoryResponseDto {
  data: null;
}
