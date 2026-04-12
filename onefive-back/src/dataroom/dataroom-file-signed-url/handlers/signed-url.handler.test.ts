import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { SignedUrlHandler } from './signed-url.handler';
import { SignedUrlService } from '../services/signed-url.service';
import { FileService } from '../../file/services/file.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { LogService } from 'logstash-winston-3';

describe('SignedUrlHandler', () => {
  let handler: SignedUrlHandler;
  let signedUrlService: SignedUrlService;
  let fileService: FileService;
  let prismaService: PrismaService;
  let logger: LogService;

  const mockMemberWithAllAccess = {
    groupId: 'group-1',
    group: { hasAllAccess: true },
  };

  const mockMemberLimited = {
    groupId: 'group-2',
    group: { hasAllAccess: false },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignedUrlHandler,
        {
          provide: SignedUrlService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: FileService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            permissionCategory: {
              findUnique: jest.fn(),
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

    handler = module.get<SignedUrlHandler>(SignedUrlHandler);
    signedUrlService = module.get<SignedUrlService>(SignedUrlService);
    fileService = module.get<FileService>(FileService);
    prismaService = module.get<PrismaService>(PrismaService);
    logger = module.get<LogService>('Logger');
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should get signed URL when member has full access', async () => {
    const mockFile = {
      id: 'file-1',
      storageId: 'storage-1',
      categoryId: 'cat-1',
      name: 'test.pdf',
      size: 1024,
      mimetype: 'application/pdf',
    };

    const mockSignedUrl = {
      url: 'https://storage.example.com/files/storage-1?expires=1234567890&signature=mock-signature',
    };

    (fileService.get as jest.Mock).mockResolvedValue(mockFile);
    (signedUrlService.get as jest.Mock).mockResolvedValue(mockSignedUrl);

    const result = await handler.get({
      dataroomId: 'dataroom-1',
      fileId: 'file-1',
      action: 'view',
      transactionId: 'test-transaction',
      member: mockMemberWithAllAccess,
    });

    expect(result.data.url).toBe(mockSignedUrl.url);
    expect(fileService.get).toHaveBeenCalledWith({
      transactionId: 'test-transaction',
      where: { id: 'file-1' },
    });
    expect(signedUrlService.get).toHaveBeenCalledWith({
      transactionId: 'test-transaction',
      storageId: 'storage-1',
      expiresIn: 60,
    });
  });

  it('should get signed URL when member has category permission', async () => {
    const mockFile = {
      id: 'file-1',
      storageId: 'storage-1',
      categoryId: 'cat-1',
      name: 'test.pdf',
      size: 1024,
      mimetype: 'application/pdf',
    };

    const mockSignedUrl = {
      url: 'https://storage.example.com/signed',
    };

    (fileService.get as jest.Mock).mockResolvedValue(mockFile);
    (signedUrlService.get as jest.Mock).mockResolvedValue(mockSignedUrl);
    (
      prismaService.permissionCategory.findUnique as jest.Mock
    ).mockResolvedValue({
      canView: true,
      canDownload: false,
    });

    const result = await handler.get({
      dataroomId: 'dataroom-1',
      fileId: 'file-1',
      action: 'view',
      transactionId: 'test-transaction',
      member: mockMemberLimited,
    });

    expect(prismaService.permissionCategory.findUnique).toHaveBeenCalledWith({
      where: {
        categoryId_groupId: {
          categoryId: 'cat-1',
          groupId: 'group-2',
        },
      },
    });
  });

  it('should throw ForbiddenException when member lacks permission', async () => {
    const mockFile = {
      id: 'file-1',
      storageId: 'storage-1',
      categoryId: 'cat-1',
      name: 'test.pdf',
      size: 1024,
      mimetype: 'application/pdf',
    };

    (fileService.get as jest.Mock).mockResolvedValue(mockFile);
    (
      prismaService.permissionCategory.findUnique as jest.Mock
    ).mockResolvedValue(null);

    await expect(
      handler.get({
        dataroomId: 'dataroom-1',
        fileId: 'file-1',
        action: 'view',
        transactionId: 'test-transaction',
        member: mockMemberLimited,
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when download requested without canDownload', async () => {
    const mockFile = {
      id: 'file-1',
      storageId: 'storage-1',
      categoryId: 'cat-1',
      name: 'test.pdf',
      size: 1024,
      mimetype: 'application/pdf',
    };

    (fileService.get as jest.Mock).mockResolvedValue(mockFile);
    (
      prismaService.permissionCategory.findUnique as jest.Mock
    ).mockResolvedValue({
      canView: true,
      canDownload: false,
    });

    await expect(
      handler.get({
        dataroomId: 'dataroom-1',
        fileId: 'file-1',
        action: 'download',
        transactionId: 'test-transaction',
        member: mockMemberLimited,
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw error when file not found', async () => {
    (fileService.get as jest.Mock).mockResolvedValue(null);

    await expect(
      handler.get({
        dataroomId: 'dataroom-1',
        fileId: 'file-1',
        transactionId: 'test-transaction',
        member: mockMemberWithAllAccess,
      }),
    ).rejects.toThrow('File not found');
  });
});
