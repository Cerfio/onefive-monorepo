import { IsString, IsOptional } from 'class-validator';

export class DeleteFileDto {
  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsString()
  fileId: string;

  @IsString()
  profileId: string;
}

export class DeleteFileResponseDto {
  data: {
    success: boolean;
  };
}
