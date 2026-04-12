import { IsString, IsNotEmpty } from 'class-validator';

export class AuthSmsConfirmDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
