import { Module } from '@nestjs/common';
import { ExperienceController } from './experience.controller';
import { ExperienceService } from './experience.service';
import { LoggerProvider } from 'src/common/logger/logger.provider';
import { CreateExperienceHandler } from './handlers/create-experience.handler';
import { UpdateExperienceHandler } from './handlers/update-experience.handler';
import { DeleteExperienceHandler } from './handlers/delete-experience.handler';
import { BatchUpdateExperiencesHandler } from './handlers/batch-update-experiences.handler';
import { ProfileModule } from 'src/profile/profile.module';
import { SessionsModule } from 'src/sessions/sessions.module';

@Module({
  imports: [ProfileModule, SessionsModule],
  controllers: [ExperienceController],
  providers: [
    LoggerProvider,
    ExperienceService,
    CreateExperienceHandler,
    UpdateExperienceHandler,
    DeleteExperienceHandler,
    BatchUpdateExperiencesHandler,
  ],
  exports: [ExperienceService],
})
export class ExperienceModule {}
