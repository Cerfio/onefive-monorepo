import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { LogService } from 'logstash-winston-3';
import {
  UsersCreateInternalException,
  UsersEmailAlreadyExistException,
  UsersFindAllException,
  UsersFindOneException,
  UsersGetException,
  UsersDeleteException,
  UsersGetByIdException,
  UsersCountActiveSessionsException,
  UsersUpdateException,
  UsersUpdatePasswordException,
} from './users.exception';
import { Log } from 'src/common/logger/logger.decorator';

@Injectable()
export class UsersService {
  /**
   * Safe select: exclut le password hash de toutes les requêtes par défaut.
   * Utiliser findByEmailWithPassword() ou getUserByIdWithPassword() pour l'auth.
   */
  private static readonly USER_SAFE_SELECT = {
    id: true,
    email: true,
    phoneNumber: true,
    isEmailVerified: true,
    isBanned: true,
    authType: true,
    linkedinId: true,
    googleId: true,
    lastSignupAttemptAt: true,
    createdAt: true,
    updatedAt: true,
    // ❌ password: NEVER expose by default
  } as const;

  constructor(
    private readonly prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async create({
    transactionId,
    data,
  }: {
    transactionId: string;
    data: Prisma.UserCreateInput;
  }) {
    try {
      return await this.prisma.user.create({
        data,
        select: UsersService.USER_SAFE_SELECT,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        UsersEmailAlreadyExistException.throw(this.logger, {
          transactionId,
          data,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
      UsersCreateInternalException.throw(this.logger, {
        transactionId,
        data,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
  @Log()
  async findAll({
    transactionId,
    where,
  }: {
    transactionId: string;
    where: Prisma.UserWhereInput;
  }) {
    try {
      return await this.prisma.user.findMany({
        where,
        select: UsersService.USER_SAFE_SELECT,
      });
    } catch (error) {
      UsersFindAllException.throw(this.logger, {
        transactionId,
        where,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Log()
  async findOne({
    transactionId,
    where,
  }: {
    transactionId: string;
    where: Prisma.UserWhereUniqueInput;
  }) {
    try {
      return await this.prisma.user.findUnique({
        where,
        select: UsersService.USER_SAFE_SELECT,
      });
    } catch (error) {
      UsersFindOneException.throw(this.logger, {
        transactionId,
        where,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Méthode réservée à l'authentification (signin).
   * Retourne le password hash pour comparaison bcrypt.
   */
  @Log()
  async findByEmailWithPassword({
    transactionId,
    email,
  }: {
    transactionId: string;
    email: string;
  }) {
    try {
      return await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: { ...UsersService.USER_SAFE_SELECT, password: true },
      });
    } catch (error) {
      UsersFindOneException.throw(this.logger, {
        transactionId,
        where: { email },
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Log()
  async get({
    transactionId,
    where,
  }: {
    transactionId: string;
    where: Prisma.UserWhereUniqueInput;
  }) {
    try {
      return await this.prisma.user.findUnique({
        where,
        select: UsersService.USER_SAFE_SELECT,
      });
    } catch (error) {
      UsersGetException.throw(this.logger, {
        transactionId,
        where,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Log()
  async update({
    transactionId,
    where,
    data,
  }: {
    transactionId: string;
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }) {
    try {
      return await this.prisma.user.update({
        where,
        data,
        select: UsersService.USER_SAFE_SELECT,
      });
    } catch (error) {
      UsersUpdateException.throw(this.logger, {
        transactionId,
        where,
        data,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Log()
  async remove({
    transactionId,
    where,
  }: {
    transactionId: string;
    where: Prisma.UserWhereUniqueInput;
  }) {
    try {
      return await this.prisma.user.delete({
        where,
        select: UsersService.USER_SAFE_SELECT,
      });
    } catch (error) {
      UsersDeleteException.throw(this.logger, {
        transactionId,
        where,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Log()
  async getUserById({
    transactionId,
    userId,
  }: {
    transactionId: string;
    userId: string;
  }) {
    try {
      return await this.prisma.user.findUnique({
        where: { id: userId },
        select: UsersService.USER_SAFE_SELECT,
      });
    } catch (error) {
      UsersGetByIdException.throw(this.logger, {
        transactionId,
        userId,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Méthode réservée à l'authentification (update-password).
   * Retourne le password hash pour comparaison bcrypt.
   */
  @Log()
  async getUserByIdWithPassword({
    transactionId,
    userId,
  }: {
    transactionId: string;
    userId: string;
  }) {
    try {
      return await this.prisma.user.findUnique({
        where: { id: userId },
        select: { ...UsersService.USER_SAFE_SELECT, password: true },
      });
    } catch (error) {
      UsersGetByIdException.throw(this.logger, {
        transactionId,
        userId,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Log()
  async countActiveSessions({
    transactionId,
    userId,
  }: {
    transactionId: string;
    userId: string;
  }) {
    try {
      return await this.prisma.session.count({
        where: {
          userId,
          expiresAt: {
            gt: new Date(),
          },
        },
      });
    } catch (error) {
      UsersCountActiveSessionsException.throw(this.logger, {
        transactionId,
        userId,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Log()
  async updatePassword({
    transactionId,
    userId,
    password,
  }: {
    transactionId: string;
    userId: string;
    password: string;
  }) {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: { password },
        select: UsersService.USER_SAFE_SELECT,
      });
    } catch (error) {
      UsersUpdatePasswordException.throw(this.logger, {
        transactionId,
        userId,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Met à jour l'URL LinkedIn dans le profil de l'utilisateur
   * Si le profil n'existe pas encore, on ne fait rien (non-bloquant)
   */
  @Log()
  async updateLinkedInUrl({
    transactionId,
    userId,
    linkedinUrl,
  }: {
    transactionId: string;
    userId: string;
    linkedinUrl: string;
  }) {
    try {
      // Vérifier si le profil existe
      const profile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!profile) {
        this.logger.info(
          'Profile does not exist yet, skipping LinkedIn URL update',
          {
            transactionId,
            userId,
          },
        );
        return null;
      }

      // Mettre à jour l'URL LinkedIn dans le profil
      return await this.prisma.profile.update({
        where: { userId },
        data: { linkedinUrl },
      });
    } catch (error) {
      this.logger.error('Failed to update LinkedIn URL', {
        transactionId,
        userId,
        linkedinUrl,
        error: error.message,
      });
      // Non-bloquant : on ne throw pas d'exception
      return null;
    }
  }
}
