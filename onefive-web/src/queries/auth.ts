import { api } from '@/utils/kyInstance';
import { toast } from 'sonner';
import { z } from 'zod';

const linkedinAuthenticationResponseSchema = z.object({
  data: z.object({
    authenticated: z.boolean(),
    user: z.unknown().optional(),
    additionalInfo: z
      .object({
        language: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        country: z.string(),
        pictureUrl: z.string().optional(),
      })
      .optional(),
  }),
});

const linkedinSyncResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    linkedin: z.object({
      headline: z.string().nullable().optional(),
      avatarUrl: z.string().nullable().optional(),
      coverUrl: z.string().nullable().optional(),
      bio: z.string().nullable().optional(),
      experiences: z.array(z.object({
        title: z.string(),
        company: z.string(),
        city: z.string(),
        from: z.string(),
        to: z.string().optional(),
        description: z.string().optional(),
        urlLinkedin: z.string().optional(),
        tags: z.array(z.string()),
      })),
      education: z.array(z.object({
        degree: z.string(),
        school: z.string(),
        city: z.string(),
        from: z.string(),
        to: z.string().optional(),
        description: z.string().optional(),
        urlLinkedin: z.string().optional(),
        tags: z.array(z.string()),
      })),
      skills: z.array(z.string()),
    }),
    current: z.object({
      headline: z.string().nullable().optional(),
      avatarUrl: z.string().nullable().optional(),
      coverUrl: z.string().nullable().optional(),
      bio: z.string().nullable().optional(),
      experiences: z.array(z.object({
        id: z.string(),
        title: z.string(),
        company: z.string(),
        city: z.string(),
        from: z.string(),
        to: z.string().optional(),
        description: z.string().optional(),
        urlLinkedin: z.string().optional(),
        tags: z.array(z.string()),
      })),
      education: z.array(z.object({
        id: z.string(),
        degree: z.string(),
        school: z.string(),
        city: z.string(),
        from: z.string(),
        to: z.string().optional(),
        description: z.string().optional(),
        urlLinkedin: z.string().optional(),
        tags: z.array(z.string()),
      })),
      skills: z.array(z.string()),
    }),
    canSync: z.boolean(),
    nextSyncAvailableAt: z.string().optional(),
    hoursRemaining: z.number().optional(),
  }),
});

export const linkedinAuthentication = async ({ code, state }: { code: string; state: string }) => {
  const response = await api.post(
    'auth/linkedin',
    { json: { code, state } },
  );
  const parse = linkedinAuthenticationResponseSchema.parse(
    await response.json(),
  );
  return parse.data;
};

export const linkedinSync = async ({ code }: { code: string }) => {
  const response = await api.post(
    'linkedin-sync/oauth',
    { 
      json: { code }, 
      timeout: 150000, // 2 minutes 30 secondes pour le scraping LinkedIn
    },
  );
  const parse = linkedinSyncResponseSchema.parse(
    await response.json(),
  );
  return parse.data;
};

const emailHasBeenVerifiedResponseSchema = z.object({
  data: z.object({
    email: z.string().email(),
    isVerified: z.boolean(),
  }),
});

export const emailHasBeenVerified = async () => {
  const response = await api.get('auth/email/has-been-verified');
  const parse = emailHasBeenVerifiedResponseSchema.parse(await response.json());
  return parse.data;
};

const SignupResponseSchema = z.object({
  data: z.object({
    authenticated: z.boolean(),
  }),
});

export const signup = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    const response = await api.post(
      'auth/signup',
      {
        json: { email, password },
      },
    );
    const payload: any = await response.json();
    const parsedPayload = SignupResponseSchema.parse(payload);

    return parsedPayload;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      toast.error('Unable to signup: Error ONE-1');
    } else if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      if (payloadError.message === 'AuthenticationEmailAlreadyExistException') {
        throw Error(payloadError.message);
      } else {
        toast.error('Unable to signup: Error ONE-2');
      }
    } else {
      toast.error('Unable to signup: Error ONE-3');
    }
    throw Error('Unable to signup');
  }
};

const SigninResponseSchema = z.object({
  data: z.object({
    authenticated: z.boolean(),
  }),
});

export const signin = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    const response = await api.post(
      'auth/signin',
      {
        json: { email, password },
      },
    );
    const payload: any = await response.json();
    const parsedPayload = SigninResponseSchema.parse(payload);
    return parsedPayload;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      toast.error('Unable to log in your account: Error ONE-1');
    } else if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      if (payloadError.statusCode === 400) {
        throw Error(payloadError.message);
      } else {
        toast.error('Unable to log in your account: Error ONE-2');
      }
    } else {
      toast.error('Unable to log in your account: Error ONE-3');
    }
    throw Error('Unable to log in your account');
  }
};

export const emailConfirm = async ({ code }: { code: string }) => {
  try {
    const response = await api.post(
      'auth/email/confirm',
      {
        json: { code },
      },
    );
    const payload: any = await response.json();
    return payload;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      const message =
        payloadError.error?.message ?? payloadError.message ?? '';
      if (
        message === 'AuthenticationEmailVerifyBadCodeBadRequestException' ||
        message === 'EmailVerificationBadCodeException' ||
        message === 'AuthenticationEmailVerifyCodeExpiredBadRequestException' ||
        message === 'EmailVerificationCodeExpiredException' ||
        message === 'AuthenticationEmailAlreadyVerifiedException'
      ) {
        throw Error(message);
      } else {
        toast.error('Unable to confirm your email: Error ONE-2');
      }
    } else {
      toast.error('Unable to confirm your email: Error ONE-3');
    }
    throw Error('Unable to confirm your email');
  }
};

export const emailRequest = async () => {
  try {
    const response = await api.post('auth/email/request');
    const payload: any = await response.json();
    return payload;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      const message =
        payloadError.error?.message ?? payloadError.message ?? '';
      if (message === 'AuthenticationEmailAlreadyVerifiedException') {
        throw Error(message);
      } else {
        toast.error('Unable to send email: Error ONE-2');
      }
    } else {
      toast.error('Unable to send email: Error ONE-3');
    }
    throw Error('Unable to send email');
  }
};

export const smsRequest = async ({ phoneNumber }: { phoneNumber: string }) => {
  try {
    const response = await api.post(
      'auth/sms/request',
      {
        json: { phoneNumber },
      },
    );
    const payload: any = await response.json();
    // Backend retourne { success, data: { alreadyVerified, ... } } — exposer data pour le caller
    return payload.data ?? payload;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      // Si le numéro est déjà vérifié (409), on retourne un succès pour skip l'étape
      if (error.response.status === 409) {
        return {
          success: true,
          alreadyVerified: true,
          message: 'Phone number already verified',
        };
      }
      const payloadError = await error.response.json();
      if (
        payloadError.message === 'AuthenticationSmsAlreadyVerifiedException' ||
        payloadError.message === 'SmsVerificationAlreadyVerifiedException'
      ) {
        return {
          success: true,
          alreadyVerified: true,
          message: 'Phone number already verified',
        };
      } else {
        toast.error('Unable to request your phone number: Error ONE-2');
      }
    } else {
      toast.error('Unable to request your phone number: Error ONE-3');
    }
    throw Error('Unable to request your phone number');
  }
};

export const smsConfirm = async ({ code }: { code: string }) => {
  try {
    const response = await api.post(
      'auth/sms/confirm',
      {
        json: { code },
      },
    );
    const payload: any = await response.json();
    // Backend retourne { success, data: { ... } } — exposer data pour le caller
    return payload.data ?? payload;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      // Si le numéro est déjà vérifié (409), on retourne un succès pour skip l'étape
      if (error.response.status === 409) {
        return {
          success: true,
          alreadyVerified: true,
          message: 'Phone number already verified',
        };
      }
      const payloadError = await error.response.json();
      const message = payloadError.error?.message ?? payloadError.message ?? '';
      
      // Gestion des différentes exceptions SMS
      if (
        message === 'AuthenticationSmsVerifyBadCodeBadRequestException' ||
        message === 'SmsVerificationIncorrectCodeException'
      ) {
        throw Error('SmsVerificationIncorrectCodeException');
      } else if (
        message === 'AuthenticationSmsVerifyCodeExpiredBadRequestException' ||
        message === 'SmsVerificationCodeExpiredException'
      ) {
        throw Error('SmsVerificationCodeExpiredException');
      } else if (
        message === 'AuthenticationSmsAlreadyVerifiedException' ||
        message === 'SmsVerificationAlreadyVerifiedException'
      ) {
        // Si déjà vérifié, on retourne un succès pour continuer
        return {
          success: true,
          alreadyVerified: true,
          message: 'Phone number already verified',
        };
      } else if (message === 'SmsVerificationPhoneNumberAlreadyUsedException') {
        throw Error('SmsVerificationPhoneNumberAlreadyUsedException');
      } else {
        toast.error('Unable to confirm your sms: Error ONE-2');
      }
    } else {
      toast.error('Unable to confirm your sms: Error ONE-3');
    }
    throw Error('Unable to confirm your sms');
  }
};

export const logout = async () => {
  try {
    // Appel à l'API pour invalider le token côté serveur (optionnel)
    await api.post('auth/logout');
  } catch (error: any) {
    // En cas d'erreur, on continue quand même la déconnexion côté client
    console.warn('Erreur lors de la déconnexion côté serveur:', error);
  }
};

// Password reset API functions

export const requestPasswordReset = async ({ email }: { email: string }) => {
  try {
    const response = await api.post(
      'auth/password/reset/request',
      {
        json: { email },
      },
    );
    const payload: any = await response.json();
    return payload;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw new Error(payloadError.message || 'Impossible d\'envoyer l\'email de réinitialisation');
    }
    throw new Error('Une erreur est survenue. Veuillez réessayer.');
  }
};

export const verifyPasswordResetCode = async ({ code, token }: { code: string; token: string }) => {
  try {
    const response = await api.post(
      'auth/password/reset/verify',
      {
        json: { code, token },
      },
    );
    const payload: any = await response.json();
    return payload;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      const message =
        payloadError.error?.message ?? payloadError.message ?? 'Code de vérification invalide';
      throw new Error(message);
    }
    throw new Error('Une erreur est survenue. Veuillez réessayer.');
  }
};

export const resetPassword = async ({ password, confirmPassword, token }: { password: string; confirmPassword: string; token?: string }) => {
  try {
    // Retrieve token from URL search params if not provided directly
    const resetToken = token || new URLSearchParams(window.location.search).get('token') || '';
    
    const response = await api.post(
      'auth/password/reset',
      {
        json: { password, confirmPassword, token: resetToken },
      },
    );
    const payload: any = await response.json();
    return payload;
  } catch (error: any) {
    if (error.name === 'HTTPError') {
      const payloadError = await error.response.json();
      throw new Error(payloadError.message || 'Impossible de réinitialiser le mot de passe');
    }
    throw new Error('Une erreur est survenue. Veuillez réessayer.');
  }
};
