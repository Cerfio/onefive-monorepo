import {
  Body,
  Controller,
  Post,
  Put,
  Delete,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateExperienceHandler } from './handlers/create-experience.handler';
import { UpdateExperienceHandler } from './handlers/update-experience.handler';
import { DeleteExperienceHandler } from './handlers/delete-experience.handler';
import { BatchUpdateExperiencesHandler } from './handlers/batch-update-experiences.handler';
import { ExperienceResponseDto } from './dto/experience-response.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { BatchUpdateExperiencesDto } from './dto/batch-update-experiences.dto';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from 'src/types/fastify-request-user-id';
import { SessionGuard } from 'src/common/guards/session-guard/session.guard';

@Controller('experience')
@UseGuards(SessionGuard)
export class ExperienceController {
  constructor(
    private readonly createExperienceHandler: CreateExperienceHandler,
    private readonly updateExperienceHandler: UpdateExperienceHandler,
    private readonly deleteExperienceHandler: DeleteExperienceHandler,
    private readonly batchUpdateExperiencesHandler: BatchUpdateExperiencesHandler,
  ) {}

  @Post()
  async create(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Body() body: CreateExperienceDto,
  ): Promise<ApiResponseDto<ExperienceResponseDto>> {
    const result = await this.createExperienceHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      data: body,
    });
    return { success: true, data: result };
  }

  @Put('/:experienceId')
  async update(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('experienceId') experienceId: string,
    @Body() body: UpdateExperienceDto,
  ): Promise<ApiResponseDto<ExperienceResponseDto>> {
    const result = await this.updateExperienceHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      experienceId,
      data: body,
    });
    return { success: true, data: result };
  }

  @Delete('/:experienceId')
  async delete(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('experienceId') experienceId: string,
  ): Promise<ApiResponseDto<ExperienceResponseDto>> {
    const result = await this.deleteExperienceHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      experienceId,
    });
    return { success: true, data: result };
  }

  @Put('/batch')
  async batchUpdate(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Body() body: BatchUpdateExperiencesDto,
  ): Promise<ApiResponseDto<ExperienceResponseDto>> {
    const result = await this.batchUpdateExperiencesHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      data: body,
    });
    return { success: true, data: result };
  }
}
