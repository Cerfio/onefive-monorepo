import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { ConfigService } from '@nestjs/config';
import { FileProcessingService } from 'src/common/services/file-processing.service';
import { StorageService } from 'src/storage/storage.service';

const FETCH_TIMEOUT_MS = 30_000;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

@Injectable()
export class AdminImportSpotlightImageHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly fileProcessingService: FileProcessingService,
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {}

  @Log()
  async execute({
    transactionId,
    url,
  }: {
    transactionId: string;
    url: string;
  }): Promise<{ url: string }> {
    const buffer = await this.fetchImage(transactionId, url);
    const processedFile = await this.fileProcessingService.processCover(
      transactionId,
      buffer,
    );

    const bucketName =
      this.configService.get('R2_BUCKET_NAME') || 'onefive-storage';
    const uploadResult = await this.storageService.uploadFile({
      transactionId,
      data: {
        buffer: processedFile.buffer,
        filename: `spotlight/import-${Date.now()}.webp`,
        mimeType: processedFile.mimeType,
        bucketName,
      },
    });

    this.logger.info('Spotlight image imported from URL', {
      transactionId,
      sourceUrl: url,
      fileId: uploadResult.id,
      processedSize: processedFile.size,
    });

    return { url: uploadResult.url };
  }

  private async fetchImage(
    transactionId: string,
    url: string,
  ): Promise<Buffer> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      FETCH_TIMEOUT_MS,
    );

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'OneFive-Backoffice/1.0',
        },
      });

      if (!response.ok) {
        throw new BadRequestException(
          `Impossible de récupérer l'image (HTTP ${response.status})`,
        );
      }

      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength, 10) > MAX_IMAGE_SIZE) {
        throw new BadRequestException(
          `Image trop volumineuse (max ${MAX_IMAGE_SIZE / 1024 / 1024}MB)`,
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (buffer.length > MAX_IMAGE_SIZE) {
        throw new BadRequestException(
          `Image trop volumineuse (max ${MAX_IMAGE_SIZE / 1024 / 1024}MB)`,
        );
      }

      return buffer;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new BadRequestException(
            'Délai dépassé lors de la récupération de l\'image',
          );
        }
        this.logger.warn('Failed to fetch spotlight image URL', {
          transactionId,
          url,
          error: error.message,
        });
        throw new BadRequestException(
          `Impossible de récupérer l'image : ${error.message}`,
        );
      }
      throw new BadRequestException('Impossible de récupérer l\'image');
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
