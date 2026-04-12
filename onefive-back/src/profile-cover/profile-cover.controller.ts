import { Controller, Post, Req, Inject } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from 'src/types/fastify-request-user-id';
import { UploadCoverHandler } from './handlers/upload-cover.handler';
import { UploadCoverResponseDto } from './dto/upload-cover.dto';
import { ProfileCoverInvalidFileException } from './profile-cover.exception';
import { LogService } from 'logstash-winston-3';

@Controller('profile-cover')
export class ProfileCoverController {
  constructor(
    private readonly uploadCoverHandler: UploadCoverHandler,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Post('/upload')
  async upload(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
  ): Promise<UploadCoverResponseDto> {
    // Traitement des fichiers avec Fastify multipart
    const data = await req.file();

    if (!data) {
      ProfileCoverInvalidFileException.throw(this.logger, {
        transactionId: req.id,
        error: 'Aucun fichier fourni',
      });
    }

    // Convertir le stream en buffer
    const buffer = await data.toBuffer();

    // Créer un objet compatible Express.Multer.File
    const file: Express.Multer.File = {
      fieldname: data.fieldname,
      originalname: data.filename,
      encoding: data.encoding,
      mimetype: data.mimetype,
      size: buffer.length,
      buffer: buffer,
      destination: '',
      filename: data.filename,
      path: '',
      stream: data.file,
    };

    const result = await this.uploadCoverHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      file,
    });

    return {
      success: true,
      data: result,
    };
  }
}
