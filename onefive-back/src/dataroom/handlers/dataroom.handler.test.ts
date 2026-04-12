import { Test, TestingModule } from '@nestjs/testing';
import { DataroomHandler } from './dataroom.handler';
import { DataroomService } from '../services/dataroom.service';
import { MemberService } from '../services/member.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LogService } from 'logstash-winston-3';

describe('DataroomHandler', () => {
  let handler: DataroomHandler;
  let dataroomService: DataroomService;
  let memberService: MemberService;
  let prismaService: PrismaService;
  let logger: LogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataroomHandler,
        {
          provide: DataroomService,
          useValue: {
            get: jest.fn(),
            delete: jest.fn(),
            list: jest.fn(),
            count: jest.fn(),
            enrichWithTrackingStats: jest.fn(),
          },
        },
        {
          provide: MemberService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
            dataroom: {
              create: jest.fn(),
            },
            member: {
              create: jest.fn(),
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

    handler = module.get<DataroomHandler>(DataroomHandler);
    dataroomService = module.get<DataroomService>(DataroomService);
    memberService = module.get<MemberService>(MemberService);
    prismaService = module.get<PrismaService>(PrismaService);
    logger = module.get<LogService>('Logger');
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should create a dataroom', async () => {
    const mockDataroom = {
      id: 'test-id',
      startupId: 'startup-1',
      createdBy: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      groups: [
        {
          id: 'group-1',
          name: 'Founder',
          type: 'DEFAULT',
          createdBy: 'user-1',
          canManageGroups: true,
          canManageUsers: true,
          canUpload: true,
          canShare: true,
          hasAllAccess: true,
        },
      ],
    };

    const mockTransaction = jest.fn().mockImplementation(async (callback) => {
      return await callback({
        dataroom: {
          create: jest.fn().mockResolvedValue(mockDataroom),
        },
        member: {
          create: jest.fn().mockResolvedValue({}),
        },
      });
    });

    (prismaService.$transaction as jest.Mock).mockImplementation(
      mockTransaction,
    );

    const result = await handler.create({
      startupId: 'startup-1',
      createdBy: 'user-1',
      transactionId: 'test-transaction',
    });

    expect(result.data.id).toBe('test-id');
  });

  it('should get a dataroom', async () => {
    const mockDataroom = {
      id: 'test-id',
      startupId: 'startup-1',
      createdBy: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      accessLogs: [],
      groups: [],
      categories: [],
      files: [],
      _count: {
        files: 0,
        accessLogs: 0,
      },
    };

    const mockEnrichedData = {
      ...mockDataroom,
      totalViews: 100,
      uniqueViewers: 50,
      avgSessionDuration: 300,
    };

    (dataroomService.get as jest.Mock).mockResolvedValue(mockDataroom);
    (dataroomService.enrichWithTrackingStats as jest.Mock).mockResolvedValue(
      mockEnrichedData,
    );

    const result = await handler.get({
      dataroomId: 'test-id',
      profileId: 'user-1',
      transactionId: 'test-transaction',
    });

    expect(result.data.totalViews).toBe(100);
    expect(result.data.uniqueViewers).toBe(50);
    expect(dataroomService.get).toHaveBeenCalledWith({
      transactionId: 'test-transaction',
      where: { id: 'test-id' },
      select: expect.any(Object),
    });
  });

  it('should delete a dataroom', async () => {
    (dataroomService.delete as jest.Mock).mockResolvedValue({});

    const result = await handler.delete({
      dataroomId: 'test-id',
      transactionId: 'test-transaction',
    });

    expect(result.data.success).toBe(true);
    expect(dataroomService.delete).toHaveBeenCalledWith({
      transactionId: 'test-transaction',
      dataroomId: 'test-id',
    });
  });

  it('should list datarooms', async () => {
    const mockDatarooms = [
      {
        id: 'test-id-1',
        startupId: 'startup-1',
        startup: {
          name: 'Test Startup',
          logo: 'https://example.com/logo.png',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        groups: [],
        files: [],
        _count: {
          files: 5,
          accessLogs: 10,
          members: 3,
        },
      },
    ];

    (dataroomService.list as jest.Mock).mockResolvedValue(mockDatarooms);
    (dataroomService.count as jest.Mock).mockResolvedValue(1);

    const result = await handler.list({
      profileId: 'user-1',
      transactionId: 'test-transaction',
    });

    expect(result.data.items).toHaveLength(1);
    expect(result.data.items[0].id).toBe('test-id-1');
    expect(result.data.items[0].name).toBe('Test Startup');
    expect(result.data.items[0].logo).toBe('https://example.com/logo.png');
    expect(dataroomService.list).toHaveBeenCalledWith({
      transactionId: 'test-transaction',
      profileId: 'user-1',
      skip: 0,
      take: 20,
      orderBy: { createdAt: 'desc' },
    });
  });
});
