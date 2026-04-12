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
import { CreateEducationHandler } from './handlers/create-education.handler';
import { UpdateEducationHandler } from './handlers/update-education.handler';
import { DeleteEducationHandler } from './handlers/delete-education.handler';
import { BatchUpdateEducationsHandler } from './handlers/batch-update-educations.handler';
import { EducationResponseDto } from './dto/education-response.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { BatchUpdateEducationsDto } from './dto/batch-update-educations.dto';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from 'src/types/fastify-request-user-id';
import { SessionGuard } from 'src/common/guards/session-guard/session.guard';

@Controller('education')
@UseGuards(SessionGuard)
export class EducationController {
  constructor(
    private readonly createEducationHandler: CreateEducationHandler,
    private readonly updateEducationHandler: UpdateEducationHandler,
    private readonly deleteEducationHandler: DeleteEducationHandler,
    private readonly batchUpdateEducationsHandler: BatchUpdateEducationsHandler,
  ) {}

  @Post()
  async create(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Body() body: CreateEducationDto,
  ): Promise<ApiResponseDto<EducationResponseDto>> {
    const result = await this.createEducationHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      data: body,
    });
    return { success: true, data: result };
  }

  @Put('/:educationId')
  async update(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('educationId') educationId: string,
    @Body() body: UpdateEducationDto,
  ): Promise<ApiResponseDto<EducationResponseDto>> {
    const result = await this.updateEducationHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      educationId,
      data: body,
    });
    return { success: true, data: result };
  }

  @Delete('/:educationId')
  async delete(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('educationId') educationId: string,
  ): Promise<ApiResponseDto<EducationResponseDto>> {
    const result = await this.deleteEducationHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      educationId,
    });
    return { success: true, data: result };
  }

  @Put('/batch')
  async batchUpdate(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Body() body: BatchUpdateEducationsDto,
  ): Promise<ApiResponseDto<EducationResponseDto>> {
    const result = await this.batchUpdateEducationsHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      data: body,
    });
    return { success: true, data: result };
  }
}
