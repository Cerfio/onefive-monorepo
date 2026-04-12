import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PermissionDto {
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsBoolean()
  @IsNotEmpty()
  canView: boolean;

  @IsBoolean()
  @IsNotEmpty()
  canDownload: boolean;

  @IsBoolean()
  @IsNotEmpty()
  canComment: boolean;
}

export class UpdateDataroomGroupPermissionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  permissions: PermissionDto[];
}
