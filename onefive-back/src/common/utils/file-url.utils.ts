import { LogService } from 'logstash-winston-3';
import { StorageService } from '../../storage/storage.service';

export class FileUrlUtils {
  constructor(private readonly logger: LogService) {}

  /**
   * Génère l'URL complète d'un fichier à partir de son ID
   * Gère la différence entre l'environnement de développement (LocalStack) et la production
   */
  async getFileUrl(
    fileId: string,
    storageService?: StorageService,
  ): Promise<string> {
    // Pour LocalStack, utiliser directement l'URL publique
    // Les URLs signées peuvent ne pas fonctionner correctement avec LocalStack
    const isLocalStack =
      process.env.AWS_ENDPOINT?.includes('localstack') ||
      process.env.AWS_ENDPOINT?.includes('localhost') ||
      process.env.NODE_ENV === 'development';

    if (isLocalStack) {
      const publicUrl = process.env.R2_PUBLIC_URL || 'http://localhost:4566';
      const bucketName = process.env.R2_BUCKET_NAME || 'onefive-storage';
      const url = `${publicUrl}/${bucketName}/${fileId}`;

      this.logger.info('🔗 Using direct public URL for LocalStack', {
        fileId,
        url,
        bucketName,
      });

      return url;
    }

    if (storageService) {
      try {
        // Pour la production, générer une URL signée
        const result = await storageService.signUrl({
          transactionId: 'file-url-utils',
          data: { fileId, expiresIn: 3600 }, // 1 heure
        });
        return result.url;
      } catch (error) {
        this.logger.warn('Failed to generate signed URL for file', {
          fileId,
          error: error.message,
        });
      }
    }

    // Fallback vers une URL publique avec bucket
    const publicUrl = process.env.R2_PUBLIC_URL || 'http://localhost:4566';
    const bucketName = process.env.R2_BUCKET_NAME || 'onefive-storage';
    return `${publicUrl}/${bucketName}/${fileId}`;
  }

  /**
   * Corrige les anciennes URLs qui n'ont pas le bucket dans le chemin
   */
  fixLegacyUrl(legacyUrl: string): string {
    // Corriger les anciennes URLs qui n'ont pas le bucket
    const publicUrl = process.env.R2_PUBLIC_URL || 'http://localhost:4566';
    const bucketName = process.env.R2_BUCKET_NAME || 'onefive-storage';

    this.logger.info('🔧 DEBUG - fixLegacyUrl', {
      legacyUrl,
      publicUrl,
      bucketName,
      startsWithPublicUrl: legacyUrl.startsWith(`${publicUrl}/`),
      includesBucket: legacyUrl.includes(`/${bucketName}/`),
    });

    // Si l'URL commence par publicUrl mais n'a pas le bucket, l'ajouter
    if (
      legacyUrl.startsWith(`${publicUrl}/`) &&
      !legacyUrl.includes(`/${bucketName}/`)
    ) {
      const fileId = legacyUrl.replace(`${publicUrl}/`, '');
      const fixedUrl = `${publicUrl}/${bucketName}/${fileId}`;
      this.logger.info('🔧 DEBUG - URL corrigée', { legacyUrl, fixedUrl });
      return fixedUrl;
    }

    this.logger.info('🔧 DEBUG - URL non modifiée', { legacyUrl });
    return legacyUrl;
  }
}
