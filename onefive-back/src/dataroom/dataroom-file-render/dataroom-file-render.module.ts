import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RenderController } from './controllers/render.controller';
import { RenderHandler } from './handlers/render.handler';
import { PdfRenderService } from './services/pdf-render.service';
import { FileModule } from '../file/file.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { SessionsModule } from '../../sessions/sessions.module';
import { StorageModule } from '../../storage/storage.module';
import { LoggerProvider } from '../../common/logger/logger.provider';

@Module({
  imports: [
    ConfigModule,
    FileModule,
    PrismaModule,
    SessionsModule,
    StorageModule,
  ],
  controllers: [RenderController],
  providers: [RenderHandler, PdfRenderService, LoggerProvider],
  exports: [PdfRenderService],
})
export class DataroomFileRenderModule {}
