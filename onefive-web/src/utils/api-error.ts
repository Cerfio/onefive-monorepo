export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  EMAIL_ALREADY_EXISTS = 'AuthenticationEmailAlreadyExistException',
  EMAIL_ALREADY_VERIFIED = 'AuthenticationEmailAlreadyVerifiedException',
  SMS_ALREADY_VERIFIED = 'AuthenticationSmsAlreadyVerifiedException',
  SMS_BAD_CODE = 'AuthenticationSmsVerifyBadCodeBadRequestException',
  SMS_CODE_EXPIRED = 'AuthenticationSmsVerifyCodeExpiredBadRequestException',
  EMAIL_BAD_CODE = 'AuthenticationEmailVerifyBadCodeBadRequestException',
  EMAIL_CODE_EXPIRED = 'AuthenticationEmailVerifyCodeExpiredBadRequestException',

  // Severity of Error
  ONE_1 = 'ONE-1',
  ONE_2 = 'ONE-2',
  ONE_3 = 'ONE-3',
  ONE_4 = 'ONE-4',
  ONE_5 = 'ONE-5',
}

export interface ApiError {
  message: string;
  code?: ErrorCode;
  statusCode?: number;
  response?: {
    status: number;
    json(): Promise<any>;
  };
}

export const createApiError = (
  message: string,
  code?: ErrorCode,
  statusCode?: number,
): ApiError => ({
  message,
  code,
  statusCode,
});
