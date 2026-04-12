import { useTranslations } from 'next-intl';
import z from 'zod';
import { VALIDATION_LIMITS } from '@/constants/validation-limits';

export const LoginFormSchema = (t?: ReturnType<typeof useTranslations>) =>
  z.object({
    email: z
      .string({ required_error: t?.('errors.form.email-invalid') })
      .email(t?.('errors.form.email-invalid') || 'Invalid email'),
    password: z
      .string({ required_error: t?.('errors.form.password-invalid') })
      .min(VALIDATION_LIMITS.AUTH.PASSWORD_NON_EMPTY_MIN, t?.('errors.form.password-invalid') || 'Required'),
  });

export type LoginFormType = z.infer<ReturnType<typeof LoginFormSchema>>;

export const LoginResponseSchema = z.object({
  data: z.object({
    authenticated: z.boolean(),
  }),
});

export const SignupFormSchema = (t?: ReturnType<typeof useTranslations>) =>
  z.object({
    email: z
      .string({ required_error: t?.('errors.form.email-invalid') })
      .email(t?.('errors.form.email-invalid') || 'Invalid email'),
    password: z
      .string({ required_error: t?.('errors.form.password-invalid') })
      .min(VALIDATION_LIMITS.AUTH.PASSWORD_MIN, t?.('errors.form.password-length') || 'Password must be at least 8 characters long')
      .regex(
        /^(?=.*[a-z])/,
        t?.('errors.form.password-lowercase') || 'Password must contain at least one lowercase letter',
      )
      .regex(
        /^(?=.*[A-Z])/,
        t?.('errors.form.password-uppercase') || 'Password must contain at least one uppercase letter',
      )
      .regex(/^(?=.*\d)/, t?.('errors.form.password-number') || 'Password must contain at least one number'),
  });

export type SignupFormType = z.infer<ReturnType<typeof SignupFormSchema>>;

export const SignupResponseSchema = z.object({
  data: z.object({
    authenticated: z.boolean(),
  }),
});
