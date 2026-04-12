import { IsString } from 'class-validator';

export class ToggleStartupFollowParamDto {
  @IsString()
  startupId: string;
}
