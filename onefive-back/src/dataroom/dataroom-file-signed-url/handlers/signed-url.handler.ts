import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { SignedUrlService } from '../services/signed-url.service';
import { FileService } from '../../file/services/file.service';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  GetSignedUrlDto,
  GetSignedUrlResponseDto,
} from '../dto/get-signed-url.dto';
import { FileNotFoundException } from '../exceptions/signed-url.exception';

@Injectable()
export class SignedUrlHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly signedUrlService: SignedUrlService,
    private readonly fileService: FileService,
    private readonly prisma: PrismaService,
  ) {}

  async get(input: GetSignedUrlDto): Promise<GetSignedUrlResponseDto> {
    // Récupérer le fichier pour vérifier qu'il existe
    const file = await this.fileService.get({
      transactionId: input.transactionId,
      where: { id: input.fileId },
    });

    if (!file) {
      FileNotFoundException.throw(this.logger, {
        transactionId: input.transactionId,
      });
    }

    // Vérifier les permissions sur la catégorie du fichier
    const { member } = input;

    if (!member.group.hasAllAccess) {
      const permission = await this.prisma.permissionCategory.findUnique({
        where: {
          categoryId_groupId: {
            categoryId: file.categoryId,
            groupId: member.groupId,
          },
        },
      });

      const requiredPermission =
        input.action === 'download' ? 'canDownload' : 'canView';

      if (!permission || !permission[requiredPermission]) {
        this.logger.warn(
          'Signed URL access denied - insufficient permissions',
          {
            transactionId: input.transactionId,
            dataroomId: input.dataroomId,
            fileId: input.fileId,
            groupId: member.groupId,
            categoryId: file.categoryId,
            requiredPermission,
          },
        );
        throw new ForbiddenException(
          'You do not have permission to access this file',
        );
      }
    }

    // Générer l'URL signée
    const signedUrl = await this.signedUrlService.get({
      transactionId: input.transactionId,
      storageId: file.storageId,
      expiresIn: 60,
    });

    // Future: persist AccessLog to DB when action is specified
    if (input.action) {
      this.logger.info('Access log created', {
        transactionId: input.transactionId,
        dataroomId: input.dataroomId,
        fileId: input.fileId,
        action: input.action.toUpperCase(),
      });
    }

    return {
      data: {
        url: signedUrl.url,
      },
    };
  }
}
