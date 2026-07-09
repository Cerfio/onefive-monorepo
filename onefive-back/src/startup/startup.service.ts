import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { Prisma, StartupMemberRoleType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LogService } from 'logstash-winston-3';
import { Log } from '../common/logger/logger.decorator';
import {
  StartupAlreadyExistsException,
  StartupGetException,
  StartupUpdateException,
  StartupUnauthorizedException,
  StartupNotFoundException,
  InvestorInvitationNotFoundException,
  InvestorInvitationExpiredException,
  InvestorInvitationAlreadyRespondedException,
} from './startup.exception';
import { DataroomHandler } from '../dataroom/handlers/dataroom.handler';

@Injectable()
export class StartupService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
    private readonly dataroomHandler: DataroomHandler,
  ) {}

  @Log()
  async create({
    transactionId,
    userId,
    data,
  }: {
    transactionId: string;
    userId: string;
    data: Prisma.StartupCreateInput & {
      invitations?: Array<{
        profileId?: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        position: string;
        equity: number;
        message?: string;
      }>;
    };
  }) {
    try {
      // Récupérer le profileId depuis le userId
      const profile = await this.prisma.profile.findUnique({
        where: { userId },
        select: {
          id: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      });

      if (!profile) {
        throw new NotFoundException('Profile not found for user');
      }

      const profileId = profile.id;

      // Vérifier que l'utilisateur n'a pas déjà atteint la limite de 5 startups
      const userStartupsCount = await this.prisma.startupMember.count({
        where: {
          profileId,
          role: StartupMemberRoleType.SUPER_ADMIN,
        },
      });

      if (userStartupsCount >= 5) {
        throw new StartupAlreadyExistsException(
          this.logger,
          {
            transactionId,
            userId,
            currentCount: userStartupsCount,
          },
          `Vous avez atteint la limite de 5 startups. Vous possédez actuellement ${userStartupsCount} startup(s).`,
        );
      }

      const normalizedCreatorEmail = profile.user.email.trim().toLowerCase();

      const validInvitations = (data.invitations || []).filter((invitation) => {
        if (!invitation.profileId && !invitation.email) {
          return false;
        }

        if (invitation.profileId && invitation.profileId === profileId) {
          return false;
        }

        if (
          invitation.email &&
          invitation.email.trim().toLowerCase() === normalizedCreatorEmail
        ) {
          return false;
        }

        return true;
      });

      if (
        data.invitations &&
        validInvitations.length !== data.invitations.length
      ) {
        this.logger.warn(
          'Self or invalid invitations were ignored on startup creation',
          {
            transactionId,
            userId,
            removedCount: data.invitations.length - validInvitations.length,
          },
        );
      }

      // Calculer les parts totales demandées
      const requestedEquity = validInvitations.reduce(
        (sum, inv) => sum + inv.equity,
        0,
      );

      // Vérifier que les parts ne dépassent pas 100%
      if (requestedEquity > 100) {
        throw new BadRequestException('Total equity cannot exceed 100%');
      }

      // Extraire invitations du data pour éviter de les passer à Prisma
      const { invitations: _ignoredInvitations, ...startupData } = data;

      // Créer la startup avec le créateur comme SUPER_ADMIN
      const startup = await this.prisma.startup.create({
        data: {
          ...startupData,
          foundedDate: startupData.foundedDate
            ? new Date(startupData.foundedDate)
            : undefined,
          members: {
            create: {
              profileId: profileId,
              role: StartupMemberRoleType.SUPER_ADMIN,
              position: 'Founder',
              equity: 100 - requestedEquity, // Parts restantes pour le créateur
            },
          },
        },
      });

      // Créer les invitations si fournies (createMany pour performance)
      if (validInvitations.length > 0) {
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours
        const invitationData = validInvitations.map((invitation) => ({
          startupId: startup.id,
          invitedById: profileId,
          status: 'PENDING' as const,
          expiresAt,
          position: invitation.position,
          equity: invitation.equity,
          message: invitation.message,
          ...(invitation.profileId && {
            invitedProfileId: invitation.profileId,
          }),
          ...(!invitation.profileId &&
            invitation.email && {
              email: invitation.email,
              firstName: invitation.firstName,
              lastName: invitation.lastName,
            }),
        }));
        await this.prisma.startupInvitation.createMany({
          data: invitationData,
        });
      }

      // Créer automatiquement la dataroom pour la startup
      try {
        await this.dataroomHandler.create({
          startupId: startup.id,
          createdBy: profileId,
          transactionId,
        });
        this.logger.info('Dataroom created automatically for startup', {
          transactionId,
          startupId: startup.id,
          profileId,
        });
      } catch (error) {
        // Log l'erreur mais ne fait pas échouer la création de la startup
        // La dataroom pourra être créée manuellement plus tard si nécessaire
        this.logger.error(
          'Failed to create dataroom automatically for startup',
          {
            transactionId,
            startupId: startup.id,
            profileId,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        );
      }

      return startup;
    } catch (error: unknown) {
      this.logger.error('Failed to create startup', {
        transactionId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  @Log()
  async getUserStartups(userId: string) {
    // Récupérer le profileId depuis le userId
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      return [];
    }

    const profileId = profile.id;

    return this.getStartupsByProfileId(profileId);
  }

  @Log()
  async getStartupsByProfileId(profileId: string) {
    const memberships = await this.prisma.startupMember.findMany({
      where: { profileId },
      include: {
        startup: {
          include: {
            _count: {
              select: {
                members: true,
                followedBy: true,
              },
            },
          },
        },
      },
    });

    return memberships.map((membership) => ({
      id: membership.startup.id,
      name: membership.startup.name,
      tagline:
        membership.startup.tagline ||
        membership.startup.description ||
        'Startup en développement',
      logo: membership.startup.logo || null,
      coverImage: membership.startup.coverImage || null,
      location: `${membership.startup.city}, ${membership.startup.countryCode}`,
      role: membership.role,
      position: membership.position,
      equity: membership.equity,
      membersCount: membership.startup._count.members,
      followersCount: membership.startup._count.followedBy,
      createdAt: membership.startup.createdAt.toISOString(),
    }));
  }

  @Log()
  async searchProfiles({
    query,
    limit = 5,
    excludeUserId,
  }: {
    query: string;
    limit?: number;
    excludeUserId?: string;
  }) {
    if (query.length < 2) return [];

    return this.prisma.profile.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { highlight: { contains: query, mode: 'insensitive' } },
        ],
        ...(excludeUserId && { id: { not: excludeUserId } }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        highlight: true,
        countryCode: true,
      },
      take: limit,
    });
  }

  @Log()
  async createInvitation({
    transactionId,
    startupId,
    invitedById,
    data,
  }: {
    transactionId: string;
    startupId: string;
    invitedById: string; // profileId
    data: {
      profileId?: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      position: string;
      equity: number;
      message?: string;
      expiresAt: Date;
    };
  }) {
    try {
      return await this.prisma.startupInvitation.create({
        data: {
          startupId,
          invitedById,
          status: 'PENDING',
          expiresAt: data.expiresAt,
          position: data.position,
          equity: data.equity,
          message: data.message,
          ...(data.profileId && { invitedProfileId: data.profileId }),
          ...(!data.profileId &&
            data.email && {
              email: data.email,
              firstName: data.firstName,
              lastName: data.lastName,
            }),
        },
      });
    } catch (error: unknown) {
      this.logger.error('Failed to create invitation', {
        transactionId,
        startupId,
        invitedById,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  @Log()
  async getPendingInvitations(startupId: string) {
    return this.prisma.startupInvitation.findMany({
      where: {
        startupId,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
      include: {
        invitedProfile: true,
        invitedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  @Log()
  async getStartupMembersEquity(startupId: string): Promise<number> {
    const members = await this.prisma.startupMember.findMany({
      where: { startupId },
      select: { equity: true },
    });

    return members.reduce((total, member) => total + member.equity, 0);
  }

  @Log()
  async getStartupInvitations(userId: string) {
    // Récupérer le profileId depuis le userId
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      return [];
    }

    const profileId = profile.id;

    return this.prisma.startupInvitation.findMany({
      where: {
        OR: [
          { invitedProfileId: profileId },
          { email: { in: await this.getUserEmails(userId) } },
        ],
      },
      include: {
        startup: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        invitedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        invitedProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Log()
  async respondToInvitation({
    transactionId,
    invitationId,
    userId,
    action,
  }: {
    transactionId: string;
    invitationId: string;
    userId: string;
    action: 'accept' | 'decline';
  }) {
    try {
      // Récupérer le profileId depuis le userId
      const profile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!profile) {
        throw new NotFoundException('Profile not found for user');
      }

      const profileId = profile.id;

      // Vérifier que l'invitation existe et est pour cet utilisateur
      const invitation = await this.prisma.startupInvitation.findUnique({
        where: { id: invitationId },
        include: { startup: true },
      });

      if (!invitation || invitation.status !== 'PENDING') {
        throw new NotFoundException('Invalid invitation');
      }

      if (invitation.invitedProfileId !== profileId) {
        throw new ForbiddenException('Invitation not for this user');
      }

      if (invitation.expiresAt < new Date()) {
        throw new BadRequestException('Invitation expired');
      }

      if (action === 'accept') {
        // Vérifier que l'utilisateur n'est pas déjà membre
        const existingMember = await this.prisma.startupMember.findUnique({
          where: {
            profileId_startupId: {
              profileId: profileId,
              startupId: invitation.startupId,
            },
          },
        });

        if (existingMember) {
          throw new ConflictException(
            'User is already a member of this startup',
          );
        }

        // Créer le membre
        await this.prisma.startupMember.create({
          data: {
            profileId: profileId,
            startupId: invitation.startupId,
            role: invitation.role,
            position: invitation.position,
            equity: invitation.equity,
            invitationId: invitationId,
          },
        });
      }

      // Mettre à jour l'invitation
      return this.prisma.startupInvitation.update({
        where: { id: invitationId },
        data: {
          status: action === 'accept' ? 'ACCEPTED' : 'DECLINED',
          respondedAt: new Date(),
          respondedById: profileId,
        },
      });
    } catch (error: unknown) {
      this.logger.error('Failed to respond to invitation', {
        transactionId,
        invitationId,
        userId,
        action,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  @Log()
  async get({
    transactionId,
    where,
    select,
  }: {
    transactionId: string;
    where: Prisma.StartupWhereUniqueInput;
    select?: Prisma.StartupSelect;
  }) {
    try {
      const result = await this.prisma.startup.findUnique({
        where,
        select,
      });

      return result;
    } catch (error: unknown) {
      StartupGetException.throw(this.logger, {
        transactionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Log()
  async update({
    transactionId,
    startupId,
    userId,
    data,
  }: {
    transactionId: string;
    startupId: string;
    userId: string;
    data: Prisma.StartupUpdateInput;
  }) {
    try {
      // Récupérer le profileId depuis le userId
      const profile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!profile) {
        throw new NotFoundException('Profile not found for user');
      }

      const profileId = profile.id;

      // Vérifier que l'utilisateur est membre avec les droits d'édition (SUPER_ADMIN ou ADMIN)
      const member = await this.prisma.startupMember.findUnique({
        where: {
          profileId_startupId: {
            profileId,
            startupId,
          },
        },
        select: { role: true },
      });

      if (
        !member ||
        (member.role !== 'SUPER_ADMIN' && member.role !== 'ADMIN')
      ) {
        StartupUnauthorizedException.throw(this.logger, {
          transactionId,
          startupId,
          userId,
        });
      }

      // Préparer les données de mise à jour
      const updateData: Prisma.StartupUpdateInput = { ...data };

      // Convertir foundedDate en Date si fourni (peut être string ou Date)
      if (data.foundedDate !== undefined) {
        if (typeof data.foundedDate === 'string') {
          updateData.foundedDate = new Date(data.foundedDate);
        } else if (data.foundedDate instanceof Date) {
          updateData.foundedDate = data.foundedDate;
        } else if (data.foundedDate === null) {
          updateData.foundedDate = null;
        }
      }

      const startup = await this.prisma.startup.update({
        where: { id: startupId },
        data: updateData,
      });

      return startup;
    } catch (error: unknown) {
      if (error instanceof Error && error.name?.includes('Exception')) {
        throw error; // Relancer l'exception custom
      }
      StartupUpdateException.throw(this.logger, {
        transactionId,
        startupId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Log()
  async getOrCreateDataroom({
    transactionId,
    startupId,
    userId,
  }: {
    transactionId: string;
    startupId: string;
    userId: string;
  }) {
    try {
      // Récupérer le profileId depuis le userId
      const profile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!profile) {
        throw new NotFoundException('Profile not found for user');
      }

      // Chercher le dataroom existant
      let dataroom = await this.prisma.dataroom.findUnique({
        where: { startupId },
      });

      // Créer le dataroom s'il n'existe pas
      if (!dataroom) {
        dataroom = await this.prisma.dataroom.create({
          data: {
            startupId,
            createdBy: profile.id,
          },
        });
      }

      return dataroom;
    } catch (error: unknown) {
      this.logger.error('Failed to get or create dataroom', {
        transactionId,
        startupId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  @Log()
  async getFunding({
    transactionId,
    startupId,
  }: {
    transactionId: string;
    startupId: string;
  }) {
    try {
      const startup = await this.prisma.startup.findUnique({
        where: { id: startupId },
        include: {
          fundingInfo: true,
        },
      });

      if (!startup || !startup.fundingInfo) {
        return {
          totalRaised: '0',
          lastRound: null,
          investors: [],
          fundraisingType: 'none' as const,
        };
      }

      const fundingInfo = startup.fundingInfo;

      const result: any = {
        totalRaised: fundingInfo.totalRaised || '0',
        lastRound: fundingInfo.lastRound || null,
        investors: fundingInfo.investors || [],
        fundraisingType:
          (fundingInfo.fundraisingType as 'structured' | 'rolling' | 'none') ||
          'none',
      };

      if (fundingInfo.fundraisingType === 'structured') {
        result.structuredRound = {
          targetAmount: fundingInfo.structuredTargetAmount || '',
          minTicket: fundingInfo.structuredMinTicket || '',
          instrument: fundingInfo.structuredInstrument || 'SAFE',
          cap: fundingInfo.structuredCap,
          discount: fundingInfo.structuredDiscount,
          deadline: fundingInfo.structuredDeadline || '',
          deckUrl: fundingInfo.structuredDeckUrl,
        };
      }

      if (fundingInfo.fundraisingType === 'rolling') {
        result.rollingInvestment = {
          instrument: fundingInfo.rollingInstrument || 'SAFE',
          cap: fundingInfo.rollingCap,
          discount: fundingInfo.rollingDiscount,
        };
      }

      return result;
    } catch (error: unknown) {
      this.logger.error('Failed to get funding', {
        transactionId,
        startupId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  @Log()
  async updateFunding({
    transactionId,
    startupId,
    userId,
    data,
  }: {
    transactionId: string;
    startupId: string;
    userId: string;
    data: {
      totalRaised?: string;
      lastRound?: string;
      investors?: string[];
      fundraisingType?: string;
      structuredRound?: any;
      rollingInvestment?: any;
    };
  }) {
    try {
      // Récupérer le profileId depuis le userId
      const profile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!profile) {
        throw new NotFoundException('Profile not found for user');
      }

      const profileId = profile.id;

      // Vérifier que l'utilisateur est membre avec les droits d'édition
      const member = await this.prisma.startupMember.findUnique({
        where: {
          profileId_startupId: {
            profileId,
            startupId,
          },
        },
        select: { role: true },
      });

      if (
        !member ||
        (member.role !== 'SUPER_ADMIN' && member.role !== 'ADMIN')
      ) {
        StartupUnauthorizedException.throw(this.logger, {
          transactionId,
          startupId,
          userId,
        });
      }

      // Vérifier que la startup existe
      const startup = await this.prisma.startup.findUnique({
        where: { id: startupId },
        select: { id: true },
      });

      if (!startup) {
        StartupNotFoundException.throw(this.logger, {
          transactionId,
          startupId,
        });
      }

      // Créer ou mettre à jour le fundingInfo
      const fundingInfo = await this.prisma.startupFundingInfo.upsert({
        where: { startupId },
        create: {
          startupId,
          totalRaised: data.totalRaised,
          lastRound: data.lastRound,
          investors: data.investors || [],
          fundraisingType: data.fundraisingType || 'none',
          structuredTargetAmount: data.structuredRound?.targetAmount,
          structuredMinTicket: data.structuredRound?.minTicket,
          structuredInstrument: data.structuredRound?.instrument,
          structuredCap: data.structuredRound?.cap,
          structuredDiscount: data.structuredRound?.discount,
          structuredDeadline: data.structuredRound?.deadline,
          structuredDeckUrl: data.structuredRound?.deckUrl,
          rollingInstrument: data.rollingInvestment?.instrument,
          rollingCap: data.rollingInvestment?.cap,
          rollingDiscount: data.rollingInvestment?.discount,
        },
        update: {
          totalRaised: data.totalRaised,
          lastRound: data.lastRound,
          investors: data.investors || [],
          fundraisingType: data.fundraisingType || 'none',
          structuredTargetAmount: data.structuredRound?.targetAmount,
          structuredMinTicket: data.structuredRound?.minTicket,
          structuredInstrument: data.structuredRound?.instrument,
          structuredCap: data.structuredRound?.cap,
          structuredDiscount: data.structuredRound?.discount,
          structuredDeadline: data.structuredRound?.deadline,
          structuredDeckUrl: data.structuredRound?.deckUrl,
          rollingInstrument: data.rollingInvestment?.instrument,
          rollingCap: data.rollingInvestment?.cap,
          rollingDiscount: data.rollingInvestment?.discount,
        },
      });

      // Retourner les données formatées
      const result: any = {
        totalRaised: fundingInfo.totalRaised || '0',
        lastRound: fundingInfo.lastRound || null,
        investors: fundingInfo.investors || [],
        fundraisingType:
          (fundingInfo.fundraisingType as 'structured' | 'rolling' | 'none') ||
          'none',
      };

      if (fundingInfo.fundraisingType === 'structured') {
        result.structuredRound = {
          targetAmount: fundingInfo.structuredTargetAmount || '',
          minTicket: fundingInfo.structuredMinTicket || '',
          instrument: fundingInfo.structuredInstrument || 'SAFE',
          cap: fundingInfo.structuredCap,
          discount: fundingInfo.structuredDiscount,
          deadline: fundingInfo.structuredDeadline || '',
          deckUrl: fundingInfo.structuredDeckUrl,
        };
      }

      if (fundingInfo.fundraisingType === 'rolling') {
        result.rollingInvestment = {
          instrument: fundingInfo.rollingInstrument || 'SAFE',
          cap: fundingInfo.rollingCap,
          discount: fundingInfo.rollingDiscount,
        };
      }

      return result;
    } catch (error: unknown) {
      if (error instanceof Error && error.name?.includes('Exception')) {
        throw error;
      }
      StartupUpdateException.throw(this.logger, {
        transactionId,
        startupId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Log()
  async getFundingHistory({
    transactionId,
    startupId,
  }: {
    transactionId: string;
    startupId: string;
  }) {
    try {
      const history = await this.prisma.startupFundingHistory.findMany({
        where: { startupId },
        orderBy: { date: 'desc' },
        include: {
          profileInvestors: {
            include: {
              profile: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: {
                    select: {
                      id: true,
                    },
                  },
                  highlight: true,
                  countryCode: true,
                  ecosystemRoles: true,
                  bio: true,
                },
              },
            },
          },
        },
      });

      return history.map((entry) => {
        const combinedInvestors = [
          ...entry.profileInvestors
            .filter((pi: any) => pi.profileId && pi.profile)
            .map((pi: any) => ({
              type: 'person' as const,
              id: pi.profile.id,
              name: `${pi.profile.firstName} ${pi.profile.lastName}`,
              firstName: pi.profile.firstName,
              lastName: pi.profile.lastName,
              avatar: pi.profile.avatar?.id,
              highlight: pi.profile.highlight,
              countryCode: pi.profile.countryCode,
              ecosystemRoles: pi.profile.ecosystemRoles,
              bio: pi.profile.bio,
              invitationStatus: pi.invitationStatus,
              isVisible: pi.isVisible,
            })),
          ...entry.profileInvestors
            .filter((pi: any) => !pi.profileId)
            .map((pi: any) => ({
              type: 'person' as const,
              id: pi.id,
              name: `${pi.firstName} ${pi.lastName}`,
              firstName: pi.firstName,
              lastName: pi.lastName,
              invitationStatus: pi.invitationStatus,
              isVisible: pi.isVisible,
            })),
          ...(Array.isArray(entry.manualInvestors)
            ? (entry.manualInvestors as any[])
            : []),
        ];

        return {
          id: entry.id,
          date: entry.date.toISOString(),
          amountRaised: entry.amountRaised,
          valuation: entry.valuation,
          round: entry.round,
          investors: combinedInvestors,
          leadInvestor: entry.leadInvestorId,
          instrument: entry.instrument,
          notes: entry.notes,
        };
      });
    } catch (error: unknown) {
      this.logger.error('Failed to get funding history', {
        transactionId,
        startupId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  @Log()
  async createFundingHistory({
    transactionId,
    startupId,
    userId,
    data,
  }: {
    transactionId: string;
    startupId: string;
    userId: string;
    data: {
      date: string;
      amountRaised: number;
      valuation?: number;
      round: string;
      investors?: any[];
      leadInvestor?: string;
      instrument?: string;
      notes?: string;
    };
  }) {
    try {
      // Récupérer le profileId depuis le userId
      const profile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!profile) {
        throw new NotFoundException('Profile not found for user');
      }

      const profileId = profile.id;

      // Vérifier que l'utilisateur est membre avec les droits d'édition
      const member = await this.prisma.startupMember.findUnique({
        where: {
          profileId_startupId: {
            profileId,
            startupId,
          },
        },
        select: { role: true },
      });

      if (
        !member ||
        (member.role !== 'SUPER_ADMIN' && member.role !== 'ADMIN')
      ) {
        StartupUnauthorizedException.throw(this.logger, {
          transactionId,
          startupId,
          userId,
        });
      }

      // Vérifier que la startup existe
      const startup = await this.prisma.startup.findUnique({
        where: { id: startupId },
        select: { id: true },
      });

      if (!startup) {
        StartupNotFoundException.throw(this.logger, {
          transactionId,
          startupId,
        });
      }

      // Séparer les investisseurs: profils OneFive, personnes manuelles, entreprises
      const profileInvestorsToCreate: any[] = [];
      const manualPersonInvestorsToCreate: any[] = [];
      const manualCompanyInvestors: any[] = [];

      if (data.investors && data.investors.length > 0) {
        const personInvestors = data.investors.filter(
          (inv) => inv.type === 'person',
        );
        const personIds = personInvestors
          .filter((inv) => !inv.id.startsWith('manual-'))
          .map((inv) => inv.id);

        const existingProfiles =
          personIds.length > 0
            ? await this.prisma.profile.findMany({
                where: { id: { in: personIds } },
                select: { id: true },
              })
            : [];
        const existingProfileIds = new Set(existingProfiles.map((p) => p.id));

        for (const inv of data.investors) {
          if (inv.type === 'person') {
            if (
              !inv.id.startsWith('manual-') &&
              existingProfileIds.has(inv.id)
            ) {
              profileInvestorsToCreate.push(inv);
            } else {
              manualPersonInvestorsToCreate.push(inv);
            }
          } else {
            manualCompanyInvestors.push(inv);
          }
        }
      }

      const historyEntry = await this.prisma.startupFundingHistory.create({
        data: {
          startupId,
          date: new Date(data.date),
          amountRaised: data.amountRaised,
          valuation: data.valuation,
          round: data.round as any,
          manualInvestors:
            manualCompanyInvestors.length > 0
              ? manualCompanyInvestors
              : undefined,
          leadInvestorId: data.leadInvestor,
          instrument: data.instrument,
          notes: data.notes,
          profileInvestors: {
            create: [
              ...profileInvestorsToCreate.map((inv) => ({
                profileId: inv.id,
                isLead: inv.id === data.leadInvestor,
                invitationStatus: 'PENDING' as const,
              })),
              ...manualPersonInvestorsToCreate.map((inv) => ({
                firstName: inv.firstName || inv.name?.split(' ')[0] || '',
                lastName:
                  inv.lastName || inv.name?.split(' ').slice(1).join(' ') || '',
                email: inv.email || null,
                isLead: false,
                invitationStatus: 'PENDING' as const,
                token: crypto.randomUUID(),
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              })),
            ],
          },
        },
        include: {
          startup: { select: { name: true } },
          profileInvestors: {
            include: {
              profile: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: {
                    select: {
                      id: true,
                    },
                  },
                  highlight: true,
                },
              },
            },
          },
        },
      });

      // Recombiner les investisseurs pour le retour
      const combinedInvestors = [
        ...historyEntry.profileInvestors
          .filter((pi) => pi.profileId)
          .map((pi) => ({
            type: 'person' as const,
            id: pi.profile!.id,
            name: `${pi.profile!.firstName} ${pi.profile!.lastName}`,
            firstName: pi.profile!.firstName,
            lastName: pi.profile!.lastName,
            avatar: pi.profile!.avatar?.id,
            highlight: pi.profile!.highlight,
            invitationStatus: pi.invitationStatus,
          })),
        ...historyEntry.profileInvestors
          .filter((pi) => !pi.profileId)
          .map((pi) => ({
            type: 'person' as const,
            id: pi.id,
            name: `${pi.firstName} ${pi.lastName}`,
            firstName: pi.firstName,
            lastName: pi.lastName,
            invitationStatus: pi.invitationStatus,
          })),
        ...(Array.isArray(historyEntry.manualInvestors)
          ? (historyEntry.manualInvestors as any[])
          : []),
      ];

      // Collect data for notifications/emails (returned to handler)
      const newProfileInvestors = historyEntry.profileInvestors
        .filter((pi) => pi.profileId)
        .map((pi) => ({
          investorRecordId: pi.id,
          profileId: pi.profileId!,
        }));

      const newManualPersonInvestors = historyEntry.profileInvestors
        .filter((pi) => !pi.profileId && pi.email)
        .map((pi) => ({
          investorRecordId: pi.id,
          email: pi.email!,
          firstName: pi.firstName,
          lastName: pi.lastName,
          token: pi.token!,
        }));

      return {
        id: historyEntry.id,
        date: historyEntry.date.toISOString(),
        amountRaised: historyEntry.amountRaised,
        valuation: historyEntry.valuation,
        round: historyEntry.round,
        investors: combinedInvestors,
        leadInvestor: historyEntry.leadInvestorId,
        instrument: historyEntry.instrument,
        notes: historyEntry.notes,
        startupName: historyEntry.startup.name,
        _newProfileInvestors: newProfileInvestors,
        _newManualPersonInvestors: newManualPersonInvestors,
      };
    } catch (error: unknown) {
      if (error instanceof Error && error.name?.includes('Exception')) {
        throw error;
      }
      StartupUpdateException.throw(this.logger, {
        transactionId,
        startupId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Log()
  async updateFundingHistory({
    transactionId,
    startupId,
    userId,
    historyId,
    data,
  }: {
    transactionId: string;
    startupId: string;
    userId: string;
    historyId: string;
    data: {
      date?: string;
      amountRaised?: number;
      valuation?: number;
      round?: string;
      investors?: any[];
      leadInvestor?: string;
      instrument?: string;
      notes?: string;
    };
  }) {
    try {
      // Récupérer le profileId depuis le userId
      const profile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!profile) {
        throw new NotFoundException('Profile not found for user');
      }

      const profileId = profile.id;

      // Vérifier que l'utilisateur est membre avec les droits d'édition
      const member = await this.prisma.startupMember.findUnique({
        where: {
          profileId_startupId: {
            profileId,
            startupId,
          },
        },
        select: { role: true },
      });

      if (
        !member ||
        (member.role !== 'SUPER_ADMIN' && member.role !== 'ADMIN')
      ) {
        StartupUnauthorizedException.throw(this.logger, {
          transactionId,
          startupId,
          userId,
        });
      }

      // Vérifier que l'entrée d'historique existe et appartient à la startup
      const existingEntry = await this.prisma.startupFundingHistory.findFirst({
        where: {
          id: historyId,
          startupId,
        },
      });

      if (!existingEntry) {
        StartupNotFoundException.throw(this.logger, {
          transactionId,
          startupId,
        });
      }

      if (data.investors !== undefined) {
        await this.prisma.fundingHistoryInvestor.deleteMany({
          where: { fundingHistoryId: historyId },
        });

        const profileInvestorsToCreate: any[] = [];
        const manualPersonInvestorsToCreate: any[] = [];
        const manualCompanyInvestors: any[] = [];

        const personInvestors = data.investors.filter(
          (inv: { type?: string }) => inv.type === 'person',
        );
        const personIds = personInvestors
          .filter((inv: { id: string }) => !inv.id.startsWith('manual-'))
          .map((inv: { id: string }) => inv.id);

        const existingProfiles =
          personIds.length > 0
            ? await this.prisma.profile.findMany({
                where: { id: { in: personIds } },
                select: { id: true },
              })
            : [];
        const existingProfileIds = new Set(existingProfiles.map((p) => p.id));

        for (const inv of data.investors) {
          if (inv.type === 'person') {
            if (
              !inv.id.startsWith('manual-') &&
              existingProfileIds.has(inv.id)
            ) {
              profileInvestorsToCreate.push(inv);
            } else {
              manualPersonInvestorsToCreate.push(inv);
            }
          } else {
            manualCompanyInvestors.push(inv);
          }
        }

        const historyEntry = await this.prisma.startupFundingHistory.update({
          where: { id: historyId },
          data: {
            ...(data.date && { date: new Date(data.date) }),
            ...(data.amountRaised !== undefined && {
              amountRaised: data.amountRaised,
            }),
            ...(data.valuation !== undefined && { valuation: data.valuation }),
            ...(data.round && { round: data.round as any }),
            manualInvestors:
              manualCompanyInvestors.length > 0
                ? manualCompanyInvestors
                : Prisma.JsonNull,
            ...(data.leadInvestor !== undefined && {
              leadInvestorId: data.leadInvestor,
            }),
            ...(data.instrument !== undefined && {
              instrument: data.instrument,
            }),
            ...(data.notes !== undefined && { notes: data.notes }),
            profileInvestors: {
              create: [
                ...profileInvestorsToCreate.map((inv) => ({
                  profileId: inv.id,
                  isLead: inv.id === data.leadInvestor,
                  invitationStatus: 'PENDING' as const,
                })),
                ...manualPersonInvestorsToCreate.map((inv) => ({
                  firstName: inv.firstName || inv.name?.split(' ')[0] || '',
                  lastName:
                    inv.lastName ||
                    inv.name?.split(' ').slice(1).join(' ') ||
                    '',
                  email: inv.email || null,
                  isLead: false,
                  invitationStatus: 'PENDING' as const,
                  token: crypto.randomUUID(),
                  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                })),
              ],
            },
          },
          include: {
            startup: { select: { name: true } },
            profileInvestors: {
              include: {
                profile: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: {
                      select: {
                        id: true,
                      },
                    },
                    highlight: true,
                  },
                },
              },
            },
          },
        });

        const combinedInvestors = this.combineInvestors(historyEntry);

        return {
          id: historyEntry.id,
          date: historyEntry.date.toISOString(),
          amountRaised: historyEntry.amountRaised,
          valuation: historyEntry.valuation,
          round: historyEntry.round,
          investors: combinedInvestors,
          leadInvestor: historyEntry.leadInvestorId,
          instrument: historyEntry.instrument,
          notes: historyEntry.notes,
        };
      } else {
        const historyEntry = await this.prisma.startupFundingHistory.update({
          where: { id: historyId },
          data: {
            ...(data.date && { date: new Date(data.date) }),
            ...(data.amountRaised !== undefined && {
              amountRaised: data.amountRaised,
            }),
            ...(data.valuation !== undefined && { valuation: data.valuation }),
            ...(data.round && { round: data.round as any }),
            ...(data.leadInvestor !== undefined && {
              leadInvestorId: data.leadInvestor,
            }),
            ...(data.instrument !== undefined && {
              instrument: data.instrument,
            }),
            ...(data.notes !== undefined && { notes: data.notes }),
          },
          include: {
            profileInvestors: {
              include: {
                profile: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: {
                      select: {
                        id: true,
                      },
                    },
                    highlight: true,
                  },
                },
              },
            },
          },
        });

        const combinedInvestors = this.combineInvestors(historyEntry);

        return {
          id: historyEntry.id,
          date: historyEntry.date.toISOString(),
          amountRaised: historyEntry.amountRaised,
          valuation: historyEntry.valuation,
          round: historyEntry.round,
          investors: combinedInvestors,
          leadInvestor: historyEntry.leadInvestorId,
          instrument: historyEntry.instrument,
          notes: historyEntry.notes,
        };
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name?.includes('Exception')) {
        throw error;
      }
      StartupUpdateException.throw(this.logger, {
        transactionId,
        startupId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Log()
  async deleteFundingHistory({
    transactionId,
    startupId,
    userId,
    historyId,
  }: {
    transactionId: string;
    startupId: string;
    userId: string;
    historyId: string;
  }) {
    try {
      // Récupérer le profileId depuis le userId
      const profile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!profile) {
        throw new NotFoundException('Profile not found for user');
      }

      const profileId = profile.id;

      // Vérifier que l'utilisateur est membre avec les droits d'édition
      const member = await this.prisma.startupMember.findUnique({
        where: {
          profileId_startupId: {
            profileId,
            startupId,
          },
        },
        select: { role: true },
      });

      if (
        !member ||
        (member.role !== 'SUPER_ADMIN' && member.role !== 'ADMIN')
      ) {
        StartupUnauthorizedException.throw(this.logger, {
          transactionId,
          startupId,
          userId,
        });
      }

      // Vérifier que l'entrée d'historique existe et appartient à la startup
      const existingEntry = await this.prisma.startupFundingHistory.findFirst({
        where: {
          id: historyId,
          startupId,
        },
      });

      if (!existingEntry) {
        StartupNotFoundException.throw(this.logger, {
          transactionId,
          startupId,
        });
      }

      // Supprimer l'entrée d'historique
      await this.prisma.startupFundingHistory.delete({
        where: { id: historyId },
      });

      return { success: true };
    } catch (error: unknown) {
      if (error instanceof Error && error.name?.includes('Exception')) {
        throw error;
      }
      StartupUpdateException.throw(this.logger, {
        transactionId,
        startupId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private async getUserEmails(userId: string): Promise<string[]> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) return [];

    return [
      profile.firstName.toLowerCase() +
        '.' +
        profile.lastName.toLowerCase() +
        '@onefive.app',
    ];
  }

  private combineInvestors(historyEntry: {
    profileInvestors: any[];
    manualInvestors: any;
  }) {
    return [
      ...historyEntry.profileInvestors
        .filter((pi: any) => pi.profileId && pi.profile)
        .map((pi: any) => ({
          type: 'person' as const,
          id: pi.profile.id,
          name: `${pi.profile.firstName} ${pi.profile.lastName}`,
          firstName: pi.profile.firstName,
          lastName: pi.profile.lastName,
          avatar: pi.profile.avatar?.id,
          highlight: pi.profile.highlight,
          invitationStatus: pi.invitationStatus,
          isVisible: pi.isVisible,
        })),
      ...historyEntry.profileInvestors
        .filter((pi: any) => !pi.profileId)
        .map((pi: any) => ({
          type: 'person' as const,
          id: pi.id,
          name: `${pi.firstName} ${pi.lastName}`,
          firstName: pi.firstName,
          lastName: pi.lastName,
          invitationStatus: pi.invitationStatus,
          isVisible: pi.isVisible,
        })),
      ...(Array.isArray(historyEntry.manualInvestors)
        ? (historyEntry.manualInvestors as any[])
        : []),
    ];
  }

  @Log()
  async respondToInvestorInvitation({
    transactionId,
    userId,
    invitationId,
    action,
  }: {
    transactionId: string;
    userId: string;
    invitationId: string;
    action: 'accept' | 'decline';
  }) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const invitation = await this.prisma.fundingHistoryInvestor.findUnique({
      where: { id: invitationId },
      include: {
        fundingHistory: {
          select: {
            id: true,
            startupId: true,
            startup: { select: { name: true } },
          },
        },
      },
    });

    if (!invitation) {
      InvestorInvitationNotFoundException.throw(this.logger, {
        transactionId,
        invitationId,
      });
      return;
    }

    if (invitation.profileId !== profile.id) {
      throw new ForbiddenException('This invitation does not belong to you');
    }

    if (invitation.invitationStatus !== 'PENDING') {
      InvestorInvitationAlreadyRespondedException.throw(this.logger, {
        transactionId,
        invitationId,
        currentStatus: invitation.invitationStatus,
      });
      return;
    }

    const updated = await this.prisma.fundingHistoryInvestor.update({
      where: { id: invitationId },
      data: {
        invitationStatus: action === 'accept' ? 'ACCEPTED' : 'DECLINED',
        respondedAt: new Date(),
      },
    });

    return {
      id: updated.id,
      invitationStatus: updated.invitationStatus,
      startupName: invitation.fundingHistory.startup.name,
      startupId: invitation.fundingHistory.startupId,
    };
  }

  @Log()
  async respondToInvestorInvitationByToken({
    transactionId,
    userId,
    token,
    action,
  }: {
    transactionId: string;
    userId: string;
    token: string;
    action: 'accept' | 'decline';
  }) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const invitation = await this.prisma.fundingHistoryInvestor.findUnique({
      where: { token },
      include: {
        fundingHistory: {
          select: {
            id: true,
            startupId: true,
            startup: { select: { name: true } },
          },
        },
      },
    });

    if (!invitation) {
      InvestorInvitationNotFoundException.throw(this.logger, {
        transactionId,
        token,
      });
      return;
    }

    if (invitation.invitationStatus !== 'PENDING') {
      InvestorInvitationAlreadyRespondedException.throw(this.logger, {
        transactionId,
        token,
        currentStatus: invitation.invitationStatus,
      });
      return;
    }

    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      InvestorInvitationExpiredException.throw(this.logger, {
        transactionId,
        token,
      });
      return;
    }

    const updated = await this.prisma.fundingHistoryInvestor.update({
      where: { token },
      data: {
        invitationStatus: action === 'accept' ? 'ACCEPTED' : 'DECLINED',
        profileId: action === 'accept' ? profile.id : undefined,
        respondedAt: new Date(),
      },
    });

    return {
      id: updated.id,
      invitationStatus: updated.invitationStatus,
      startupName: invitation.fundingHistory.startup.name,
      startupId: invitation.fundingHistory.startupId,
    };
  }

  @Log()
  async getInvestorInvitationByToken({
    transactionId,
    token,
  }: {
    transactionId: string;
    token: string;
  }) {
    const invitation = await this.prisma.fundingHistoryInvestor.findUnique({
      where: { token },
      include: {
        fundingHistory: {
          select: {
            id: true,
            date: true,
            round: true,
            startupId: true,
            startup: {
              select: { name: true, logo: true },
            },
          },
        },
      },
    });

    if (!invitation) {
      InvestorInvitationNotFoundException.throw(this.logger, {
        transactionId,
        token,
      });
      return;
    }

    return {
      id: invitation.id,
      invitationStatus: invitation.invitationStatus,
      firstName: invitation.firstName,
      lastName: invitation.lastName,
      isExpired: invitation.expiresAt
        ? invitation.expiresAt < new Date()
        : false,
      startup: {
        id: invitation.fundingHistory.startupId,
        name: invitation.fundingHistory.startup.name,
        logo: invitation.fundingHistory.startup.logo,
      },
      fundingRound: invitation.fundingHistory.round,
      fundingDate: invitation.fundingHistory.date.toISOString(),
    };
  }

  @Log()
  async toggleInvestorVisibility({
    transactionId,
    userId,
    invitationId,
    isVisible,
  }: {
    transactionId: string;
    userId: string;
    invitationId: string;
    isVisible: boolean;
  }) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const invitation = await this.prisma.fundingHistoryInvestor.findUnique({
      where: { id: invitationId },
    });

    if (!invitation || invitation.profileId !== profile.id) {
      throw new ForbiddenException(
        'This investment record does not belong to you',
      );
    }

    const updated = await this.prisma.fundingHistoryInvestor.update({
      where: { id: invitationId },
      data: { isVisible },
    });

    return {
      id: updated.id,
      isVisible: updated.isVisible,
    };
  }

  @Log()
  async getMyInvestments({
    transactionId,
    userId,
  }: {
    transactionId: string;
    userId: string;
  }) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const investments = await this.prisma.fundingHistoryInvestor.findMany({
      where: { profileId: profile.id },
      include: {
        fundingHistory: {
          select: {
            id: true,
            date: true,
            amountRaised: true,
            round: true,
            startupId: true,
            startup: {
              select: {
                id: true,
                name: true,
                logo: true,
                tagline: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Docs liés : data room de la startup accessible à l'investisseur (s'il en
    // est membre). Dataroom.startupId est unique → 1 data room par startup.
    const startupIds = Array.from(
      new Set(investments.map((i) => i.fundingHistory.startupId)),
    );
    const datarooms = startupIds.length
      ? await this.prisma.dataroom.findMany({
          where: { startupId: { in: startupIds } },
          select: { id: true, startupId: true },
        })
      : [];
    const dataroomByStartup = new Map(
      datarooms.map((d) => [d.startupId, d.id]),
    );
    const dataroomIds = datarooms.map((d) => d.id);
    const memberships = dataroomIds.length
      ? await this.prisma.member.findMany({
          where: { dataroomId: { in: dataroomIds }, profileId: profile.id },
          select: { dataroomId: true },
        })
      : [];
    const accessibleDataroomIds = new Set(
      memberships.map((m) => m.dataroomId),
    );

    return investments.map((inv) => {
      const drId = dataroomByStartup.get(inv.fundingHistory.startupId);
      const dataroom =
        drId && accessibleDataroomIds.has(drId) ? { id: drId } : null;
      return {
        id: inv.id,
        invitationStatus: inv.invitationStatus,
        isVisible: inv.isVisible,
        isLead: inv.isLead,
        respondedAt: inv.respondedAt?.toISOString() || null,
        createdAt: inv.createdAt.toISOString(),
        fundingHistory: {
          id: inv.fundingHistory.id,
          date: inv.fundingHistory.date.toISOString(),
          amountRaised: inv.fundingHistory.amountRaised,
          round: inv.fundingHistory.round,
        },
        startup: inv.fundingHistory.startup,
        dataroom,
      };
    });
  }
}
