import {
  Controller,
  Get,
  Param,
  Query,
  Inject,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { SignedUrlHandler } from '../handlers/signed-url.handler';
import {
  GetSignedUrlDto,
  GetSignedUrlResponseDto,
} from '../dto/get-signed-url.dto';
import { FastifyRequest } from 'fastify';
import { SessionGuard } from '../../../common/guards/session-guard/session.guard';
import { FastifyRequestUserId } from '../../../types/fastify-request-user-id';
import { DataroomMemberGuard } from '../../guards/dataroom-member.guard';

@Controller('dataroom/:dataroomId/file/:fileId/signed-url')
@UseGuards(SessionGuard, DataroomMemberGuard)
export class SignedUrlController {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly signedUrlHandler: SignedUrlHandler,
  ) {}

  @Get()
  async get(
    @Req() req: FastifyRequest & FastifyRequestUserId,
    @Param('dataroomId') dataroomId: string,
    @Param('fileId') fileId: string,
    @Query('action') action?: 'view' | 'download',
  ): Promise<{ success: true; data: GetSignedUrlResponseDto['data'] }> {
    this.logger.info('Getting signed URL', {
      transactionId: req.id,
      dataroomId,
      fileId,
      action,
      userId: req.userId,
    });

    const getSignedUrlDto: GetSignedUrlDto = {
      dataroomId,
      fileId,
      action,
      transactionId: req.id,
      member: {
        groupId: (req as any).dataroomMember.groupId,
        group: {
          hasAllAccess: (req as any).dataroomMember.group.hasAllAccess,
        },
      },
    };

    const result = await this.signedUrlHandler.get(getSignedUrlDto);
    return { success: true, data: result.data };
  }
}
