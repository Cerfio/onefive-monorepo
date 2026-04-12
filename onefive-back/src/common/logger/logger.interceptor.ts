import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import loggerLogstashInstance from './logger.config';
import { FIELD_TO_MASK, FORCE_MASK_NAME, maskSensitiveData } from '../utils';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private logger = loggerLogstashInstance();

  private extractSafeRequestData(request: any) {
    // Only extract safe, serializable properties from the request
    return {
      method: request.method,
      url: request.url,
      headers: request.headers,
      body: request.body,
      params: request.params,
      query: request.query,
      ip: request.ip,
      userAgent: request.get?.('User-Agent'),
      transactionId: request.transactionId,
      // Add any other custom properties you've added to the request
      authId: request.authId,
      session: request.session,
    };
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const className = context.getClass().name;
    const methodName = context.getHandler().name;
    const request = context.switchToHttp().getRequest();

    // Extract only safe request data instead of destructuring the entire request
    const safeRequestData = this.extractSafeRequestData(request);
    const { transactionId, ...input } = safeRequestData;

    const inputMasked = maskSensitiveData(input, FIELD_TO_MASK);

    this.logger.debug(`Begin ${className}.${methodName}`, {
      transactionId: request.transactionId,
      input: inputMasked,
      class: className,
      method: methodName,
      action: 'entering',
    });

    const now = Date.now();
    return next.handle().pipe(
      tap(
        (response) => {
          const responseMasked = maskSensitiveData(
            response,
            FIELD_TO_MASK,
            FORCE_MASK_NAME.includes(className) ||
              FORCE_MASK_NAME.includes(methodName),
          );
          this.logger.debug(`End ${className}.${methodName}`, {
            transactionId: request.transactionId,
            timeRequest: Date.now() - now,
            output: responseMasked,
            class: className,
            method: methodName,
            action: 'exiting',
          });
        },
        (error) => {
          // Also log errors properly
          this.logger.error(`Error in ${className}.${methodName}`, {
            transactionId: request.transactionId,
            timeRequest: Date.now() - now,
            error: error.message,
            stack: error.stack,
            class: className,
            method: methodName,
            action: 'error',
          });
        },
      ),
    );
  }
}
