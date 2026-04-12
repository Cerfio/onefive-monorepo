import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { Log } from '../common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';

@Injectable()
export class EmailService {
  constructor(@Inject('Logger') private readonly logger: LogService) {}

  private isEmailSendingDisabled(): boolean {
    return (
      process.env.MOCK_EMAIL_SERVICE === 'true' ||
      process.env.DISABLE_EMAIL_SENDING === 'true' ||
      process.env.NODE_ENV === 'test'
    );
  }

  @Log()
  async sendEmail({
    to,
    type,
    payload,
  }: {
    to: string;
    type: string;
    payload: object;
  }) {
    console.log({
      to,
      type,
      payload,
    });
    if (this.isEmailSendingDisabled()) {
      this.logger.warn('Email sending mocked/disabled', {
        to,
        type,
        reason: 'test-or-disabled-mode',
      });

      return {
        mocked: true,
        accepted: true,
        to,
        type,
      };
    }

    let response: Response;
    try {
      response = await fetch(
        `${process.env.ONEFIVE_MICROSERVICE_EMAIL_URL}/api/send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ONEFIVE_MICROSERVICE_EMAIL_API_KEY,
          },
          body: JSON.stringify({
            to,
            type,
            payload,
            jobId: `job-${Date.now()}`, // Simple job ID for logging
          }),
        },
      );
    } catch (error) {
      this.logger.error('Failed to send email', { error: error.message });
      throw new InternalServerErrorException(
        `Failed to send Email: ${error.message}`,
      );
    }

    if (response.status !== 200) {
      const error = await response.json();
      console.log(error);
      this.logger.error('Email service returned error', {
        code: error.code,
        message: error.message,
      });
      this.logger.error('Email service error', { error });
      throw new InternalServerErrorException(
        `Failed to send Email: ${error.code} - ${error.message}`,
      );
    }

    return await response.json();
  }
}
