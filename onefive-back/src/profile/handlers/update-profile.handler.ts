import { Inject, Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { ProfileService } from '../profile.service';
import {
  UpdateProfileDto,
  UpdateSkillsInterestsDto,
} from '../dto/update-profile.dto';
import { UsersService } from 'src/users/users.service';
import { Prisma, ProfileRole } from '@prisma/client';
import { PostHogService } from 'src/posthog/posthog.service';

type UpdateProfileHandlerParams = {
  transactionId: string;
  userId: string;
} & UpdateProfileDto;

type UpdateProfileHandlerResponse = {
  success: boolean;
};

@Injectable()
export class UpdateProfileHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly profileService: ProfileService,
    private readonly usersService: UsersService,
    private readonly posthogService: PostHogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    firstName,
    lastName,
    title,
    bio,
    socials,
    skills,
    interests,
    countryCode,
    city,
    ecosystemRoles,
  }: UpdateProfileHandlerParams): Promise<UpdateProfileHandlerResponse> {
    // Debug log pour voir les données reçues
    this.logger.info('UpdateProfileHandler data received', {
      transactionId,
      firstName: typeof firstName + ': ' + firstName,
      lastName: typeof lastName + ': ' + lastName,
      title: typeof title + ': ' + title,
      bio: typeof bio + ': ' + bio,
      socials: socials?.length || 0,
      socialsData: socials,
      skills: skills?.length || 0,
      skillsData: skills,
      interests: interests?.length || 0,
      interestsData: interests,
    });

    // Préparer les données de mise à jour avec typage Prisma
    const updateData: Prisma.ProfileUpdateInput = {
      firstName,
      lastName,
      highlight: title, // title correspond au champ highlight dans la DB
      bio,
    };

    if (countryCode !== undefined) {
      updateData.countryCode = countryCode.toUpperCase();
    }
    if (city !== undefined) {
      updateData.city = city.trim();
    }

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

    // Gérer les rôles écosystème si fournis (1 à 2 rôles)
    if (ecosystemRoles !== undefined) {
      updateData.ecosystemRoles = ecosystemRoles as ProfileRole[];
    }

    // Gérer les liens sociaux si fournis
    if (socials !== undefined) {
      if (socials.length > 0) {
        this.logger.info('Processing socials update', {
          transactionId,
          socialsCount: socials.length,
          socials: socials,
        });

        // Supprimer tous les liens existants et recréer
        updateData.socials = {
          deleteMany: {},
          create: socials.map((social) => ({
            title: social.title,
            url: social.url,
          })),
        };
      } else {
        // Si socials est un tableau vide, supprimer tous les liens existants
        this.logger.info('Removing all socials', { transactionId });
        updateData.socials = {
          deleteMany: {},
        };
      }
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

    this.logger.info('Profile updated successfully', {
      transactionId,
      profileId: updatedProfile.id,
    });

    const fieldsUpdated = [
      firstName !== undefined && 'firstName',
      lastName !== undefined && 'lastName',
      title !== undefined && 'title',
      bio !== undefined && 'bio',
      socials !== undefined && 'socials',
      skills !== undefined && 'skills',
      interests !== undefined && 'interests',
      countryCode !== undefined && 'countryCode',
      city !== undefined && 'city',
      ecosystemRoles !== undefined && 'ecosystemRoles',
    ].filter(Boolean);
    this.posthogService.capture(userId, 'profile_updated', {
      fields_updated: fieldsUpdated,
    });

    return { success: true };
  }
}
