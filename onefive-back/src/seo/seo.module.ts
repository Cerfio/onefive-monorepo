import { Module } from '@nestjs/common';
import { SeoPreviewController } from './seo-preview.controller';
import { SeoSitemapController } from './seo-sitemap.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerProvider } from '../common/logger/logger.provider';

@Module({
  imports: [PrismaModule],
  controllers: [SeoPreviewController, SeoSitemapController],
  providers: [LoggerProvider],
})
export class SeoModule {}
