'use client';
import { Separator } from '@/components/base/separator/separator';
import { useOnboardingContext } from './OnboardingContext';
import { useMutation } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import OnefiveLogo from '@/assets/images/onefiveLogo.png';
import StepProfile from './StepProfile';
import StepRole from './StepRole';
import StepTags from './StepTags';
import StepListProfile from './StepListProfile';
import StepStartupList from './StepStartup';
import StepOTP from './StepOTP';
import PhoneNumberVerification from './StepOTP/PhoneNumberVerification';
import { Button } from '@/base/buttons/button';
import { smsRequest } from '@/queries/auth';
import { uploadAvatar, GenderSalutationPreference, createProfile } from '@/queries/profile';
import { api } from '@/utils/kyInstance';
import { getCookie } from 'cookies-next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button as ShadcnButton } from '@/components/ui/button';
import { Input } from '@/components/base/input/input';
import { Label } from '@/components/base/input/label';
import posthog from 'posthog-js';

const Onboarding = () => {
  const t = useTranslations('onboarding');
  const router = useRouter();
  const _searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const { 
    buttonDisabled, 
    setButtonDisabled, 
    phoneNumber, 
    dialCode, 
    avatarFile, 
    mainRole, 
    secondaryRole,
    setFirstname,
    setLastname,
    setProfilePicture,
    setAvatarFile,
    ...payload 
  } = useOnboardingContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRequestingRef = useRef(false);
  const [showManualUrlModal, setShowManualUrlModal] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [isCompletingSync, setIsCompletingSync] = useState(false);

  const convertAddressGenderToPreference = (addressGender: 'man' | 'woman' | 'other'): GenderSalutationPreference => {
    switch (addressGender) {
      case 'man':
        return GenderSalutationPreference.MALE;
      case 'woman':
        return GenderSalutationPreference.FEMALE;
      case 'other':
        return GenderSalutationPreference.OTHER;
      default:
        return GenderSalutationPreference.OTHER;
    }
  };

  // Effect pour gérer le retour de LinkedIn (ancien flux OAuth - gardé pour compatibilité)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('linkedin') === 'true') {
      const data = sessionStorage.getItem('linkedInOnboardingData');
      if (data) {
        try {
          const parsedData = JSON.parse(data);
          
          if (parsedData.requiresManualUrl) {
            setShowManualUrlModal(true);
          }
          // Sinon, les données sont déjà pré-remplies directement dans StepProfile
          // Plus besoin d'afficher LinkedInConfirmation
          
          sessionStorage.removeItem('linkedInOnboardingData');
          // Nettoyer l'URL
          window.history.replaceState({}, '', '/onboarding');
        } catch (error) {
          console.error('Error parsing LinkedIn data:', error);
          toast.error('Erreur lors de la récupération des données LinkedIn');
        }
      }
    }
  }, []);

  const handleManualUrlSubmit = async () => {
    if (!manualUrl.trim()) return;
    setIsCompletingSync(true);
    try {
      const _response = await api.post(
        'linkedin-sync/onboarding/complete',
        {
          json: { linkedinUrl: manualUrl },
          timeout: 150000, // 2 minutes 30 secondes pour le scraping LinkedIn
        }
      ).json<any>();
      
      // Les données seront pré-remplies directement dans StepProfile
      // Plus besoin de confirmation
      setShowManualUrlModal(false);
      toast.success('Données LinkedIn récupérées !');
    } catch (error) {
      console.error(error);
      toast.error('Impossible de récupérer les données avec cette URL');
    } finally {
      setIsCompletingSync(false);
    }
  };

  const createProfileDirectly = async () => {
    setIsSubmitting(true);
    try {
      // 1. D'abord créer le profil SANS l'avatar
      const ecosystemRoles: string[] = [];
      if (mainRole) ecosystemRoles.push(mainRole);
      if (secondaryRole && secondaryRole !== mainRole) ecosystemRoles.push(secondaryRole);

      // Get referral code from cookie (from URL) or from context (manual input)
      const referredByCodeFromCookie = getCookie('referredByCode') as string | undefined;
      const referredByCode = referredByCodeFromCookie || payload.referredByCode || undefined;

      const _profileResponse = await createProfile({
        city: payload.city,
        countryCode: payload.countryCode,
        dateOfBirth: payload.dateOfBirth,
        firstName: payload.firstname,
        followProfileIds: payload.profileFollowed,
        followStartupIds: payload.startupsFollowed,
        gender: payload.anotherGender.genderName,
        lastName: payload.lastname,
        genderSalutationPreference: convertAddressGenderToPreference(
          payload.anotherGender.addressGender,
        ),
        tagFollowing: payload.tags,
        code: '', // Code vide car numéro déjà vérifié
        ecosystemRoles,
        ...(referredByCode ? { referredByCode } : {}),
      });

      // 2. Ensuite uploader l'avatar si un fichier a été sélectionné
      if (avatarFile) {
        try {
          await uploadAvatar(avatarFile);
        } catch (uploadError) {
          console.error('Erreur lors de l\'upload de l\'avatar:', uploadError);
          // Ne pas faire échouer tout le processus — pas de toast, le succès final suffit
        }
      }


      posthog.capture('onboarding_completed');

      toast.success("🎉 Profil créé avec succès ! Bienvenue sur Onefive !", {
        duration: 3000,
        description:
          "Votre compte est maintenant actif. Découvrez votre feed personnalisé !"
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      router.push("/waitlist");
    } catch (error: any) {
      const errorMessage = error?.message || '';
      if (!errorMessage.includes('Unable to create your profile')) {
        console.error('Erreur lors de la création du profil:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const { mutateAsync } = useMutation({
    mutationFn: async () => {
      // Protection contre les appels multiples avec useRef (synchrone)
      if (isRequestingRef.current) {
        return Promise.resolve();
      }
      
      if (currentStep === 5) {
        isRequestingRef.current = true;
        try {
          // Construire le numéro de téléphone complet avec le code pays
          const fullPhoneNumber = `${dialCode.dialCode}${phoneNumber}`;
          // Appeler l'API pour envoyer le code SMS
          const result = await smsRequest({ phoneNumber: fullPhoneNumber });
          // Si le numéro est déjà vérifié, on skip complètement l'étape de vérification et on crée le profil directement
          if ((result as any)?.alreadyVerified) {
            // Créer le profil directement sans passer par l'étape de vérification (pas de toast)
            await createProfileDirectly();
          } else {
            toast.success('Code de vérification envoyé !');
            setCurrentStep(6);
            setButtonDisabled(true);
          }
        } finally {
          isRequestingRef.current = false;
        }
        return;
      }
      if (currentStep === 5) {
        isRequestingRef.current = true;
        try {
          // Pour le renvoi de code depuis PhoneNumberVerification
          const fullPhoneNumber = `${dialCode.dialCode}${phoneNumber}`;
          await smsRequest({ phoneNumber: fullPhoneNumber });
          toast.success('Code de vérification envoyé !');
        } finally {
          isRequestingRef.current = false;
        }
        return;
      }
      setCurrentStep(currentStep + 1);
      // Permettre de skip les étapes 3 (suivre des profils) et 4 (suivre des startups)
      if (currentStep + 1 === 3 || currentStep + 1 === 4) {
        setButtonDisabled(false);
      } else {
        setButtonDisabled(true);
      }
      return Promise.resolve();
    },
    onMutate: () => {
      setIsSubmitting(true);
    },
    onSuccess: () => {
      // La logique est maintenant dans mutationFn
    },
    onError: (error) => {
      // Les erreurs sont déjà gérées dans smsRequest (toast affiché)
      console.error('Erreur lors de l\'envoi du code SMS:', error);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const changeStep = (step: number) => {
    // Protection contre les doubles clics
    if (isSubmitting) {
      return;
    }
    
    if (step === 5 && phoneNumber.length > 0 && dialCode.dialCode.length > 0 && !buttonDisabled) {
      setCurrentStep(step);
      setButtonDisabled(false);
    } else if (step === 6) {
      mutateAsync();
    } else {
      setCurrentStep(step);
      setButtonDisabled(true);
    }
  };


  return (
    <div className="flex flex-col items-center pt-4 pb-4 relative min-h-screen w-full">
      <div className="relative">
        <Image quality={100} width={41} height={49} src={OnefiveLogo} alt={'Onefive logo'} />
      </div>
      <div className="mt-3 text-gray-900 font-semibold text-lg sm:text-xl px-4 text-center">{t('welcome')}</div>
      <div className="mt-4 px-4 w-full max-w-6xl">
        <ProgressStep
          callback={step => {
            setCurrentStep(step);
            setButtonDisabled(true);
          }}
          currentStep={currentStep}
        />
      </div>
      <div className="mt-6 sm:mt-8 flex-1 flex flex-col items-center justify-start gap-4 sm:gap-6 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {currentStep === 0 ? (
          <StepProfile />
        ) : currentStep === 1 ? (
          <StepRole />
        ) : currentStep === 2 ? (
          <StepTags />
        ) : currentStep === 3 ? (
          <StepListProfile />
        ) : currentStep === 4 ? (
          <StepStartupList />
        ) : currentStep === 5 ? (
          <StepOTP />
        ) : (
          <PhoneNumberVerification
            callback={() => {
              setCurrentStep(currentStep - 1);
            }}
            requestSms={() => mutateAsync()}
          />
        )}
        {currentStep !== 6 && (
          <div className="flex justify-center mt-4 sm:mt-6 px-4">
            <Button
              disabled={buttonDisabled || isSubmitting}
              size="lg"
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isSubmitting && !buttonDisabled) {
                  changeStep(currentStep + 1);
                }
              }}
            >
              {t('continue')}
            </Button>
          </div>
        )}
      </div>

      {/* Modal pour saisir l'URL LinkedIn manuellement si nécessaire */}
      <Dialog open={showManualUrlModal} onOpenChange={setShowManualUrlModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Une dernière étape !</DialogTitle>
            <DialogDescription>
              Pour finaliser l'import de votre profil, nous avons besoin de votre URL LinkedIn publique.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="linkedin-url">URL de votre profil LinkedIn</Label>
              <Input
                id="linkedin-url"
                placeholder="https://www.linkedin.com/in/votre-profil"
                value={manualUrl}
                onChange={(value) => setManualUrl(value)}
              />
              <p className="text-xs text-slate-500">
                Vous pouvez la trouver sur votre profil LinkedIn, sous votre nom ou dans la barre d'adresse.
              </p>
            </div>
          </div>
          <DialogFooter>
            <ShadcnButton
              variant="outline"
              onClick={() => setShowManualUrlModal(false)}
              disabled={isCompletingSync}
            >
              Annuler
            </ShadcnButton>
            <ShadcnButton 
              onClick={handleManualUrlSubmit}
              disabled={!manualUrl || isCompletingSync}
            >
              {isCompletingSync ? 'Récupération...' : 'Terminer l\'import'}
            </ShadcnButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Onboarding;

const ProgressStep = ({ currentStep, callback }: { currentStep: number; callback: (step: number) => void }) => {
  const t = useTranslations('onboarding.progressStep');
  const lists = [
    {
      title: t('step1Title'),
      description: t('step1Description'),
    },
    {
      title: t('step2Title'),
      description: t('step2Description'),
    },
    {
      title: t('step3Title'),
      description: t('step3Description'),
    },
    {
      title: t('step4Title'),
      description: t('step4Description'),
    },
    {
      title: t('step5Title'),
      description: t('step5Description'),
    },
    {
      title: t('step6Title'),
      description: t('step6Description'),
    },
  ];

  return (
    <div className="w-full">
      {/* Version Desktop */}
      <div className="hidden lg:flex w-full justify-center">
        {lists.map((list, index) => (
          <div
            key={index}
            className={`relative ${index < currentStep ? 'cursor-pointer' : ''}`}
            onClick={() => {
              if (index < currentStep) {
                callback(index);
              }
            }}
          >
            <div className="flex flex-col gap-3 items-center w-60">
              {index < currentStep ? (
                <ProgressStepDotComplete />
              ) : index === currentStep ? (
                <ProgressStepDotCurrent />
              ) : (
                <ProgressStepDotIncomplete />
              )}
              <div>
                <div
                  className={`text-sm font-semibold text-center ${
                    index === currentStep ? 'text-primary-700' : 'text-gray-700'
                  }`}
                >
                  {list.title}
                </div>
                <div
                  className={`text-xs font-normal text-center ${
                    index === currentStep ? 'text-primary-600' : 'text-gray-600'
                  }`}
                >
                  {list.description}
                </div>
              </div>
            </div>
            {index < lists.length - 1 && (
              <Separator
                className={`w-[204px] h-p z-10 absolute top-[17.5px] left-[138px] ${
                  index < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Version Mobile/Tablet */}
      <div className="lg:hidden w-full">
        <div className="flex flex-col gap-4">
          {lists.map((list, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-200 ${
                index < currentStep
                  ? 'bg-primary-50 border border-primary-200 cursor-pointer'
                  : index === currentStep
                    ? 'bg-primary-100 border-2 border-primary-300'
                    : 'bg-gray-50 border border-gray-200'
              }`}
              onClick={() => {
                if (index < currentStep) {
                  callback(index);
                }
              }}
            >
              <div className="flex-shrink-0">
                {index < currentStep ? (
                  <ProgressStepDotComplete />
                ) : index === currentStep ? (
                  <ProgressStepDotCurrent />
                ) : (
                  <ProgressStepDotIncomplete />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm font-semibold ${index === currentStep ? 'text-primary-700' : 'text-gray-700'}`}
                >
                  {list.title}
                </div>
                <div className={`text-xs ${index === currentStep ? 'text-primary-600' : 'text-gray-600'}`}>
                  {list.description}
                </div>
              </div>
              {index < currentStep && (
                <div className="flex-shrink-0">
                  <Check className="w-4 h-4 text-primary-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProgressStepDotIncomplete = () => {
  return (
    <div className="w-9 h-9 bg-white rounded-full flex justify-center items-center">
      <div className="w-6 h-6 bg-gray-100 rounded-full flex justify-center items-center">
        <div className="w-2 h-2 bg-white rounded-full"></div>
      </div>
    </div>
  );
};

const ProgressStepDotComplete = () => {
  return (
    <div className="w-9 h-9 bg-white rounded-full flex justify-center items-center">
      <div className="w-6 h-6 bg-primary-600 hover:bg-primary-500 rounded-full flex justify-center items-center">
        <Check className="w-4 h-4 text-white" />
      </div>
    </div>
  );
};

const ProgressStepDotCurrent = () => {
  return (
    <div className="w-9 h-9 bg-primary-50 rounded-full flex justify-center items-center">
      <div className="w-6 h-6 bg-primary-600 rounded-full flex justify-center items-center">
        <div className="w-2 h-2 bg-white rounded-full"></div>
      </div>
    </div>
  );
};
