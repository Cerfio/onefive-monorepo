import { Module } from '@nestjs/common';
import { EducationController } from './education.controller';
import { EducationService } from './education.service';
import { LoggerProvider } from 'src/common/logger/logger.provider';
import { CreateEducationHandler } from './handlers/create-education.handler';
import { UpdateEducationHandler } from './handlers/update-education.handler';
import { DeleteEducationHandler } from './handlers/delete-education.handler';
import { BatchUpdateEducationsHandler } from './handlers/batch-update-educations.handler';
import { ProfileModule } from 'src/profile/profile.module';
import { SessionsModule } from 'src/sessions/sessions.module';

@Module({
  imports: [ProfileModule, SessionsModule],
  controllers: [EducationController],
  providers: [
    LoggerProvider,
    EducationService,
    CreateEducationHandler,
    UpdateEducationHandler,
    DeleteEducationHandler,
    BatchUpdateEducationsHandler,
  ],
  exports: [EducationService],
})
export class EducationModule {}
