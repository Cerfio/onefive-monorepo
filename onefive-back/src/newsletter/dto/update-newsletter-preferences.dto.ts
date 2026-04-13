import { NewsletterFrequency } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export { NewsletterFrequency };

export class UpdateNewsletterPreferencesDto {
  @IsOptional()
  @IsEnum(NewsletterFrequency)
  frequency?: NewsletterFrequency;
}
