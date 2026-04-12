'use client';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/base/buttons/button';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import LetterCercle from '@/icons/LetterCercle.svg';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { emailConfirm, emailRequest, emailHasBeenVerified } from '@/queries/auth';
import { toast } from 'sonner';
import { deleteCookie } from 'cookies-next';
import { Meteors } from '@/components/meteors';
import { PinInput } from '@/components/base/pin-input/pin-input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, X } from 'lucide-react';

const RESEND_COOLDOWN_SECONDS = 30;

const EmailToConfirm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get('code');
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const { data, isSuccess, isError, isLoading } = useQuery({
    queryKey: ['emailHasBeenVerified'],
    queryFn: () => emailHasBeenVerified(),
    retry: false,
  });
  const [codeManually, setCodeManually] = useState(false);
  const [code, setCode] = useState('');
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const hasAttemptedRef = useRef(false);

  // Synchronise le code de l'URL avec le state (si l'utilisateur veut le taper "manuellement")
  useEffect(() => {
    if (codeFromUrl && codeFromUrl.length === 4) {
      setCode(codeFromUrl);
      setCodeManually(true); // On affiche les slots
    }
  }, [codeFromUrl]);

  // Redirection ou Auto-validation
  useEffect(() => {
    // Si la route charge, on attend
    if (isLoading) return;

    // S'il n'y a pas de code dans l'URL, pas d'auto-validation
    if (!codeFromUrl || codeFromUrl.length !== 4) return;

    // Évite qu'on le fasse en boucle
    if (hasAttemptedRef.current) return;

    // Si l'utilisateur n'est pas connecté ou session expiré
    if (isError) {
      const returnUrl = encodeURIComponent(`/auth/confirm/email?code=${codeFromUrl}`);
      router.push(`/signin?returnUrl=${returnUrl}`);
      return;
    }

    if (isSuccess && data?.isVerified === false) {
      hasAttemptedRef.current = true;
      confirmEmail({ code: codeFromUrl });
    }
  }, [isLoading, isError, isSuccess, data, codeFromUrl, router]);

  const { mutateAsync: confirmEmail } = useMutation({
    mutationFn: (variables?: { code: string }) => {
      return emailConfirm({ code: variables && variables.code ? variables.code : code });
    },
    onError: error => {
      // Nettoyer l'URL pour éviter de re-valider le même code erroné au prochain re-render
      window.history.replaceState(null, '', window.location.pathname);

      if (error instanceof Error && error.message === 'AuthenticationEmailVerifyBadCodeBadRequestException') {
        setError('The code you entered is incorrect. Please try again or request a new one.');
      }
      else if (error instanceof Error && error.message === 'EmailVerificationBadCodeException') {
        setError('The code you entered is incorrect. Please try again or request a new one.');
      }
      else if (error instanceof Error && error.message === 'AuthenticationEmailVerifyCodeExpiredBadRequestException') {
        setError('The code you entered has expired. Please request a new one.');
      }
      else if (error instanceof Error && error.message === 'EmailVerificationCodeExpiredException') {
        setError('The code you entered has expired. Please request a new one.');
      }
      else if (error instanceof Error && error.message === 'AuthenticationEmailAlreadyVerifiedException') {
        toast.info('This email is already verified');
        router.push('/feed');
      }
      else {
        setError('An error occurred. Please try again.');
      }
    },
    onSuccess: _data => {
      router.push('/feed');
    },
  });

  const { mutateAsync: requestEmail } = useMutation({
    mutationFn: () => {
      return emailRequest();
    },
    onSuccess: _data => {
      setCode('');
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      toast.success('A new verification code has been sent to your email');
    },
    onError: error => {
      if (error instanceof Error && error.message === 'AuthenticationEmailAlreadyVerifiedException') {
        toast.info('This email is already verified');
        router.push('/feed');
      }
    },
  });

  // Chrono 30s avant de pouvoir renvoyer un nouvel email
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Nettoie le code collé en extrayant uniquement les lettres et chiffres
  const handleCodeChange = (value: string) => {
    // Extrait uniquement les caractères alphanumériques (lettres et chiffres)
    const cleanedCode = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    // Limite à 4 caractères maximum
    setCode(cleanedCode.slice(0, 4));
    // Réinitialise l'erreur quand l'utilisateur modifie le code
    if (error) setError('');
  };

  // Gère le paste via un input caché pour capturer tout le contenu collé
  useEffect(() => {
    if (!codeManually) return;

    const handlePaste = async (e: ClipboardEvent) => {
      const pastedText = e.clipboardData?.getData('text') || '';
      if (pastedText) {
        // Nettoie le texte collé : extrait uniquement les lettres et chiffres
        const cleanedCode = pastedText.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4);
        if (cleanedCode) {
          e.preventDefault();
          e.stopPropagation();
          setCode(cleanedCode);
          
          // Si le code fait exactement 4 caractères, valide automatiquement
          if (cleanedCode.length === 4) {
            // Petit délai pour s'assurer que le state est mis à jour
            setTimeout(async () => {
              await confirmEmail({ code: cleanedCode });
            }, 100);
          } else {
            // Sinon, focus sur le premier slot après le paste
            setTimeout(() => {
              const firstSlot = document.querySelector('[aria-label*="Enter digit 1"]') as HTMLElement;
              firstSlot?.focus();
            }, 0);
          }
        }
      }
    };

    // Écoute le paste sur le document avec capture pour intercepter avant OTPInput
    document.addEventListener('paste', handlePaste, true);
    
    return () => {
      document.removeEventListener('paste', handlePaste, true);
    };
  }, [codeManually, confirmEmail]);

  if (isSuccess && data.isVerified === true) {
    router.push('/feed');
    toast.info('Your email has been already verified');
  }

  if (isSuccess && data.isVerified === false) {
    return (
      <>
        <div className="w-full h-screen -z-10 absolute overflow-hidden">
          <Meteors number={10} />
        </div>
        <div className="h-screen w-screen flex flex-col items-center pt-24">
          <div className="flex flex-col items-center z-10">
            <Image src={LetterCercle} alt={''} width={56} height={56} />
            <div className="text-gray-900 text-3xl font-semibold mt-6">Confirm your email</div>
            <div className="text-center text-base font-normal mt-3">
              We sent a verification link to <br />
              <span className="font-medium">{data.email}</span>
            </div>
            {error && (
              <Alert variant="destructive" className="mt-4 w-[380px] relative">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="pr-8">
                  {error}
                </AlertDescription>
                <button
                  onClick={() => setError('')}
                  className="absolute top-3 right-3 text-destructive/70 hover:text-destructive transition-colors"
                  aria-label="Close error"
                >
                  <X className="h-4 w-4" />
                </button>
              </Alert>
            )}
            {!codeManually ? (
              <Button
                className="h-11 w-[380px] mt-8 text-base font-semibold"
                color="secondary"
                onClick={() => {
                  setCodeManually(true);
                  setCode('');
                  setError('');
                }}
              >
                Enter code manually
              </Button>
            ) : (
              <>
                <div className="pt-8">
                  {/* Input caché pour capturer le paste */}
                  <input
                    ref={hiddenInputRef}
                    type="text"
                    autoComplete="off"
                    style={{
                      position: 'absolute',
                      opacity: 0,
                      pointerEvents: 'none',
                      width: 0,
                      height: 0,
                    }}
                    tabIndex={-1}
                  />
                  <PinInput>
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
                <Button
                  className="h-11 w-[380px] mt-8 text-base font-semibold"
                  color="secondary"
                  disabled={code.length < 4}
                  onClick={() => confirmEmail({ code })}
                >
                  Verify email
                </Button>
              </>
            )}
            <div
              className={`text-sm font-normal mt-8 ${resendCooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:underline cursor-pointer'}`}
              onClick={() => resendCooldown === 0 && requestEmail()}
            >
              Didn’t receive the email?
              {resendCooldown > 0 ? (
                <span className="text-gray-500 text-sm font-semibold"> Resend in {resendCooldown}s</span>
              ) : (
                <span className="text-primary-700 text-sm font-semibold"> Click to resend</span>
              )}
            </div>
            <div
              className="flex items-center gap-2 text-gray-600 text-sm font-semibold mt-3 hover:underline cursor-pointer"
              onClick={() => {
                deleteCookie('is_authenticated');
                router.push('/signin');
              }}
            >
              <ArrowLeft width={20} height={20} />
              Back to log in
            </div>
          </div>
        </div>
      </>
    );
  }
};

export default EmailToConfirm;
