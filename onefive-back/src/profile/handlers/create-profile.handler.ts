import { Inject, Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { ProfileService } from '../profile.service';
import { LogService } from 'logstash-winston-3';
import { GenderSalutationPreference } from '../dto/create-profile.dto';
import { WaitlistService } from '../../waitlist/waitlist.service';
import { UsersService } from '../../users/users.service';
import { DiscordWebhookService } from '../../discord/discord-webhook.service';
import { PostHogService } from 'src/posthog/posthog.service';

@Injectable()
export class CreateProfileHandler {
  constructor(
    private readonly profileService: ProfileService,
    private readonly waitlistService: WaitlistService,
    private readonly usersService: UsersService,
    private readonly discordWebhookService: DiscordWebhookService,
    @Inject('Logger') private readonly logger: LogService,
    private readonly posthogService: PostHogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    city,
    countryCode,
    dateOfBirth,
    firstName,
    lastName,
    followProfileIds,
    followStartupIds,
    gender,
    genderSalutationPreference,
    tagFollowing,
    code,
    ecosystemRoles,
    referredByCode,
  }: {
    transactionId: string;
    userId: string;
    city: string;
    countryCode: string;
    dateOfBirth: string;
    firstName: string;
    lastName: string;
    followProfileIds: string[];
    followStartupIds: string[];
    gender: string;
    genderSalutationPreference: GenderSalutationPreference;
    tagFollowing: string[];
    code: string;
    ecosystemRoles?: string[];
    referredByCode?: string;
  }) {
    // Préparer les données de création du profil
    const profileData: any = {
      user: { connect: { id: userId } },
      city,
      countryCode,
      dateOfBirth: new Date(dateOfBirth),
      firstName,
      lastName,
      gender,
      genderSalutationPreferenceType:
        genderSalutationPreference === GenderSalutationPreference.MALE
          ? 'MALE'
          : genderSalutationPreference === GenderSalutationPreference.FEMALE
            ? 'FEMALE'
            : 'OTHER',
    };

    // Ajouter les rôles de l'écosystème si fournis
    if (ecosystemRoles && ecosystemRoles.length > 0) {
      profileData.ecosystemRoles = ecosystemRoles;
    }

    // Ajouter les relations seulement si les arrays ne sont pas vides
    if (followProfileIds && followProfileIds.length > 0) {
      profileData.following = {
        create: followProfileIds.map((id) => ({
          followedBy: { connect: { id } },
        })),
      };
    }

    if (followStartupIds && followStartupIds.length > 0) {
      profileData.startupFollowing = {
        create: followStartupIds.map((id) => ({
          startup: { connect: { id } },
        })),
      };
    }

    if (tagFollowing && tagFollowing.length > 0) {
      profileData.tagFollowing = {
        createMany: {
          data: tagFollowing.map((name) => ({ name })),
        },
      };
    }

    const profile = await this.profileService.create({
      transactionId,
      data: profileData,
    });

    this.posthogService.capture(userId, 'profile_created', {
      has_referral_code: !!referredByCode,
      ecosystem_roles: ecosystemRoles || [],
    });
    this.posthogService.identify(userId, { firstName, lastName });

    // Process waitlist logic: check referral, ambassador, activation
    try {
      const user = await this.usersService.get({
        transactionId,
        where: { id: userId },
      });

      await this.waitlistService.processNewProfile(
        profile.id,
        user?.email || '',
        referredByCode,
        user?.isEmailVerified ?? false,
      );

      this.logger.info('Waitlist processing completed for new profile', {
        transactionId,
        profileId: profile.id,
        referredByCode,
      });
    } catch (error) {
      this.logger.error('Error processing waitlist for new profile', {
        transactionId,
        profileId: profile.id,
        error: (error as Error).message,
      });
      // Don't fail profile creation if waitlist processing fails
    }

    // Fire-and-forget Discord webhook for new signup
    this.discordWebhookService
      .sendNewUser({
        firstName,
        lastName,
        ecosystemRoles: ecosystemRoles || [],
        profileId: profile.id,
      })
      .catch((err) =>
        this.logger.warn('Discord new user webhook failed', {
          transactionId,
          error: (err as Error).message,
        }),
      );

    if (process.env.NODE_ENV === 'test') {
      try {
        await this.profileService.update({
          transactionId,
          where: { id: profile.id },
          data: {
            waitlistStatus: 'ACTIVE',
            activatedAt: new Date(),
          },
        });
      } catch (error) {
        this.logger.warn('Failed to force ACTIVE waitlist status in test mode', {
          transactionId,
          profileId: profile.id,
          error: (error as Error).message,
        });
      }
    }

    return profile;
  }
}
