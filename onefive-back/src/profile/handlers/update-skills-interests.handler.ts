import { Inject, Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { ProfileService } from '../profile.service';
import { UpdateSkillsInterestsDto } from '../dto/update-profile.dto';
import { Prisma } from '@prisma/client';

type UpdateSkillsInterestsHandlerParams = {
  transactionId: string;
  userId: string;
} & UpdateSkillsInterestsDto;

type UpdateSkillsInterestsHandlerResponse = {
  success: boolean;
};

@Injectable()
export class UpdateSkillsInterestsHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly profileService: ProfileService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    skills,
    interests,
  }: UpdateSkillsInterestsHandlerParams): Promise<UpdateSkillsInterestsHandlerResponse> {
    // Debug log pour voir les données reçues
    this.logger.info('UpdateSkillsInterestsHandler data received', {
      transactionId,
      skills: skills?.length || 0,
      skillsData: skills,
      interests: interests?.length || 0,
      interestsData: interests,
    });

    // Préparer les données de mise à jour avec typage Prisma
    const updateData: Prisma.ProfileUpdateInput = {};

    // Gérer les compétences si fournies
    if (skills !== undefined) {
      this.logger.info('Processing skills update', {
        transactionId,
        skillsCount: skills.length,
        skills: skills,
      });
      updateData.skills = skills;
    }

    // Gérer les intérêts si fournis
    if (interests !== undefined) {
      this.logger.info('Processing interests update', {
        transactionId,
        interestsCount: interests.length,
        interests: interests,
      });

      // Supprimer tous les tags existants et recréer avec les nouveaux intérêts
      updateData.tagFollowing = {
        deleteMany: {},
        create: interests.map((interest) => ({
          name: interest,
        })),
      };
    }

    this.logger.info('Final updateData', {
      transactionId,
      updateData: JSON.stringify(updateData, null, 2),
    });

    // Mettre à jour le profil
    const updatedProfile = await this.profileService.update({
      transactionId,
      where: { userId },
      data: updateData,
    });

    this.logger.info('Profile skills/interests updated successfully', {
      transactionId,
      profileId: updatedProfile.id,
    });

    return { success: true };
  }
}
