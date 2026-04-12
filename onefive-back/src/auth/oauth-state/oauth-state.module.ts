import { Module } from '@nestjs/common';
import { OAuthStateService } from './oauth-state.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggerProvider } from '../../common/logger/logger.provider';

@Module({
  providers: [OAuthStateService, PrismaService, LoggerProvider],
  exports: [OAuthStateService],
})
export class OAuthStateModule {}
