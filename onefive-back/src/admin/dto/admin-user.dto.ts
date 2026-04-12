import { IsBoolean, IsIn } from 'class-validator';

export class AdminBanUserDto {
  @IsBoolean()
  isBanned: boolean;
}

export class AdminToggleAmbassadorDto {
  @IsBoolean()
  isAmbassador: boolean;
}

export class AdminChangeWaitlistStatusDto {
  @IsIn(['WAITING', 'ACTIVE', 'IGNORED'])
  waitlistStatus: 'WAITING' | 'ACTIVE' | 'IGNORED';
}
