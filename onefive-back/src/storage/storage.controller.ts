import {
  Controller,
  Post,
  Get,
  Param,
  Req,
  Res,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { FastifyRequestUserId } from 'src/types/fastify-request-user-id';
import { LogService } from 'logstash-winston-3';
import { StorageService } from './storage.service';
import { FileUrlUtils } from 'src/common/utils/file-url.utils';
import { Public } from 'src/common/decorators/public.decorator';

@Controller()
export class StorageController {
  private fileUrlUtils: FileUrlUtils;

  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly storageService: StorageService,
  ) {
    this.fileUrlUtils = new FileUrlUtils(logger);
  }

  /**
   * Generic file upload endpoint — used when no entity ID is available yet
   * (e.g. startup logo/cover during creation wizard).
   * Returns the public URL of the uploaded file.
   */
  @Post('storage/upload')
  async upload(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
  ): Promise<{ success: true; data: { url: string; id: string } }> {
    const data = await req.file();

    if (!data) {
      throw new BadRequestException('No file provided');
    }

    const buffer = await data.toBuffer();
    const bucketName = process.env.R2_BUCKET_NAME || 'onefive-storage';

    const result = await this.storageService.uploadFile({
      transactionId: req.id,
      data: {
        buffer,
        filename: data.filename,
        mimeType: data.mimetype,
        bucketName,
      },
    });

    return { success: true, data: { url: result.url, id: result.id } };
  }

  /**
   * Serve a file by its ID — redirects to the actual storage URL.
   * Used when the frontend constructs URLs as `${API_URL}/file/:id`
   * (e.g. avatar/cover images in search results, navbar, etc.).
   */
  @Public()
  @Get('file/:id')
  async serveFile(
    @Param('id') id: string,
    @Res() res: FastifyReply,
  ): Promise<void> {
    const url = await this.fileUrlUtils.getFileUrl(id, this.storageService);
    return res.redirect(url, 302);
  }
}
