import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../common/logger/logger.decorator';
import { z } from 'zod';
import axios from 'axios';
import {
  GoogleAccessTokenException,
  GoogleAccessTokenValidationException,
  GoogleUserInfoException,
  GoogleUserInfoValidationException,
} from './google.exception';

const googleUserInfoSchema = z.object({
  id: z.string(),
  email: z.string(),
  verified_email: z.boolean(),
  name: z.string(),
  given_name: z.string(),
  family_name: z.string(),
  picture: z.string(),
  locale: z.string(),
});

const googleAccessTokenSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  scope: z.string(),
  token_type: z.string(),
  id_token: z.string(),
});

export interface GoogleAccessToken {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

@Injectable()
export class GoogleService {
  constructor(@Inject('Logger') private readonly logger: LogService) {}

  @Log()
  async getAccessToken({
    transactionId,
    data,
  }: {
    transactionId: string;
    data: {
      code: string;
    };
  }): Promise<GoogleAccessToken> {
    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.AUTH_REDIRECT_URI,
        grant_type: 'authorization_code',
        code: data.code,
      });

      const parse = googleAccessTokenSchema.parse(response.data);
      return parse;
    } catch (error) {
      GoogleAccessTokenException.throw(this.logger, {
        transactionId,
        code: data.code,
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
  }): Promise<GoogleUserInfo> {
    try {
      const response = await axios.get(
        'https://www.googleapis.com/oauth2/v1/userinfo',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const parse = googleUserInfoSchema.parse(response.data);
      return parse;
    } catch (error) {
      GoogleUserInfoException.throw(this.logger, {
        transactionId,
        accessToken,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
