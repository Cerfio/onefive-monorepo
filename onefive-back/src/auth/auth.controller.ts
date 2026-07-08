import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { FastifyReply, FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from 'src/types/fastify-request-user-id';
import {
  AuthTokenResponseDto,
  OAuthUrlResponseDto,
  OAuthAuthResponseDto,
  SmsVerificationResponseDto,
  EmailHasVerifiedResponseDto,
} from './dto/auth-response.dto';
import {
  ApiResponseDto,
  ApiSuccessResponseDto,
} from '../common/dto/api-response.dto';
import { AuthSignupDto } from './dto/auth-signup.dto';
import { SignupHandler } from './handlers/signup.handler';
import { AuthSigninDto } from './dto/auth-signin.dto';
import { SigninHandler } from './handlers/signin.handler';
import { AuthLinkedinHandler } from './handlers/auth-linkedin.handler';
import { AuthGoogleHandler } from './handlers/auth-google.handler';
import { AuthLinkedinDto } from './dto/auth-linkedin.dto';
import { AuthGoogleDto } from './dto/auth-google.dto';
import { AuthSmsRequestDto } from './dto/auth-sms-request.dto';
import { AuthSmsConfirmDto } from './dto/auth-sms-confirm.dto';
import { AuthEmailConfirmDto } from './dto/auth-email-confirm.dto';
import { SmsRequestHandler } from '../sms-verification/handlers/sms-request.handler';
import { SmsConfirmHandler } from '../sms-verification/handlers/sms-confirm.handler';
import { EmailHasVerifiedHandler } from './handlers/email-has-verified.handler';
import { EmailConfirmHandler } from './handlers/email-confirm.handler';
import { EmailRequestHandler } from './handlers/email-request.handler';
import { OAuthStateService } from './oauth-state/oauth-state.service';
import { PrismaService } from '../prisma/prisma.service';
import { clearAuthCookie, setAuthCookie } from '../common/utils/cookie.utils';
import { AllowOtpOnlySession } from '../common/decorators/allow-otp-only-session.decorator';
import { AllowEmailNotVerified } from '../common/decorators/allow-email-not-verified.decorator';
import { AllowOnboardingNotComplete } from '../common/decorators/allow-onboarding-not-complete.decorator';
import { AllowWaitlistNotActive } from '../common/decorators/allow-waitlist-not-active.decorator';

@Controller('auth')
@Throttle({
  long: { limit: 20, ttl: 60000 }, // 20 auth operations / minute (controller default)
})
export class AuthController {
  constructor(
    private readonly signupHandler: SignupHandler,
    private readonly signinHandler: SigninHandler,
    private readonly authLinkedinHandler: AuthLinkedinHandler,
    private readonly authGoogleHandler: AuthGoogleHandler,
    private readonly smsRequestHandler: SmsRequestHandler,
    private readonly smsConfirmHandler: SmsConfirmHandler,
    private readonly emailHasVerifiedHandler: EmailHasVerifiedHandler,
    private readonly emailConfirmHandler: EmailConfirmHandler,
    private readonly emailRequestHandler: EmailRequestHandler,
    private readonly oauthStateService: OAuthStateService,
    private readonly prisma: PrismaService,
  ) {}

  private extractTokenFromCookie(cookieHeader?: string): string | null {
    if (!cookieHeader) return null;
    const tokenCookie = cookieHeader
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('token='));
    return tokenCookie ? tokenCookie.slice('token='.length) : null;
  }

  @Public()
  @Throttle({ long: { limit: 3, ttl: 60000 } }) // 3 signups / minute
  @Post('/signup')
  async signup(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
    @Body() body: AuthSignupDto,
  ): Promise<ApiResponseDto<AuthTokenResponseDto>> {
    // ✅ Extraire les informations de sécurité
    const ip =
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.ip ||
      'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const auth = await this.signupHandler.execute({
      transactionId: req.id,
      email: body.email,
      password: body.password,
      ip: ip as string,
      userAgent: userAgent as string,
    });
    if (auth.setCookie !== false) {
      setAuthCookie(reply, auth.sessionId);
    }
    return {
      success: true,
      data: { authenticated: true, token: auth.sessionId },
    };
  }

  @Public()
  @Throttle({ long: { limit: 5, ttl: 60000 } }) // 5 signin attempts / minute
  @Post('/signin')
  @HttpCode(200)
  async signin(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
    @Body() signinInput: AuthSigninDto,
  ): Promise<ApiResponseDto<AuthTokenResponseDto>> {
    // ✅ Extraire les informations de sécurité
    const ip =
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.ip ||
      'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const auth = await this.signinHandler.execute({
      transactionId: req.id,
      email: signinInput.email,
      password: signinInput.password,
      twoFactorCode: signinInput.twoFactorCode,
      ip: ip as string,
      userAgent: userAgent as string,
    });
    setAuthCookie(reply, auth.sessionId);
    return {
      success: true,
      data: { authenticated: true, token: auth.sessionId },
    };
  }

  @Public()
  @Throttle({ long: { limit: 10, ttl: 60000 } })
  @Get('/oauth-url')
  async getOAuthUrl(
    @Query('provider') provider: string,
  ): Promise<
    ApiResponseDto<OAuthUrlResponseDto> | { success: false; error: string }
  > {
    if (!['linkedin', 'google'].includes(provider)) {
      return {
        success: false,
        error: 'Invalid provider. Must be "linkedin" or "google".',
      };
    }

    const state = await this.oauthStateService.generateState(provider);

    let url: string;
    if (provider === 'linkedin') {
      url = `https://www.linkedin.com/oauth/v2/authorization?client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${process.env.AUTH_REDIRECT_URI}&response_type=code&state=${state}&scope=email%20profile%20openid`;
    } else {
      url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.AUTH_REDIRECT_URI}&response_type=code&state=${state}&scope=email%20profile%20openid`;
    }

    return { success: true, data: { url, state } };
  }

  @Public()
  @Post('/linkedin')
  @HttpCode(200)
  async linkedinAuth(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
    @Body() body: AuthLinkedinDto,
  ): Promise<ApiResponseDto<OAuthAuthResponseDto>> {
    // ✅ Extraire les informations de sécurité
    const ip =
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.ip ||
      'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const result = await this.authLinkedinHandler.execute({
      transactionId: req.id,
      code: body.code,
      state: body.state,
      ip: ip as string,
      userAgent: userAgent as string,
    });
    setAuthCookie(reply, result.sessionId);
    return {
      success: true,
      data: {
        authenticated: true,
        user: result.user,
      },
    };
  }

  @Public()
  @Post('/google')
  @HttpCode(200)
  async googleAuth(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
    @Body() body: AuthGoogleDto,
  ): Promise<ApiResponseDto<OAuthAuthResponseDto>> {
    // ✅ Extraire les informations de sécurité
    const ip =
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.ip ||
      'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const result = await this.authGoogleHandler.execute({
      transactionId: req.id,
      code: body.code,
      state: body.state,
      ip: ip as string,
      userAgent: userAgent as string,
    });
    setAuthCookie(reply, result.sessionId);
    return {
      success: true,
      data: {
        authenticated: true,
        user: result.user,
      },
    };
  }

  @AllowOtpOnlySession()
  @AllowEmailNotVerified()
  @AllowOnboardingNotComplete()
  @AllowWaitlistNotActive()
  @Post('/logout')
  @HttpCode(200)
  async logout(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<ApiSuccessResponseDto> {
    // Revoke the server-side session before clearing the cookie. Without this,
    // a saved cookie keeps working even after logout (SessionGuard only
    // rejects sessions where isRevoked=true). The cookie token is
    // `${hmac}${uuid}` — the DB session is keyed on `sessionId` (the uuid).
    const token = this.extractTokenFromCookie(req.headers.cookie);
    if (token) {
      const uuidLength = 32; // 36 char uuid minus 4 hyphens
      const uuid = token.slice(-uuidLength);
      try {
        await this.prisma.session.updateMany({
          where: { sessionId: uuid, isRevoked: false },
          data: { isRevoked: true },
        });
      } catch {
        // Don't fail the logout if revocation has a transient DB issue —
        // the cookie clear below still logs the user out client-side.
      }
    }

    clearAuthCookie(reply);
    return { success: true };
  }

  @AllowOnboardingNotComplete()
  @Post('/sms/request')
  @HttpCode(200)
  async smsRequest(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Body() body: AuthSmsRequestDto,
  ): Promise<ApiResponseDto<SmsVerificationResponseDto>> {
    const result = await this.smsRequestHandler.execute({
      transactionId: req.id,
      phoneNumber: body.phoneNumber,
      userId: req.userId,
    });

    return {
      success: true,
      data: result,
    };
  }

  @AllowOnboardingNotComplete()
  @Post('/sms/confirm')
  @HttpCode(200)
  async smsConfirm(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Body() body: AuthSmsConfirmDto,
  ): Promise<ApiResponseDto<SmsVerificationResponseDto>> {
    const result = await this.smsConfirmHandler.execute({
      transactionId: req.id,
      code: body.code,
      userId: req.userId,
    });

    return {
      success: true,
      data: result,
    };
  }

  @AllowOtpOnlySession()
  @AllowEmailNotVerified()
  @AllowOnboardingNotComplete()
  @AllowWaitlistNotActive()
  @Get('/email/has-been-verified')
  async hasBeenVerified(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
  ): Promise<ApiResponseDto<EmailHasVerifiedResponseDto>> {
    const payload = await this.emailHasVerifiedHandler.execute({
      transactionId: req.id,
      userId: req.userId,
    });
    return {
      success: true,
      data: { email: payload.email, isVerified: payload.isVerified },
    };
  }

  @AllowOtpOnlySession()
  @AllowEmailNotVerified()
  @AllowOnboardingNotComplete()
  @AllowWaitlistNotActive()
  @Post('/email/confirm')
  @HttpCode(200)
  async emailConfirm(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Body() body: AuthEmailConfirmDto,
  ): Promise<ApiSuccessResponseDto> {
    await this.emailConfirmHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      code: body.code,
    });
    return {
      success: true,
    };
  }

  @AllowOtpOnlySession()
  @AllowEmailNotVerified()
  @AllowOnboardingNotComplete()
  @AllowWaitlistNotActive()
  @Post('/email/request')
  @HttpCode(200)
  async emailRequest(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
  ): Promise<ApiSuccessResponseDto> {
    await this.emailRequestHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      isOtpOnlySession: req.session?.isOtpOnlySession ?? false,
    });
    return {
      success: true,
    };
  }
}
