import { Test, TestingModule } from '@nestjs/testing';
import { CategoryHandler } from './category.handler';
import { CategoryService } from '../services/category.service';
import { LogService } from 'logstash-winston-3';

describe('CategoryHandler', () => {
  let handler: CategoryHandler;
  let categoryService: CategoryService;
  let logger: LogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryHandler,
        {
          provide: CategoryService,
          useValue: {
            create: jest.fn(),
            get: jest.fn(),
            list: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
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

    handler = module.get<CategoryHandler>(CategoryHandler);
    categoryService = module.get<CategoryService>(CategoryService);
    logger = module.get<LogService>('Logger');
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should create a category', async () => {
    const mockCategory = {
      id: 'category-1',
      name: 'Documents',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (categoryService.create as jest.Mock).mockResolvedValue(mockCategory);

    const result = await handler.create(
      {
        name: 'Documents',
        transactionId: 'test-transaction',
      },
      'dataroom-1',
      'profile-1',
    );

    expect(result.data.id).toBe('category-1');
    expect(categoryService.create).toHaveBeenCalledWith({
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
  });

  it('should list categories', async () => {
    const mockCategories = [
      {
        id: 'category-1',
        name: 'Documents',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'category-2',
        name: 'Images',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (categoryService.list as jest.Mock).mockResolvedValue(mockCategories);

    const result = await handler.list(
      {
        transactionId: 'test-transaction',
      },
      'dataroom-1',
    );

    expect(result.data.categories).toHaveLength(2);
    expect(result.data.categories[0].name).toBe('Documents');
    expect(categoryService.list).toHaveBeenCalledWith({
      transactionId: 'test-transaction',
      where: {
        dataroomId: 'dataroom-1',
      },
    });
  });

  it('should update a category', async () => {
    const mockCategory = {
      id: 'category-1',
      name: 'Documents',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (categoryService.get as jest.Mock).mockResolvedValue(mockCategory);
    (categoryService.update as jest.Mock).mockResolvedValue(mockCategory);

    const result = await handler.update(
      {
        name: 'Updated Documents',
        transactionId: 'test-transaction',
      },
      'category-1',
      'profile-1',
    );

    expect(result.data).toBeNull();
    expect(categoryService.get).toHaveBeenCalledWith({
      transactionId: 'test-transaction',
      where: { id: 'category-1' },
    });
    expect(categoryService.update).toHaveBeenCalledWith({
      transactionId: 'test-transaction',
      categoryId: 'category-1',
      data: {
        name: 'Updated Documents',
      },
    });
  });

  it('should delete a category', async () => {
    const mockCategory = {
      id: 'category-1',
      name: 'Documents',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (categoryService.get as jest.Mock).mockResolvedValue(mockCategory);
    (categoryService.delete as jest.Mock).mockResolvedValue(mockCategory);

    const result = await handler.delete(
      {
        transactionId: 'test-transaction',
      },
      'category-1',
      'profile-1',
    );

    expect(result.data).toBeNull();
    expect(categoryService.get).toHaveBeenCalledWith({
      transactionId: 'test-transaction',
      where: { id: 'category-1' },
    });
    expect(categoryService.delete).toHaveBeenCalledWith({
      transactionId: 'test-transaction',
      categoryId: 'category-1',
    });
  });

  it('should throw error when updating non-existent category', async () => {
    (categoryService.get as jest.Mock).mockResolvedValue(null);

    await expect(
      handler.update(
        {
          name: 'Updated Documents',
          transactionId: 'test-transaction',
        },
        'non-existent-category',
        'profile-1',
      ),
    ).rejects.toThrow('Category not found');
  });

  it('should throw error when deleting non-existent category', async () => {
    (categoryService.get as jest.Mock).mockResolvedValue(null);

    await expect(
      handler.delete(
        {
          transactionId: 'test-transaction',
        },
        'non-existent-category',
        'profile-1',
      ),
    ).rejects.toThrow('Category not found');
  });
});
