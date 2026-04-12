import { IsString, IsUrl, MaxLength } from 'class-validator';

export class AdminImportSpotlightImageDto {
  @IsString()
  @IsUrl()
  @MaxLength(2000)
  url: string;
}
