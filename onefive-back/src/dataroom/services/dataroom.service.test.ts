import { Test, TestingModule } from '@nestjs/testing';
import { DataroomService } from './dataroom.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TrackingService } from './tracking.service';
import { LogService } from 'logstash-winston-3';

describe('DataroomService', () => {
  let service: DataroomService;
  let prismaService: PrismaService;
  let trackingService: TrackingService;
  let logger: LogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataroomService,
        {
          provide: PrismaService,
          useValue: {
            dataroom: {
              create: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: TrackingService,
          useValue: {
            getDataroomAnalytics: jest.fn(),
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

    service = module.get<DataroomService>(DataroomService);
    prismaService = module.get<PrismaService>(PrismaService);
    trackingService = module.get<TrackingService>(TrackingService);
    logger = module.get<LogService>('Logger');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a dataroom', async () => {
    const mockDataroom = {
      id: 'test-id',
      startupId: 'startup-1',
      createdBy: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prismaService.dataroom.create as jest.Mock).mockResolvedValue(
      mockDataroom,
    );

    const result = await service.create({
      transactionId: 'test-transaction',
      data: {
        startup: {
          connect: { id: 'startup-1' },
        },
        createdBy: 'user-1',
      } as any,
    });

    expect(result).toEqual(mockDataroom);
    expect(prismaService.dataroom.create).toHaveBeenCalledWith({
      data: {
        startup: {
          connect: { id: 'startup-1' },
        },
        createdBy: 'user-1',
      },
    });
  });

  it('should get a dataroom', async () => {
    const mockDataroom = {
      id: 'test-id',
      startupId: 'startup-1',
      createdBy: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      files: [],
      categories: [],
      groups: [],
      _count: {
        files: 0,
        accessLogs: 0,
      },
    };

    (prismaService.dataroom.findUnique as jest.Mock).mockResolvedValue(
      mockDataroom,
    );

    const result = await service.get({
      transactionId: 'test-transaction',
      where: { id: 'test-id' },
    });

    expect(result).toEqual(mockDataroom);
    expect(prismaService.dataroom.findUnique).toHaveBeenCalledWith({
      where: { id: 'test-id' },
      select: undefined,
    });
  });

  it('should delete a dataroom', async () => {
    const mockDataroom = {
      id: 'test-id',
      startupId: 'startup-1',
      createdBy: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prismaService.dataroom.delete as jest.Mock).mockResolvedValue(
      mockDataroom,
    );

    const result = await service.delete({
      transactionId: 'test-transaction',
      dataroomId: 'test-id',
    });

    expect(result).toEqual(mockDataroom);
    expect(prismaService.dataroom.delete).toHaveBeenCalledWith({
      where: { id: 'test-id' },
    });
  });

  it('should list datarooms', async () => {
    const mockDatarooms = [
      {
        id: 'test-id-1',
        startupId: 'startup-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        groups: [],
        files: [],
        _count: {
          files: 0,
          accessLogs: 0,
          members: 0,
        },
      },
    ];

    (prismaService.dataroom.findMany as jest.Mock).mockResolvedValue(
      mockDatarooms,
    );

    const result = await service.list({
      transactionId: 'test-transaction',
      profileId: 'user-1',
    });

    expect(result).toEqual(mockDatarooms);
    expect(prismaService.dataroom.findMany).toHaveBeenCalled();
  });

  it('should enrich with tracking stats', async () => {
    const mockAnalytics = {
      totalViews: 100,
      uniqueViewers: 50,
      avgSessionDuration: 300,
      topFiles: [],
      userActivity: [],
    };

    (trackingService.getDataroomAnalytics as jest.Mock).mockResolvedValue(
      mockAnalytics,
    );

    const baseData = {
      id: 'test-id',
      _count: { files: 5, accessLogs: 10 },
    };

    const result = await service.enrichWithTrackingStats(
      'test-id',
      'user-1',
      baseData,
      '30d',
    );

    expect(result.totalViews).toBe(100);
    expect(result.uniqueViewers).toBe(50);
    expect(result.avgSessionDuration).toBe(300);
    expect(result.documentCount).toBe(5);
    expect(trackingService.getDataroomAnalytics).toHaveBeenCalledWith({
      dataroomId: 'test-id',
      profileId: 'user-1',
      period: '30d',
    });
  });
});
