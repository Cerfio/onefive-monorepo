import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class AdminBulkBanDto {
  @IsArray()
  @IsString({ each: true })
  ids: string[];

  @IsBoolean()
  isBanned: boolean;
}

export class AdminBulkDeleteDto {
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}
