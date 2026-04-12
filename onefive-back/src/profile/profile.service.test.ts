import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { PrismaService } from '../prisma/prisma.service';
import { StreakService } from '../streak/streak.service';
import { LogService } from 'logstash-winston-3';

describe('ProfileService', () => {
  let service: ProfileService;
  let prismaService: PrismaService;
  let logger: LogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: PrismaService,
          useValue: {
            profile: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: StreakService,
          useValue: {
            getCurrentStreak: jest.fn().mockResolvedValue({ streak: 0 }),
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

    service = module.get<ProfileService>(ProfileService);
    prismaService = module.get<PrismaService>(PrismaService);
    logger = module.get<LogService>('Logger');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a profile', async () => {
    const mockProfile = {
      id: 'test-id',
      userId: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prismaService.profile.create as jest.Mock).mockResolvedValue(mockProfile);

    const result = await service.create({
      transactionId: 'test-transaction',
      data: {
        user: {
          connect: { id: 'user-1' },
        },
        firstName: 'John',
        lastName: 'Doe',
        gender: 'MALE',
        genderSalutationPreferenceType: 'MALE',
        dateOfBirth: new Date('1990-01-01'),
        countryCode: 'France',
        city: 'Paris',
      },
    });

    expect(result).toEqual(mockProfile);
    expect(prismaService.profile.create).toHaveBeenCalledWith({
      data: {
        user: {
          connect: { id: 'user-1' },
        },
        firstName: 'John',
        lastName: 'Doe',
        gender: 'MALE',
        genderSalutationPreferenceType: 'MALE',
        dateOfBirth: new Date('1990-01-01'),
        countryCode: 'France',
        city: 'Paris',
      },
    });
  });

  it('should get a profile', async () => {
    const mockProfile = {
      id: 'test-id',
      userId: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prismaService.profile.findUnique as jest.Mock).mockResolvedValue(
      mockProfile,
    );

    const result = await service.get({
      transactionId: 'test-transaction',
      where: { id: 'test-id' },
    });

    expect(result).toEqual(mockProfile);
    expect(prismaService.profile.findUnique).toHaveBeenCalledWith({
      where: { id: 'test-id' },
      select: undefined,
    });
  });

  it('should list profiles', async () => {
    const mockProfiles = [
      {
        id: 'test-id-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'test-id-2',
        userId: 'user-2',
        firstName: 'Jane',
        lastName: 'Smith',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (prismaService.profile.findMany as jest.Mock).mockResolvedValue(
      mockProfiles,
    );

    const result = await service.list({
      transactionId: 'test-transaction',
      where: { firstName: { contains: 'John' } },
      skip: 0,
      take: 10,
    });

    expect(result).toEqual(mockProfiles);
    expect(prismaService.profile.findMany).toHaveBeenCalledWith({
      where: { firstName: { contains: 'John' } },
      select: undefined,
      skip: 0,
      take: 10,
    });
  });
});
