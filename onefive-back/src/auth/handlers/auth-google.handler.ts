import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import { GoogleService } from '../../google/google.service';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { SessionsService } from '../../sessions/sessions.service';
import { ReferralService } from '../../referral/referral.service';
import { OAuthStateService } from '../oauth-state/oauth-state.service';
import { AuthGoogleHandlerException } from './auth-google.handler.exception';
import { PostHogService } from 'src/posthog/posthog.service';

export interface GoogleAuthResult {
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
export class AuthGoogleHandler {
  constructor(
    private readonly googleService: GoogleService,
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
  }): Promise<GoogleAuthResult> {
    try {
      // 0. Valider le state CSRF avant toute opération
      await this.oauthStateService.validateState(state, 'google');

      // 1. Échanger le code contre un access token
      const accessTokenData = await this.googleService.getAccessToken({
        transactionId,
        data: { code },
      });

      // 2. Récupérer les informations utilisateur
      const userInfo = await this.googleService.getUserInfo({
        transactionId,
        accessToken: accessTokenData.access_token,
      });

      // 3. Vérifier si l'utilisateur existe déjà
      let user = await this.usersService.get({
        transactionId,
        where: { email: userInfo.email },
      });

      let isNewUser = false;
      if (!user) {
        isNewUser = true;
        // 4. Créer un nouvel utilisateur
        user = await this.authService.create({
          transactionId,
          data: {
            email: userInfo.email,
            authType: 'GOOGLE',
            isEmailVerified: userInfo.verified_email,
            googleId: userInfo.id,
          },
        });
      } else {
        // 5. Mettre à jour l'utilisateur existant
        user = await this.authService.update({
          transactionId,
          where: { id: user.id },
          data: {
            googleId: userInfo.id,
            isEmailVerified: userInfo.verified_email,
          },
        });
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

      this.posthogService.capture(user.id, 'user_authenticated_google', { is_new_user: isNewUser });
      if (isNewUser) {
        this.posthogService.identify(user.id, { email: user.email, auth_type: 'GOOGLE' });
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
      AuthGoogleHandlerException.throw(this.logger, {
        transactionId,
        code,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
