import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { PrismaService } from '../../prisma/prisma.service';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let prisma: jest.Mocked<PrismaService>;
  let mockGetRequest: jest.Mock;
  let mockExecutionContext: ExecutionContext;

  beforeEach(async () => {
    const mockPrisma = {
      profile: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminGuard,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    guard = module.get<AdminGuard>(AdminGuard);
    prisma = module.get(PrismaService);

    mockGetRequest = jest.fn();
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: mockGetRequest,
      }),
    } as unknown as ExecutionContext;
  });

  describe('canActivate', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should allow access for ADMIN role', async () => {
      // ✅ Test : Accès autorisé pour rôle ADMIN
      const mockRequest = {
        user: { id: 'user-123' },
      };

      const mockProfile = {
        userId: 'user-123',
        roles: ['ADMIN'],
      };

      mockGetRequest.mockReturnValue(mockRequest);
      (prisma.profile.findUnique as jest.Mock).mockResolvedValue(
        mockProfile as any,
      );

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(prisma.profile.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        select: { roles: true },
      });
    });

    it('should allow access for SUPER_ADMIN role', async () => {
      // ✅ Test : Accès autorisé pour rôle SUPER_ADMIN
      const mockRequest = {
        user: { id: 'user-123' },
      };

      const mockProfile = {
        userId: 'user-123',
        roles: ['SUPER_ADMIN'],
      };

      mockGetRequest.mockReturnValue(mockRequest);
      (prisma.profile.findUnique as jest.Mock).mockResolvedValue(
        mockProfile as any,
      );

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should allow access for OWNER role', async () => {
      // ✅ Test : Accès autorisé pour rôle OWNER
      const mockRequest = {
        user: { id: 'user-123' },
      };

      const mockProfile = {
        userId: 'user-123',
        roles: ['OWNER'],
      };

      mockGetRequest.mockReturnValue(mockRequest);
      (prisma.profile.findUnique as jest.Mock).mockResolvedValue(
        mockProfile as any,
      );

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should allow access for multiple admin roles', async () => {
      // ✅ Test : Accès autorisé pour plusieurs rôles admin
      const mockRequest = {
        user: { id: 'user-123' },
      };

      const mockProfile = {
        userId: 'user-123',
        roles: ['USER', 'ADMIN', 'MODERATOR'],
      };

      mockGetRequest.mockReturnValue(mockRequest);
      (prisma.profile.findUnique as jest.Mock).mockResolvedValue(
        mockProfile as any,
      );

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should deny access for non-admin roles', async () => {
      // ✅ Test : Accès refusé pour rôles non-admin
      const mockRequest = {
        user: { id: 'user-123' },
      };

      const mockProfile = {
        userId: 'user-123',
        roles: ['USER', 'MODERATOR'],
      };

      mockGetRequest.mockReturnValue(mockRequest);
      (prisma.profile.findUnique as jest.Mock).mockResolvedValue(
        mockProfile as any,
      );

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.profile.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        select: { roles: true },
      });
    });

    it('should deny access for empty roles', async () => {
      // ✅ Test : Accès refusé pour rôles vides
      const mockRequest = {
        user: { id: 'user-123' },
      };

      const mockProfile = {
        userId: 'user-123',
        roles: [],
      };

      mockGetRequest.mockReturnValue(mockRequest);
      (prisma.profile.findUnique as jest.Mock).mockResolvedValue(
        mockProfile as any,
      );

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException when user not authenticated', async () => {
      // ✅ Test : Exception quand utilisateur non authentifié
      const mockRequest = {};

      mockGetRequest.mockReturnValue(mockRequest);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.profile.findUnique).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user id is null', async () => {
      // ✅ Test : Exception quand user ID est null
      const mockRequest = {
        user: { id: null },
      };

      mockGetRequest.mockReturnValue(mockRequest);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.profile.findUnique).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user id is undefined', async () => {
      // ✅ Test : Exception quand user ID est undefined
      const mockRequest = {
        user: { id: undefined },
      };

      mockGetRequest.mockReturnValue(mockRequest);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.profile.findUnique).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when profile not found', async () => {
      // ✅ Test : Exception quand profil non trouvé
      const mockRequest = {
        user: { id: 'user-123' },
      };

      mockGetRequest.mockReturnValue(mockRequest);
      (prisma.profile.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.profile.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        select: { roles: true },
      });
    });

    it('should handle database errors gracefully', async () => {
      // ✅ Test : Gestion des erreurs de base de données
      const mockRequest = {
        user: { id: 'user-123' },
      };

      mockGetRequest.mockReturnValue(mockRequest);
      (prisma.profile.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle case sensitivity in roles', async () => {
      // ✅ Test : Sensibilité à la casse dans les rôles
      const mockRequest = {
        user: { id: 'user-123' },
      };

      const mockProfile = {
        userId: 'user-123',
        roles: ['admin', 'ADMIN', 'Admin'], // Différentes casse
      };

      mockGetRequest.mockReturnValue(mockRequest);
      (prisma.profile.findUnique as jest.Mock).mockResolvedValue(
        mockProfile as any,
      );

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should handle roles with extra spaces', async () => {
      // ✅ Test : Rôles avec espaces supplémentaires - strict equality means spaces cause rejection
      const mockRequest = {
        user: { id: 'user-123' },
      };

      const mockProfile = {
        userId: 'user-123',
        roles: [' ADMIN ', ' USER '], // Espaces supplémentaires
      };

      mockGetRequest.mockReturnValue(mockRequest);
      (prisma.profile.findUnique as jest.Mock).mockResolvedValue(
        mockProfile as any,
      );

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('Security Edge Cases', () => {
    it('should handle very long user IDs', async () => {
      // ✅ Test : User IDs très longs
      const longUserId = 'a'.repeat(1000);
      const mockRequest = {
        user: { id: longUserId },
      };

      const mockProfile = {
        userId: longUserId,
        roles: ['ADMIN'],
      };

      mockGetRequest.mockReturnValue(mockRequest);
      (prisma.profile.findUnique as jest.Mock).mockResolvedValue(
        mockProfile as any,
      );

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(prisma.profile.findUnique).toHaveBeenCalledWith({
        where: { userId: longUserId },
        select: { roles: true },
      });
    });

    it('should handle special characters in user IDs', async () => {
      // ✅ Test : Caractères spéciaux dans user IDs
      const specialUserId = 'user-123!@#$%^&*()';
      const mockRequest = {
        user: { id: specialUserId },
      };

      const mockProfile = {
        userId: specialUserId,
        roles: ['ADMIN'],
      };

      mockGetRequest.mockReturnValue(mockRequest);
      (prisma.profile.findUnique as jest.Mock).mockResolvedValue(
        mockProfile as any,
      );

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should handle concurrent admin checks', async () => {
      // ✅ Test : Vérifications admin concurrentes
      const mockRequest = {
        user: { id: 'user-123' },
      };

      const mockProfile = {
        userId: 'user-123',
        roles: ['ADMIN'],
      };

      mockGetRequest.mockReturnValue(mockRequest);
      (prisma.profile.findUnique as jest.Mock).mockResolvedValue(
        mockProfile as any,
      );

      // Simuler plusieurs vérifications concurrentes
      const promises = Array(10)
        .fill(null)
        .map(() => guard.canActivate(mockExecutionContext));
      const results = await Promise.all(promises);

      expect(results.every((result) => result === true)).toBe(true);
      expect(prisma.profile.findUnique).toHaveBeenCalledTimes(10);
    });

    it('should handle null roles gracefully', async () => {
      // ✅ Test : Gestion des rôles null - null.some() throws TypeError
      const mockRequest = {
        user: { id: 'user-123' },
      };

      const mockProfile = {
        userId: 'user-123',
        roles: null,
      };

      mockGetRequest.mockReturnValue(mockRequest);
      (prisma.profile.findUnique as jest.Mock).mockResolvedValue(
        mockProfile as any,
      );

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow();
    });

    it('should handle undefined roles gracefully', async () => {
      // ✅ Test : Gestion des rôles undefined - undefined.some() throws TypeError
      const mockRequest = {
        user: { id: 'user-123' },
      };

      const mockProfile = {
        userId: 'user-123',
        roles: undefined,
      };

      mockGetRequest.mockReturnValue(mockRequest);
      (prisma.profile.findUnique as jest.Mock).mockResolvedValue(
        mockProfile as any,
      );

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow();
    });
  });

  describe('Role Validation Logic', () => {
    it('should correctly identify admin roles', async () => {
      // ✅ Test : Identification correcte des rôles admin
      const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'OWNER'];

      for (const role of adminRoles) {
        const mockRequest = {
          user: { id: 'user-123' },
        };

        const mockProfile = {
          userId: 'user-123',
          roles: [role],
        };

        mockGetRequest.mockReturnValue(mockRequest);
        (prisma.profile.findUnique as jest.Mock).mockResolvedValue(
          mockProfile as any,
        );

        const result = await guard.canActivate(mockExecutionContext);
        expect(result).toBe(true);
      }
    });

    it('should correctly reject non-admin roles', async () => {
      // ✅ Test : Rejet correct des rôles non-admin
      const nonAdminRoles = ['USER', 'MODERATOR', 'GUEST', 'VIEWER', 'EDITOR'];

      for (const role of nonAdminRoles) {
        const mockRequest = {
          user: { id: 'user-123' },
        };

        const mockProfile = {
          userId: 'user-123',
          roles: [role],
        };

        mockGetRequest.mockReturnValue(mockRequest);
        (prisma.profile.findUnique as jest.Mock).mockResolvedValue(
          mockProfile as any,
        );

        await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
          ForbiddenException,
        );
      }
    });
  });
});
