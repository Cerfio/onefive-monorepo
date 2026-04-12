'use client';
import { startTransition, useCallback } from 'react';
import { Input } from '@/components/base/input/input';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import OnefiveLogo from '@/assets/images/onefiveLogo.png';
import { Button } from '@/base/buttons/button';
import { SocialButton } from '@/components/base/buttons/social-button';
import { useLoginMutation } from '@/state/queries/auth';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { LoginFormSchema, LoginFormType } from '@/lib/definitions/auth.definition';
import Link from 'next/link';
import { InputPassword } from '@/components/base/input/input-password';
import { initiateOAuth } from '@/utils/oauth-csrf';
import { toast } from 'sonner';
import { HTTPError } from 'ky';
import posthog from 'posthog-js';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

interface SigninProps {
  returnUrl?: string;
}

const Signin = ({ returnUrl = '/feed' }: SigninProps) => {
  const t = useTranslations('auth.login');
  const tErrors = useTranslations('auth.login.errors');
  const schema = LoginFormSchema(t);
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const getErrorMessage = (err: unknown) => {
    if (err instanceof HTTPError && err.response.status === 401) {
      return tErrors('bad-authentication-exception');
    }
    return tErrors('error-occured');
  };

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormType>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
  });

  const { mutateAsync: login, isPending, error } = useLoginMutation(returnUrl);

  const handleOAuthClick = useCallback(async (provider: 'linkedin' | 'google') => {
    try {
      posthog.capture('oauth_clicked', { provider });
      await initiateOAuth(provider);
    } catch {
      toast.error(`Erreur lors de la connexion ${provider === 'linkedin' ? 'LinkedIn' : 'Google'}`);
    }
  }, []);

  const onSubmit = async (data: LoginFormType) => {
    posthog.capture('login_submitted', { auth_type: 'email' });
    startTransition(() => {
      login(data);
    });
  };

  return (
    <motion.div
      className="h-full w-full flex flex-col items-center justify-center px-4 sm:px-8 lg:px-12 relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="relative z-10" variants={cardVariants}>
        <Image width={61} height={69} src={OnefiveLogo} alt="OneFive Logo" />
      </motion.div>

      <motion.div className="text-xl sm:text-2xl font-semibold mt-6 text-center text-gray-900" variants={cardVariants}>
        {t('header-title')}
      </motion.div>
      <motion.div className="text-sm sm:text-base text-gray-500 text-center mt-2" variants={cardVariants}>
        {t('header-description')}
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col items-center max-w-sm relative z-10">
        <motion.div className="mt-8 w-full" variants={cardVariants}>
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
        </motion.div>

        <motion.div
          className={cn('mt-5 min-w-full flex gap-2', errors?.password ? 'items-center' : 'items-end')}
          variants={cardVariants}
        >
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <InputPassword
                id="password"
                isPassword
                label={t('password-title')}
                placeholder={t('password-placeholder')}
                {...field}
                isInvalid={!!errors.password}
                hint={errors.password?.message}
              />
            )}
          />
        </motion.div>

        <motion.div className="flex flex-col gap-[6px] mt-6 w-full" variants={cardVariants}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              className="text-white text-base font-medium rounded-lg w-full h-11"
              isLoading={isPending}
              showTextWhileLoading={false}
              isDisabled={!isValid || isPending}
            >
              {t('submit')}
            </Button>
            {error && <div className="mt-2 text-error-primary text-sm text-center">{getErrorMessage(error)}</div>}
          </motion.div>
        </motion.div>
      </form>

      <motion.div className="mt-6 flex items-center gap-2 w-full max-w-sm" variants={cardVariants}>
        <Separator className="flex-1 bg-gray-200" />
        <span className="text-gray-500 text-sm px-4">{t('or-continue-with')}</span>
        <Separator className="flex-1 bg-gray-200" />
      </motion.div>

      <motion.div className="mt-6 flex gap-3 w-full max-w-sm justify-center" variants={cardVariants}>
        <SocialButton
          social="google"
          theme="color"
          size="lg"
          onClick={() => handleOAuthClick('google')}
          className="w-20 h-11 sm:w-28"
        />
        <SocialButton
          social="linkedin"
          theme="color"
          size="lg"
          onClick={() => handleOAuthClick('linkedin')}
          className="w-20 h-11 sm:w-28"
        />
        <SocialButton social="apple" theme="color" size="lg" disabled className="w-20 h-11 sm:w-28" />
      </motion.div>

      <motion.div className="mt-8 flex justify-center gap-1 text-sm" variants={cardVariants}>
        <span className="text-tertiary">{t('dont-have-account')}</span>
        <Link href="/signup">
          <span className="text-brand-secondary hover:underline">{t('sign-up')}</span>
        </Link>
      </motion.div>

      <motion.div
        className="mt-2 flex justify-center text-sm cursor-pointer text-brand-secondary hover:underline"
        onClick={() => router.push('/auth/reset-password')}
        variants={cardVariants}
      >
        {t('forgot-password')}
      </motion.div>

      <motion.div className="mt-4 text-xs text-gray-700 text-center" variants={cardVariants}>
        Onefive {currentYear} ©
      </motion.div>
    </motion.div>
  );
};

export default Signin;
