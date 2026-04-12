import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { CategoryService } from '../services/category.service';
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
import { CategoryNotFoundException } from '../exceptions/category.exception';

@Injectable()
export class CategoryHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly categoryService: CategoryService,
  ) {}

  async create(
    input: CreateCategoryDto,
    dataroomId: string,
    profileId: string,
  ): Promise<CreateCategoryResponseDto> {
    const category = await this.categoryService.create({
      transactionId: input.transactionId,
      data: {
        name: input.name,
        dataroom: {
          connect: {
            id: dataroomId,
          },
        },
        createdBy: profileId,
      },
    });

    return {
      data: {
        id: category.id,
      },
    };
  }

  async list(
    input: ListCategoriesDto,
    dataroomId: string,
  ): Promise<ListCategoriesResponseDto> {
    const categories = await this.categoryService.list({
      transactionId: input.transactionId,
      where: {
        dataroomId: dataroomId,
      },
    });

    return {
      data: {
        categories: categories.map((category) => ({
          id: category.id,
          name: category.name,
          createdAt: category.createdAt.toISOString(),
          updatedAt: category.updatedAt.toISOString(),
        })),
      },
    };
  }

  async update(
    input: UpdateCategoryDto,
    categoryId: string,
    profileId: string,
  ): Promise<UpdateCategoryResponseDto> {
    // Vérifier que la catégorie existe
    const category = await this.categoryService.get({
      transactionId: input.transactionId,
      where: { id: categoryId },
    });

    if (!category) {
      CategoryNotFoundException.throw(this.logger, {
        transactionId: input.transactionId,
      });
    }

    await this.categoryService.update({
      transactionId: input.transactionId,
      categoryId,
      data: {
        name: input.name,
      },
    });

    return {
      data: null,
    };
  }

  async delete(
    input: DeleteCategoryDto,
    categoryId: string,
    profileId: string,
  ): Promise<DeleteCategoryResponseDto> {
    // Vérifier que la catégorie existe
    const category = await this.categoryService.get({
      transactionId: input.transactionId,
      where: { id: categoryId },
    });

    if (!category) {
      CategoryNotFoundException.throw(this.logger, {
        transactionId: input.transactionId,
      });
    }

    await this.categoryService.delete({
      transactionId: input.transactionId,
      categoryId,
    });

    return {
      data: null,
    };
  }
}
