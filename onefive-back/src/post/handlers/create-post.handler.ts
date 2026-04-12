import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PostService } from '../post.service';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { Log } from '../../common/logger/logger.decorator';
import { Prisma } from '@prisma/client';
import { CreatePostDto, PostMediaDto } from '../dto/create-post.dto';
import { FileProcessingService } from '../../common/services/file-processing.service';
import { LogService } from 'logstash-winston-3';
import { FastifyRequest } from 'fastify';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PostHogService } from 'src/posthog/posthog.service';

@Injectable()
export class CreatePostHandler {
  constructor(
    private readonly postService: PostService,
    private readonly prisma: PrismaService,
    private readonly fileProcessingService: FileProcessingService,
    private readonly storageService: StorageService,
    @Inject('Logger') private readonly logger: LogService,
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
    const mediaFiles: any[] = [];

    // Vérifier si la requête est multipart (avec fichiers)
    if (req.isMultipart && req.isMultipart()) {
      // Parser les parties multipart avec Fastify
      const parts = req.parts();

      for await (const part of parts) {
        if (part.type === 'field') {
          // Champs texte (content, tags, etc.)
          fields[part.fieldname] = part.value;
        } else if (part.type === 'file' && part.fieldname === 'medias') {
          // Fichiers médias
          const buffer = await part.toBuffer();
          mediaFiles.push({
            buffer,
            filename: part.filename,
            mimetype: part.mimetype,
          });
        }
      }
    } else {
      // Requête JSON normale (sans fichiers)
      fields = req.body || {};
    }

    // Parse tags accepting both JSON string and array payloads
    let parsedTags: string[] = [];
    if (Array.isArray(fields.tags)) {
      parsedTags = fields.tags as string[];
    } else if (typeof fields.tags === 'string') {
      try {
        parsedTags = JSON.parse(fields.tags);
      } catch {
        parsedTags = fields.tags ? [fields.tags] : [];
      }
    }

    // Traiter et uploader les fichiers médias
    const uploadedMedias: PostMediaDto[] = [];
    for (const mediaFile of mediaFiles) {
      try {
        // Définir les options de traitement selon le type de fichier
        const isImage = mediaFile.mimetype.startsWith('image/');
        const processingOptions = isImage
          ? {
              removeMetadata: true,
              // Options pour les images uniquement
              width: 1200,
              height: 1200,
              quality: 85,
              format: 'webp' as const,
            }
          : {
              removeMetadata: true,
              // Pas d'options de redimensionnement pour les documents/vidéos
            };

        // Traiter le fichier
        const processedFile = await this.fileProcessingService.processFile(
          req.id,
          mediaFile.buffer,
          mediaFile.mimetype,
          processingOptions,
        );

        // Uploader vers le stockage
        const uploadResult = await this.storageService.uploadFile({
          transactionId: req.id,
          data: {
            buffer: processedFile.buffer,
            filename: mediaFile.filename,
            mimeType: processedFile.mimeType,
            bucketName: 'onefive-storage',
          },
        });

        uploadedMedias.push({
          url: uploadResult.url,
          mimeType: processedFile.mimeType,
          fileName: mediaFile.filename,
          size: processedFile.buffer.length,
        });
      } catch (error) {
        this.logger.error('Failed to process/upload media file', {
          transactionId: req.id,
          filename: mediaFile.filename,
          error: error.message,
        });
        // Continue avec les autres fichiers au lieu d'échouer complètement
      }
    }

    const requestMedias = Array.isArray(fields.medias)
      ? (fields.medias as PostMediaDto[])
      : [];

    const medias: PostMediaDto[] = [...requestMedias, ...uploadedMedias];

    const createPostDto = plainToInstance(CreatePostDto, {
      content: fields.content || '',
      tags: parsedTags,
      medias,
      repostedPostId: fields.repostedPostId,
    });

    const validationErrors = await validate(createPostDto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (validationErrors.length > 0) {
      throw new BadRequestException(validationErrors);
    }

    this.logger.debug('Creating post with data', {
      transactionId: req.id,
      createPostDto,
    });

    // Validate that content or media is required
    const hasContent =
      createPostDto.content && createPostDto.content.trim().length > 0;
    const hasMedia = createPostDto.medias && createPostDto.medias.length > 0;

    if (!hasContent && !hasMedia) {
      throw new BadRequestException('Content or media is required');
    }

    // Get user profile for author ID only
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Create post
    const post = await this.postService.create({
      transactionId,
      data: {
        author: {
          connect: {
            id: profile.id,
          },
        },
        content: createPostDto.content,
        medias: (createPostDto.medias ||
          []) as unknown as Prisma.InputJsonValue[],
        tags: createPostDto.tags || [],
        repostedPost: createPostDto.repostedPostId
          ? {
              connect: {
                id: createPostDto.repostedPostId,
              },
            }
          : undefined,
      },
    });

    // Return minimal post data - frontend will enrich with current user profile data
    // Ensure dates are valid ISO strings
    const createdAt =
      post.createdAt instanceof Date
        ? post.createdAt.toISOString()
        : new Date().toISOString();
    const updatedAt =
      post.updatedAt instanceof Date
        ? post.updatedAt.toISOString()
        : new Date().toISOString();

    this.posthogService.capture(userId, 'post_created', {
      has_media: medias.length > 0,
      tag_count: (createPostDto.tags || []).length,
    });

    // Mark own post as viewed so the mix feed doesn't re-propose it
    this.prisma.postView
      .create({
        data: {
          post: { connect: { id: post.id } },
          viewer: { connect: { id: profile.id } },
        },
      })
      .catch(() => {});

    return {
      id: post.id,
      createdAt,
      updatedAt,
    };
  }
}
