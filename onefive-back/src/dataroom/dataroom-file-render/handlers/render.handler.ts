import {
  Injectable,
  Inject,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LogService } from 'logstash-winston-3';
import { PrismaService } from '../../../prisma/prisma.service';
import { FileService } from '../../file/services/file.service';
import { StorageService } from '../../../storage/storage.service';
import { PdfRenderService } from '../services/pdf-render.service';

interface RenderMember {
  groupId: string;
  group: { hasAllAccess: boolean };
}

interface RenderContext {
  transactionId: string;
  userId: string;
  dataroomId: string;
  fileId: string;
  member: RenderMember;
}

@Injectable()
export class RenderHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
    private readonly storageService: StorageService,
    private readonly pdfRenderService: PdfRenderService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Vérifie l'existence + les droits (canView requis), calcule canDownload, et
   * renvoie le fichier. Rejette si non-visible.
   */
  private async authorize(ctx: RenderContext): Promise<{
    file: any;
    canDownload: boolean;
  }> {
    const file = await this.fileService.get({
      transactionId: ctx.transactionId,
      where: { id: ctx.fileId },
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }

    let canDownload = true;
    if (!ctx.member.group.hasAllAccess) {
      const permission = await this.prisma.permissionCategory.findUnique({
        where: {
          categoryId_groupId: {
            categoryId: file.categoryId,
            groupId: ctx.member.groupId,
          },
        },
      });
      if (!permission || !permission.canView) {
        this.logger.warn('Render access denied - cannot view', {
          transactionId: ctx.transactionId,
          dataroomId: ctx.dataroomId,
          fileId: ctx.fileId,
          groupId: ctx.member.groupId,
        });
        throw new ForbiddenException(
          'You do not have permission to view this file',
        );
      }
      canDownload = !!permission.canDownload;
    }

    return { file, canDownload };
  }

  private isPdf(file: any): boolean {
    return (
      file.mimetype === 'application/pdf' ||
      (typeof file.name === 'string' &&
        file.name.toLowerCase().endsWith('.pdf'))
    );
  }

  private async getPdfBuffer(
    ctx: RenderContext,
    storageId: string,
  ): Promise<Buffer> {
    const cached = this.pdfRenderService.getCachedBuffer(storageId);
    if (cached) return cached;

    const bucket =
      this.configService.get<string>('R2_BUCKET_NAME') || 'onefive-storage';
    const buffer = await this.storageService.getObjectBuffer({
      transactionId: ctx.transactionId,
      bucket,
      key: storageId,
    });
    this.pdfRenderService.cacheBuffer(storageId, buffer);
    return buffer;
  }

  /** Construit le libellé du filigrane à partir de l'identité authentifiée. */
  private async buildWatermark(userId: string): Promise<string> {
    const [profile, user] = await Promise.all([
      this.prisma.profile.findUnique({
        where: { userId },
        select: { firstName: true, lastName: true },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      }),
    ]);
    const name = profile
      ? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim()
      : '';
    const email = user?.email ? ` · ${user.email}` : '';
    const when = new Date().toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
    return `${name || 'OneFive'}${email} · ${when}`;
  }

  /**
   * Métadonnées de rendu : renderable (PDF ?), nombre de pages, viewOnly
   * (= pas de droit de téléchargement → on sert des images rasterisées).
   */
  async getInfo(ctx: RenderContext): Promise<{
    renderable: boolean;
    numPages: number;
    viewOnly: boolean;
  }> {
    const { file, canDownload } = await this.authorize(ctx);
    if (!this.isPdf(file)) {
      return { renderable: false, numPages: 0, viewOnly: !canDownload };
    }
    const buffer = await this.getPdfBuffer(ctx, file.storageId);
    const numPages = await this.pdfRenderService.getPageCount(buffer);
    return { renderable: true, numPages, viewOnly: !canDownload };
  }

  /** Rend une page en PNG watermarké. */
  async renderPage(
    ctx: RenderContext,
    pageNumber: number,
  ): Promise<Buffer> {
    const { file } = await this.authorize(ctx);
    if (!this.isPdf(file)) {
      throw new BadRequestException('File is not a PDF');
    }
    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
      throw new BadRequestException('Invalid page number');
    }
    const buffer = await this.getPdfBuffer(ctx, file.storageId);
    const watermark = await this.buildWatermark(ctx.userId);
    this.logger.info('Rendering dataroom PDF page', {
      transactionId: ctx.transactionId,
      dataroomId: ctx.dataroomId,
      fileId: ctx.fileId,
      pageNumber,
    });
    return this.pdfRenderService.renderPage({
      pdf: buffer,
      pageNumber,
      watermark,
    });
  }
}
