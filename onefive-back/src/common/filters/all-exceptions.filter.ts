import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { DiscordWebhookService } from '../../discord/discord-webhook.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  private readonly discordWebhookService = new DiscordWebhookService();

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : exceptionResponse;
    } else if (exception instanceof Error) {
      // Prisma known errors
      if ((exception as any).code === 'P2002') {
        status = HttpStatus.CONFLICT;
        message = 'A record with this value already exists';
      } else if ((exception as any).code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
      } else {
        // Log unexpected errors with full stack in dev, sanitized in prod
        this.logger.error(
          `Unhandled exception: ${exception.message}`,
          exception.stack,
        );
      }
    }

    // Fire-and-forget Discord alert for 500 errors
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      const errorMsg =
        exception instanceof Error ? exception.message : 'Unknown error';
      const stack = exception instanceof Error ? exception.stack : undefined;

      this.discordWebhookService
        .sendError500({
          url: request.url,
          method: request.method,
          errorMessage: errorMsg,
          stack,
        })
        .catch(() => {});
    }

    // Never leak stack traces or internal details in production
    const isProduction = process.env.NODE_ENV === 'production';

    // Consistent response format: { success, error }
    const errorMessage =
      typeof message === 'object'
        ? message
        : {
            message:
              isProduction && status === 500
                ? 'Internal server error'
                : message,
          };

    const responseBody = {
      success: false,
      error: {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        ...errorMessage,
      },
    };

    response.status(status).send(responseBody);
  }
}
