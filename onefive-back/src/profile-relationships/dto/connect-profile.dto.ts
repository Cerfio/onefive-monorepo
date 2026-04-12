import { IsString, IsNotEmpty } from 'class-validator';

export class ConnectProfileDto {
  @IsString()
  @IsNotEmpty()
  profileId: string;
}
