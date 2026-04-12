import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class AdminSigninDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 100)
  password: string;
}

export class AdminCreateInvitationDto {
  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(50)
  roleKey: string;
}

export class AdminAcceptInvitationDto {
  @IsString()
  token: string;

  @IsString()
  @Length(8, 100)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;
}
