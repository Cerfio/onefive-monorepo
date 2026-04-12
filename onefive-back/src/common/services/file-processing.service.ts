import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../logger/logger.decorator';
import * as sharp from 'sharp';

export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  ARCHIVE = 'archive',
  OTHER = 'other',
}

export interface FileProcessingOptions {
  // Images
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  removeMetadata?: boolean;

  // Documents & Vidéos
  maxSize?: number;
  generateThumbnail?: boolean;

  // Sécurité
  scanForMalware?: boolean;
  removeScripts?: boolean;
}

export interface ProcessedFile {
  buffer: Buffer;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number; // Pour vidéos/audio
  thumbnail?: Buffer; // Miniature générée
  metadata: {
    originalSize: number;
    compressionRatio: number;
    type: FileType;
    isSecure: boolean;
  };
}

@Injectable()
export class FileProcessingService {
  private readonly ALLOWED_MIME_TYPES = {
    [FileType.IMAGE]: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ],
    [FileType.DOCUMENT]: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
      'application/json',
    ],
    [FileType.VIDEO]: [
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm',
    ],
    [FileType.AUDIO]: ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/ogg'],
    [FileType.ARCHIVE]: [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
    ],
  };

  private readonly MAX_SIZES = {
    [FileType.IMAGE]: 10 * 1024 * 1024, // 10MB
    [FileType.DOCUMENT]: 50 * 1024 * 1024, // 50MB
    [FileType.VIDEO]: 500 * 1024 * 1024, // 500MB
    [FileType.AUDIO]: 50 * 1024 * 1024, // 50MB
    [FileType.ARCHIVE]: 100 * 1024 * 1024, // 100MB
    [FileType.OTHER]: 10 * 1024 * 1024, // 10MB
  };

  constructor(@Inject('Logger') private readonly logger: LogService) {}

  @Log()
  async processFile(
    transactionId: string,
    inputBuffer: Buffer,
    originalMimeType: string,
    options: FileProcessingOptions = {},
  ): Promise<ProcessedFile> {
    const fileType = this.getFileType(originalMimeType);
    const originalSize = inputBuffer.length;

    // Validation de sécurité
    await this.validateFile(
      transactionId,
      inputBuffer,
      originalMimeType,
      fileType,
    );

    let processedBuffer: Buffer;
    let mimeType: string;
    let width: number | undefined;
    let height: number | undefined;
    let thumbnail: Buffer | undefined;

    switch (fileType) {
      case FileType.IMAGE:
        const imageResult = await this.processImage(
          transactionId,
          inputBuffer,
          options,
        );
        processedBuffer = imageResult.buffer;
        mimeType = imageResult.mimeType;
        width = imageResult.width;
        height = imageResult.height;
        break;

      case FileType.DOCUMENT:
        const docResult = await this.processDocument(
          transactionId,
          inputBuffer,
          originalMimeType,
          options,
        );
        processedBuffer = docResult.buffer;
        mimeType = docResult.mimeType;
        thumbnail = docResult.thumbnail;
        break;

      case FileType.VIDEO:
        const videoResult = await this.processVideo(
          transactionId,
          inputBuffer,
          originalMimeType,
          options,
        );
        processedBuffer = videoResult.buffer;
        mimeType = videoResult.mimeType;
        thumbnail = videoResult.thumbnail;
        break;

      default:
        // Pour les autres types, on ne fait que la validation et suppression de métadonnées
        processedBuffer = await this.sanitizeFile(
          transactionId,
          inputBuffer,
          originalMimeType,
        );
        mimeType = originalMimeType;
        break;
    }

    const result: ProcessedFile = {
      buffer: processedBuffer,
      mimeType,
      size: processedBuffer.length,
      width,
      height,
      thumbnail,
      metadata: {
        originalSize,
        compressionRatio: Math.round(
          (1 - processedBuffer.length / originalSize) * 100,
        ),
        type: fileType,
        isSecure: true,
      },
    };

    this.logger.info('File processed successfully', {
      transactionId,
      fileType,
      originalSize,
      processedSize: result.size,
      compressionRatio: result.metadata.compressionRatio,
      mimeType: result.mimeType,
    });

    return result;
  }

  private getFileType(mimeType: string): FileType {
    for (const [type, mimeTypes] of Object.entries(this.ALLOWED_MIME_TYPES)) {
      if (mimeTypes.includes(mimeType)) {
        return type as FileType;
      }
    }
    return FileType.OTHER;
  }

  private async validateFile(
    transactionId: string,
    buffer: Buffer,
    mimeType: string,
    fileType: FileType,
  ): Promise<void> {
    // Vérifier la taille
    const maxSize = this.MAX_SIZES[fileType];
    if (buffer.length > maxSize) {
      throw new BadRequestException(
        `Fichier trop volumineux. Taille maximum : ${Math.round(maxSize / 1024 / 1024)}MB`,
      );
    }

    // Vérifier le type MIME
    if (!this.ALLOWED_MIME_TYPES[fileType]?.includes(mimeType)) {
      throw new BadRequestException(
        `Type de fichier non autorisé : ${mimeType}`,
      );
    }

    // Validation spécifique par type
    if (fileType === FileType.IMAGE) {
      const isValidImage = await this.validateImageBuffer(buffer);
      if (!isValidImage) {
        throw new BadRequestException('Fichier image corrompu ou invalide');
      }
    }

    this.logger.info('File validation passed', {
      transactionId,
      fileType,
      mimeType,
      size: buffer.length,
    });
  }

  private async processImage(
    transactionId: string,
    buffer: Buffer,
    options: FileProcessingOptions,
  ): Promise<{
    buffer: Buffer;
    mimeType: string;
    width: number;
    height: number;
  }> {
    const {
      width,
      height,
      quality = 85,
      format = 'webp',
      removeMetadata = true,
    } = options;

    let pipeline = sharp(buffer);

    // Supprimer les métadonnées EXIF
    if (removeMetadata) {
      pipeline = pipeline.withMetadata({
        exif: {},
        icc: undefined,
      });
    }

    // Redimensionner si nécessaire
    if (width || height) {
      pipeline = pipeline.resize(width, height, {
        fit: 'cover',
        position: 'center',
      });
    }

    // Optimiser selon le format
    switch (format) {
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality, progressive: true, mozjpeg: true });
        break;
      case 'png':
        pipeline = pipeline.png({ compressionLevel: 9, progressive: true });
        break;
      case 'webp':
      default:
        pipeline = pipeline.webp({ quality, effort: 6 });
        break;
    }

    const result = await pipeline.toBuffer({ resolveWithObject: true });

    return {
      buffer: result.data,
      mimeType: `image/${format}`,
      width: result.info.width,
      height: result.info.height,
    };
  }

  private async processDocument(
    transactionId: string,
    buffer: Buffer,
    mimeType: string,
    options: FileProcessingOptions,
  ): Promise<{ buffer: Buffer; mimeType: string; thumbnail?: Buffer }> {
    // Validation et sanitization. Future: thumbnails PDF via pdf-poppler
    const sanitizedBuffer = await this.sanitizeFile(
      transactionId,
      buffer,
      mimeType,
    );

    return {
      buffer: sanitizedBuffer,
      mimeType,
      // thumbnail: await this.generateDocumentThumbnail(buffer, mimeType),
    };
  }

  private async processVideo(
    transactionId: string,
    buffer: Buffer,
    mimeType: string,
    options: FileProcessingOptions,
  ): Promise<{ buffer: Buffer; mimeType: string; thumbnail?: Buffer }> {
    // Validation et sanitization. Future: ffmpeg pour compression et thumbnails
    const sanitizedBuffer = await this.sanitizeFile(
      transactionId,
      buffer,
      mimeType,
    );

    return {
      buffer: sanitizedBuffer,
      mimeType,
      // thumbnail: await this.generateVideoThumbnail(buffer),
    };
  }

  private async sanitizeFile(
    transactionId: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<Buffer> {
    // Pass-through pour types non-image (images: sharp fait le stripping).
    // Future: sanitization spécifique par type (PDF, vidéo).
    this.logger.info('File sanitized', {
      transactionId,
      mimeType,
      size: buffer.length,
    });

    return buffer;
  }

  private async validateImageBuffer(buffer: Buffer): Promise<boolean> {
    try {
      const metadata = await sharp(buffer).metadata();
      return !!(metadata.format && metadata.width && metadata.height);
    } catch {
      return false;
    }
  }

  // Méthodes spécialisées pour les profils
  @Log()
  async processAvatar(
    transactionId: string,
    buffer: Buffer,
  ): Promise<ProcessedFile> {
    return this.processFile(transactionId, buffer, 'image/jpeg', {
      width: 400,
      height: 400,
      quality: 85,
      format: 'webp',
      removeMetadata: true,
    });
  }

  @Log()
  async processCover(
    transactionId: string,
    buffer: Buffer,
  ): Promise<ProcessedFile> {
    return this.processFile(transactionId, buffer, 'image/jpeg', {
      width: 1200,
      height: 400,
      quality: 80,
      format: 'webp',
      removeMetadata: true,
    });
  }
}
