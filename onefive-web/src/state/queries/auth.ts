'use client';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { HTTPError } from 'ky';
import { apiClient } from '../client';
import { LoginFormType, SignupFormType } from '@/lib/definitions/auth.definition';

export function useLoginMutation(returnUrl: string = '/feed') {
  const router = useRouter();
  const t = useTranslations('auth.login.errors');
  return useMutation({
    mutationFn: async ({ email, password }: LoginFormType) => {
      return apiClient.auth.signin(email, password);
    },
    onError: (error: unknown) => {
      // 401: message affiché dans le formulaire (Signin), pas de toast
      if (error instanceof HTTPError && error.response.status === 401) {
        return;
      }
      if (error instanceof Error && error.message === 'BadAuthenticationException') {
        return;
      }
      toast.error(t('error-occured'));
    },
    onSuccess: payload => {
      // Nettoyer complètement le localStorage pour éviter toute fuite de données
      localStorage.clear();

      toast.success('Connexion réussie !');
      // ✅ Le cookie httpOnly est maintenant setté côté serveur (protection XSS)
      router.push(returnUrl);
    },
  });
}

export function useSignupMutation() {
  const router = useRouter();
  const t = useTranslations('auth.signup.errors');
  return useMutation({
    mutationFn: async ({ email, password }: SignupFormType) => {
      return apiClient.auth.signup({ email, password });
    },
    onError: (error: { message: string }) => {
      if (error instanceof Error && error.message === 'AuthenticationEmailAlreadyExistException') {
        toast.error(t('email-already-exists'));
        return;
      }
      toast.error(t('error-occured'));
    },
    onSuccess: payload => {
      toast.success('Account created successfully!');
      // ✅ Le cookie httpOnly est maintenant setté côté serveur (protection XSS)
      router.push('/auth/confirm/email');
    },
  });
}
