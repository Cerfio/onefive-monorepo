import { IsOptional, IsUUID } from 'class-validator';

export class RunNewsletterIngestionDto {
  /** When set, only this feed source is fetched (must be active unless we relax later). */
  @IsOptional()
  @IsUUID()
  sourceId?: string;
}
