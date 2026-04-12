import {
  Controller,
  HttpCode,
  Post,
  Get,
  Body,
  Req,
  Query,
} from '@nestjs/common';
import { CreateConnectionHandler } from './handlers/create-connection.handler';
import { ProfileRelationshipsService } from './profile-relationships.service';
import { ConnectProfileDto } from './dto/connect-profile.dto';
import { ConnectProfileResponseDto } from './dto/profile-relationships-response.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { SessionGuard } from '../common/guards/session-guard/session.guard';
import { UseGuards } from '@nestjs/common';
import { FastifyRequestUserId } from 'src/types/fastify-request-user-id';

@Controller('profile-relationships')
@UseGuards(SessionGuard)
export class ProfileRelationshipsController {
  constructor(
    private readonly createConnectionHandler: CreateConnectionHandler,
  ) {}

  @Post('connect')
  @HttpCode(200)
  async connect(
    @Req() req: FastifyRequestUserId,
    @Body() body: ConnectProfileDto,
  ): Promise<ApiResponseDto<ConnectProfileResponseDto>> {
    const result = await this.createConnectionHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      profileId: body.profileId,
    });
    return { success: true, data: result };
  }

  // Deprecated: use enriched payloads via /network/people
}
