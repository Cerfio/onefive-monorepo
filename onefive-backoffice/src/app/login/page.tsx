'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Image from 'next/image';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { api } from '@/lib/api';

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);

    try {
      await api.post('admin/auth/signin', { json: values }).json();
      toast.success('Connexion réussie');
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Connexion impossible');
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-secondary_subtle p-6">
      {/* Background pattern */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-primary/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-brand-primary/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Image src="/onefive.svg" alt="Onefive" width={48} height={55} className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-primary">Onefive Backoffice</h1>
          <p className="mt-1 text-sm text-tertiary">
            Connecte-toi avec un compte administrateur.
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-2xl bg-primary p-8 shadow-lg ring-1 ring-secondary">
          <form onSubmit={onSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              name="email"
              value={form.watch('email')}
              onChange={(value) => form.setValue('email', value)}
              onBlur={() => form.trigger('email')}
              hint={form.formState.errors.email?.message}
              isInvalid={!!form.formState.errors.email}
              placeholder="admin@onefive.app"
            />
            <Input
              label="Mot de passe"
              type="password"
              name="password"
              value={form.watch('password')}
              onChange={(value) => form.setValue('password', value)}
              onBlur={() => form.trigger('password')}
              hint={form.formState.errors.password?.message}
              isInvalid={!!form.formState.errors.password}
              placeholder="Minimum 8 caractères"
            />
            <Button
              type="submit"
              className="w-full"
              isDisabled={isSubmitting}
              isLoading={isSubmitting}
            >
              {isSubmitting ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-quaternary">
          Accès réservé aux administrateurs Onefive.
        </p>
      </div>
    </main>
  );
}
