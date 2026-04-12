'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Image from 'next/image';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { api } from '@/lib/api';

const schema = z
  .object({
    firstName: z.string().min(1, 'Prénom requis'),
    lastName: z.string().min(1, 'Nom requis'),
    password: z.string().min(8, 'Minimum 8 caractères'),
    confirmPassword: z.string().min(8, 'Minimum 8 caractères'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export default function AcceptInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: '', lastName: '', password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (!token) {
      setTokenError("Lien d'invitation invalide ou expiré.");
    }
  }, [token]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!token) return;
    setIsSubmitting(true);

    try {
      await api
        .post('admin/auth/accept-invitation', {
          json: {
            token,
            firstName: values.firstName,
            lastName: values.lastName,
            password: values.password,
          },
        })
        .json();

      toast.success('Compte créé avec succès !');
      router.push('/login');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'acceptation de l'invitation");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-secondary_subtle p-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-primary/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-brand-primary/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Image src="/onefive.svg" alt="Onefive" width={48} height={55} className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-primary">Rejoindre Onefive</h1>
          <p className="mt-1 text-sm text-tertiary">
            Crée ton compte administrateur pour accéder au backoffice.
          </p>
        </div>

        {tokenError ? (
          <div className="rounded-2xl bg-primary p-8 shadow-lg ring-1 ring-secondary text-center">
            <p className="text-sm text-error-primary font-medium">{tokenError}</p>
            <p className="mt-3 text-xs text-tertiary">
              Demande à un superadmin de te renvoyer une invitation.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-primary p-8 shadow-lg ring-1 ring-secondary">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Prénom"
                  type="text"
                  name="firstName"
                  value={form.watch('firstName')}
                  onChange={(value) => form.setValue('firstName', value)}
                  onBlur={() => form.trigger('firstName')}
                  hint={form.formState.errors.firstName?.message}
                  isInvalid={!!form.formState.errors.firstName}
                  placeholder="Jean"
                />
                <Input
                  label="Nom"
                  type="text"
                  name="lastName"
                  value={form.watch('lastName')}
                  onChange={(value) => form.setValue('lastName', value)}
                  onBlur={() => form.trigger('lastName')}
                  hint={form.formState.errors.lastName?.message}
                  isInvalid={!!form.formState.errors.lastName}
                  placeholder="Dupont"
                />
              </div>
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
              <Input
                label="Confirmer le mot de passe"
                type="password"
                name="confirmPassword"
                value={form.watch('confirmPassword')}
                onChange={(value) => form.setValue('confirmPassword', value)}
                onBlur={() => form.trigger('confirmPassword')}
                hint={form.formState.errors.confirmPassword?.message}
                isInvalid={!!form.formState.errors.confirmPassword}
                placeholder="Répète le mot de passe"
              />
              <Button
                type="submit"
                className="w-full"
                isDisabled={isSubmitting}
                isLoading={isSubmitting}
              >
                {isSubmitting ? 'Création en cours...' : 'Créer mon compte'}
              </Button>
            </form>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-quaternary">
          Accès réservé aux administrateurs Onefive.
        </p>
      </div>
    </main>
  );
}
