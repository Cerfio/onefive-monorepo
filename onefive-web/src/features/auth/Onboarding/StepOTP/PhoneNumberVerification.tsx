"use client";

import { useOnboardingContext } from "../OnboardingContext";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/base/buttons/button";
import { ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, X } from "lucide-react";
import { uploadAvatar, GenderSalutationPreference, createProfile } from "@/queries/profile";
import { smsConfirm } from "@/queries/auth";
import { PinInput } from "@/components/base/pin-input/pin-input";

const PhoneNumberVerification = ({
  callback,
  requestSms
}: {
  callback: () => void;
  requestSms: () => void;
}) => {
  const router = useRouter();
  const t = useTranslations("onboarding.verifyPhoneNumber");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { buttonDisabled, setButtonDisabled, dialCode, phoneNumber, avatarFile, mainRole, secondaryRole, ...payload } =
    useOnboardingContext();

  // Calcul de la progression du code
  const filledDigits = code.length;
  const progressPercentage = (filledDigits / 6) * 100;

  const handleCodeChange = (value: string) => {
    setCode(value);
    if (error) setError("");
    if (value.length === 6) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  };

  const handleCodeComplete = (value: string) => {
    setCode(value);
    setButtonDisabled(false);
    toast.success("Code complet ! Vous pouvez continuer");
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      await requestSms();
      toast.success("Nouveau code envoyé !");
    } catch {
      toast.error("Erreur lors de l'envoi du code");
    } finally {
      setIsResending(false);
    }
  };

  const [showConfetti, setShowConfetti] = useState(false);

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

  const handleSubmit = async () => {
    // Si le bouton n'est pas désactivé et qu'on n'a pas de code, c'est que le numéro est déjà vérifié
    const isAlreadyVerified = !buttonDisabled && code.length === 0;
    
    if (!isAlreadyVerified && code.length !== 6) {
      toast.error("Veuillez entrer un code à 6 chiffres");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Vérifier le code SMS seulement si on a un code
      if (!isAlreadyVerified) {
        try {
          await smsConfirm({ code });
          // Code validé ou déjà vérifié — pas de toast, le succès final suffit
        } catch (smsError: any) {
          // Gestion spécifique des erreurs SMS — message rouge sur l'écran (pas de toast)
          const errorMessage = smsError?.message || '';
          
          if (errorMessage === 'SmsVerificationIncorrectCodeException') {
            setError("Le code que vous avez saisi est incorrect. Veuillez réessayer.");
            setCode("");
            setButtonDisabled(true);
            throw smsError;
          } else if (errorMessage === 'SmsVerificationCodeExpiredException') {
            setError("Le code que vous avez saisi a expiré. Veuillez demander un nouveau code.");
            setCode("");
            setButtonDisabled(true);
            throw smsError;
          } else if (errorMessage === 'SmsVerificationPhoneNumberAlreadyUsedException') {
            setError("Ce numéro de téléphone est déjà utilisé par un autre compte. Veuillez utiliser un autre numéro.");
            setCode("");
            setButtonDisabled(true);
            throw smsError;
          } else {
            toast.error("Une erreur est survenue. Veuillez réessayer.");
            throw smsError;
          }
        }
      }
      // else: numéro déjà vérifié, on continue sans toast

      // 2. D'abord créer le profil SANS l'avatar
      const ecosystemRoles: string[] = [];
      if (mainRole) ecosystemRoles.push(mainRole);
      if (secondaryRole && secondaryRole !== mainRole) ecosystemRoles.push(secondaryRole);

      await createProfile({
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
        code: isAlreadyVerified ? '' : code,
        ecosystemRoles,
      });

      // 3. Ensuite uploader l'avatar si un fichier a été sélectionné
      if (avatarFile) {
        try {
          await uploadAvatar(avatarFile);
        } catch (uploadError) {
          console.error('Erreur lors de l\'upload de l\'avatar:', uploadError);
          // Ne pas faire échouer tout le processus — pas de toast, le succès final suffit
        }
      }

      setShowConfetti(true);

      toast.success("🎉 Profil créé avec succès ! Bienvenue sur Onefive !", {
        duration: 3000,
        description:
          "Votre compte est maintenant actif. Découvrez votre feed personnalisé !"
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      router.push("/feed");
    } catch (error: any) {
      // Les erreurs spécifiques sont déjà gérées dans smsConfirm et createProfile
      // On ne log que si ce n'est pas une erreur déjà gérée
      const errorMessage = error?.message || '';
      if (!errorMessage.includes('Unable to confirm your sms') && !errorMessage.includes('Unable to create your profile')) {
        console.error('Erreur lors de la création du profil:', error);
      }
    } finally {
      setIsSubmitting(false);
      setShowConfetti(false);
    }
  };


  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 sm:mb-8"
      >
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#101828] mb-2">
          Vérifiez votre numéro
        </h2>
        <p className="text-sm sm:text-base text-[#475467] mb-4 px-2">
          Entrez le code à 6 chiffres envoyé par SMS
        </p>

        {/* Phone Number Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-50 rounded-full mb-4 text-xs sm:text-sm"
        >
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Code envoyé à</span>
          </div>
          <span className="font-semibold text-[#101828]">{`${dialCode.dialCode} ${phoneNumber}`}</span>
        </motion.div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto mb-4 sm:mb-6 px-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-[#5E6AD2] h-2 rounded-full transition-all duration-300"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {filledDigits < 6 ? (
              <span className="text-orange-600">
                Il vous reste {6 - filledDigits} chiffre
                {6 - filledDigits > 1 ? "s" : ""}
              </span>
            ) : (
              <span className="text-green-600">
                Code complet ! Vous pouvez continuer
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Code Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center w-full"
      >
        <div className="w-full max-w-md mb-6 sm:mb-8 px-4">
          <PinInput size="md">
            <PinInput.Label className="text-center mb-4">Code de vérification</PinInput.Label>
            <PinInput.Group 
              maxLength={6}
              value={code}
              onChange={handleCodeChange}
              onComplete={handleCodeComplete}
            >
              <PinInput.Slot index={0} />
              <PinInput.Slot index={1} />
              <PinInput.Slot index={2} />
              <PinInput.Separator />
              <PinInput.Slot index={3} />
              <PinInput.Slot index={4} />
              <PinInput.Slot index={5} />
            </PinInput.Group>
            <PinInput.Description className="text-center mt-4">
              Entrez le code à 6 chiffres reçu par SMS
            </PinInput.Description>
          </PinInput>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 max-w-md w-full relative">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="pr-8">{error}</AlertDescription>
            <button
              onClick={() => setError("")}
              className="absolute top-3 right-3 text-destructive/70 hover:text-destructive transition-colors"
              aria-label="Fermer l'erreur"
            >
              <X className="h-4 w-4" />
            </button>
          </Alert>
        )}

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Button
            className={`w-full h-12 text-base font-semibold transition-all duration-300 ${
              isSubmitting
                ? "bg-green-500 hover:bg-green-600"
                : "bg-[#5E6AD2] hover:bg-[#5E6AD2]/90"
            }`}
            color="primary"
            isDisabled={(!buttonDisabled && code.length === 0 ? false : code.length < 6) || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <motion.div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Création du profil...</span>
              </motion.div>
            ) : (
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{t("letsStart")}</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.div>
              </motion.div>
            )}
          </Button>
        </motion.div>

        {/* Action Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center space-y-3"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleResendCode}
            disabled={isResending}
            className="text-sm text-gray-600 hover:text-[#5E6AD2] transition-colors cursor-pointer"
          >
            {isResending ? (
              <span className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full"
                />
                Envoi en cours...
              </span>
            ) : (
              <>
                {t("didntReceiveCode")}
                <span className="text-[#5E6AD2] font-semibold ml-1">
                  {t("resendCode")}
                </span>
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              callback();
              setButtonDisabled(false);
            }}
            className="flex w-full items-center justify-center gap-2 text-gray-600 text-sm font-medium hover:text-[#5E6AD2] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("changePhoneNumber")}
          </motion.button>
        </motion.div>
      </motion.div>
      <AnimatePresence>{showConfetti && <ConfettiAnimation />}</AnimatePresence>
    </div>
  );
};

export default PhoneNumberVerification;

const ConfettiAnimation = () => {
  const colors = ["#5E6AD2", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            left: `${Math.random() * 100}%`,
            top: "-10px"
          }}
          initial={{
            y: -10,
            x: 0,
            rotate: 0,
            scale: 0
          }}
          animate={{
            y: window.innerHeight + 10,
            x: Math.random() * 200 - 100,
            rotate: Math.random() * 360,
            scale: [0, 1, 0.8, 0]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: Math.random() * 0.5
          }}
        />
      ))}
    </div>
  );
};
