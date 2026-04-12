import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import { StorageService } from '../../storage/storage.service';
import { FileProcessingService } from '../../common/services/file-processing.service';
import { ConfigService } from '@nestjs/config';
import { StartupService } from '../startup.service';
import {
  StartupCoverMimeTypeException,
  StartupCoverFileSizeException,
} from '../startup.exception';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadStartupCoverHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly storageService: StorageService,
    private readonly fileProcessingService: FileProcessingService,
    private readonly configService: ConfigService,
    private readonly startupService: StartupService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    startupId,
    file,
  }: {
    transactionId: string;
    userId: string;
    startupId: string;
    file: Express.Multer.File;
  }) {
    // Validation du fichier
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      StartupCoverMimeTypeException.throw(this.logger, {
        transactionId,
        startupId,
        mimeType: file.mimetype,
      });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB pour les covers (plus grandes)
    if (file.size > maxSize) {
      StartupCoverFileSizeException.throw(this.logger, {
        transactionId,
        startupId,
        fileSize: file.size,
        maxSize,
      });
    }

    // Traiter l'image (compression)
    const processedFile = await this.fileProcessingService.processCover(
      transactionId,
      file.buffer,
    );

    // Générer une clé unique pour le fichier
    const fileId = uuidv4();
    const fileKey = `covers/startups/${startupId}/${fileId}`;

    // Upload vers le stockage
    const uploadResult = await this.storageService.uploadFile({
      transactionId,
      data: {
        buffer: processedFile.buffer,
        filename: fileKey,
        mimeType: processedFile.mimeType,
        bucketName:
          this.configService.get<string>('PUBLIC_BUCKET_NAME') ||
          'onefive-storage',
      },
    });

    // Mettre à jour la startup avec la nouvelle URL de la cover
    await this.startupService.update({
      transactionId,
      startupId,
      userId,
      data: {
        coverImage: uploadResult.url,
      },
    });

    this.logger.info('Startup cover uploaded successfully', {
      transactionId,
      startupId,
      userId,
      url: uploadResult.url,
    });

    return {
      url: uploadResult.url,
    };
  }
}
