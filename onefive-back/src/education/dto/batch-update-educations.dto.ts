import { IsArray, ArrayMaxSize } from 'class-validator';
import { CreateEducationDto } from './create-education.dto';
import { UpdateEducationDto } from './update-education.dto';
import { VALIDATION_LIMITS } from '../../common/constants/validation-limits.constants';

export class BatchUpdateEducationsDto {
  @IsArray()
  @ArrayMaxSize(VALIDATION_LIMITS.BATCH.EDUCATIONS_MAX)
  educations: Array<{
    id?: string;
    data: CreateEducationDto | UpdateEducationDto;
  }>;

  @IsArray()
  @ArrayMaxSize(VALIDATION_LIMITS.BATCH.DELETE_IDS_MAX)
  deleteIds: string[];
}
