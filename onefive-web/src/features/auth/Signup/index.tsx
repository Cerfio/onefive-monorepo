'use client';
import { startTransition, useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/base/buttons/button';
import { SocialButton } from '@/components/base/buttons/social-button';
import { Input } from '@/components/base/input/input';
import { Separator } from '@/components/base/separator/separator';
import OnefiveLogo from '@/images/onefiveLogo.png';
import Link from 'next/link';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useSignupMutation } from '@/state/queries/auth';
import { InputPassword } from '@/components/base/input/input-password';
import { SignupFormSchema, SignupFormType } from '@/lib/definitions/auth.definition';
import { useSearchParams } from 'next/navigation';
import { setCookie } from 'cookies-next';
import { ReferralBanner, type Referrer } from '@/components/waitlist/ReferralBanner';
import { getReferrerByCode } from '@/queries/waitlist';
import posthog from 'posthog-js';

const Signup = () => {
  const currentYear = new Date().getFullYear();
  const searchParams = useSearchParams();
  const [referrer, setReferrer] = useState<Referrer | null>(null);

  const t = useTranslations('auth.signup');
  const schema = SignupFormSchema(t);

  // Store referral code from ?ref= query param in cookie and fetch referrer info
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setCookie('referredByCode', refCode, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'strict',
      });
      
      // Fetch referrer info for banner
      fetchReferrerInfo(refCode);
    }
  }, [searchParams]);

  const fetchReferrerInfo = async (code: string) => {
    try {
      const result = await getReferrerByCode(code);
      setReferrer(result);
    } catch {
      setReferrer(null);
    }
  };


  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<SignupFormType>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
  });

  const { mutateAsync: signup, isPending, error } = useSignupMutation();

  const getPasswordStrength = useCallback((password: string) => {
    if (!password) return { score: 0, label: '', color: 'bg-gray-200' };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const labels = ['Very weak', 'Weak', 'Good', 'Strong', 'Very strong'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

    return {
      score: Math.min(score, 5),
      label: labels[Math.min(score - 1, 4)] || '',
      color: colors[Math.min(score - 1, 4)] || 'bg-gray-200',
    };
  }, []);

  const passwordValue = watch('password');
  const passwordStrength = getPasswordStrength(passwordValue);

  const a = async () => {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    const _visitorId = result.visitorId;
  };

  useEffect(() => {
    a();
  }, []);

  const onSubmit = async (data: SignupFormType) => {
    posthog.capture('signup_submitted', { auth_type: 'email' });
    startTransition(() => {
      signup(data);
    });
  };

  const refCodeFromURL = searchParams.get('ref');

  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-4 sm:px-8 lg:px-12 relative animate-in slide-in-from-bottom-5 fade-in-0 duration-700">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary-50/20" />
      <div className="relative z-10">
        <Image quality={100} width={61} height={69} src={OnefiveLogo} alt="OneFive Logo" className="drop-shadow-lg" />
      </div>
      <div className="text-gray-900 text-xl sm:text-2xl font-semibold mt-6 text-center relative z-10">
        {t('header-title')}
      </div>
      <div className="text-gray-500 text-center text-sm sm:text-base font mt-2 relative z-10">
        {t('header-description')}
      </div>

      {/* Referral Banner */}
      {referrer && (
        <div className="w-full max-w-sm mt-6 relative z-10">
          <ReferralBanner referrer={referrer} />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col items-center max-w-sm relative z-10">
        <div className="mt-8 w-full">
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                id="email"
                type="email"
                label={t('email-title')}
                placeholder={t('email-placeholder')}
                {...field}
                isInvalid={!!errors.email}
                hint={errors.email?.message}
              />
            )}
          />
        </div>
        <div className="mt-5 w-full">
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <div className="flex min-w-full items-center gap-2">
                <div className="flex-1 relative">
                  <InputPassword
                    isPassword
                    id="password"
                    label={t('password-title')}
                    placeholder={t('password-placeholder')}
                    {...field}
                    isInvalid={!!errors.password}
                    hint={errors.password?.message}
                  />
                </div>
              </div>
            )}
          />

          {/* Indicateur de force du mot de passe */}
          {passwordValue && passwordValue.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">{t('password-strength')}</span>
                {passwordStrength.label && (
                  <span
                    className={`text-xs font-medium ${
                      passwordStrength.score <= 2
                        ? 'text-red-500'
                        : passwordStrength.score <= 3
                          ? 'text-orange-500'
                          : passwordStrength.score <= 4
                            ? 'text-blue-500'
                            : 'text-green-500'
                    }`}
                  >
                    {t(`password-strength-${passwordStrength.score}`)}
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(index => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      index <= passwordStrength.score ? passwordStrength.color : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>


        <div className="flex flex-col gap-[6px] mt-6 w-full">
          <div className="w-full">
            <Button
              type="submit"
              className="text-white text-base font-medium rounded-lg w-full h-11"
              isLoading={isPending}
              showTextWhileLoading={false}
              isDisabled={!isValid || isPending}
            >
              {t('submit')}
            </Button>
          </div>
          {error && <div className="mt-2 text-red-500 text-sm text-center">{error.message}</div>}
        </div>
      </form>

      {/* Lien CGU */}
      <div className="mt-4 text-gray-500 text-xs text-center max-w-md relative z-10">
        {t('create-conditions')}
        <Link
          prefetch={false}
          href="/cgu"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative inline-flex h-max cursor-pointer items-center whitespace-nowrap outline-brand transition duration-100 ease-linear before:absolute focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:text-fg-disabled px-3.5 py-2.5 text-sm font-semibold before:rounded-[7px] justify-normal rounded-xs p-0! text-brand-secondary hover:text-brand-secondary_hover *:data-text:underline *:data-text:decoration-transparent *:data-text:underline-offset-2 hover:*:data-text:decoration-current gap-1"
          data-rac=""
          tabIndex={0}
        >
          <span data-text="true" className="transition-inherit-all">
            {t('create-conditions-link')}
          </span>
        </Link>
      </div>

      <div className="mt-6 flex items-center gap-2 w-full max-w-sm relative z-10">
        <Separator className="flex-1 bg-gray-200" />
        <span className="text-gray-500 font-normal text-sm px-4">{t('or-continue-with')}</span>
        <Separator className="flex-1 bg-gray-200" />
      </div>
      <div className="mt-6 flex gap-3 w-full max-w-sm justify-center relative z-10">
        <div className="hover:scale-105 transition-transform">
          <SocialButton
            social="google"
            theme="color"
            size="lg"
            aria-label="Sign up with Google"
            className="w-20 h-11 sm:w-28"
          />
        </div>
        <div className="hover:scale-105 transition-transform">
          <SocialButton
            social="linkedin"
            theme="color"
            size="lg"
            aria-label="Sign up with LinkedIn"
            className="w-20 h-11 sm:w-28"
          />
        </div>
        <div className="hover:scale-105 transition-transform">
          <SocialButton
            social="apple"
            theme="color"
            size="lg"
            disabled
            aria-label="Sign up with Apple (coming soon)"
            className="w-20 h-11 sm:w-28"
          />
        </div>
      </div>
      <div className="mt-8 flex justify-center gap-1 text-center relative z-10">
        <span className="text-sm text-tertiary">{t('already-have-account')}</span>
        <div className="group relative inline-flex h-max cursor-pointer items-center whitespace-nowrap outline-brand transition duration-100 ease-linear before:absolute focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:text-fg-disabled px-3.5 py-2.5 text-sm font-semibold before:rounded-[7px] justify-normal rounded-xs p-0! text-brand-secondary hover:text-brand-secondary_hover *:data-text:underline *:data-text:decoration-transparent *:data-text:underline-offset-2 hover:*:data-text:decoration-current gap-1">
          <Link href="/signin">
            <span data-text="true" className="transition-inherit-all">
              {t('sign-in')}
            </span>
          </Link>
        </div>
      </div>
      <div className="mt-4 text-gray-700 font-medium text-xs text-center relative z-10"> Onefive {currentYear} ©</div>
    </div>
  );
};

export default Signup;
