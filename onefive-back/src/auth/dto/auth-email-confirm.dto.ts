import { IsString } from 'class-validator';

export class AuthEmailConfirmDto {
  @IsString()
  code: string;
}
