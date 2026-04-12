import { Test, TestingModule } from '@nestjs/testing';
import { CreateStartupInvitationHandler } from './create-invitation.handler';
import { StartupService } from '../../startup/startup.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationHelperService } from '../../notification/notification-helper.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

describe('CreateStartupInvitationHandler', () => {
  let handler: CreateStartupInvitationHandler;
  let prisma: any;
  let startupService: any;

  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    startAction: jest.fn().mockReturnValue({ transactionId: 'test-tx' }),
    endAction: jest.fn(),
  };

  const mockProfile = { id: 'profile-1', firstName: 'John', lastName: 'Doe' };
  const mockStartup = {
    id: 'startup-1',
    name: 'Test Startup',
    role: 'SUPER_ADMIN',
  };

  beforeEach(async () => {
    const mockPrisma = {
      profile: {
        findUnique: jest.fn().mockResolvedValue(mockProfile),
      },
      startupMember: {
        findMany: jest.fn(),
      },
      startupInvitation: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const mockStartupService = {
      getUserStartups: jest.fn().mockResolvedValue([mockStartup]),
      getPendingInvitations: jest.fn().mockResolvedValue([]),
      getStartupMembersEquity: jest.fn(),
      createInvitation: jest.fn(),
    };

    const mockNotificationHelper = {
      notifyStartupInvitation: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateStartupInvitationHandler,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: StartupService, useValue: mockStartupService },
        {
          provide: NotificationHelperService,
          useValue: mockNotificationHelper,
        },
        { provide: 'Logger', useValue: mockLogger },
      ],
    }).compile();

    handler = module.get<CreateStartupInvitationHandler>(
      CreateStartupInvitationHandler,
    );
    prisma = module.get<PrismaService>(PrismaService);
    startupService = module.get<StartupService>(StartupService);
  });

  afterEach(() => jest.clearAllMocks());

  const baseData = {
    transactionId: 'tx-1',
    userId: 'user-1',
    data: {
      profileId: 'invited-profile-1',
      position: 'CTO',
      equity: 10,
    },
  };

  it('should use $transaction for equity check + invitation creation', async () => {
    const mockInvitation = { id: 'inv-1', equity: 10 };

    prisma.$transaction.mockImplementation(async (cb: any) => {
      const tx = {
        startupMember: {
          findMany: jest.fn().mockResolvedValue([{ equity: 50 }]),
        },
        startupInvitation: {
          findMany: jest.fn().mockResolvedValue([{ equity: 10 }]),
          create: jest.fn().mockResolvedValue(mockInvitation),
        },
      };
      return cb(tx);
    });

    const result = await handler.execute(baseData);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockInvitation);
  });

  it('should include pending invitations equity in available calculation', async () => {
    prisma.$transaction.mockImplementation(async (cb: any) => {
      const tx = {
        startupMember: {
          findMany: jest.fn().mockResolvedValue([{ equity: 60 }]), // 60% members
        },
        startupInvitation: {
          findMany: jest.fn().mockResolvedValue([{ equity: 25 }]), // 25% pending
          create: jest.fn(),
        },
      };
      return cb(tx);
    });

    // 60% + 25% = 85% taken → only 15% available, requesting 20%
    await expect(
      handler.execute({
        ...baseData,
        data: { ...baseData.data, equity: 20 },
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should allow invitation when enough equity is available', async () => {
    const mockInvitation = { id: 'inv-1', equity: 15 };

    prisma.$transaction.mockImplementation(async (cb: any) => {
      const tx = {
        startupMember: {
          findMany: jest.fn().mockResolvedValue([{ equity: 60 }]), // 60% members
        },
        startupInvitation: {
          findMany: jest.fn().mockResolvedValue([{ equity: 10 }]), // 10% pending
          create: jest.fn().mockResolvedValue(mockInvitation),
        },
      };
      return cb(tx);
    });

    // 60% + 10% = 70% taken → 30% available, requesting 15% → OK
    const result = await handler.execute({
      ...baseData,
      data: { ...baseData.data, equity: 15 },
    });

    expect(result).toEqual(mockInvitation);
  });

  it('should throw NotFoundException if profile not found', async () => {
    prisma.profile.findUnique.mockResolvedValue(null);

    await expect(handler.execute(baseData)).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if user is not admin', async () => {
    startupService.getUserStartups.mockResolvedValue([
      { id: 'startup-1', role: 'MEMBER' },
    ]);

    await expect(handler.execute(baseData)).rejects.toThrow(ForbiddenException);
  });

  it('should throw BadRequestException if 5 pending invitations already exist', async () => {
    startupService.getPendingInvitations.mockResolvedValue(
      Array(5).fill({ id: 'inv', status: 'PENDING' }),
    );

    await expect(handler.execute(baseData)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should block race condition: exactly 100% should be allowed', async () => {
    const mockInvitation = { id: 'inv-1', equity: 20 };

    prisma.$transaction.mockImplementation(async (cb: any) => {
      const tx = {
        startupMember: {
          findMany: jest
            .fn()
            .mockResolvedValue([{ equity: 50 }, { equity: 30 }]), // 80%
        },
        startupInvitation: {
          findMany: jest.fn().mockResolvedValue([]), // 0% pending
          create: jest.fn().mockResolvedValue(mockInvitation),
        },
      };
      return cb(tx);
    });

    // 80% + 0% = 80% taken → 20% available, requesting exactly 20% → OK
    const result = await handler.execute({
      ...baseData,
      data: { ...baseData.data, equity: 20 },
    });

    expect(result).toEqual(mockInvitation);
  });

  it('should reject if equity would exceed 100%', async () => {
    prisma.$transaction.mockImplementation(async (cb: any) => {
      const tx = {
        startupMember: {
          findMany: jest
            .fn()
            .mockResolvedValue([{ equity: 50 }, { equity: 30 }]), // 80%
        },
        startupInvitation: {
          findMany: jest.fn().mockResolvedValue([]), // 0% pending
          create: jest.fn(),
        },
      };
      return cb(tx);
    });

    // 80% + 0% = 80% taken → 20% available, requesting 21% → REJECT
    await expect(
      handler.execute({
        ...baseData,
        data: { ...baseData.data, equity: 21 },
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
