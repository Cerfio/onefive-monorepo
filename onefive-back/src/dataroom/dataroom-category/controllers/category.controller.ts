import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { CategoryHandler } from '../handlers/category.handler';
import {
  CreateCategoryDto,
  CreateCategoryResponseDto,
} from '../dto/create-category.dto';
import {
  UpdateCategoryDto,
  UpdateCategoryResponseDto,
} from '../dto/update-category.dto';
import {
  DeleteCategoryDto,
  DeleteCategoryResponseDto,
} from '../dto/delete-category.dto';
import {
  ListCategoriesDto,
  ListCategoriesResponseDto,
} from '../dto/list-categories.dto';
import { FastifyRequest } from 'fastify';
import { SessionGuard } from '../../../common/guards/session-guard/session.guard';
import { FastifyRequestUserId } from '../../../types/fastify-request-user-id';
import { DataroomMemberGuard } from '../../guards/dataroom-member.guard';

@Controller('dataroom/:dataroomId/category')
@UseGuards(SessionGuard, DataroomMemberGuard)
export class CategoryController {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly categoryHandler: CategoryHandler,
  ) {}

  @Post()
  async create(
    @Req() req: FastifyRequest & FastifyRequestUserId,
    @Body() createCategoryDto: CreateCategoryDto,
    @Param('dataroomId') dataroomId: string,
  ): Promise<CreateCategoryResponseDto> {
    this.logger.info('Creating category', {
      transactionId: createCategoryDto.transactionId,
      dataroomId,
      name: createCategoryDto.name,
    });

    const profileId = req.userId;

    return await this.categoryHandler.create(
      createCategoryDto,
      dataroomId,
      profileId,
    );
  }

  @Get()
  async list(
    @Req() req: FastifyRequest & FastifyRequestUserId,
    @Param('dataroomId') dataroomId: string,
    @Query('transactionId') transactionId?: string,
  ): Promise<ListCategoriesResponseDto> {
    this.logger.info('Listing categories', {
      transactionId,
      dataroomId,
    });

    const listCategoriesDto: ListCategoriesDto = {
      transactionId,
    };

    return await this.categoryHandler.list(listCategoriesDto, dataroomId);
  }

  @Put(':id')
  async update(
    @Req() req: FastifyRequest & FastifyRequestUserId,
    @Param('id') categoryId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Param('dataroomId') dataroomId: string,
  ): Promise<UpdateCategoryResponseDto> {
    this.logger.info('Updating category', {
      transactionId: updateCategoryDto.transactionId,
      categoryId,
      dataroomId,
      name: updateCategoryDto.name,
    });

    const profileId = req.userId;

    return await this.categoryHandler.update(
      updateCategoryDto,
      categoryId,
      profileId,
    );
  }

  @Delete(':id')
  async delete(
    @Req() req: FastifyRequest & FastifyRequestUserId,
    @Param('id') categoryId: string,
    @Param('dataroomId') dataroomId: string,
    @Query('transactionId') transactionId?: string,
  ): Promise<DeleteCategoryResponseDto> {
    this.logger.info('Deleting category', {
      transactionId,
      categoryId,
      dataroomId,
    });

    const profileId = req.userId;

    const deleteCategoryDto: DeleteCategoryDto = {
      transactionId,
    };

    return await this.categoryHandler.delete(
      deleteCategoryDto,
      categoryId,
      profileId,
    );
  }
}
