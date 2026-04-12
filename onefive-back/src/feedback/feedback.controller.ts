import { BadRequestException, Controller, Post, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from '../types/fastify-request-user-id';
import { CreateFeedbackHandler } from './handlers/create-feedback.handler';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly createFeedbackHandler: CreateFeedbackHandler) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async create(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
  ) {
    const parts = req.parts();

    let type: string | undefined;
    let message: string | undefined;
    let url: string | undefined;
    let browserInfo: string | undefined;
    let screenshotFile: Express.Multer.File | undefined;

    for await (const part of parts) {
      if (part.type === 'file' && part.fieldname === 'screenshot') {
        const buffer = await part.toBuffer();
        screenshotFile = {
          fieldname: part.fieldname,
          originalname: part.filename,
          encoding: part.encoding,
          mimetype: part.mimetype,
          size: buffer.length,
          buffer,
          destination: '',
          filename: part.filename,
          path: '',
          stream: part.file,
        };
      } else if (part.type === 'field') {
        const value = part.value as string;
        if (part.fieldname === 'type') type = value;
        else if (part.fieldname === 'message') message = value;
        else if (part.fieldname === 'url') url = value;
        else if (part.fieldname === 'browserInfo') browserInfo = value;
      }
    }

    if (!type || !message) {
      throw new BadRequestException('Les champs type et message sont requis');
    }

    const result = await this.createFeedbackHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      type,
      message,
      url,
      browserInfo,
      screenshotFile,
    });

    return { success: true, data: result };
  }
}
