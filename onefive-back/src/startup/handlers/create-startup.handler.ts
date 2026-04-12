import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { StartupService } from '../startup.service';
import { StorageService } from '../../storage/storage.service';
import { FileProcessingService } from '../../common/services/file-processing.service';
import { Log } from '../../common/logger/logger.decorator';
import { FastifyRequest } from 'fastify';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationHelperService } from '../../notification/notification-helper.service';
import { EmailService } from '../../email/email.service';
import { PostHogService } from 'src/posthog/posthog.service';

@Injectable()
export class CreateStartupHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly startupService: StartupService,
    private readonly storageService: StorageService,
    private readonly fileProcessingService: FileProcessingService,
    private readonly prisma: PrismaService,
    private readonly notificationHelper: NotificationHelperService,
    private readonly emailService: EmailService,
    private readonly posthogService: PostHogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    req,
  }: {
    transactionId: string;
    userId: string;
    req: FastifyRequest & { id: string };
  }) {
    let fields: any = {};
    let logoFile: any = null;
    let coverImageFile: any = null;

    // Vérifier si la requête est multipart (avec fichiers)
    if (req.isMultipart && req.isMultipart()) {
      // Parser les parties multipart avec Fastify
      const parts = req.parts();

      for await (const part of parts) {
        if (part.type === 'field') {
          // Champs texte
          fields[part.fieldname] = part.value;
        } else if (part.type === 'file') {
          // Fichiers
          if (part.fieldname === 'logo') {
            const buffer = await part.toBuffer();
            logoFile = {
              buffer,
              filename: part.filename,
              mimetype: part.mimetype,
            };
          } else if (part.fieldname === 'coverImage') {
            const buffer = await part.toBuffer();
            coverImageFile = {
              buffer,
              filename: part.filename,
              mimetype: part.mimetype,
            };
          }
        }
      }

      // Parser les champs JSON si nécessaire
      if (fields.data && typeof fields.data === 'string') {
        try {
          const parsedData = JSON.parse(fields.data);
          fields = { ...fields, ...parsedData };
        } catch (e) {
          this.logger.warn('Failed to parse JSON data field', {
            transactionId,
            error: e.message,
          });
        }
      }

      // Parser les invitations si c'est une string JSON
      if (fields.invitations && typeof fields.invitations === 'string') {
        try {
          fields.invitations = JSON.parse(fields.invitations);
        } catch (e) {
          this.logger.warn('Failed to parse invitations JSON', {
            transactionId,
            error: e.message,
          });
        }
      }

      // Parser les catégories si c'est une string JSON
      if (fields.categories && typeof fields.categories === 'string') {
        try {
          fields.categories = JSON.parse(fields.categories);
        } catch (e) {
          this.logger.warn('Failed to parse categories JSON', {
            transactionId,
            error: e.message,
          });
        }
      }
    } else {
      // Requête JSON normale (sans fichiers)
      fields = req.body || {};
    }

    // Uploader les fichiers et obtenir les URLs
    let logoUrl: string | undefined;
    let coverImageUrl: string | undefined;

    if (logoFile) {
      try {
        // Traiter le fichier logo
        const processedFile = await this.fileProcessingService.processFile(
          transactionId,
          logoFile.buffer,
          logoFile.mimetype,
          {
            removeMetadata: true,
            width: 400,
            height: 400,
            quality: 90,
            format: 'webp',
          },
        );

        // Uploader vers le stockage
        const uploadResult = await this.storageService.uploadFile({
          transactionId,
          data: {
            buffer: processedFile.buffer,
            filename: logoFile.filename,
            mimeType: processedFile.mimeType,
            bucketName: 'onefive-storage',
          },
        });

        logoUrl = uploadResult.url;
      } catch (error) {
        this.logger.error('Failed to process/upload logo file', {
          transactionId,
          filename: logoFile.filename,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
      }
    }

    if (coverImageFile) {
      try {
        // Traiter le fichier coverImage
        const processedFile = await this.fileProcessingService.processFile(
          transactionId,
          coverImageFile.buffer,
          coverImageFile.mimetype,
          {
            removeMetadata: true,
            width: 1600,
            height: 900,
            quality: 85,
            format: 'webp',
          },
        );

        // Uploader vers le stockage
        const uploadResult = await this.storageService.uploadFile({
          transactionId,
          data: {
            buffer: processedFile.buffer,
            filename: coverImageFile.filename,
            mimeType: processedFile.mimeType,
            bucketName: 'onefive-storage',
          },
        });

        coverImageUrl = uploadResult.url;
      } catch (error) {
        this.logger.error('Failed to process/upload coverImage file', {
          transactionId,
          filename: coverImageFile.filename,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
      }
    }

    // Si l'image vient d'une URL distante (ex: import LinkedIn), on la copie
    // vers notre storage pour éviter l'expiration/casse des URLs tierces.
    if (!logoUrl && this.isRemoteHttpUrl(fields.logo)) {
      const mirroredLogoUrl = await this.mirrorRemoteImageToStorage({
        transactionId,
        imageUrl: fields.logo,
        type: 'logo',
      });

      if (mirroredLogoUrl) {
        logoUrl = mirroredLogoUrl;
      }
    }

    if (!coverImageUrl && this.isRemoteHttpUrl(fields.coverImage)) {
      const mirroredCoverUrl = await this.mirrorRemoteImageToStorage({
        transactionId,
        imageUrl: fields.coverImage,
        type: 'cover',
      });

      if (mirroredCoverUrl) {
        coverImageUrl = mirroredCoverUrl;
      }
    }

    this.logger.info('Creating startup', {
      transactionId,
      userId,
      startupName: fields.name,
      invitationsCount: fields.invitations?.length || 0,
      hasLogo: !!logoUrl,
      hasCoverImage: !!coverImageUrl,
    });

    const startup = await this.startupService.create({
      transactionId,
      userId,
      data: {
        name: fields.name,
        tagline: fields.tagline,
        description: fields.description,
        website: fields.website,
        linkedin: fields.linkedin,
        foundedDate: fields.foundedDate,
        countryCode: fields.countryCode,
        city: fields.city,
        categories: fields.categories,
        logo: logoUrl || fields.logo,
        coverImage: coverImageUrl || fields.coverImage,
        invitations: fields.invitations,
      },
    });

    this.posthogService.capture(userId, 'startup_created', {
      startup_id: startup.id,
      startup_name: startup.name,
      has_logo: !!logoUrl,
      has_cover: !!coverImageUrl,
      invitations_count: fields.invitations?.length || 0,
    });
    this.posthogService.groupIdentify('startup', startup.id, {
      name: startup.name,
      categories: startup.categories,
    });

    await this.sendStartupCreationInvitations({
      transactionId,
      userId,
      startupId: startup.id,
      startupName: startup.name,
      startupLogo: startup.logo || undefined,
    });

    return {
      id: startup.id,
      name: startup.name,
      tagline: startup.tagline,
      description: startup.description,
      categories: startup.categories,
      countryCode: startup.countryCode,
      city: startup.city,
      logo: startup.logo,
      coverImage: startup.coverImage,
      createdAt: startup.createdAt.toISOString(),
    };
  }

  private async sendStartupCreationInvitations({
    transactionId,
    userId,
    startupId,
    startupName,
    startupLogo,
  }: {
    transactionId: string;
    userId: string;
    startupId: string;
    startupName: string;
    startupLogo?: string;
  }) {
    const inviterProfile = await this.prisma.profile.findUnique({
      where: { userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!inviterProfile) {
      return;
    }

    const invitationRecords = await this.prisma.startupInvitation.findMany({
      where: {
        startupId,
        invitedById: inviterProfile.id,
        status: 'PENDING',
      },
      include: {
        invitedProfile: {
          select: {
            id: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    if (invitationRecords.length === 0) {
      return;
    }

    const inviterName =
      `${inviterProfile.firstName} ${inviterProfile.lastName}`.trim();
    const frontendUrl = process.env.FRONTEND_URL || 'https://app.onefive.com';

    await Promise.all(
      invitationRecords.map(async (invitation) => {
        if (invitation.invitedProfileId) {
          try {
            await this.notificationHelper.notifyStartupInvitation({
              invitedProfileId: invitation.invitedProfileId,
              inviterProfileId: inviterProfile.id,
              inviterName,
              startupId,
              startupName,
              position: invitation.position,
            });
          } catch (error) {
            this.logger.error(
              'Failed to send startup invitation notification on startup creation',
              {
                transactionId,
                startupId,
                invitationId: invitation.id,
                error: error instanceof Error ? error.message : 'Unknown error',
              },
            );
          }
        }

        const recipientEmail =
          invitation.email || invitation.invitedProfile?.user?.email;
        if (!recipientEmail) {
          return;
        }

        const acceptUrl = `${frontendUrl}/startup/invitations/${invitation.id}/accept`;
        const declineUrl = `${frontendUrl}/startup/invitations/${invitation.id}/decline`;
        const emailType =
          invitation.equity > 0 ? 'founder-invitation' : 'member-invitation';

        try {
          await this.emailService.sendEmail({
            to: recipientEmail,
            type: emailType,
            payload: {
              inviterName,
              startupName,
              startupLogo,
              position: invitation.position,
              equity: invitation.equity,
              message: invitation.message || '',
              acceptUrl,
              declineUrl,
            },
          });
        } catch (error) {
          this.logger.error(
            'Failed to send startup invitation email on startup creation',
            {
              transactionId,
              startupId,
              invitationId: invitation.id,
              recipientEmail,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          );
        }
      }),
    );
  }

  private isRemoteHttpUrl(value: unknown): value is string {
    if (typeof value !== 'string') {
      return false;
    }

    return /^https?:\/\//i.test(value.trim());
  }

  private async mirrorRemoteImageToStorage({
    transactionId,
    imageUrl,
    type,
  }: {
    transactionId: string;
    imageUrl: string;
    type: 'logo' | 'cover';
  }): Promise<string | undefined> {
    try {
      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept:
            'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          Referer: 'https://www.linkedin.com/',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const sourceMimeType =
        response.headers.get('content-type')?.split(';')[0].trim() ||
        'image/jpeg';
      const buffer = Buffer.from(arrayBuffer);

      const processedFile = await this.fileProcessingService.processFile(
        transactionId,
        buffer,
        sourceMimeType,
        type === 'logo'
          ? {
              removeMetadata: true,
              width: 400,
              height: 400,
              quality: 90,
              format: 'webp',
            }
          : {
              removeMetadata: true,
              width: 1600,
              height: 900,
              quality: 85,
              format: 'webp',
            },
      );

      const uploadResult = await this.storageService.uploadFile({
        transactionId,
        data: {
          buffer: processedFile.buffer,
          filename: `startup-${type}-remote-${Date.now()}.webp`,
          mimeType: processedFile.mimeType,
          bucketName: 'onefive-storage',
        },
      });

      return uploadResult.url;
    } catch (error) {
      this.logger.warn('Failed to mirror remote startup image to storage', {
        transactionId,
        imageUrl,
        type,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return undefined;
    }
  }
}
