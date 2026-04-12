import { IsString, IsNotEmpty } from 'class-validator';

export class AuthSmsRequestDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}
