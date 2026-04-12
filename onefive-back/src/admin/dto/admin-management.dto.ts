import { IsBoolean, IsString, MaxLength } from 'class-validator';

export class AdminUpdateRoleDto {
  @IsString()
  @MaxLength(50)
  roleKey: string;
}

export class AdminToggleSuperAdminDto {
  @IsBoolean()
  isSuperAdmin: boolean;
}

export class AdminSetActiveDto {
  @IsBoolean()
  isActive: boolean;
}
