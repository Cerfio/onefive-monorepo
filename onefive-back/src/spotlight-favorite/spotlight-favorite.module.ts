import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SessionsModule } from '../sessions/sessions.module';
import { LoggerProvider } from '../common/logger/logger.provider';
import { SpotlightFavoriteController } from './spotlight-favorite.controller';
import { SpotlightFavoriteService } from './spotlight-favorite.service';

@Module({
  imports: [PrismaModule, SessionsModule],
  controllers: [SpotlightFavoriteController],
  providers: [SpotlightFavoriteService, LoggerProvider],
})
export class SpotlightFavoriteModule {}
