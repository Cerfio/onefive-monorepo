import { Controller, Post, Req, Inject } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from 'src/types/fastify-request-user-id';
import { UploadAvatarHandler } from './handlers/upload-avatar.handler';
import { UploadAvatarResponseDto } from './dto/upload-avatar.dto';
import { ProfileAvatarInvalidFileException } from './profile-avatar.exception';
import { LogService } from 'logstash-winston-3';

@Controller('profile-avatar')
export class ProfileAvatarController {
  constructor(
    private readonly uploadAvatarHandler: UploadAvatarHandler,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Post('/upload')
  async upload(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
  ): Promise<UploadAvatarResponseDto> {
    const data = await req.file();

    if (!data) {
      ProfileAvatarInvalidFileException.throw(this.logger, {
        transactionId: req.id,
        error: 'Aucun fichier fourni',
      });
    }

    const buffer = await data.toBuffer();

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

    const result = await this.uploadAvatarHandler.execute({
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
