'use client';
import { useState } from 'react';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { requestPasswordReset } from '@/queries/auth';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Meteors } from '@/components/meteors';
import { motion } from 'framer-motion';
import Image from 'next/image';
import LetterCercle from '@/icons/LetterCercle.svg';

const ResetPasswordPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: () => {
      return requestPasswordReset({ email });
    },
    onError: (error) => {
      if (error instanceof Error) {
        if (error.message === 'PasswordResetTooManyRequestsException') {
          setError('Trop de demandes. Veuillez attendre avant de réessayer.');
        } else if (error.message === 'PasswordResetCreateException') {
          setError('Une erreur est survenue lors de la création de la demande.');
        } else {
          setError('Une erreur est survenue. Veuillez réessayer.');
        }
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success('Un email de réinitialisation a été envoyé à votre adresse email');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setError('');
      mutateAsync();
    }
  };

  if (isSubmitted) {
    return (
      <>
        <div className="w-full h-screen -z-10 absolute overflow-hidden">
          <Meteors number={10} />
        </div>
        <div className="h-screen w-screen flex flex-col items-center pt-24">
          <motion.div 
            className="flex flex-col items-center z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Image src={LetterCercle} alt="" width={56} height={56} />
            <div className="text-gray-900 text-3xl font-semibold mt-6">
              Email envoyé !
            </div>
            <div className="text-center text-base font-normal mt-3 max-w-md">
              Nous avons envoyé un lien de réinitialisation à <br />
              <span className="font-medium">{email}</span>
            </div>
            <div className="text-center text-sm text-gray-600 mt-4 max-w-md">
              Vérifiez votre boîte de réception et cliquez sur le lien pour réinitialiser votre mot de passe.
            </div>
            <Button
              className="h-11 w-[380px] mt-8 text-base font-semibold"
              color="secondary"
              onClick={() => router.push('/signin')}
            >
              Retour à la connexion
            </Button>
            <div
              className="text-sm font-normal text-gray-600 hover:underline cursor-pointer mt-4"
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
              }}
            >
              Envoyer un autre email
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="w-full h-screen -z-10 absolute overflow-hidden">
        <Meteors number={10} />
      </div>
      <div className="h-screen w-screen flex flex-col items-center pt-24">
        <motion.div 
          className="flex flex-col items-center z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Image src={LetterCercle} alt="" width={56} height={56} />
          <div className="text-gray-900 text-3xl font-semibold mt-6">
            Réinitialiser le mot de passe
          </div>
          <div className="text-center text-base font-normal mt-3 max-w-md">
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </div>
          
          <form onSubmit={handleSubmit} className="w-full max-w-[380px] mt-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Adresse email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={setEmail}
                  className="h-11"
                  required
                />
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription className="text-center">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <Button
                type="submit"
                color="primary"
                className="h-11 w-full text-base font-semibold"
                isDisabled={isLoading || !email.trim()}
              >
                {isLoading ? 'Envoi en cours...' : 'Envoyer le lien'}
              </Button>
            </div>
          </form>
          
          <div
            className="flex items-center gap-2 text-gray-600 text-sm font-semibold mt-8 hover:underline cursor-pointer"
            onClick={() => router.push('/signin')}
          >
            <ArrowLeft width={20} height={20} />
            Retour à la connexion
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ResetPasswordPage; 