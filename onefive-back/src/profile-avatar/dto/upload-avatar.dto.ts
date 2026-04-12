import { IsOptional } from 'class-validator';

export class UploadAvatarDto {
  @IsOptional()
  file?: Express.Multer.File;
}

export class UploadAvatarResponseDto {
  success: boolean;
  data: {
    fileId: string;
    url: string;
    size: number;
    mimeType: string;
  };
}
