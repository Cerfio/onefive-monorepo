'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/base/buttons/button';
import { ArrowLeft, ShieldAlert, Clock } from 'lucide-react';
import Image from 'next/image';
import LetterCercle from '@/icons/LetterCercle.svg';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { verifyPasswordResetCode } from '@/queries/auth';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/base/alert/alert';
import { Meteors } from '@/components/meteors';
import { motion } from 'framer-motion';
import { PinInput } from '@/components/base/pin-input/pin-input';
import { AlertCircle, X } from 'lucide-react';

const MAX_ATTEMPTS = 5;

const VerifyResetCodePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [error, setError] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [code, setCode] = useState('');

  const handleCodeChange = (value: string) => {
    if (isBlocked) return;
    const cleanedCode = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4);
    setCode(cleanedCode);
    if (error) setError('');
  };

  const { mutateAsync: verifyCode, isLoading } = useMutation({
    mutationFn: () => {
      return verifyPasswordResetCode({
        code,
        token: token || '',
      });
    },
    onError: (error) => {
      if (error instanceof Error) {
        if (error.message === 'AuthenticationPasswordResetBadCodeBadRequestException') {
          setAttemptsUsed((prev) => {
            const newAttempts = prev + 1;
            const remaining = MAX_ATTEMPTS - newAttempts;
            if (remaining > 0) {
              setError(`Code incorrect. ${remaining} tentative${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}.`);
            } else {
              setIsBlocked(true);
              setError('');
            }
            return newAttempts;
          });
        } else if (error.message === 'AuthenticationPasswordResetCodeExpiredBadRequestException') {
          setError('Le code a expiré. Veuillez demander un nouveau code.');
        } else if (
          error.message === 'PasswordResetTooManyAttemptsException' ||
          error.message.includes('Too many attempts')
        ) {
          setIsBlocked(true);
          setError('');
        } else if (error.message === 'AuthenticationPasswordResetInvalidTokenBadRequestException') {
          setError('Le lien de réinitialisation est invalide.');
        } else {
          setError('Une erreur est survenue. Veuillez réessayer.');
        }
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    },
    onSuccess: () => {
      toast.success('Code vérifié avec succès !');
      router.push(`/auth/reset-password/new-password?token=${token}`);
    },
  });

  const handleSubmit = () => {
    if (code.length === 4 && !isBlocked) {
      setError('');
      verifyCode();
    }
  };

  // Paste support (same as EmailToConfirm)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (isBlocked) return;
      const pastedText = e.clipboardData?.getData('text') || '';
      if (pastedText) {
        const cleanedCode = pastedText.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4);
        if (cleanedCode) {
          e.preventDefault();
          e.stopPropagation();
          setCode(cleanedCode);
          if (error) setError('');
        }
      }
    };
    document.addEventListener('paste', handlePaste, true);
    return () => document.removeEventListener('paste', handlePaste, true);
  }, [isBlocked, error]);

  if (!token) {
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
              Lien invalide
            </div>
            <div className="text-center text-base font-normal mt-3 max-w-md">
              Le lien de réinitialisation est invalide ou a expiré.
            </div>
            <Button
              className="h-11 w-[380px] mt-8 text-base font-semibold"
              onClick={() => router.push('/auth/reset-password')}
            >
              Demander un nouveau lien
            </Button>
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
            Vérifier le code
          </div>
          <div className="text-center text-base font-normal mt-3 max-w-md">
            Entrez le code de vérification envoyé à votre adresse email.
          </div>
          {error && !isBlocked && (
            <Alert variant="destructive" className="mt-4 w-[380px] relative">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="pr-8">{error}</AlertDescription>
              <button
                onClick={() => setError('')}
                className="absolute top-3 right-3 text-destructive/70 hover:text-destructive transition-colors"
                aria-label="Fermer l'erreur"
              >
                <X className="h-4 w-4" />
              </button>
            </Alert>
          )}
          <div className="pt-8">
            <PinInput disabled={isBlocked}>
              <PinInput.Group
                value={code}
                onChange={handleCodeChange}
                maxLength={4}
              >
                <PinInput.Slot index={0} />
                <PinInput.Slot index={1} />
                <PinInput.Slot index={2} />
                <PinInput.Slot index={3} />
              </PinInput.Group>
            </PinInput>
          </div>
          
          {/* Blocked state - Too many attempts */}
          {isBlocked && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 w-[380px]"
            >
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <ShieldAlert className="h-5 w-5 text-red-600" />
                <AlertTitle className="text-red-800">Compte temporairement bloqué</AlertTitle>
                <AlertDescription className="text-red-700">
                  <p className="mt-1">
                    Trop de tentatives incorrectes. Pour votre sécurité, ce code a été invalidé.
                  </p>
                  <p className="mt-2 flex items-center gap-1 text-sm">
                    <Clock className="h-4 w-4" />
                    Veuillez demander un nouveau code de réinitialisation.
                  </p>
                </AlertDescription>
              </Alert>
              <Button
                className="h-11 w-full mt-4 text-base font-semibold"
                onClick={() => router.push('/auth/reset-password')}
              >
                Demander un nouveau code
              </Button>
            </motion.div>
          )}
          
          {/* Normal state */}
          {!isBlocked && (
            <>
              <Button
                className="h-11 w-[380px] mt-8 text-base font-semibold"
                color="secondary"
                isDisabled={code.length < 4 || isLoading}
                onClick={handleSubmit}
              >
                {isLoading ? 'Vérification...' : 'Vérifier le code'}
              </Button>
              
              {/* Attempts indicator */}
              {attemptsUsed > 0 && attemptsUsed < MAX_ATTEMPTS && (
                <div className="mt-3 text-sm text-amber-600 flex items-center gap-1">
                  <ShieldAlert className="h-4 w-4" />
                  {MAX_ATTEMPTS - attemptsUsed} tentative{MAX_ATTEMPTS - attemptsUsed > 1 ? 's' : ''} restante{MAX_ATTEMPTS - attemptsUsed > 1 ? 's' : ''}
                </div>
              )}
            </>
          )}
          
          
          <div
            className="flex items-center gap-2 text-gray-600 text-sm font-semibold mt-8 hover:underline cursor-pointer"
            onClick={() => router.push('/auth/reset-password')}
          >
            <ArrowLeft width={20} height={20} />
            Retour à la réinitialisation
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default VerifyResetCodePage; 