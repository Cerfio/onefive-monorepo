import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminInvitationStatus, Prisma } from '@prisma/client';
import { LogService } from 'logstash-winston-3';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReportService } from 'src/report/report.service';
import { Log } from 'src/common/logger/logger.decorator';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ADMIN_PERMISSIONS, AdminPermissionKey } from './admin.constants';

type AdminUserWithRoles = Prisma.AdminUserGetPayload<{
  include: {
    roles: {
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true;
              };
            };
          };
        };
      };
    };
  };
}>;

@Injectable()
export class AdminService implements OnModuleInit {
  private readonly sessionDurationMs = 7 * 24 * 60 * 60 * 1000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly reportService: ReportService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.ensureSystemRbac();
    await this.ensureBootstrapSuperAdmin();
  }

  private buildFullName(firstName?: string | null, lastName?: string | null) {
    return `${firstName ?? ''} ${lastName ?? ''}`.trim();
  }

  @Log()
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password.concat(process.env.KEY_AUTHENTICATION), 10);
  }

  @Log()
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(
      password.concat(process.env.KEY_AUTHENTICATION),
      hash,
    );
  }

  @Log()
  async ensureSystemRbac(): Promise<void> {
    const permissions = Object.values(ADMIN_PERMISSIONS);

    await this.prisma.adminPermission.createMany({
      data: permissions.map((key) => ({ key, description: key })),
      skipDuplicates: true,
    });

    const superAdminRole = await this.prisma.adminRole.upsert({
      where: { key: 'SUPERADMIN' },
      update: { name: 'Superadmin' },
      create: {
        key: 'SUPERADMIN',
        name: 'Superadmin',
        description: 'Access to all admin features',
        isSystem: true,
      },
    });

    const moderatorRole = await this.prisma.adminRole.upsert({
      where: { key: 'MODERATOR' },
      update: { name: 'Moderator' },
      create: {
        key: 'MODERATOR',
        name: 'Moderator',
        description: 'Can moderate content and manage waitlist',
        isSystem: true,
      },
    });

    const allPermissions = await this.prisma.adminPermission.findMany({
      where: { key: { in: permissions } },
      select: { id: true, key: true },
    });

    await this.prisma.adminRolePermission.createMany({
      data: allPermissions.map((permission) => ({
        roleId: superAdminRole.id,
        permissionId: permission.id,
      })),
      skipDuplicates: true,
    });

    const moderatorPermissionKeys: AdminPermissionKey[] = [
      ADMIN_PERMISSIONS.ADMIN_USERS_READ,
      ADMIN_PERMISSIONS.ADMIN_CONTENT_MODERATE,
      ADMIN_PERMISSIONS.ADMIN_WAITLIST_MANAGE,
      ADMIN_PERMISSIONS.ADMIN_SPOTLIGHT_MANAGE,
      ADMIN_PERMISSIONS.ADMIN_NEWSLETTER_MANAGE,
    ];

    const moderatorPermissions = allPermissions.filter((permission) =>
      moderatorPermissionKeys.includes(permission.key as AdminPermissionKey),
    );

    await this.prisma.adminRolePermission.createMany({
      data: moderatorPermissions.map((permission) => ({
        roleId: moderatorRole.id,
        permissionId: permission.id,
      })),
      skipDuplicates: true,
    });
  }

  @Log()
  async ensureBootstrapSuperAdmin(): Promise<void> {
    const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim();

    if (!email || !password) {
      return;
    }

    const existing = await this.prisma.adminUser.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return;
    }

    const superAdminRole = await this.prisma.adminRole.findUnique({
      where: { key: 'SUPERADMIN' },
      select: { id: true },
    });

    if (!superAdminRole) {
      return;
    }

    const hashedPassword = await this.hashPassword(password);

    const adminUser = await this.prisma.adminUser.create({
      data: {
        email,
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        isSuperAdmin: true,
      },
      select: { id: true },
    });

    await this.prisma.adminUserRole.create({
      data: {
        adminUserId: adminUser.id,
        roleId: superAdminRole.id,
      },
    });
  }

  @Log()
  async getAdminUserByEmail(email: string): Promise<AdminUserWithRoles | null> {
    return this.prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });
  }

  @Log()
  async getAdminUserById(
    adminUserId: string,
  ): Promise<AdminUserWithRoles | null> {
    return this.prisma.adminUser.findUnique({
      where: { id: adminUserId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });
  }

  @Log()
  async createAdminSession({
    adminUserId,
    userAgent,
    ipAddress,
  }: {
    adminUserId: string;
    userAgent?: string;
    ipAddress?: string;
  }) {
    const token = crypto.randomBytes(48).toString('hex');
    return this.prisma.adminSession.create({
      data: {
        adminUserId,
        token,
        userAgent: userAgent ?? '',
        ipAddress: ipAddress ?? '',
        expiresAt: new Date(Date.now() + this.sessionDurationMs),
      },
      select: {
        token: true,
        expiresAt: true,
      },
    });
  }

  @Log()
  async getAdminSessionByToken(token: string) {
    return this.prisma.adminSession.findUnique({
      where: { token },
      include: {
        adminUser: {
          include: {
            roles: {
              include: {
                role: {
                  include: {
                    permissions: {
                      include: { permission: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  @Log()
  async getAdminSessionForAudit(token: string) {
    return this.prisma.adminSession.findUnique({
      where: { token },
      select: {
        id: true,
        adminUserId: true,
        isRevoked: true,
        expiresAt: true,
        createdAt: true,
        lastUsage: true,
        ipAddress: true,
        userAgent: true,
      },
    });
  }

  extractPermissionsFromAdmin(adminUser: AdminUserWithRoles): string[] {
    const permissions = new Set<string>();
    for (const role of adminUser.roles) {
      for (const rolePermission of role.role.permissions) {
        permissions.add(rolePermission.permission.key);
      }
    }
    return Array.from(permissions);
  }

  @Log()
  async validateAdminToken(token: string) {
    const session = await this.getAdminSessionByToken(token);
    if (!session || session.isRevoked) {
      throw new UnauthorizedException('Invalid admin session');
    }

    if (session.expiresAt.getTime() < Date.now()) {
      await this.prisma.adminSession.update({
        where: { id: session.id },
        data: { isRevoked: true },
      });
      throw new UnauthorizedException('Admin session expired');
    }

    if (!session.adminUser.isActive) {
      throw new ForbiddenException('Admin account disabled');
    }

    await this.prisma.adminSession.update({
      where: { id: session.id },
      data: { lastUsage: new Date() },
    });

    const permissions = this.extractPermissionsFromAdmin(session.adminUser);
    return {
      adminUser: session.adminUser,
      permissions,
    };
  }

  @Log()
  async revokeAdminSession(token: string): Promise<void> {
    await this.prisma.adminSession.updateMany({
      where: { token, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  @Log()
  async createAuditLog({
    adminUserId,
    action,
    resourceType,
    resourceId,
    metadata,
    ipAddress,
    userAgent,
  }: {
    adminUserId?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    metadata?: Prisma.InputJsonValue;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.prisma.adminAuditLog.create({
      data: {
        adminUserId,
        action,
        resourceType,
        resourceId,
        metadata,
        ipAddress,
        userAgent,
      },
    });
  }

  @Log()
  async requireSuperAdmin(adminUserId: string): Promise<void> {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: adminUserId },
      select: { isSuperAdmin: true },
    });
    if (!admin?.isSuperAdmin) {
      throw new ForbiddenException('Superadmin required');
    }
  }

  @Log()
  async createInvitation({
    adminUserId,
    email,
    roleKey,
  }: {
    adminUserId: string;
    email: string;
    roleKey: string;
  }) {
    const role = await this.prisma.adminRole.findUnique({
      where: { key: roleKey },
      select: { id: true, key: true },
    });

    if (!role) {
      throw new NotFoundException('Admin role not found');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingAdmin = await this.prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingAdmin) {
      throw new BadRequestException('Admin user already exists');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const invitation = await this.prisma.adminInvitation.create({
      data: {
        email: normalizedEmail,
        roleId: role.id,
        token,
        invitedById: adminUserId,
        expiresAt,
      },
      select: {
        id: true,
        email: true,
        token: true,
        expiresAt: true,
        role: { select: { key: true, name: true } },
      },
    });

    return invitation;
  }

  @Log()
  async acceptInvitation({
    token,
    password,
    firstName,
    lastName,
  }: {
    token: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    const invitation = await this.prisma.adminInvitation.findUnique({
      where: { token },
      include: {
        role: true,
      },
    });

    if (!invitation || invitation.status !== AdminInvitationStatus.PENDING) {
      throw new BadRequestException('Invalid invitation');
    }

    if (invitation.expiresAt.getTime() < Date.now()) {
      await this.prisma.adminInvitation.update({
        where: { id: invitation.id },
        data: { status: AdminInvitationStatus.EXPIRED },
      });
      throw new BadRequestException('Invitation expired');
    }

    const hashedPassword = await this.hashPassword(password);

    const result = await this.prisma.$transaction(async (tx) => {
      const created = await tx.adminUser.create({
        data: {
          email: invitation.email,
          password: hashedPassword,
          firstName: firstName?.trim() || null,
          lastName: lastName?.trim() || null,
          isSuperAdmin: invitation.role.key === 'SUPERADMIN',
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isSuperAdmin: true,
        },
      });

      await tx.adminUserRole.create({
        data: {
          adminUserId: created.id,
          roleId: invitation.roleId,
        },
      });

      await tx.adminInvitation.update({
        where: { id: invitation.id },
        data: {
          status: AdminInvitationStatus.ACCEPTED,
          acceptedById: created.id,
        },
      });

      return created;
    });

    return result;
  }

  private buildDateFilter(
    dateFrom?: string,
    dateTo?: string,
  ): { gte?: Date; lte?: Date } | undefined {
    if (!dateFrom && !dateTo) return undefined;
    const filter: { gte?: Date; lte?: Date } = {};
    if (dateFrom) filter.gte = new Date(dateFrom);
    if (dateTo) filter.lte = new Date(dateTo);
    return filter;
  }

  @Log()
  async listUsers({
    search,
    skip,
    take,
    dateFrom,
    dateTo,
  }: {
    search?: string;
    skip: number;
    take: number;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const dateFilter = this.buildDateFilter(dateFrom, dateTo);
    const where: Prisma.UserWhereInput = {
      ...(dateFilter ? { createdAt: dateFilter } : {}),
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              {
                profile: {
                  OR: [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                  ],
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          email: true,
          isEmailVerified: true,
          isBanned: true,
          createdAt: true,
          profile: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              waitlistStatus: true,
              avatarId: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total };
  }

  @Log()
  async getUserDetail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        isEmailVerified: true,
        isBanned: true,
        authType: true,
        phoneNumber: true,
        createdAt: true,
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            gender: true,
            dateOfBirth: true,
            countryCode: true,
            city: true,
            bio: true,
            highlight: true,
            skills: true,
            roles: true,
            ecosystemRoles: true,
            avatarId: true,
            linkedinUrl: true,
            waitlistStatus: true,
            activatedAt: true,
            isAmbassador: true,
            referralCode: true,
            showInLeaderboard: true,
            createdAt: true,
            referrer: {
              select: { id: true, firstName: true, lastName: true },
            },
            referredBy: {
              select: { id: true, firstName: true, lastName: true },
              take: 20,
            },
            posts: {
              select: {
                id: true,
                content: true,
                isHidden: true,
                createdAt: true,
                _count: { select: { comments: true, reactions: true } },
              },
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
            discussions: {
              select: {
                id: true,
                question: true,
                isHidden: true,
                createdAt: true,
                _count: { select: { answers: true, upvotes: true } },
              },
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
            postComments: {
              select: {
                id: true,
                content: true,
                createdAt: true,
                post: { select: { id: true, content: true } },
                _count: { select: { reactions: true, replies: true } },
              },
              orderBy: { createdAt: 'desc' },
              take: 20,
            },
            discussionAnswers: {
              select: {
                id: true,
                content: true,
                createdAt: true,
                discussion: { select: { id: true, question: true } },
                _count: {
                  select: { reactions: true, upvotes: true, replies: true },
                },
              },
              orderBy: { createdAt: 'desc' },
              take: 20,
            },
            startups: {
              select: {
                position: true,
                role: true,
                isFounder: true,
                startup: {
                  select: {
                    id: true,
                    name: true,
                    city: true,
                    countryCode: true,
                    categories: true,
                    tagline: true,
                    logo: true,
                  },
                },
              },
            },
            relationshipRequest: {
              where: { status: 'ACCEPTED' },
              select: {
                accepter: {
                  select: { id: true, firstName: true, lastName: true },
                },
              },
              take: 20,
            },
            relationshipAccepter: {
              where: { status: 'ACCEPTED' },
              select: {
                requester: {
                  select: { id: true, firstName: true, lastName: true },
                },
              },
              take: 20,
            },
            reportsSubmitted: {
              select: {
                id: true,
                resourceType: true,
                resourceId: true,
                reason: true,
                message: true,
                status: true,
                createdAt: true,
              },
              orderBy: { createdAt: 'desc' },
              take: 20,
            },
            feedbackSubmitted: {
              select: {
                id: true,
                type: true,
                message: true,
                url: true,
                status: true,
                createdAt: true,
              },
              orderBy: { createdAt: 'desc' },
              take: 20,
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const reportsReceived = user.profile
      ? await this.reportService.findByProfileTarget({
          transactionId: 'admin',
          profileId: user.profile.id,
          userId: user.id,
          take: 20,
        })
      : [];

    return {
      ...user,
      profile: user.profile ? { ...user.profile, reportsReceived } : null,
    };
  }

  @Log()
  async getUsersForBulkAudit(userIds: string[]) {
    if (userIds.length === 0) {
      return [];
    }

    return this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        email: true,
        isBanned: true,
        isEmailVerified: true,
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            waitlistStatus: true,
            isAmbassador: true,
          },
        },
      },
    });
  }

  @Log()
  async getStartupDetail(startupId: string) {
    const startup = await this.prisma.startup.findUnique({
      where: { id: startupId },
      select: {
        id: true,
        name: true,
        categories: true,
        description: true,
        countryCode: true,
        city: true,
        teamSize: true,
        investorsCount: true,
        partnersCount: true,
        createdAt: true,
        updatedAt: true,
        coverImage: true,
        foundedDate: true,
        linkedin: true,
        logo: true,
        tagline: true,
        website: true,
        members: {
          select: {
            id: true,
            position: true,
            role: true,
            isFounder: true,
            equity: true,
            profile: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                userId: true,
                avatarId: true,
              },
            },
          },
        },
        dataroom: {
          select: {
            id: true,
            _count: { select: { files: true, members: true, groups: true } },
          },
        },
        fundingInfo: {
          select: {
            totalRaised: true,
            lastRound: true,
            investors: true,
            fundraisingType: true,
          },
        },
        _count: {
          select: {
            followedBy: true,
            hiring: true,
            views: true,
          },
        },
      },
    });

    if (!startup) {
      throw new NotFoundException('Startup not found');
    }

    return startup;
  }

  @Log()
  async getPostDetail(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            userId: true,
            avatarId: true,
          },
        },
        repostedPost: {
          select: {
            id: true,
            content: true,
            author: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        comments: {
          where: { parentId: null },
          orderBy: { createdAt: 'desc' },
          take: 50,
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                userId: true,
                avatarId: true,
              },
            },
            _count: { select: { reactions: true, replies: true } },
          },
        },
        reactions: {
          select: { reaction: true },
          take: 500,
        },
        _count: {
          select: {
            comments: true,
            reactions: true,
            views: true,
            reposts: true,
            bookmarks: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  @Log()
  async getDiscussionDetail(discussionId: string) {
    const discussion = await this.prisma.discussion.findUnique({
      where: { id: discussionId },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            userId: true,
            avatarId: true,
          },
        },
        answers: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                userId: true,
                avatarId: true,
              },
            },
            _count: {
              select: { reactions: true, upvotes: true, replies: true },
            },
          },
        },
        reactions: {
          select: { reaction: true },
          take: 500,
        },
        _count: {
          select: {
            answers: true,
            upvotes: true,
            reactions: true,
            views: true,
          },
        },
      },
    });

    if (!discussion) {
      throw new NotFoundException('Discussion not found');
    }

    return discussion;
  }

  @Log()
  async banUser({ userId, isBanned }: { userId: string; isBanned: boolean }) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isBanned },
      select: { id: true, email: true, isBanned: true },
    });
  }

  @Log()
  async deleteUser(userId: string) {
    return this.prisma.user.delete({
      where: { id: userId },
      select: { id: true, email: true },
    });
  }

  async toggleAmbassador({
    userId,
    isAmbassador,
  }: {
    userId: string;
    isAmbassador: boolean;
  }) {
    return this.prisma.profile.update({
      where: { userId },
      data: { isAmbassador },
      select: { id: true, isAmbassador: true },
    });
  }

  async changeWaitlistStatus({
    userId,
    waitlistStatus,
  }: {
    userId: string;
    waitlistStatus: 'WAITING' | 'ACTIVE' | 'IGNORED';
  }) {
    return this.prisma.profile.update({
      where: { userId },
      data: { waitlistStatus },
      select: { id: true, waitlistStatus: true },
    });
  }

  async verifyEmail(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true },
      select: { id: true, email: true, isEmailVerified: true },
    });
  }

  @Log()
  async listWaitlist({
    skip,
    take,
    search,
  }: {
    skip: number;
    take: number;
    search?: string;
  }) {
    const where: Prisma.ProfileWhereInput = {
      waitlistStatus: 'WAITING',
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { user: { email: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.profile.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        skip,
        take,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarId: true,
          referralCode: true,
          createdAt: true,
          user: {
            select: { id: true, email: true },
          },
        },
      }),
      this.prisma.profile.count({ where }),
    ]);

    return { items, total };
  }

  @Log()
  async getProfileWithUserForAudit(profileId: string): Promise<{
    profileId: string;
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        user: { select: { id: true, email: true } },
      },
    });
    if (!profile) return null;
    return {
      profileId: profile.id,
      userId: profile.user.id,
      email: profile.user.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
    };
  }

  @Log()
  async ignoreWaitlistEntry(profileId: string): Promise<void> {
    await this.prisma.profile.update({
      where: { id: profileId },
      data: { waitlistStatus: 'IGNORED' },
    });
  }

  @Log()
  async bulkAcceptWaitlist(count: number): Promise<{
    acceptedIds: string[];
    acceptedProfiles: Array<{
      profileId: string;
      userId: string;
      email: string;
      firstName: string;
      lastName: string;
    }>;
  }> {
    const profiles = await this.prisma.profile.findMany({
      where: { waitlistStatus: 'WAITING' },
      orderBy: { createdAt: 'asc' },
      take: count,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        user: { select: { id: true, email: true } },
      },
    });

    const acceptedProfiles = profiles.map((p) => ({
      profileId: p.id,
      userId: p.user.id,
      email: p.user.email,
      firstName: p.firstName,
      lastName: p.lastName,
    }));

    return {
      acceptedIds: profiles.map((p) => p.id),
      acceptedProfiles,
    };
  }

  @Log()
  async listPosts({
    skip,
    take,
    search,
  }: {
    skip: number;
    take: number;
    search?: string;
  }) {
    const where: Prisma.PostWhereInput | undefined = search
      ? {
          OR: [
            { content: { contains: search, mode: 'insensitive' } },
            {
              author: {
                OR: [
                  { firstName: { contains: search, mode: 'insensitive' } },
                  { lastName: { contains: search, mode: 'insensitive' } },
                ],
              },
            },
          ],
        }
      : undefined;

    const [items, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          profileId: true,
          content: true,
          isHidden: true,
          createdAt: true,
          author: {
            select: { firstName: true, lastName: true, avatarId: true },
          },
          _count: {
            select: {
              comments: true,
              reactions: true,
            },
          },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    return { items, total };
  }

  @Log()
  async listDiscussions({
    skip,
    take,
    search,
  }: {
    skip: number;
    take: number;
    search?: string;
  }) {
    const where: Prisma.DiscussionWhereInput | undefined = search
      ? {
          OR: [
            { question: { contains: search, mode: 'insensitive' } },
            {
              author: {
                OR: [
                  { firstName: { contains: search, mode: 'insensitive' } },
                  { lastName: { contains: search, mode: 'insensitive' } },
                ],
              },
            },
          ],
        }
      : undefined;

    const [items, total] = await Promise.all([
      this.prisma.discussion.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          profileId: true,
          question: true,
          isHidden: true,
          createdAt: true,
          author: {
            select: { firstName: true, lastName: true, avatarId: true },
          },
          _count: {
            select: {
              answers: true,
              upvotes: true,
            },
          },
        },
      }),
      this.prisma.discussion.count({ where }),
    ]);

    return { items, total };
  }

  private readonly spotIncludeRelations = {
    accelerator: { include: { prices: { include: { plan: true } } } },
    contest: { include: { prices: { include: { plan: true } } } },
    event: { include: { prices: { include: { plan: true } } } },
    incubator: { include: { prices: { include: { plan: true } } } },
    coworkingSpace: {
      include: { prices: { include: { plan: true } }, openingHours: true },
    },
  };

  @Log()
  async listSpotlight({ skip, take }: { skip: number; take: number }) {
    const [items, total] = await Promise.all([
      this.prisma.spot.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: this.spotIncludeRelations,
      }),
      this.prisma.spot.count(),
    ]);

    return { items, total };
  }

  @Log()
  async getSpotForAudit(spotId: string): Promise<{
    spotType: string;
    name: string | null;
    description: string | null;
    highlight: string | null;
    address: string | null;
    url: string | null;
    image: string | null;
    provider: string | null;
  } | null> {
    const spot = await this.prisma.spot.findUnique({
      where: { id: spotId },
      select: {
        spot: true,
        name: true,
        description: true,
        highlight: true,
        address: true,
        url: true,
        image: true,
        provider: true,
      },
    });
    if (!spot) return null;
    return {
      spotType: spot.spot,
      name: spot.name,
      description: spot.description,
      highlight: spot.highlight,
      address: spot.address,
      url: spot.url,
      image: spot.image,
      provider: spot.provider,
    };
  }

  @Log()
  async getSpotlight(id: string) {
    return this.prisma.spot.findUniqueOrThrow({
      where: { id },
      include: this.spotIncludeRelations,
    });
  }

  @Log()
  async listStartups({
    skip,
    take,
    search,
  }: {
    skip: number;
    take: number;
    search?: string;
  }) {
    const where: Prisma.StartupWhereInput | undefined = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { tagline: { contains: search, mode: 'insensitive' } },
            { city: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined;

    const [items, total] = await Promise.all([
      this.prisma.startup.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          name: true,
          city: true,
          countryCode: true,
          categories: true,
          teamSize: true,
          tagline: true,
          logo: true,
          createdAt: true,
        },
      }),
      this.prisma.startup.count({ where }),
    ]);

    return { items, total };
  }

  @Log()
  async getPostForAudit(postId: string): Promise<{
    profileId: string;
    contentPreview: string;
    isHidden: boolean;
  } | null> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { profileId: true, content: true, isHidden: true },
    });
    if (!post) return null;
    return {
      profileId: post.profileId,
      contentPreview: post.content?.slice(0, 100) ?? '',
      isHidden: post.isHidden,
    };
  }

  @Log()
  async getDiscussionForAudit(discussionId: string): Promise<{
    profileId: string;
    questionPreview: string;
    isHidden: boolean;
  } | null> {
    const discussion = await this.prisma.discussion.findUnique({
      where: { id: discussionId },
      select: { profileId: true, question: true, isHidden: true },
    });
    if (!discussion) return null;
    return {
      profileId: discussion.profileId,
      questionPreview: discussion.question?.slice(0, 100) ?? '',
      isHidden: discussion.isHidden,
    };
  }

  @Log()
  async hidePost(postId: string, isHidden: boolean) {
    return this.prisma.post.update({
      where: { id: postId },
      data: { isHidden },
      select: { id: true, isHidden: true },
    });
  }

  @Log()
  async hideDiscussion(discussionId: string, isHidden: boolean) {
    return this.prisma.discussion.update({
      where: { id: discussionId },
      data: { isHidden },
      select: { id: true, isHidden: true },
    });
  }

  @Log()
  async bulkBanUsers(userIds: string[], isBanned: boolean) {
    return this.prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: { isBanned },
    });
  }

  @Log()
  async bulkDeleteUsers(userIds: string[]) {
    return this.prisma.user.deleteMany({
      where: { id: { in: userIds } },
    });
  }

  @Log()
  async exportUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        isEmailVerified: true,
        isBanned: true,
        createdAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            city: true,
            countryCode: true,
            waitlistStatus: true,
          },
        },
      },
    });
  }

  @Log()
  async exportWaitlist() {
    return this.prisma.profile.findMany({
      where: { waitlistStatus: 'WAITING' },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        user: { select: { email: true } },
      },
    });
  }

  @Log()
  async exportAuditLogs() {
    return this.prisma.adminAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5000,
      select: {
        id: true,
        action: true,
        resourceType: true,
        resourceId: true,
        metadata: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        adminUser: {
          select: { email: true, firstName: true, lastName: true },
        },
      },
    });
  }

  @Log()
  async updateAdminProfile({
    adminUserId,
    firstName,
    lastName,
    currentPassword,
    newPassword,
  }: {
    adminUserId: string;
    firstName?: string;
    lastName?: string;
    currentPassword?: string;
    newPassword?: string;
  }) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: adminUserId },
      select: { id: true, password: true },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    const data: { firstName?: string; lastName?: string; password?: string } =
      {};

    if (firstName !== undefined) data.firstName = firstName.trim() || null;
    if (lastName !== undefined) data.lastName = lastName.trim() || null;

    if (newPassword && currentPassword) {
      const valid = await this.comparePassword(currentPassword, admin.password);
      if (!valid) {
        throw new BadRequestException('Current password is incorrect');
      }
      data.password = await this.hashPassword(newPassword);
    }

    return this.prisma.adminUser.update({
      where: { id: adminUserId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });
  }

  @Log()
  async deleteStartup(startupId: string) {
    return this.prisma.startup.delete({
      where: { id: startupId },
      select: {
        id: true,
        name: true,
        tagline: true,
        description: true,
        categories: true,
        countryCode: true,
        city: true,
        website: true,
        linkedin: true,
        logo: true,
        coverImage: true,
        teamSize: true,
        investorsCount: true,
        partnersCount: true,
      },
    });
  }

  @Log()
  async listAdminUsers({ skip, take }: { skip: number; take: number }) {
    const [items, total] = await Promise.all([
      this.prisma.adminUser.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          roles: {
            include: {
              role: {
                select: { id: true, key: true, name: true },
              },
            },
          },
        },
      }),
      this.prisma.adminUser.count(),
    ]);

    return { items, total };
  }

  @Log()
  async listRoles() {
    return this.prisma.adminRole.findMany({
      orderBy: { key: 'asc' },
      select: {
        id: true,
        key: true,
        name: true,
        description: true,
        isSystem: true,
      },
    });
  }

  @Log()
  async setAdminRole({
    adminUserId,
    roleKey,
  }: {
    adminUserId: string;
    roleKey: string;
  }) {
    const role = await this.prisma.adminRole.findUnique({
      where: { key: roleKey.trim().toUpperCase() },
      select: { id: true, key: true },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.adminUserRole.deleteMany({ where: { adminUserId } });
      await tx.adminUserRole.create({
        data: {
          adminUserId,
          roleId: role.id,
        },
      });
      await tx.adminUser.update({
        where: { id: adminUserId },
        data: { isSuperAdmin: role.key === 'SUPERADMIN' },
      });
    });

    return this.getAdminUserById(adminUserId);
  }

  @Log()
  async setAdminSuperAdmin({
    adminUserId,
    isSuperAdmin,
  }: {
    adminUserId: string;
    isSuperAdmin: boolean;
  }) {
    const targetRoleKey = isSuperAdmin ? 'SUPERADMIN' : 'MODERATOR';
    await this.setAdminRole({ adminUserId, roleKey: targetRoleKey });
    return this.prisma.adminUser.update({
      where: { id: adminUserId },
      data: { isSuperAdmin },
      select: {
        id: true,
        email: true,
        isSuperAdmin: true,
      },
    });
  }

  @Log()
  async setAdminActive({
    adminUserId,
    isActive,
  }: {
    adminUserId: string;
    isActive: boolean;
  }) {
    const updated = await this.prisma.adminUser.update({
      where: { id: adminUserId },
      data: { isActive },
      select: { id: true, email: true, isActive: true },
    });

    if (!isActive) {
      await this.prisma.adminSession.updateMany({
        where: { adminUserId, isRevoked: false },
        data: { isRevoked: true },
      });
    }

    return updated;
  }

  @Log()
  async listAdminInvitations({ skip, take }: { skip: number; take: number }) {
    const [items, total] = await Promise.all([
      this.prisma.adminInvitation.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          email: true,
          token: true,
          status: true,
          expiresAt: true,
          createdAt: true,
          role: {
            select: { key: true, name: true },
          },
        },
      }),
      this.prisma.adminInvitation.count(),
    ]);

    return { items, total };
  }

  @Log()
  async getAdminInvitationForAuditById(invitationId: string) {
    return this.prisma.adminInvitation.findUnique({
      where: { id: invitationId },
      select: {
        id: true,
        email: true,
        status: true,
        expiresAt: true,
        createdAt: true,
        role: {
          select: {
            key: true,
            name: true,
          },
        },
        invitedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        acceptedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  @Log()
  async getAdminInvitationForAuditByToken(token: string) {
    return this.prisma.adminInvitation.findUnique({
      where: { token },
      select: {
        id: true,
        email: true,
        status: true,
        expiresAt: true,
        createdAt: true,
        role: {
          select: {
            key: true,
            name: true,
          },
        },
        invitedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        acceptedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  @Log()
  async revokeInvitation(invitationId: string) {
    return this.prisma.adminInvitation.update({
      where: { id: invitationId },
      data: { status: AdminInvitationStatus.REVOKED },
      select: {
        id: true,
        email: true,
        status: true,
      },
    });
  }

  @Log()
  async listAuditLogs({
    skip,
    take,
    search,
    resourceType,
  }: {
    skip: number;
    take: number;
    search?: string;
    resourceType?: string;
  }) {
    const where: Prisma.AdminAuditLogWhereInput = {
      ...(resourceType ? { resourceType } : {}),
      ...(search
        ? {
            OR: [
              { action: { contains: search, mode: 'insensitive' } },
              {
                adminUser: {
                  OR: [
                    { email: { contains: search, mode: 'insensitive' } },
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                  ],
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.adminAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          action: true,
          resourceType: true,
          resourceId: true,
          metadata: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,
          adminUser: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.adminAuditLog.count({ where }),
    ]);

    return { items, total };
  }

  @Log()
  async getAuditLogDetail(auditLogId: string) {
    const auditLog = await this.prisma.adminAuditLog.findUniqueOrThrow({
      where: { id: auditLogId },
      select: {
        id: true,
        action: true,
        resourceType: true,
        resourceId: true,
        metadata: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        adminUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const [resourcePreview, acceptedProfilesPreview] = await Promise.all([
      this.fetchAuditLogResourcePreview(
        auditLog.resourceType,
        auditLog.resourceId,
      ),
      this.fetchAcceptedProfilesPreview(auditLog.metadata),
    ]);

    return {
      ...auditLog,
      resourcePreview,
      acceptedProfilesPreview,
    };
  }

  private async fetchAcceptedProfilesPreview(
    metadata: Prisma.JsonValue | null,
  ) {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      return [];
    }

    const acceptedProfiles = (
      metadata as {
        acceptedProfiles?: Array<{
          profileId: string;
          userId?: string;
          email?: string;
          firstName?: string;
          lastName?: string;
        }>;
      }
    ).acceptedProfiles;

    if (!acceptedProfiles?.length) {
      return [];
    }

    const profileIds = acceptedProfiles
      .map((profile) => profile.profileId)
      .filter(Boolean);

    const profiles = await this.prisma.profile.findMany({
      where: { id: { in: profileIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarId: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    const profilesById = new Map(
      profiles.map((profile) => [profile.id, profile]),
    );

    return acceptedProfiles.map((profile) => {
      const dbProfile = profilesById.get(profile.profileId);
      return {
        profileId: profile.profileId,
        userId: dbProfile?.user.id ?? profile.userId ?? null,
        email: dbProfile?.user.email ?? profile.email ?? null,
        firstName: dbProfile?.firstName ?? profile.firstName ?? null,
        lastName: dbProfile?.lastName ?? profile.lastName ?? null,
        avatarId: dbProfile?.avatarId ?? null,
      };
    });
  }

  private async fetchAuditLogResourcePreview(
    resourceType: string,
    resourceId?: string | null,
  ) {
    if (!resourceId) {
      return null;
    }

    switch (resourceType) {
      case 'user':
        return this.prisma.user.findUnique({
          where: { id: resourceId },
          select: {
            id: true,
            email: true,
            isBanned: true,
            isEmailVerified: true,
            profile: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarId: true,
                waitlistStatus: true,
              },
            },
          },
        });
      case 'profile':
        return this.prisma.profile.findUnique({
          where: { id: resourceId },
          select: {
            id: true,
            userId: true,
            firstName: true,
            lastName: true,
            avatarId: true,
            waitlistStatus: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        });
      case 'post':
        return this.prisma.post.findUnique({
          where: { id: resourceId },
          select: {
            id: true,
            content: true,
            isHidden: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                userId: true,
                firstName: true,
                lastName: true,
                avatarId: true,
              },
            },
          },
        });
      case 'discussion':
        return this.prisma.discussion.findUnique({
          where: { id: resourceId },
          select: {
            id: true,
            question: true,
            content: true,
            isHidden: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                userId: true,
                firstName: true,
                lastName: true,
                avatarId: true,
              },
            },
          },
        });
      case 'startup':
        return this.prisma.startup.findUnique({
          where: { id: resourceId },
          select: {
            id: true,
            name: true,
            tagline: true,
            city: true,
            countryCode: true,
            logo: true,
          },
        });
      case 'spotlight':
        return this.prisma.spot.findUnique({
          where: { id: resourceId },
          select: {
            id: true,
            name: true,
            spot: true,
            provider: true,
            highlight: true,
            image: true,
            url: true,
          },
        });
      case 'admin_user':
        return this.prisma.adminUser.findUnique({
          where: { id: resourceId },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isActive: true,
            isSuperAdmin: true,
          },
        });
      case 'admin_invitation':
        return this.prisma.adminInvitation.findUnique({
          where: { id: resourceId },
          select: {
            id: true,
            email: true,
            status: true,
            expiresAt: true,
            role: {
              select: {
                key: true,
                name: true,
              },
            },
          },
        });
      case 'report':
        return this.reportService.findById({
          transactionId: 'admin-audit',
          reportId: resourceId,
        });
      case 'feedback':
        return this.prisma.feedback.findUnique({
          where: { id: resourceId },
          select: {
            id: true,
            type: true,
            status: true,
            message: true,
            url: true,
            resolvedAt: true,
            createdAt: true,
            reporter: {
              select: {
                id: true,
                userId: true,
                firstName: true,
                lastName: true,
                avatarId: true,
              },
            },
          },
        });
      default:
        return null;
    }
  }

  @Log()
  async getDashboardStats() {
    const [
      users,
      waitlist,
      posts,
      discussions,
      startups,
      datarooms,
      spots,
      pendingReports,
      pendingFeedback,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.profile.count({ where: { waitlistStatus: 'WAITING' } }),
      this.prisma.post.count(),
      this.prisma.discussion.count(),
      this.prisma.startup.count(),
      this.prisma.dataroom.count(),
      this.prisma.spot.count(),
      this.prisma.report.count({ where: { status: 'PENDING' } }),
      this.prisma.feedback.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      users,
      waitlist,
      posts,
      discussions,
      startups,
      datarooms,
      spots,
      pendingReports,
      pendingFeedback,
    };
  }

  @Log()
  async listDatarooms({ skip, take }: { skip: number; take: number }) {
    const [items, total] = await Promise.all([
      this.prisma.dataroom.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          createdAt: true,
          startup: {
            select: {
              id: true,
              name: true,
              city: true,
              countryCode: true,
            },
          },
          _count: {
            select: {
              files: true,
              members: true,
              groups: true,
            },
          },
        },
      }),
      this.prisma.dataroom.count(),
    ]);

    return { items, total };
  }
}
