import { IsOptional } from 'class-validator';

export class UploadCoverDto {
  @IsOptional()
  file?: Express.Multer.File;
}

export class UploadCoverResponseDto {
  success: boolean;
  data: {
    fileId: string;
    url: string;
    size: number;
    mimeType: string;
  };
}
