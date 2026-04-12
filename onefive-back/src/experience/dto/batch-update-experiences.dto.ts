import { IsArray, ArrayMaxSize } from 'class-validator';
import { CreateExperienceDto } from './create-experience.dto';
import { UpdateExperienceDto } from './update-experience.dto';
import { VALIDATION_LIMITS } from '../../common/constants/validation-limits.constants';

export class BatchUpdateExperiencesDto {
  @IsArray()
  @ArrayMaxSize(VALIDATION_LIMITS.BATCH.EXPERIENCES_MAX)
  experiences: Array<{
    id?: string;
    data: CreateExperienceDto | UpdateExperienceDto;
  }>;

  @IsArray()
  @ArrayMaxSize(VALIDATION_LIMITS.BATCH.DELETE_IDS_MAX)
  deleteIds: string[];
}
