import { Injectable, Inject } from '@nestjs/common';
import { Twilio } from 'twilio';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import {
  TwilioSendException,
  TwilioConfigurationException,
  TwilioPhoneNumberException,
} from './twilio.exception';

@Injectable()
export class TwilioService {
  private twilioClient: Twilio;

  constructor(@Inject('Logger') private readonly logger: LogService) {
    try {
      this.twilioClient = new Twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
      );
    } catch (error) {
      TwilioConfigurationException.throw(this.logger, {
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Log()
  async sendSms({
    transactionId,
    to,
    body,
  }: {
    transactionId: string;
    to: string;
    body: string;
  }): Promise<string> {
    try {
      // Validation du numéro de téléphone
      if (!to || !to.match(/^\+[1-9]\d{1,14}$/)) {
        TwilioPhoneNumberException.throw(this.logger, {
          transactionId,
          phoneNumber: to,
          timestamp: new Date().toISOString(),
        });
      }

      const message = await this.twilioClient.messages.create({
        to,
        from: process.env.TWILIO_PHONE_NUMBER,
        body,
      });

      this.logger.info(`SMS sent successfully`, {
        transactionId,
        to,
        messageSid: message.sid,
        timestamp: new Date().toISOString(),
      });

      return message.sid;
    } catch (error) {
      TwilioSendException.throw(this.logger, {
        transactionId,
        to,
        body,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
