"use client";

import { useOnboardingContext } from "../OnboardingContext";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import dialCodeEmoji from "@/assets/dial-code-emoji.json";
import { motion } from "framer-motion";
import { Label } from "@/components/base/label/label";
import InputSelect from "@/components/ui/input-search";
import { Input } from "@/components/base/input/input";
import { Check, X } from "lucide-react";

const StepOTP = () => {
  const t = useTranslations("onboarding.fillPhoneNumber");
  const {
    setPhoneNumber,
    phoneNumber,
    countryCode,
    setButtonDisabled,
    buttonDisabled,
    setDialCode,
    dialCode
  } = useOnboardingContext();

  const [isValidPhone, setIsValidPhone] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const phoneNumberRegex = /^[0-9]{8,15}$/;

  // Validation en temps réel
  useEffect(() => {
    const isValid = phoneNumberRegex.test(phoneNumber);
    setIsValidPhone(isValid);

    if (isValid && buttonDisabled) {
      setButtonDisabled(false);
      toast.success("Numéro de téléphone valide !");
    } else if (!isValid && !buttonDisabled) {
      setButtonDisabled(true);
    }
  }, [phoneNumber, buttonDisabled, setButtonDisabled]);

  const handlePhoneNumberChange = (inputValue: string) => {
    const splitValue = inputValue.split(" ");

    if (/^[0-9]*$/.test(splitValue[1] || "")) {
      setPhoneNumber(splitValue[1] || "");
    }
  };

  const defaultDialedCode =
    dialCodeEmoji.find((item) => item.code.toLowerCase() === countryCode) ||
    dialCodeEmoji[0];

  useEffect(() => {
    setDialCode(defaultDialedCode);
  }, [defaultDialedCode]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        
      }
    }
  };

  if (!dialCode) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 sm:mb-8"
      >
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#101828] mb-2">
          Vérifiez votre identité
        </h2>
        <p className="text-sm sm:text-base text-[#475467] mb-4 px-2">
          Entrez votre numéro de téléphone pour recevoir un code de vérification
        </p>

        {/* Indicateur de progression */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm text-[#475467] mb-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#5E6AD2] rounded-full"></div>
            <span>Validé</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <span>{isValidPhone ? "Numéro valide" : "En attente"}</span>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto mb-4 sm:mb-6 px-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full transition-all duration-300 ${
                isValidPhone ? "bg-green-500" : "bg-[#5E6AD2]"
              }`}
              initial={{ width: 0 }}
              animate={{
                width: isValidPhone
                  ? "100%"
                  : phoneNumber.length > 0
                  ? "50%"
                  : "0%"
              }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {!isValidPhone && phoneNumber.length > 0 ? (
              <span className="text-orange-600">
                Le numéro doit contenir entre 8 et 15 chiffres
              </span>
            ) : isValidPhone ? (
              <span className="text-green-600">
                Numéro valide ! Vous pouvez continuer
              </span>
            ) : (
              <span className="text-gray-500">
                Entrez votre numéro de téléphone
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Form Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center"
      >
        <motion.div variants={fieldVariants} className="w-full max-w-md px-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label
                className="text-gray-700 text-sm font-medium flex items-center gap-2"
                htmlFor="phone number"
              >
                {t("phoneNumber")}
                {isValidPhone && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 bg-green-500 rounded-full"
                  />
                )}
              </Label>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Country Code Selector */}
                <motion.div
                  className="w-full sm:w-32"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <InputSelect
                    data={dialCodeEmoji.map((item) => ({
                      ...item,
                      compute: `${item.emoji} ${item.name} ${item.dialCode}`
                    }))}
                    placeholder={""}
                    placeholderInput={""}
                    messageNotFound={""}
                    keyLabel={"compute"}
                    value={{
                      ...dialCode,
                      compute: `${dialCode.emoji}`
                    }}
                    setValue={setDialCode}
                    defaultKey={"compute"}
                  />
                </motion.div>

                {/* Phone Number Input */}
                <motion.div
                  className="flex-1"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="relative">
                    <Input
                      type="tel"
                      onChange={handlePhoneNumberChange}
                      value={`${dialCode.dialCode} ${phoneNumber}`}
                      id="phone number"
                      placeholder={`${dialCode.dialCode} ${t(
                        "phoneNumberPlaceholder"
                      )}`}
                      className={`w-full text-gray-700 text-sm font-normal transition-all duration-200 ${
                        isFocused ? "ring-2 ring-[#5E6AD2]/20" : ""
                      } ${
                        isValidPhone && phoneNumber.length > 0
                          ? "border-green-500 bg-green-50"
                          : phoneNumber.length > 0
                          ? "border-orange-500 bg-orange-50"
                          : ""
                      }`}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                    />

                    {/* Validation indicator */}
                    {phoneNumber.length > 0 && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {isValidPhone ? (
                          <motion.div
                            initial={{ rotate: -180, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                          >
                            <Check className="w-3 h-3 text-white" />
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ rotate: 180, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center"
                          >
                            <X className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Help text */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-gray-500 mt-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <span>Format international recommandé</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <span>Nous vous enverrons un code de vérification</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StepOTP;
