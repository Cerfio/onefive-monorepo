import { IsString, IsOptional } from 'class-validator';

export class DeleteDataroomDto {
  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsString()
  dataroomId: string;
}

export class DeleteDataroomResponseDto {
  data: {
    success: boolean;
  };
}
