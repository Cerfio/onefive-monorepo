import { Injectable, Inject } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { PrismaService } from 'src/prisma/prisma.service';
import { StorageService } from 'src/storage/storage.service';
import { FileProcessingService } from 'src/common/services/file-processing.service';
import { ConfigService } from '@nestjs/config';
import { ProfileService } from 'src/profile/profile.service';
import { FileService } from 'src/file/file.service';
import {
  ProfileAvatarMimeTypeException,
  ProfileAvatarFileSizeException,
  ProfileAvatarInvalidFileException,
} from '../profile-avatar.exception';
import { validateAvatarImageFile } from 'src/common/utils';

@Injectable()
export class UploadAvatarHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly fileProcessingService: FileProcessingService,
    private readonly profileService: ProfileService,
    private readonly fileService: FileService,
    private readonly configService: ConfigService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    file,
  }: {
    transactionId: string;
    userId: string;
    file: Express.Multer.File;
  }) {
    // Validation du fichier
    const exceptions = {
      MimeTypeException: ProfileAvatarMimeTypeException,
      FileSizeException: ProfileAvatarFileSizeException,
      InvalidFileException: ProfileAvatarInvalidFileException,
    };
    validateAvatarImageFile(file, transactionId, this.logger, exceptions);

    // Traitement de l'image avec compression et suppression métadonnées
    const processedFile = await this.fileProcessingService.processAvatar(
      transactionId,
      file.buffer,
    );

    // Générer une clé S3 avec préfixe
    const fileKey = this.getAvatarKey(userId);

    // Upload vers le stockage S3
    const uploadResult = await this.storageService.uploadFile({
      transactionId,
      data: {
        buffer: processedFile.buffer,
        filename: fileKey,
        mimeType: processedFile.mimeType,
        bucketName: this.getBucketName(),
      },
    });

    // Récupérer l'ancien avatar avant la transaction
    const oldProfile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: { avatarId: true },
    });
    const oldAvatarFileId = oldProfile?.avatarId || null;

    // Transaction Prisma pour garantir la cohérence des données
    await this.prisma.$transaction(async (tx) => {
      // Créer l'entrée File dans la base de données
      await tx.file.create({
        data: {
          id: uploadResult.id,
          size: processedFile.size,
          mimeType: processedFile.mimeType,
          bucket: this.getBucketName(),
        },
      });

      // Mettre à jour le profil avec le nouvel avatar
      await tx.profile.update({
        where: { userId },
        data: { avatarId: uploadResult.id },
      });

      // Supprimer l'ancienne entrée File de la base de données si elle existait
      if (oldAvatarFileId) {
        await tx.file.delete({
          where: { id: oldAvatarFileId },
        });
      }
    });

    // Cleanup de l'ancien fichier S3 (hors transaction, best effort)
    if (oldAvatarFileId) {
      await this.storageService
        .deleteFile({
          transactionId,
          fileId: oldAvatarFileId,
        })
        .catch((error) => {
          this.logger.warn('Failed to delete old avatar from S3', {
            transactionId,
            userId,
            oldAvatarFileId,
            error: error.message,
          });
        });
    }

    this.logger.info('Avatar uploaded successfully', {
      transactionId,
      userId,
      fileId: uploadResult.id,
      fileKey,
      originalSize: file.size,
      processedSize: processedFile.size,
      compressionRatio: processedFile.metadata.compressionRatio,
    });

    return {
      fileId: uploadResult.id,
      url: uploadResult.url,
      size: processedFile.size,
      mimeType: processedFile.mimeType,
    };
  }

  private getBucketName(): string {
    return this.configService.get('R2_BUCKET_NAME') || 'onefive-storage';
  }

  private getAvatarKey(userId: string): string {
    const timestamp = Date.now();
    return `avatars/user-${userId}-avatar-${timestamp}.webp`;
  }
}
