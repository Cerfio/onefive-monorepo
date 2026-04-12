import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from './file.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { LogService } from 'logstash-winston-3';

describe('FileService', () => {
  let service: FileService;
  let prismaService: PrismaService;
  let logger: LogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        {
          provide: PrismaService,
          useValue: {
            dataroomFile: {
              create: jest.fn(),
              createMany: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
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

    service = module.get<FileService>(FileService);
    prismaService = module.get<PrismaService>(PrismaService);
    logger = module.get<LogService>('Logger');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a file', async () => {
    const mockFile = {
      id: 'file-1',
      name: 'test.pdf',
      size: 1024,
      mimetype: 'application/pdf',
      storageId: 'storage-1',
      category: { id: 'cat-1', name: 'Documents' },
    };

    (prismaService.dataroomFile.create as jest.Mock).mockResolvedValue(
      mockFile,
    );

    const result = await service.create({
      transactionId: 'test-transaction',
      data: {
        name: 'test.pdf',
        size: 1024,
        mimetype: 'application/pdf',
        storageId: 'storage-1',
        dataroom: { connect: { id: 'dataroom-1' } },
        category: { connect: { id: 'cat-1' } },
        uploadedBy: 'user-1',
      },
    });

    expect(result).toEqual(mockFile);
    expect(prismaService.dataroomFile.create).toHaveBeenCalledWith({
      data: {
        name: 'test.pdf',
        size: 1024,
        mimetype: 'application/pdf',
        storageId: 'storage-1',
        dataroom: { connect: { id: 'dataroom-1' } },
        category: { connect: { id: 'cat-1' } },
        uploadedBy: 'user-1',
      },
      include: {
        category: true,
      },
    });
  });

  it('should get a file', async () => {
    const mockFile = {
      id: 'file-1',
      name: 'test.pdf',
      size: 1024,
      mimetype: 'application/pdf',
      storageId: 'storage-1',
      category: { id: 'cat-1', name: 'Documents' },
    };

    (prismaService.dataroomFile.findUnique as jest.Mock).mockResolvedValue(
      mockFile,
    );

    const result = await service.get({
      transactionId: 'test-transaction',
      where: { id: 'file-1' },
    });

    expect(result).toEqual(mockFile);
    expect(prismaService.dataroomFile.findUnique).toHaveBeenCalledWith({
      where: { id: 'file-1' },
      include: { category: true },
    });
  });

  it('should list files', async () => {
    const mockFiles = [
      {
        id: 'file-1',
        name: 'test.pdf',
        size: 1024,
        mimetype: 'application/pdf',
        storageId: 'storage-1',
        category: { id: 'cat-1', name: 'Documents' },
      },
    ];

    (prismaService.dataroomFile.findMany as jest.Mock).mockResolvedValue(
      mockFiles,
    );

    const result = await service.list({
      transactionId: 'test-transaction',
      where: { dataroomId: 'dataroom-1', isDeleted: false },
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    expect(result).toEqual(mockFiles);
    expect(prismaService.dataroomFile.findMany).toHaveBeenCalledWith({
      where: { dataroomId: 'dataroom-1', isDeleted: false },
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
  });

  it('should count files', async () => {
    (prismaService.dataroomFile.count as jest.Mock).mockResolvedValue(5);

    const result = await service.count({
      transactionId: 'test-transaction',
      where: { dataroomId: 'dataroom-1', isDeleted: false },
    });

    expect(result).toBe(5);
    expect(prismaService.dataroomFile.count).toHaveBeenCalledWith({
      where: { dataroomId: 'dataroom-1', isDeleted: false },
    });
  });

  it('should delete a file', async () => {
    const mockFile = {
      id: 'file-1',
      isDeleted: true,
      deletedAt: new Date(),
    };

    (prismaService.dataroomFile.update as jest.Mock).mockResolvedValue(
      mockFile,
    );

    const result = await service.delete({
      transactionId: 'test-transaction',
      fileId: 'file-1',
    });

    expect(result).toEqual(mockFile);
    expect(prismaService.dataroomFile.update).toHaveBeenCalledWith({
      where: { id: 'file-1' },
      data: {
        isDeleted: true,
        deletedAt: expect.any(Date),
      },
    });
  });
});
