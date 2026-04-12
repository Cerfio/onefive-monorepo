import { IsString } from 'class-validator';

export class ToggleProfileFollowParamDto {
  @IsString()
  profileId: string;
}
