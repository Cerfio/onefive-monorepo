import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import { LinkedinService } from '../../linkedin/linkedin.service';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { SessionsService } from '../../sessions/sessions.service';
import { ReferralService } from '../../referral/referral.service';
import { OAuthStateService } from '../oauth-state/oauth-state.service';
import { AuthLinkedinHandlerException } from './auth-linkedin.handler.exception';
import { PostHogService } from 'src/posthog/posthog.service';

export interface LinkedinAuthResult {
  sessionId: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    picture?: string;
  };
}

@Injectable()
export class AuthLinkedinHandler {
  constructor(
    private readonly linkedinService: LinkedinService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
    private readonly referralService: ReferralService,
    private readonly oauthStateService: OAuthStateService,
    @Inject('Logger') private readonly logger: LogService,
    private readonly posthogService: PostHogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    code,
    state,
    ip,
    userAgent,
  }: {
    transactionId: string;
    code: string;
    state: string;
    ip?: string;
    userAgent?: string;
  }): Promise<LinkedinAuthResult> {
    try {
      // 0. Valider le state CSRF avant toute opération
      await this.oauthStateService.validateState(state, 'linkedin');

      // 1. Échanger le code contre un access token
      const accessTokenData = await this.linkedinService.getAccessToken({
        transactionId,
        data: { code },
      });

      // 2. Récupérer les informations utilisateur
      const userInfo = await this.linkedinService.getUserInfo({
        transactionId,
        accessToken: accessTokenData.access_token,
      });

      // 3. Vérifier si l'utilisateur existe déjà
      let isNewUser = false;
      let user = await this.usersService.get({
        transactionId,
        where: { email: userInfo.email },
      });

      if (!user) {
        isNewUser = true;
        // 4. Créer un nouvel utilisateur
        user = await this.authService.create({
          transactionId,
          data: {
            email: userInfo.email,
            authType: 'LINKEDIN',
            isEmailVerified: userInfo.email_verified,
            linkedinId: userInfo.sub,
          },
        });

        // Stocker l'URL LinkedIn dans le profil s'il existe
        if (userInfo.linkedinUrl) {
          try {
            await this.usersService.updateLinkedInUrl({
              transactionId,
              userId: user.id,
              linkedinUrl: userInfo.linkedinUrl,
            });
          } catch (error) {
            // Non-bloquant : on log juste l'erreur
            this.logger.warn('Failed to update LinkedIn URL for new user', {
              transactionId,
              userId: user.id,
              error: error.message,
            });
          }
        }
      } else {
        // 5. Mettre à jour l'utilisateur existant
        user = await this.authService.update({
          transactionId,
          where: { id: user.id },
          data: {
            linkedinId: userInfo.sub,
            isEmailVerified: userInfo.email_verified,
          },
        });

        // Stocker l'URL LinkedIn dans le profil s'il existe
        if (userInfo.linkedinUrl) {
          try {
            await this.usersService.updateLinkedInUrl({
              transactionId,
              userId: user.id,
              linkedinUrl: userInfo.linkedinUrl,
            });
          } catch (error) {
            // Non-bloquant : on log juste l'erreur
            this.logger.warn(
              'Failed to update LinkedIn URL for existing user',
              {
                transactionId,
                userId: user.id,
                error: error.message,
              },
            );
          }
        }
      }

      // 6. Créer une session
      const session = await this.sessionsService.createSession({
        transactionId,
        data: {
          userId: user.id,
          userAgent,
          ipAddress: ip,
        },
      });

      this.posthogService.capture(user.id, 'user_authenticated_linkedin', { is_new_user: isNewUser });
      if (isNewUser) {
        this.posthogService.identify(user.id, { email: user.email, auth_type: 'LINKEDIN' });
      }

      return {
        sessionId: session.sessionId,
        user: {
          id: user.id,
          email: user.email,
          firstName: userInfo.given_name,
          lastName: userInfo.family_name,
          picture: userInfo.picture,
        },
      };
    } catch (error) {
      AuthLinkedinHandlerException.throw(this.logger, {
        transactionId,
        code,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
