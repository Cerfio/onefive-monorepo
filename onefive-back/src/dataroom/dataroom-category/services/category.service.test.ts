import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { LogService } from 'logstash-winston-3';

describe('CategoryService', () => {
  let service: CategoryService;
  let prismaService: PrismaService;
  let logger: LogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: PrismaService,
          useValue: {
            category: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: 'Logger',
          useValue: {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    prismaService = module.get<PrismaService>(PrismaService);
    logger = module.get<LogService>('Logger');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a category', async () => {
    const mockCategory = {
      id: 'category-1',
      name: 'Documents',
      dataroomId: 'dataroom-1',
      createdBy: 'profile-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prismaService.category.create as jest.Mock).mockResolvedValue(
      mockCategory,
    );

    const result = await service.create({
      transactionId: 'test-transaction',
      data: {
        name: 'Documents',
        dataroom: {
          connect: {
            id: 'dataroom-1',
          },
        },
        createdBy: 'profile-1',
      },
    });

    expect(result).toEqual(mockCategory);
    expect(prismaService.category.create).toHaveBeenCalledWith({
      data: {
        name: 'Documents',
        dataroom: {
          connect: {
            id: 'dataroom-1',
          },
        },
        createdBy: 'profile-1',
      },
    });
  });

  it('should get a category', async () => {
    const mockCategory = {
      id: 'category-1',
      name: 'Documents',
      dataroomId: 'dataroom-1',
      createdBy: 'profile-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prismaService.category.findUnique as jest.Mock).mockResolvedValue(
      mockCategory,
    );

    const result = await service.get({
      transactionId: 'test-transaction',
      where: { id: 'category-1' },
    });

    expect(result).toEqual(mockCategory);
    expect(prismaService.category.findUnique).toHaveBeenCalledWith({
      where: { id: 'category-1' },
    });
  });

  it('should list categories', async () => {
    const mockCategories = [
      {
        id: 'category-1',
        name: 'Documents',
        dataroomId: 'dataroom-1',
        createdBy: 'profile-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'category-2',
        name: 'Images',
        dataroomId: 'dataroom-1',
        createdBy: 'profile-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (prismaService.category.findMany as jest.Mock).mockResolvedValue(
      mockCategories,
    );

    const result = await service.list({
      transactionId: 'test-transaction',
      where: { dataroomId: 'dataroom-1' },
    });

    expect(result).toEqual(mockCategories);
    expect(prismaService.category.findMany).toHaveBeenCalledWith({
      where: { dataroomId: 'dataroom-1' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should update a category', async () => {
    const mockCategory = {
      id: 'category-1',
      name: 'Updated Documents',
      dataroomId: 'dataroom-1',
      createdBy: 'profile-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prismaService.category.update as jest.Mock).mockResolvedValue(
      mockCategory,
    );

    const result = await service.update({
      transactionId: 'test-transaction',
      categoryId: 'category-1',
      data: {
        name: 'Updated Documents',
      },
    });

    expect(result).toEqual(mockCategory);
    expect(prismaService.category.update).toHaveBeenCalledWith({
      where: { id: 'category-1' },
      data: {
        name: 'Updated Documents',
      },
    });
  });

  it('should delete a category', async () => {
    const mockCategory = {
      id: 'category-1',
      name: 'Documents',
      dataroomId: 'dataroom-1',
      createdBy: 'profile-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prismaService.category.delete as jest.Mock).mockResolvedValue(
      mockCategory,
    );

    const result = await service.delete({
      transactionId: 'test-transaction',
      categoryId: 'category-1',
    });

    expect(result).toEqual(mockCategory);
    expect(prismaService.category.delete).toHaveBeenCalledWith({
      where: { id: 'category-1' },
    });
  });
});
