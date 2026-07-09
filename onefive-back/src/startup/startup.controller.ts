import {
  Controller,
  Post,
  Get,
  Put,
  Patch,
  Delete,
  Req,
  Query,
  UseGuards,
  Param,
  Body,
  ValidationPipe,
  Inject,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LogService } from 'logstash-winston-3';
import { CreateStartupHandler } from './handlers/create-startup.handler';
import { GetUserStartupsHandler } from './handlers/get-user-startups.handler';
import { GetProfileStartupsHandler } from './handlers/get-profile-startups.handler';
import { SearchProfilesHandler } from './handlers/search-profiles.handler';
import { SearchInvestorsHandler } from './handlers/search-investors.handler';
import { GetStartupHandler } from './handlers/get-startup.handler';
import { GetStartupMembersHandler } from './handlers/get-startup-members.handler';
import { GetStartupPostsHandler } from './handlers/get-startup-posts.handler';
import { UpdateStartupHandler } from './handlers/update-startup.handler';
import { GetFundingHandler } from './handlers/get-funding.handler';
import { UpdateFundingHandler } from './handlers/update-funding.handler';
import { GetFundingHistoryHandler } from './handlers/get-funding-history.handler';
import { CreateFundingHistoryHandler } from './handlers/create-funding-history.handler';
import { UpdateFundingHistoryHandler } from './handlers/update-funding-history.handler';
import { DeleteFundingHistoryHandler } from './handlers/delete-funding-history.handler';
import { UploadStartupLogoHandler } from './handlers/upload-startup-logo.handler';
import { UploadStartupCoverHandler } from './handlers/upload-startup-cover.handler';
import { AddMemberHandler } from './handlers/add-member.handler';
import { UpdateMemberHandler } from './handlers/update-member.handler';
import { RemoveMemberHandler } from './handlers/remove-member.handler';
import { LeaveStartupHandler } from './handlers/leave-startup.handler';
import { TransferOwnershipHandler } from './handlers/transfer-ownership.handler';
import { DeleteStartupHandler } from './handlers/delete-startup.handler';
import { GetStartupInvitationsHandler } from './handlers/get-startup-invitations.handler';
import { CancelInvitationHandler } from './handlers/cancel-invitation.handler';
import { RespondInvestorInvitationHandler } from './handlers/respond-investor-invitation.handler';
import { RespondInvestorInvitationByTokenHandler } from './handlers/respond-investor-invitation-by-token.handler';
import { GetInvestorInvitationByTokenHandler } from './handlers/get-investor-invitation-by-token.handler';
import { ToggleInvestorVisibilityHandler } from './handlers/toggle-investor-visibility.handler';
import { GetMyInvestmentsHandler } from './handlers/get-my-investments.handler';
import { UpdateStartupDto } from './dto/update-startup.dto';
import { UpdateFundingDto } from './dto/update-funding.dto';
import { CreateFundingHistoryDto } from './dto/funding-history.dto';
import { UpdateFundingHistoryDto } from './dto/funding-history.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { TransferOwnershipDto } from './dto/transfer-ownership.dto';
import { SessionGuard } from '../common/guards/session-guard/session.guard';
import { FastifyRequestUserId } from 'src/types/fastify-request-user-id';
import { StartupLogoInvalidFileException } from './startup.exception';
import {
  CreateStartupResponseDto,
  ListUserStartupsResponseDto,
  ListProfileStartupsResponseDto,
  StartupResponseDto,
} from './dto/startup-response.dto';
import { ApiResponseDto, ApiSuccessResponseDto } from '../common/dto';

@Controller('startup')
@UseGuards(SessionGuard)
export class StartupController {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly createStartupHandler: CreateStartupHandler,
    private readonly getUserStartupsHandler: GetUserStartupsHandler,
    private readonly getProfileStartupsHandler: GetProfileStartupsHandler,
    private readonly searchProfilesHandler: SearchProfilesHandler,
    private readonly searchInvestorsHandler: SearchInvestorsHandler,
    private readonly getStartupHandler: GetStartupHandler,
    private readonly getStartupMembersHandler: GetStartupMembersHandler,
    private readonly getStartupPostsHandler: GetStartupPostsHandler,
    private readonly updateStartupHandler: UpdateStartupHandler,
    private readonly getFundingHandler: GetFundingHandler,
    private readonly updateFundingHandler: UpdateFundingHandler,
    private readonly getFundingHistoryHandler: GetFundingHistoryHandler,
    private readonly createFundingHistoryHandler: CreateFundingHistoryHandler,
    private readonly updateFundingHistoryHandler: UpdateFundingHistoryHandler,
    private readonly deleteFundingHistoryHandler: DeleteFundingHistoryHandler,
    private readonly uploadStartupLogoHandler: UploadStartupLogoHandler,
    private readonly uploadStartupCoverHandler: UploadStartupCoverHandler,
    private readonly addMemberHandler: AddMemberHandler,
    private readonly updateMemberHandler: UpdateMemberHandler,
    private readonly removeMemberHandler: RemoveMemberHandler,
    private readonly leaveStartupHandler: LeaveStartupHandler,
    private readonly transferOwnershipHandler: TransferOwnershipHandler,
    private readonly deleteStartupHandler: DeleteStartupHandler,
    private readonly getStartupInvitationsHandler: GetStartupInvitationsHandler,
    private readonly cancelInvitationHandler: CancelInvitationHandler,
    private readonly respondInvestorInvitationHandler: RespondInvestorInvitationHandler,
    private readonly respondInvestorInvitationByTokenHandler: RespondInvestorInvitationByTokenHandler,
    private readonly getInvestorInvitationByTokenHandler: GetInvestorInvitationByTokenHandler,
    private readonly toggleInvestorVisibilityHandler: ToggleInvestorVisibilityHandler,
    private readonly getMyInvestmentsHandler: GetMyInvestmentsHandler,
  ) {}

  @Post()
  @Throttle({
    short: { limit: 2, ttl: 1000 },
    medium: { limit: 5, ttl: 10000 },
    long: { limit: 5, ttl: 60000 },
  }) // 5 startups/min anti-spam
  async createStartup(
    @Req() req: FastifyRequestUserId,
  ): Promise<ApiResponseDto<CreateStartupResponseDto>> {
    const result = await this.createStartupHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      req: req as any,
    });
    return { success: true, data: result };
  }

  @Get('me')
  async getUserStartups(
    @Req() req: FastifyRequestUserId,
  ): Promise<ApiResponseDto<ListUserStartupsResponseDto>> {
    const result = await this.getUserStartupsHandler.execute({
      transactionId: req.id,
      userId: req.userId,
    });
    return { success: true, data: result };
  }

  @Get('profile/:profileId')
  async getProfileStartups(
    @Req() req: FastifyRequestUserId,
    @Param('profileId') profileId: string,
  ): Promise<ApiResponseDto<ListProfileStartupsResponseDto>> {
    const result = await this.getProfileStartupsHandler.execute({
      transactionId: req.id,
      profileId,
    });
    return { success: true, data: result };
  }

  @Get('search-profiles')
  async searchProfiles(
    @Req() req: FastifyRequestUserId,
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.searchProfilesHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      query,
      limit: limit ? parseInt(limit) : 5,
    });
    return { success: true, data: result };
  }

  @Get('search-investors')
  async searchInvestors(
    @Req() req: FastifyRequestUserId,
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.searchInvestorsHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      query,
      limit: limit ? parseInt(limit) : 10,
    });
    return { success: true, data: result };
  }

  // --- Investor invitation endpoints ---

  @Get('my-investments')
  async getMyInvestments(
    @Req() req: FastifyRequestUserId,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.getMyInvestmentsHandler.execute({
      transactionId: req.id,
      userId: req.userId,
    });
    return { success: true, data: result };
  }

  @Get('investor-invitation/token/:token')
  async getInvestorInvitationByToken(
    @Req() req: FastifyRequestUserId,
    @Param('token') token: string,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.getInvestorInvitationByTokenHandler.execute({
      transactionId: req.id,
      token,
    });
    return { success: true, data: result };
  }

  @Put('investor-invitation/token/:token/accept')
  async acceptInvestorInvitationByToken(
    @Req() req: FastifyRequestUserId,
    @Param('token') token: string,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.respondInvestorInvitationByTokenHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      token,
      action: 'accept',
    });
    return { success: true, data: result };
  }

  @Put('investor-invitation/token/:token/decline')
  async declineInvestorInvitationByToken(
    @Req() req: FastifyRequestUserId,
    @Param('token') token: string,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.respondInvestorInvitationByTokenHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      token,
      action: 'decline',
    });
    return { success: true, data: result };
  }

  @Put('investor-invitation/:invitationId/accept')
  async acceptInvestorInvitation(
    @Req() req: FastifyRequestUserId,
    @Param('invitationId') invitationId: string,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.respondInvestorInvitationHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      invitationId,
      action: 'accept',
    });
    return { success: true, data: result };
  }

  @Put('investor-invitation/:invitationId/decline')
  async declineInvestorInvitation(
    @Req() req: FastifyRequestUserId,
    @Param('invitationId') invitationId: string,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.respondInvestorInvitationHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      invitationId,
      action: 'decline',
    });
    return { success: true, data: result };
  }

  @Put('investor-invitation/:invitationId/visibility')
  async toggleInvestorVisibility(
    @Req() req: FastifyRequestUserId,
    @Param('invitationId') invitationId: string,
    @Body() body: { isVisible: boolean },
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.toggleInvestorVisibilityHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      invitationId,
      isVisible: body.isVisible,
    });
    return { success: true, data: result };
  }

  // Routes spécifiques doivent être définies AVANT la route générique :id
  @Get(':id/members')
  async getStartupMembers(
    @Req() req: FastifyRequestUserId,
    @Param('id') startupId: string,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.getStartupMembersHandler.execute({
      transactionId: req.id,
      startupId,
    });
    return { success: true, data: result };
  }

  @Get(':id/posts')
  async getStartupPosts(
    @Req() req: FastifyRequestUserId,
    @Param('id') startupId: string,
    @Query('limit') limit?: string,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.getStartupPostsHandler.execute({
      transactionId: req.id,
      startupId,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    return { success: true, data: result };
  }

  @Post(':id/members')
  async addMember(
    @Req() req: FastifyRequestUserId,
    @Param('id') startupId: string,
    @Body(ValidationPipe) payload: AddMemberDto,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.addMemberHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      startupId,
      payload,
    });
    return { success: true, data: result };
  }

  @Patch(':id/members/:memberId')
  async updateMember(
    @Req() req: FastifyRequestUserId,
    @Param('id') startupId: string,
    @Param('memberId') memberId: string,
    @Body(ValidationPipe) payload: UpdateMemberDto,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.updateMemberHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      startupId,
      memberId,
      payload,
    });
    return { success: true, data: result };
  }

  @Delete(':id/members/:memberId')
  async removeMember(
    @Req() req: FastifyRequestUserId,
    @Param('id') startupId: string,
    @Param('memberId') memberId: string,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.removeMemberHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      startupId,
      memberId,
    });
    return { success: true, data: result };
  }

  @Post(':id/leave')
  async leaveStartup(
    @Req() req: FastifyRequestUserId,
    @Param('id') startupId: string,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.leaveStartupHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      startupId,
    });
    return { success: true, data: result };
  }

  @Post(':id/transfer-ownership')
  async transferOwnership(
    @Req() req: FastifyRequestUserId,
    @Param('id') startupId: string,
    @Body(ValidationPipe) body: TransferOwnershipDto,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.transferOwnershipHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      startupId,
      newOwnerMemberId: body.newOwnerMemberId,
    });
    return { success: true, data: result };
  }

  @Get(':id/invitations')
  async getStartupInvitations(
    @Req() req: FastifyRequestUserId,
    @Param('id') startupId: string,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.getStartupInvitationsHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      startupId,
    });
    return { success: true, data: result };
  }

  @Delete(':id/invitations/:invitationId')
  async cancelInvitation(
    @Req() req: FastifyRequestUserId,
    @Param('id') startupId: string,
    @Param('invitationId') invitationId: string,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.cancelInvitationHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      startupId,
      invitationId,
    });
    return { success: true, data: result };
  }

  @Get(':id/funding/history')
  async getFundingHistory(
    @Req() req: FastifyRequestUserId,
    @Param('id') startupId: string,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.getFundingHistoryHandler.execute({
      transactionId: req.id,
      startupId,
    });
    return { success: true, data: result };
  }

  @Post(':id/funding/history')
  async createFundingHistory(
    @Req() req: FastifyRequestUserId,
    @Param('id') startupId: string,
    @Body(ValidationPipe) body: CreateFundingHistoryDto,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.createFundingHistoryHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      startupId,
      data: body,
    });
    return { success: true, data: result };
  }

  @Put(':id/funding/history/:historyId')
  async updateFundingHistory(
    @Req() req: FastifyRequestUserId,
    @Param('id') startupId: string,
    @Param('historyId') historyId: string,
    @Body(ValidationPipe) body: UpdateFundingHistoryDto,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.updateFundingHistoryHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      startupId,
      historyId,
      data: body,
    });
    return { success: true, data: result };
  }

  @Delete(':id/funding/history/:historyId')
  async deleteFundingHistory(
    @Req() req: FastifyRequestUserId,
    @Param('id') startupId: string,
    @Param('historyId') historyId: string,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.deleteFundingHistoryHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      startupId,
      historyId,
    });
    return { success: true, data: result };
  }

  @Get(':id/funding')
  async getFunding(
    @Req() req: FastifyRequestUserId,
    @Param('id') startupId: string,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.getFundingHandler.execute({
      transactionId: req.id,
      startupId,
    });
    return { success: true, data: result };
  }

  @Put(':id/funding')
  async updateFunding(
    @Req() req: FastifyRequestUserId,
    @Param('id') startupId: string,
    @Body(ValidationPipe) body: UpdateFundingDto,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.updateFundingHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      startupId,
      data: body,
    });
    return { success: true, data: result };
  }

  @Post(':id/logo/upload')
  async uploadLogo(
    @Req() req: FastifyRequestUserId & { file: () => Promise<any> },
    @Param('id') startupId: string,
  ): Promise<ApiResponseDto<unknown>> {
    const data = await req.file();

    if (!data) {
      StartupLogoInvalidFileException.throw(this.logger, {
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

    const result = await this.uploadStartupLogoHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      startupId,
      file,
    });

    return { success: true, data: result };
  }

  @Post(':id/cover/upload')
  async uploadCover(
    @Req() req: FastifyRequestUserId & { file: () => Promise<any> },
    @Param('id') startupId: string,
  ): Promise<ApiResponseDto<unknown>> {
    const data = await req.file();

    if (!data) {
      StartupLogoInvalidFileException.throw(this.logger, {
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

    const result = await this.uploadStartupCoverHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      startupId,
      file,
    });

    return { success: true, data: result };
  }

  @Delete(':id')
  async deleteStartup(
    @Req() req: FastifyRequestUserId,
    @Param('id') startupId: string,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.deleteStartupHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      startupId,
    });
    return { success: true, data: result };
  }

  // Route générique :id doit être définie EN DERNIER
  @Get(':id')
  async getStartup(
    @Req() req: FastifyRequestUserId,
    @Param('id') startupId: string,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.getStartupHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      startupId,
    });
    return { success: true, data: result };
  }

  @Put(':id')
  async updateStartup(
    @Req() req: FastifyRequestUserId,
    @Param('id') startupId: string,
    @Body(ValidationPipe) body: UpdateStartupDto,
  ): Promise<ApiResponseDto<unknown>> {
    const result = await this.updateStartupHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      startupId,
      data: body,
    });
    return { success: true, data: result };
  }
}
