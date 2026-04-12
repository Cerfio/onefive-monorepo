import { Module } from '@nestjs/common';
import { CategoryController } from './controllers/category.controller';
import { CategoryHandler } from './handlers/category.handler';
import { CategoryService } from './services/category.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { SessionsModule } from '../../sessions/sessions.module';
import { LoggerProvider } from '../../common/logger/logger.provider';

@Module({
  imports: [PrismaModule, SessionsModule],
  controllers: [CategoryController],
  providers: [CategoryHandler, CategoryService, LoggerProvider],
  exports: [CategoryService],
})
export class DataroomCategoryModule {}
