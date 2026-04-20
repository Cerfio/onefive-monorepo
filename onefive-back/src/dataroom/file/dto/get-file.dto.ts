import { IsString, IsOptional } from 'class-validator';

export class GetFileDto {
  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsString()
  fileId: string;

  @IsString()
  dataroomId: string;

  @IsString()
  profileId: string;
}

export class GetFileResponseDto {
  data: {
    id: string;
    name: string;
    size: number;
    mimetype: string;
    storageId: string;
    category: {
      id: string;
      name: string;
    };
    uploadedBy: string;
    createdAt: string;
    updatedAt: string;
  };
}
