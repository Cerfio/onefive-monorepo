import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../common/logger/logger.decorator';
import { z } from 'zod';
import axios from 'axios';
import {
  LinkedinAccessTokenException,
  LinkedinAccessTokenValidationException,
  LinkedinUserInfoException,
  LinkedinUserInfoValidationException,
} from './linkedin.exception';

const linkedinAccessTokenSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  scope: z.string(),
  token_type: z.string(),
  id_token: z.string(),
});

const linkedinUserInfoSchema = z.object({
  sub: z.string(),
  email_verified: z.boolean(),
  name: z.string(),
  locale: z.object({
    country: z.string(),
    language: z.string(),
  }),
  given_name: z.string(),
  family_name: z.string(),
  email: z.string().email(),
  picture: z.string().url(),
});

const linkedinVanityNameSchema = z.object({
  vanityName: z.string().optional(),
});

export interface LinkedinAccessToken {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token: string;
}

export interface LinkedinUserInfo {
  sub: string;
  email_verified: boolean;
  name: string;
  locale: {
    country: string;
    language: string;
  };
  given_name: string;
  family_name: string;
  email: string;
  picture: string;
  vanityName?: string; // Ajout du vanityName
  linkedinUrl?: string; // URL construite
}

@Injectable()
export class LinkedinService {
  constructor(@Inject('Logger') private readonly logger: LogService) {}

  @Log()
  async getAccessToken({
    transactionId,
    data,
  }: {
    transactionId: string;
    data: {
      code: string;
      redirectUri?: string; // Permet de spécifier un redirect_uri personnalisé
    };
  }): Promise<LinkedinAccessToken> {
    let response;
    try {
      // LinkedIn requiert application/x-www-form-urlencoded
      const params = new URLSearchParams();
      params.append('client_id', process.env.LINKEDIN_CLIENT_ID);
      params.append('client_secret', process.env.LINKEDIN_CLIENT_SECRET);
      // Utiliser le redirect_uri fourni ou celui par défaut
      params.append(
        'redirect_uri',
        data.redirectUri || process.env.AUTH_REDIRECT_URI,
      );
      params.append('code', data.code);
      params.append('grant_type', 'authorization_code');

      this.logger.info('LinkedIn OAuth - Token exchange attempt', {
        transactionId,
        redirectUri: data.redirectUri || process.env.AUTH_REDIRECT_URI,
      });

      response = await axios.post(
        'https://www.linkedin.com/oauth/v2/accessToken',
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      this.logger.info('LinkedIn OAuth - Token obtained successfully', {
        transactionId,
      });
    } catch (error) {
      // Logger les détails de l'erreur pour debug
      this.logger.error('LinkedIn OAuth token exchange failed', {
        transactionId,
        code: data.code,
        error: error.response?.data || error.message,
        status: error.response?.status,
      });

      LinkedinAccessTokenException.throw(this.logger, {
        transactionId,
        code: data.code,
        error: error.response?.data || error.message,
        timestamp: new Date().toISOString(),
      });
    }

    try {
      const parse = linkedinAccessTokenSchema.parse(response.data);
      return parse;
    } catch (error) {
      LinkedinAccessTokenValidationException.throw(this.logger, {
        transactionId,
        code: data.code,
        responseData: response.data,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Log()
  async getUserInfo({
    transactionId,
    accessToken,
  }: {
    transactionId: string;
    accessToken: string;
  }): Promise<LinkedinUserInfo> {
    let response;
    try {
      response = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      this.logger.info('LinkedIn User Info - Data retrieved successfully', {
        transactionId,
      });
    } catch (error) {
      LinkedinUserInfoException.throw(this.logger, {
        transactionId,
        accessToken,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    try {
      const parse = linkedinUserInfoSchema.parse(response.data);

      // Essayer de récupérer le vanityName (nom public du profil)
      let vanityName: string | undefined;
      let linkedinUrl: string | undefined;

      this.logger.info('Attempting to retrieve LinkedIn vanityName', {
        transactionId,
      });
      try {
        const vanityResponse = await axios.get(
          'https://api.linkedin.com/v2/me?projection=(vanityName)',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        const vanityData = linkedinVanityNameSchema.parse(vanityResponse.data);
        vanityName = vanityData.vanityName;

        this.logger.info('LinkedIn vanityName parsed', {
          transactionId,
          vanityName,
        });

        if (vanityName) {
          linkedinUrl = `https://www.linkedin.com/in/${vanityName}`;
          this.logger.info('LinkedIn URL constructed', {
            transactionId,
            linkedinUrl,
          });
        } else {
          this.logger.warn('vanityName is undefined or empty', {
            transactionId,
          });
        }
      } catch (vanityError) {
        // Si on ne peut pas récupérer le vanityName, ce n'est pas bloquant
        this.logger.warn('Could not fetch LinkedIn vanity name', {
          transactionId,
          error:
            vanityError instanceof Error
              ? vanityError.message
              : 'Unknown error',
        });
      }

      return {
        ...parse,
        vanityName,
        linkedinUrl,
      };
    } catch (error) {
      LinkedinUserInfoValidationException.throw(this.logger, {
        transactionId,
        accessToken,
        responseData: response.data,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
