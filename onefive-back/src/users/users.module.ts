import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerProvider } from 'src/common/logger/logger.provider';

@Module({
  controllers: [],
  providers: [UsersService, LoggerProvider],
  exports: [UsersService],
})
export class UsersModule {}
