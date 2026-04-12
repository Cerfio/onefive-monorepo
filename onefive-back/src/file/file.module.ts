import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LoggerProvider } from 'src/common/logger/logger.provider';

@Module({
  imports: [PrismaModule],
  providers: [FileService, LoggerProvider],
  exports: [FileService],
})
export class FileModule {}
