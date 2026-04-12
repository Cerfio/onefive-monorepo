import { IsString } from 'class-validator';

export class GetProfileParamDto {
  @IsString()
  profileId: string;
}
