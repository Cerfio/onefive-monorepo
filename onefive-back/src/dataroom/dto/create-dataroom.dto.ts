import { IsString, IsOptional } from 'class-validator';

export class CreateDataroomDto {
  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsString()
  startupId: string;

  @IsString()
  createdBy: string;

  @IsOptional()
  @IsString()
  dataroomId?: string;
}

export class CreateDataroomResponseDto {
  data: {
    id: string;
  };
}
