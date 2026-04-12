import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CreateFounderHandler } from './create-founder.handler';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../../notification/notification.service';
import { ProfileRelationshipsService } from '../../profile-relationships/profile-relationships.service';
import { EmailService } from '../../email/email.service';
import { StartupMemberRoleType } from '@prisma/client';

describe('CreateFounderHandler', () => {
  let handler: CreateFounderHandler;
  let prisma: any;

  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    startAction: jest.fn().mockReturnValue({ transactionId: 'test-tx' }),
    endAction: jest.fn(),
  };

  const mockNotificationService = {
    create: jest.fn().mockResolvedValue(undefined),
  };

  const mockProfileRelationshipsService = {
    connectProfile: jest.fn().mockResolvedValue(undefined),
  };

  const mockEmailService = {
    sendEmail: jest.fn().mockResolvedValue(undefined),
  };

  // ---- shared fixtures -------------------------------------------------------
  const STARTUP_ID = 'startup-1';
  const USER_ID = 'user-1';
  const ADMIN_PROFILE_ID = 'profile-admin';
  const NEW_PROFILE_ID = 'profile-new';
  const EXISTING_PROFILE_ID = 'profile-existing';

  const adminMember = {
    id: 'member-admin',
    profileId: ADMIN_PROFILE_ID,
    startupId: STARTUP_ID,
    role: StartupMemberRoleType.SUPER_ADMIN,
    equity: 0,
    profile: { userId: USER_ID },
  };

  const basePayload = {
    position: 'CTO',
    equity: 10,
    role: StartupMemberRoleType.ADMIN,
  };

  const baseArgs = {
    transactionId: 'tx-1',
    userId: USER_ID,
    startupId: STARTUP_ID,
  };

  // ---------------------------------------------------------------------------

  beforeEach(async () => {
    const mockPrisma = {
      startupMember: {
        findFirst: jest.fn().mockResolvedValue(adminMember),
        findMany: jest.fn().mockResolvedValue([adminMember]),
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'new-member' }),
      },
      startupInvitation: {
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockResolvedValue({ id: 'inv-1' }),
      },
      startup: {
        update: jest
          .fn()
          .mockResolvedValue({ id: STARTUP_ID, name: 'Test Startup' }),
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: STARTUP_ID, name: 'Test Startup' }),
      },
      profile: {
        findUnique: jest.fn().mockResolvedValue({
          id: NEW_PROFILE_ID,
          firstName: 'Jane',
          lastName: 'Doe',
          user: { email: 'jane@example.com' },
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateFounderHandler,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationService, useValue: mockNotificationService },
        {
          provide: ProfileRelationshipsService,
          useValue: mockProfileRelationshipsService,
        },
        { provide: EmailService, useValue: mockEmailService },
        { provide: 'Logger', useValue: mockLogger },
      ],
    }).compile();

    handler = module.get<CreateFounderHandler>(CreateFounderHandler);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => jest.clearAllMocks());

  // ===========================================================================
  // PERMISSIONS
  // ===========================================================================

  describe('permissions', () => {
    it('should throw ForbiddenException when user is not a member', async () => {
      prisma.startupMember.findFirst.mockResolvedValue(null);

      await expect(
        handler.execute({
          ...baseArgs,
          payload: { ...basePayload, profileId: NEW_PROFILE_ID },
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when user is a MEMBER (not admin)', async () => {
      prisma.startupMember.findFirst.mockResolvedValue({
        ...adminMember,
        role: StartupMemberRoleType.MEMBER,
      });

      await expect(
        handler.execute({
          ...baseArgs,
          payload: { ...basePayload, profileId: NEW_PROFILE_ID },
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when user is a MODERATOR', async () => {
      prisma.startupMember.findFirst.mockResolvedValue({
        ...adminMember,
        role: StartupMemberRoleType.MODERATOR,
      });

      await expect(
        handler.execute({
          ...baseArgs,
          payload: { ...basePayload, profileId: NEW_PROFILE_ID },
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow ADMIN to add a founder', async () => {
      prisma.startupMember.findFirst.mockResolvedValue({
        ...adminMember,
        role: StartupMemberRoleType.ADMIN,
      });

      const result = await handler.execute({
        ...baseArgs,
        payload: { ...basePayload, profileId: NEW_PROFILE_ID },
      });

      expect(result.status).toBe('ADDED');
    });
  });

  // ===========================================================================
  // EQUITY VALIDATION — NEW MEMBER (no existing equity to exclude)
  // ===========================================================================

  describe('equity validation — new member', () => {
    it('should add a new founder when enough equity is available', async () => {
      // current members: admin (0%) + another (60%) → 60% used
      prisma.startupMember.findMany.mockResolvedValue([
        { ...adminMember, equity: 0 },
        {
          id: 'member-other',
          profileId: 'other',
          startupId: STARTUP_ID,
          equity: 60,
        },
      ]);

      const result = await handler.execute({
        ...baseArgs,
        payload: { ...basePayload, profileId: NEW_PROFILE_ID, equity: 40 },
      });

      expect(result.status).toBe('ADDED');
    });

    it('should allow exactly 100% total equity', async () => {
      // current: 60% + pending: 20% → 80% used; requesting 20% → total exactly 100%
      prisma.startupMember.findMany.mockResolvedValue([
        { ...adminMember, equity: 60 },
      ]);
      prisma.startupInvitation.findMany.mockResolvedValue([{ equity: 20 }]);

      const result = await handler.execute({
        ...baseArgs,
        payload: { ...basePayload, profileId: NEW_PROFILE_ID, equity: 20 },
      });

      expect(result.status).toBe('ADDED');
    });

    it('should reject when adding a new member would exceed 100%', async () => {
      // current: 85% used; requesting 20% → 105% → reject
      prisma.startupMember.findMany.mockResolvedValue([
        { ...adminMember, equity: 85 },
      ]);

      await expect(
        handler.execute({
          ...baseArgs,
          payload: { ...basePayload, profileId: NEW_PROFILE_ID, equity: 20 },
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should count pending invitations equity in the total', async () => {
      // current: 60% + pending: 30% = 90% used; requesting 15% → 105% → reject
      prisma.startupMember.findMany.mockResolvedValue([
        { ...adminMember, equity: 60 },
      ]);
      prisma.startupInvitation.findMany.mockResolvedValue([{ equity: 30 }]);

      await expect(
        handler.execute({
          ...baseArgs,
          payload: { ...basePayload, profileId: NEW_PROFILE_ID, equity: 15 },
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ===========================================================================
  // EQUITY VALIDATION — EXISTING MEMBER (the core bug fix)
  // ===========================================================================

  describe('equity validation — existing member (update scenario)', () => {
    beforeEach(() => {
      // Simulate: EXISTING_PROFILE_ID is already a member with 85% equity
      prisma.startupMember.findMany.mockResolvedValue([
        { ...adminMember, equity: 0 },
        {
          id: 'member-existing',
          profileId: EXISTING_PROFILE_ID,
          startupId: STARTUP_ID,
          equity: 85,
        },
      ]);
      // Profile lookup returns a valid profile
      prisma.profile.findUnique.mockResolvedValue({
        id: EXISTING_PROFILE_ID,
        firstName: 'Mark',
        lastName: 'Zuckerberg',
        user: { email: 'mark@meta.com' },
      });
      // The "already a member" check uses startupMember.findUnique
      prisma.startupMember.findUnique.mockResolvedValue({
        id: 'member-existing',
        profileId: EXISTING_PROFILE_ID,
      });
    });

    it('should allow increasing equity to 100% for an existing member (the bug fix)', async () => {
      // Without the fix: 85 (existing) + 0 (pending) + 100 (payload) = 185 → BAD
      // With the fix:    (85 - 85) + 0 (pending) + 100 (payload) = 100 → OK
      // Note: the "already member" check will block the CREATE, but equity validation passes
      const result = await handler
        .execute({
          ...baseArgs,
          payload: {
            ...basePayload,
            profileId: EXISTING_PROFILE_ID,
            equity: 100,
          },
        })
        .catch((err) => {
          // The member already exists, so "already a member" will throw.
          // What matters is that it is NOT a BadRequestException about equity.
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.message).toBe('User is already a member of this startup');
          return null;
        });

      // If we reach this point without the equity error, the test passed
      if (result !== null) {
        // Should not happen (member exists), but equity check passed
        expect(true).toBe(true);
      }
    });

    it('equity error message should not appear when existing member tries to go to 100%', async () => {
      let thrownError: any = null;
      try {
        await handler.execute({
          ...baseArgs,
          payload: {
            ...basePayload,
            profileId: EXISTING_PROFILE_ID,
            equity: 100,
          },
        });
      } catch (err) {
        thrownError = err;
      }

      // The error MUST NOT be the equity-exceeded error
      expect(thrownError).not.toBeNull();
      expect(thrownError.message).not.toMatch(/Total equity cannot exceed/);
      // It must be the "already a member" error instead
      expect(thrownError.message).toBe(
        'User is already a member of this startup',
      );
    });

    it('should reject when the NEW equity truly exceeds 100% (even after excluding existing)', async () => {
      // existing member has 85% equity, other member has 20% equity
      // total = 0 + 85 + 20 = 105%, but without existing member's equity:
      // effectiveTotal = (105 - 85) + 0 + 101 = 121% → reject
      prisma.startupMember.findMany.mockResolvedValue([
        { ...adminMember, equity: 0 },
        {
          id: 'member-existing',
          profileId: EXISTING_PROFILE_ID,
          startupId: STARTUP_ID,
          equity: 85,
        },
        {
          id: 'member-other',
          profileId: 'other-profile',
          startupId: STARTUP_ID,
          equity: 20,
        },
      ]);

      await expect(
        handler.execute({
          ...baseArgs,
          payload: {
            ...basePayload,
            profileId: EXISTING_PROFILE_ID,
            equity: 101,
          },
        }),
      ).rejects.toThrow(BadRequestException);

      // But specifically the equity error, not the "already member" one
      await expect(
        handler.execute({
          ...baseArgs,
          payload: {
            ...basePayload,
            profileId: EXISTING_PROFILE_ID,
            equity: 101,
          },
        }),
      ).rejects.toMatchObject({
        message: expect.stringContaining('Total equity cannot exceed'),
      });
    });

    it('should correctly exclude only the target member equity, not others', async () => {
      // other member B has 20%, existing has 85%, admin has 0% → total 105%
      // effectiveTotal = (105 - 85) + 0 + 80 = 100% → equity check passes
      // Then "already a member" check triggers
      prisma.startupMember.findMany.mockResolvedValue([
        { ...adminMember, equity: 0 },
        {
          id: 'member-existing',
          profileId: EXISTING_PROFILE_ID,
          startupId: STARTUP_ID,
          equity: 85,
        },
        {
          id: 'member-other',
          profileId: 'other-profile',
          startupId: STARTUP_ID,
          equity: 20,
        },
      ]);

      let thrownError: any = null;
      try {
        await handler.execute({
          ...baseArgs,
          payload: {
            ...basePayload,
            profileId: EXISTING_PROFILE_ID,
            equity: 80,
          },
        });
      } catch (err) {
        thrownError = err;
      }

      // equity validation passes → error is "already a member", NOT equity error
      expect(thrownError).not.toBeNull();
      expect(thrownError.message).not.toMatch(/Total equity cannot exceed/);
      expect(thrownError.message).toBe(
        'User is already a member of this startup',
      );
    });
  });

  // ===========================================================================
  // PROFILE VALIDATION
  // ===========================================================================

  describe('profile validation', () => {
    it('should throw NotFoundException when profile does not exist', async () => {
      prisma.profile.findUnique.mockResolvedValue(null);

      await expect(
        handler.execute({
          ...baseArgs,
          payload: { ...basePayload, profileId: 'unknown-profile' },
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when profile is already a member', async () => {
      // findUnique on startupMember returns an existing member
      prisma.startupMember.findUnique.mockResolvedValue({
        id: 'existing-member',
      });

      await expect(
        handler.execute({
          ...baseArgs,
          payload: { ...basePayload, profileId: NEW_PROFILE_ID },
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        handler.execute({
          ...baseArgs,
          payload: { ...basePayload, profileId: NEW_PROFILE_ID },
        }),
      ).rejects.toMatchObject({
        message: 'User is already a member of this startup',
      });
    });
  });

  // ===========================================================================
  // SUCCESSFUL CREATION — profileId path
  // ===========================================================================

  describe('successful founder creation (profileId)', () => {
    it('should create the member and return ADDED status', async () => {
      const result = await handler.execute({
        ...baseArgs,
        payload: { ...basePayload, profileId: NEW_PROFILE_ID },
      });

      expect(result.status).toBe('ADDED');
      expect(prisma.startupMember.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            profileId: NEW_PROFILE_ID,
            isFounder: true,
            equity: basePayload.equity,
          }),
        }),
      );
    });

    it('should update the startup updatedAt timestamp', async () => {
      await handler.execute({
        ...baseArgs,
        payload: { ...basePayload, profileId: NEW_PROFILE_ID },
      });

      expect(prisma.startup.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: STARTUP_ID } }),
      );
    });

    it('should send a notification to the new founder', async () => {
      await handler.execute({
        ...baseArgs,
        payload: { ...basePayload, profileId: NEW_PROFILE_ID },
      });

      expect(mockNotificationService.create).toHaveBeenCalledWith(
        expect.objectContaining({ profileId: NEW_PROFILE_ID }),
      );
    });
  });

  // ===========================================================================
  // EMAIL INVITATION path
  // ===========================================================================

  describe('email invitation path', () => {
    const emailPayload = {
      position: 'CEO',
      equity: 15,
      role: StartupMemberRoleType.ADMIN,
      email: 'new.founder@example.com',
      firstName: 'Alice',
      lastName: 'Martin',
    };

    beforeEach(() => {
      // For the email path, requester profile must be findable
      prisma.profile.findUnique.mockResolvedValue({
        id: ADMIN_PROFILE_ID,
        firstName: 'Admin',
        lastName: 'User',
      });
    });

    it('should create an invitation and return INVITED status', async () => {
      const result = await handler.execute({
        ...baseArgs,
        payload: emailPayload,
      });

      expect(result.status).toBe('INVITED');
      expect(prisma.startupInvitation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: emailPayload.email,
            equity: emailPayload.equity,
            status: 'PENDING',
          }),
        }),
      );
    });

    it('should send the invitation email', async () => {
      await handler.execute({ ...baseArgs, payload: emailPayload });

      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: emailPayload.email,
          type: 'founder-invitation',
        }),
      );
    });

    it('should not throw if the email send fails', async () => {
      mockEmailService.sendEmail.mockRejectedValueOnce(new Error('SMTP error'));

      await expect(
        handler.execute({ ...baseArgs, payload: emailPayload }),
      ).resolves.toMatchObject({ status: 'INVITED' });
    });

    it('should throw if startup not found', async () => {
      prisma.startup.findUnique.mockResolvedValueOnce(null);

      await expect(
        handler.execute({ ...baseArgs, payload: emailPayload }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================================================
  // MISSING profileId AND email
  // ===========================================================================

  it('should throw BadRequestException when neither profileId nor email is provided', async () => {
    await expect(
      handler.execute({
        ...baseArgs,
        payload: { position: 'CTO', equity: 10 } as any,
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
