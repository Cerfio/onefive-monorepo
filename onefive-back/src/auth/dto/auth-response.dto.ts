/** Response for signup/signin with cookie-based auth */
export interface AuthTokenResponseDto {
  authenticated: boolean;
  token?: string;
}

/** Response for OAuth URL */
export interface OAuthUrlResponseDto {
  url: string;
  state: string;
}

/** Response for OAuth (LinkedIn/Google) - token + user */
export interface OAuthAuthResponseDto {
  authenticated: boolean;
  user: unknown;
}

/** Response for SMS request/confirm */
export type SmsVerificationResponseDto = unknown;

/** Response for email has verified */
export interface EmailHasVerifiedResponseDto {
  email: string;
  isVerified: boolean;
}
