import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { LogService } from 'logstash-winston-3';
import { Log } from '../common/logger/logger.decorator';
import {
  GetObjectCommand,
  S3Client,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import { createId } from '@paralleldrive/cuid2';
import {
  StorageUploadException,
  StorageGetException,
  StorageDeleteException,
  StorageSignUrlException,
  StorageFileNotFoundException,
} from './storage.exception';

export interface UploadFileInput {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  bucketName: string;
}

export interface UploadFileOutput {
  id: string;
  url: string;
}

export interface SignUrlInput {
  fileId: string;
  expiresIn?: number; // en secondes, défaut 3600 (1 heure)
}

export interface SignUrlOutput {
  url: string;
}

@Injectable()
export class StorageService {
  private s3Client: S3Client;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @Inject('Logger') private readonly logger: LogService,
  ) {
    const accountId = this.configService.get('R2_ACCOUNT_ID') ?? '';
    const isLocalStack =
      accountId.includes('localhost') || accountId.includes('localstack');

    this.s3Client = new S3Client({
      region: isLocalStack ? 'us-east-1' : 'auto',
      endpoint: isLocalStack
        ? `http://${accountId}`
        : `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.configService.get('R2_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('R2_SECRET_ACCESS_KEY'),
      },
      forcePathStyle: true,
      tls: !isLocalStack,
    });
  }

  @Log()
  async uploadFile({
    transactionId,
    data,
  }: {
    transactionId: string;
    data: UploadFileInput;
  }): Promise<UploadFileOutput> {
    try {
      // Générer un ID pour le fichier
      const fileId = this.generateFileId();

      // Upload vers Cloudflare R2
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: data.bucketName,
          Key: fileId,
          Body: Readable.from(data.buffer),
          ContentType: data.mimeType,
        },
      });

      await upload.done();

      // Inclure le bucket dans l'URL pour LocalStack
      const baseUrl = this.configService.get('R2_PUBLIC_URL');
      const bucketName = data.bucketName;
      const publicUrl = `${baseUrl}/${bucketName}/${fileId}`;

      this.logger.info('📸 Generated public URL for file (upload only)', {
        transactionId,
        fileId,
        bucket: data.bucketName,
        publicUrl,
      });

      return {
        id: fileId,
        url: publicUrl,
      };
    } catch (error: unknown) {
      this.logger.error('Storage upload failed', {
        transactionId,
        error: error instanceof Error ? error.message : String(error),
      });
      StorageUploadException.throw(this.logger, {
        transactionId,
        filename: data.filename,
        mimeType: data.mimeType,
        bucketName: data.bucketName,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
    }
  }

  private generateFileId(): string {
    // Utilise CUID2 pour générer des IDs uniques et sécurisés
    return createId();
  }

  @Log()
  async signUrl({
    transactionId,
    data,
  }: {
    transactionId: string;
    data: SignUrlInput;
  }): Promise<SignUrlOutput> {
    try {
      const file = await this.prisma.file.findUnique({
        where: { id: data.fileId },
      });

      if (!file) {
        StorageFileNotFoundException.throw(this.logger, {
          transactionId,
          fileId: data.fileId,
          timestamp: new Date().toISOString(),
        });
      }

      const command = new GetObjectCommand({
        Bucket: file.bucket,
        Key: file.id,
      });

      const expiresIn = data.expiresIn || 3600;
      const url = await getSignedUrl(this.s3Client, command, { expiresIn });

      return { url };
    } catch (error) {
      StorageSignUrlException.throw(this.logger, {
        transactionId,
        fileId: data.fileId,
        expiresIn: data.expiresIn,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Log()
  async signUrlByKey({
    transactionId,
    bucket,
    key,
    expiresIn = 3600,
  }: {
    transactionId: string;
    bucket: string;
    key: string;
    expiresIn?: number;
  }): Promise<SignUrlOutput> {
    try {
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      return { url };
    } catch (error) {
      StorageSignUrlException.throw(this.logger, {
        transactionId,
        key,
        bucket,
        expiresIn,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Log()
  async deleteFile({
    transactionId,
    fileId,
  }: {
    transactionId: string;
    fileId: string;
  }): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const file = await tx.file.findUnique({
          where: { id: fileId },
        });

        if (!file) {
          StorageFileNotFoundException.throw(this.logger, {
            transactionId,
            fileId,
            timestamp: new Date().toISOString(),
          });
        }

        // Supprimer du stockage R2
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: file.bucket,
            Key: file.id,
          }),
        );

        // Supprimer de la base de données
        await tx.file.delete({
          where: { id: fileId },
        });
      });
    } catch (error: unknown) {
      StorageDeleteException.throw(this.logger, {
        transactionId,
        fileId,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Télécharge les octets bruts d'un objet S3/R2 (par bucket + clé) en Buffer.
   * Utilisé par le rendu serveur des PDF (rasterisation view-only) : on récupère
   * le PDF côté serveur pour ne jamais l'exposer tel quel au client.
   */
  @Log()
  async getObjectBuffer({
    transactionId,
    bucket,
    key,
  }: {
    transactionId: string;
    bucket: string;
    key: string;
  }): Promise<Buffer> {
    try {
      const response = await this.s3Client.send(
        new GetObjectCommand({ Bucket: bucket, Key: key }),
      );
      const body = response.Body as Readable;
      const chunks: Buffer[] = [];
      for await (const chunk of body) {
        chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
      }
      return Buffer.concat(chunks);
    } catch (error) {
      StorageGetException.throw(this.logger, {
        transactionId,
        key,
        bucket,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Log()
  async getFileInfo({
    transactionId,
    fileId,
  }: {
    transactionId: string;
    fileId: string;
  }) {
    try {
      const file = await this.prisma.file.findUnique({
        where: { id: fileId },
      });

      if (!file) {
        StorageFileNotFoundException.throw(this.logger, {
          transactionId,
          fileId,
          timestamp: new Date().toISOString(),
        });
      }

      return file;
    } catch (error) {
      StorageGetException.throw(this.logger, {
        transactionId,
        fileId,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
