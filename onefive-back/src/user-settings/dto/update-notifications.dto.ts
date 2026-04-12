import { IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { NotificationFrequency } from '@prisma/client';

export class UpdateNotificationsDto {
  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @IsOptional()
  @IsBoolean()
  push?: boolean;

  @IsOptional()
  @IsBoolean()
  marketing?: boolean;

  @IsOptional()
  @IsBoolean()
  connections?: boolean;

  @IsOptional()
  @IsBoolean()
  mentions?: boolean;

  @IsOptional()
  @IsBoolean()
  discussions?: boolean;

  @IsOptional()
  @IsEnum(NotificationFrequency)
  frequency?: NotificationFrequency;

  @IsOptional()
  @IsBoolean()
  quietHours?: boolean;

  @IsOptional()
  @IsBoolean()
  weekendNotif?: boolean;
}
