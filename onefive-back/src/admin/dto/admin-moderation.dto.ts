import { IsBoolean } from 'class-validator';

export class AdminHideDto {
  @IsBoolean()
  isHidden: boolean;
}
