import { Test, TestingModule } from '@nestjs/testing';
import { FileHandler } from './file.handler';
import { FileService } from '../services/file.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { LogService } from 'logstash-winston-3';

describe('FileHandler', () => {
  let handler: FileHandler;
  let fileService: FileService;
  let prismaService: PrismaService;
  let logger: LogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileHandler,
        {
          provide: FileService,
          useValue: {
            create: jest.fn(),
            get: jest.fn(),
            list: jest.fn(),
            count: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {},
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

    handler = module.get<FileHandler>(FileHandler);
    fileService = module.get<FileService>(FileService);
    prismaService = module.get<PrismaService>(PrismaService);
    logger = module.get<LogService>('Logger');
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should create files', async () => {
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

    (fileService.create as jest.Mock).mockResolvedValue(mockFiles[0]);

    const result = await handler.create({
      dataroomId: 'dataroom-1',
      profileId: 'user-1',
      transactionId: 'test-transaction',
      files: [
        {
          storageId: 'storage-1',
          name: 'test.pdf',
          size: 1024,
          mimetype: 'application/pdf',
          category: 'Documents',
        },
      ],
    });

    expect(result.data.files).toHaveLength(1);
    expect(result.data.files[0].id).toBe('file-1');
  });

  it('should get a file', async () => {
    const mockFile = {
      id: 'file-1',
      name: 'test.pdf',
      size: 1024,
      mimetype: 'application/pdf',
      storageId: 'storage-1',
      category: { id: 'cat-1', name: 'Documents' },
      uploadedBy: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (fileService.get as jest.Mock).mockResolvedValue(mockFile);

    const result = await handler.get({
      fileId: 'file-1',
      profileId: 'user-1',
      transactionId: 'test-transaction',
    });

    expect(result.data.id).toBe('file-1');
    expect(result.data.category.name).toBe('Documents');
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
        uploadedBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (fileService.list as jest.Mock).mockResolvedValue(mockFiles);
    (fileService.count as jest.Mock).mockResolvedValue(1);

    const result = await handler.list({
      dataroomId: 'dataroom-1',
      profileId: 'user-1',
      transactionId: 'test-transaction',
    });

    expect(result.data.files).toHaveLength(1);
    expect(result.data.total).toBe(1);
  });

  it('should delete a file', async () => {
    const mockFile = {
      id: 'file-1',
      name: 'test.pdf',
      size: 1024,
      mimetype: 'application/pdf',
      storageId: 'storage-1',
      category: { id: 'cat-1', name: 'Documents' },
      uploadedBy: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (fileService.get as jest.Mock).mockResolvedValue(mockFile);
    (fileService.delete as jest.Mock).mockResolvedValue({});

    const result = await handler.delete({
      fileId: 'file-1',
      profileId: 'user-1',
      transactionId: 'test-transaction',
    });

    expect(result.data.success).toBe(true);
  });
});
