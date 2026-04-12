import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { LogService } from 'logstash-winston-3';
import { Prisma, Category } from '@prisma/client';
import {
  CategoryCreateException,
  CategoryUpdateException,
  CategoryDeleteException,
  CategoryListException,
  CategoryNotFoundException,
} from '../exceptions/category.exception';

@Injectable()
export class CategoryService {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly prisma: PrismaService,
  ) {}

  async create({
    transactionId,
    data,
  }: {
    transactionId: string;
    data: Prisma.CategoryCreateInput;
  }): Promise<Category> {
    try {
      return await this.prisma.category.create({
        data,
      });
    } catch (error) {
      CategoryCreateException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  async get({
    transactionId,
    where,
  }: {
    transactionId: string;
    where: Prisma.CategoryWhereUniqueInput;
  }): Promise<Category | null> {
    try {
      return await this.prisma.category.findUnique({
        where,
      });
    } catch (error) {
      CategoryListException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  async list({
    transactionId,
    where,
  }: {
    transactionId: string;
    where: Prisma.CategoryWhereInput;
  }): Promise<Category[]> {
    try {
      return await this.prisma.category.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      CategoryListException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  async update({
    transactionId,
    categoryId,
    data,
  }: {
    transactionId: string;
    categoryId: string;
    data: Prisma.CategoryUpdateInput;
  }): Promise<Category> {
    try {
      return await this.prisma.category.update({
        where: { id: categoryId },
        data,
      });
    } catch (error) {
      CategoryUpdateException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  async delete({
    transactionId,
    categoryId,
  }: {
    transactionId: string;
    categoryId: string;
  }): Promise<Category> {
    try {
      return await this.prisma.category.delete({
        where: { id: categoryId },
      });
    } catch (error) {
      CategoryDeleteException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }
}
