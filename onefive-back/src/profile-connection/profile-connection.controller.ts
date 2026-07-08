import {
  Controller,
  HttpCode,
  Post,
  Patch,
  Delete,
  Get,
  Param,
  Req,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from '../types/fastify-request-user-id';
import { SendConnectionRequestHandler } from './handlers/send-connection-request.handler';
import { AcceptConnectionHandler } from './handlers/accept-connection.handler';
import { RejectConnectionHandler } from './handlers/reject-connection.handler';
import { DeleteConnectionHandler } from './handlers/delete-connection.handler';
import { ListConnectionsHandler } from './handlers/list-connections.handler';
import { ListPendingConnectionsHandler } from './handlers/list-pending-connections.handler';
import { GetConnectionStatusHandler } from './handlers/get-connection-status.handler';
import { GetMutualConnectionsHandler } from './handlers/get-mutual-connections.handler';
import { ApiResponseDto, ApiSuccessResponseDto } from '../common/dto';

@Controller('profiles')
export class ProfileConnectionController {
  constructor(
    private readonly sendConnectionRequestHandler: SendConnectionRequestHandler,
    private readonly acceptConnectionHandler: AcceptConnectionHandler,
    private readonly rejectConnectionHandler: RejectConnectionHandler,
    private readonly deleteConnectionHandler: DeleteConnectionHandler,
    private readonly listConnectionsHandler: ListConnectionsHandler,
    private readonly listPendingConnectionsHandler: ListPendingConnectionsHandler,
    private readonly getConnectionStatusHandler: GetConnectionStatusHandler,
    private readonly getMutualConnectionsHandler: GetMutualConnectionsHandler,
  ) {}

  @Post(':profileId/connect')
  @HttpCode(200)
  async sendRequest(
    @Param('profileId') profileId: string,
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
  ): Promise<ApiSuccessResponseDto> {
    await this.sendConnectionRequestHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      profileId,
    });
    return { success: true };
  }

  @Patch(':profileId/connect/accept')
  async accept(
    @Param('profileId') profileId: string,
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
  ): Promise<ApiSuccessResponseDto> {
    await this.acceptConnectionHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      profileId,
    });
    return { success: true };
  }

  @Patch(':profileId/connect/reject')
  async reject(
    @Param('profileId') profileId: string,
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
  ): Promise<ApiSuccessResponseDto> {
    await this.rejectConnectionHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      profileId,
    });
    return { success: true };
  }

  @Delete(':profileId/connect')
  async deleteConnection(
    @Param('profileId') profileId: string,
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
  ): Promise<ApiSuccessResponseDto> {
    await this.deleteConnectionHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      profileId,
    });
    return { success: true };
  }

  @Get('connections')
  async listConnections(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
  ): Promise<ApiResponseDto<unknown>> {
    const connections = await this.listConnectionsHandler.execute({
      transactionId: req.id,
      userId: req.userId,
    });
    return { success: true, data: connections };
  }

  @Get('connections/pending')
  async listPending(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
  ): Promise<ApiResponseDto<unknown>> {
    const pending = await this.listPendingConnectionsHandler.execute({
      transactionId: req.id,
      userId: req.userId,
    });
    return { success: true, data: pending };
  }

  @Get(':profileId/connection-status')
  async getStatus(
    @Param('profileId') profileId: string,
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
  ): Promise<ApiResponseDto<unknown>> {
    const status = await this.getConnectionStatusHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      profileId,
    });
    return { success: true, data: status };
  }

  @Get(':profileId/mutual-connections')
  async getMutual(
    @Param('profileId') profileId: string,
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.getMutualConnectionsHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      otherProfileId: profileId,
    });
    return { success: true, data: result };
  }
}
