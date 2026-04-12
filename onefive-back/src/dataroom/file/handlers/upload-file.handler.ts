import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { ConfigService } from '@nestjs/config';
import { FastifyRequest } from 'fastify';
import { StorageService } from '../../../storage/storage.service';
import { FileService } from '../services/file.service';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  validateUploadedFile,
  validateFileCount,
  sanitizeFilename,
  generateSafeStorageKey,
} from '../../../common/utils/file-validation.utils';
import { PostHogService } from 'src/posthog/posthog.service';

interface UploadedFile {
  buffer: Buffer;
  filename: string;
  mimetype: string;
  category: string;
}

@Injectable()
export class UploadFileHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly configService: ConfigService,
    private readonly storageService: StorageService,
    private readonly fileService: FileService,
    private readonly prisma: PrismaService,
    private readonly posthogService: PostHogService,
  ) {}

  async execute({
    transactionId,
    dataroomId,
    userId,
    req,
  }: {
    transactionId?: string;
    dataroomId: string;
    userId: string;
    req: FastifyRequest & { id: string };
  }) {
    const uploadedFiles: UploadedFile[] = [];
    const fileCategories: Map<number, string> = new Map();

    // Vérifier que la requête est multipart
    if (!req.isMultipart || !req.isMultipart()) {
      throw new BadRequestException('Request must be multipart/form-data');
    }

    // Parser les parties multipart
    const parts = req.parts();

    for await (const part of parts) {
      if (part.type === 'field') {
        // Parser les catégories: files[0].category, files[1].category, etc.
        const match = part.fieldname.match(/files\[(\d+)\]\.category/);
        if (match) {
          const index = parseInt(match[1], 10);
          fileCategories.set(index, part.value as string);
        }
      } else if (part.type === 'file') {
        // Parser les fichiers: files[0].file, files[1].file, etc.
        const match = part.fieldname.match(/files\[(\d+)\]\.file/);
        if (match) {
          const index = parseInt(match[1], 10);
          const buffer = await part.toBuffer();
          uploadedFiles[index] = {
            buffer,
            filename: part.filename,
            mimetype: part.mimetype,
            category: '', // Sera rempli après
          };
        }
      }
    }

    // Associer les catégories aux fichiers
    for (const [index, category] of fileCategories) {
      if (uploadedFiles[index]) {
        uploadedFiles[index].category = category;
      }
    }

    // Filtrer les indices vides (sparse array) et valider le nombre de fichiers
    const validFiles = uploadedFiles.filter(Boolean);
    validateFileCount(validFiles.length);

    // Valider chaque fichier : MIME type, extension, taille
    for (const file of validFiles) {
      validateUploadedFile({
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.buffer.length,
      });
      // Sanitize filename in-place (strip traversal, unsafe chars)
      file.filename = sanitizeFilename(file.filename);
    }

    // Valider que tous les fichiers ont une catégorie
    const filesWithoutCategory = validFiles.filter((f) => !f.category);
    if (filesWithoutCategory.length > 0) {
      throw new BadRequestException('All files must have a category assigned');
    }

    this.logger.info('Parsed multipart upload', {
      transactionId,
      dataroomId,
      fileCount: uploadedFiles.length,
    });

    // Uploader les fichiers vers le stockage et créer les enregistrements
    const createdFiles = [];
    const bucketName =
      this.configService.get<string>('R2_BUCKET_NAME') || 'onefive-storage';

    for (const file of validFiles) {
      try {
        // Générer une clé S3 sécurisée (UUID + nom sanitisé)
        const storageKey = generateSafeStorageKey(dataroomId, file.filename);

        // Upload vers le stockage (R2/Minio)
        const uploadResult = await this.storageService.uploadFile({
          transactionId: transactionId || req.id,
          data: {
            buffer: file.buffer,
            filename: storageKey,
            mimeType: file.mimetype,
            bucketName,
          },
        });

        this.logger.info('File uploaded to storage', {
          transactionId,
          fileId: uploadResult.id,
          filename: file.filename,
        });

        // Créer l'enregistrement en base de données
        const createdFile = await this.fileService.create({
          transactionId,
          data: {
            dataroom: {
              connect: {
                id: dataroomId,
              },
            },
            storageId: uploadResult.id,
            name: file.filename,
            size: file.buffer.length,
            mimetype: file.mimetype,
            category: {
              connectOrCreate: {
                where: {
                  name_dataroomId: {
                    name: file.category,
                    dataroomId: dataroomId,
                  },
                },
                create: {
                  name: file.category,
                  dataroom: {
                    connect: {
                      id: dataroomId,
                    },
                  },
                  createdBy: userId,
                },
              },
            },
            isDeleted: false,
            uploadedBy: userId,
          },
        });

        createdFiles.push({
          id: createdFile.id,
          name: createdFile.name,
          size: createdFile.size,
          mimetype: createdFile.mimetype,
          storageId: createdFile.storageId,
        });
      } catch (error) {
        this.logger.error('Failed to upload file', {
          transactionId,
          filename: file.filename,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
      }
    }

    this.posthogService.capture(userId, 'dataroom_file_uploaded', {
      dataroom_id: dataroomId,
      file_count: createdFiles.length,
    });

    return {
      data: {
        files: createdFiles,
      },
    };
  }
}
