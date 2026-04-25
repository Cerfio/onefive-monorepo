'use client';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useOnboardingContext } from '../OnboardingContext';
import isEmptyObject from '@/shared/utils/isEmptyObject';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { getLocalizedCountries } from '@/lib/country';
import { getLocalizedCities, getLocalizedCitiesAsync } from '@/lib/cities';
import { getCitiesForCountry } from '@/lib/cities-loader';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/base/input/input';
import { DatePicker } from '@/components/application/date-picker/date-picker';
import { Label } from '@/components/base/input/label';
import { parseDate } from '@internationalized/date';
import type { DateValue } from 'react-aria-components';
import { Select } from '@/components/base/select/select';
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/base/dialog/dialog';
import InputSelect from '@/components/ui/input-search';
import { Button } from '@/components/base/buttons/button';
import { RadioGroup, RadioButton } from '@/components/base/radio-buttons/radio-buttons';
import { Avatar } from '@/components/base/avatar/avatar';
import { Plus, User } from 'lucide-react';
import { AvatarCropModal } from '@/components/profile/modals/AvatarCropModal';
import { LinkedInOnboardingModal } from '@/components/profile/modals/LinkedInOnboardingModal';
import { getCookie } from 'cookies-next';

const useOptimizedAnimations = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return {
    reducedMotion,
    animationVariants: reducedMotion
      ? {
          hidden: { opacity: 0 },
          visible: { opacity: 1 }
        }
      : {
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4  }
          }
        }
  };
};

const useFormValidation = (fields: Record<string, any>) => {
  return useMemo(() => {
    const validations = {
      firstname: fields.firstname?.trim().length >= 2,
      lastname: fields.lastname?.trim().length >= 2,
      countryCode: fields.countryCode && !isEmptyObject(fields.countryCode) && fields.countryCode.alpha2,
      city: fields.city && !isEmptyObject(fields.city) && fields.city.asciiName,
      gender: fields.gender?.length > 0 || fields.anotherGender?.genderName?.length > 0,
      dateOfBirth: fields.dateOfBirth?.length > 0
    };

    const isValid = Object.values(validations).every(Boolean);
    const progress = Object.values(validations).filter(Boolean).length;
    const total = Object.keys(validations).length;

    return { validations, isValid, progress, total };
  }, [
    fields.firstname,
    fields.lastname,
    fields.countryCode,
    fields.city,
    fields.gender,
    fields.anotherGender?.genderName,
    fields.dateOfBirth
  ]);
};

const ModalGender = () => {
  const { setAnotherGender } = useOnboardingContext();
  const [addressGender, setAddressGender] = useState<'man' | 'woman' | 'other'>('man');
  const [gender, setGender] = useState('');

  return (
    <DialogContent className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="text-lg text-gray-700 font-semibold">Choose a gender</div>
        <div className="text-sm text-gray-700">
          Nous pouvons tenir compte de votre genre pour personnaliser les services Onefive, y compris dans la manière
          dont nous nous adressons à vous.
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="text-sm text-gray-700 font-medium">Genre</div>
        <Input placeholder="Indiquez votre genre" value={gender} onChange={setGender} />
        <div className="flex justify-between">
          <div className="text-sm font-normal text-gray-500">Veuillez utiliser au moins une lettre</div>
          <div className="text-sm font-normal text-gray-500">{gender.length} / 50</div>
        </div>
      </div>
      <div className="text-base font-normal text-gray-700">Onefive doit s'addresser à vous comme :</div>
      <RadioGroup
        value={addressGender}
        onChange={(value) => setAddressGender(value as 'man' | 'woman' | 'other')}
        className="flex flex-col gap-6 text-sm font-medium text-gray-700"
      >
        <RadioButton value="man" label="Homme" />
        <RadioButton value="woman" label="Femme" />
        <RadioButton value="other" label="Autre" />
      </RadioGroup>
      <div className="text-gray-700 font-normal">
        (Exemple : Invitez-
        <span className="font-bold">{addressGender === 'woman' ? 'la' : 'le'}</span> à rejoindre votre Startup.)
      </div>
      <div className="flex justify-between gap-2">
        <DialogClose className="w-full">
          <Button className="w-full" color="secondary">
            Annuler
          </Button>
        </DialogClose>
        <DialogClose className="w-full">
          <Button
            color="primary"
            onClick={() => {
              setAnotherGender({
                addressGender: addressGender,
                genderName: gender
              });
            }}
            className="w-full"
          >
            Enregistrer
          </Button>
        </DialogClose>
      </div>
    </DialogContent>
  );
};

const StepProfile = () => {
  const {
    setFirstname,
    firstname,
    lastname,
    setLastname,
    profilePicture,
    setProfilePicture,
    avatarFile: _avatarFile,
    setAvatarFile,
    setCountryCode,
    setCity,
    setButtonDisabled,
    gender,
    setGender,
    anotherGender,
    dateOfBirth,
    setDateOfBirth,
    referredByCode,
    setReferredByCode
  } = useOnboardingContext();

  const [countrySearch, setCountrySearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<any>({});
  const [selectedCity, setSelectedCity] = useState<any>({});
  const [genderSelectState, setGenderSelectState] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [citiesList, setCitiesList] = useState<Array<{ [key: string]: string; asciiName: string }>>([]);
  const [_isLoadingCities, setIsLoadingCities] = useState(false);
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [linkedInCity, setLinkedInCity] = useState<string | null>(null); // Pour stocker la ville LinkedIn temporairement

  const _current = new Date().toISOString().split('T')[0];
  const { animationVariants: _animationVariants } = useOptimizedAnimations();

  const formFields = {
    firstname,
    lastname,
    countryCode: selectedCountry,
    city: selectedCity,
    gender,
    anotherGender,
    dateOfBirth
  };

  const { validations, progress, total } = useFormValidation(formFields);
  const progressPercentage = (progress / total) * 100;

  const validateField = useCallback(
    (field: string, value: any) => {
      if (!touched[field]) return;

      let errorMessage = '';

      switch (field) {
        case 'firstname':
          if (value.length < 2) {
            errorMessage = 'Le prénom doit contenir au moins 2 caractères';
          }
          break;
        case 'lastname':
          if (value.length < 2) {
            errorMessage = 'Le nom doit contenir au moins 2 caractères';
          }
          break;
        case 'dateOfBirth':
          if (!value) {
            errorMessage = 'Veuillez sélectionner votre date de naissance';
          } else {
            const age = new Date().getFullYear() - new Date(value).getFullYear();
            if (age < 13 || age > 120) {
              errorMessage = 'Veuillez entrer une date de naissance valide';
            }
          }
          break;
      }

      setErrors(prev => ({
        ...prev,
        [field]: errorMessage
      }));
    },
    [touched],
  );

  const handleFieldTouch = useCallback((field: string) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  }, []);

  // Validation en temps réel seulement pour les champs touchés
  useEffect(() => {
    if (touched.firstname) {
      validateField('firstname', firstname);
    }
  }, [firstname, validateField, touched.firstname]);

  useEffect(() => {
    if (touched.lastname) {
      validateField('lastname', lastname);
    }
  }, [lastname, validateField, touched.lastname]);

  useEffect(() => {
    if (touched.dateOfBirth) {
      validateField('dateOfBirth', dateOfBirth);
    }
  }, [dateOfBirth, validateField, touched.dateOfBirth]);

  const isFormValid = useMemo(() => {
    const hasValidFirstname = firstname && firstname.trim().length >= 2;
    const hasValidLastname = lastname && lastname.trim().length >= 2;
    const hasValidCountry = selectedCountry && !isEmptyObject(selectedCountry) && selectedCountry.alpha2;
    const hasValidCity = selectedCity && !isEmptyObject(selectedCity) && selectedCity.asciiName;
    const hasValidGender = (gender && gender.length > 0) || (anotherGender && anotherGender.genderName && anotherGender.genderName.length > 0);
    const hasValidDateOfBirth = dateOfBirth && dateOfBirth.length > 0;
    
    return !!(hasValidFirstname && hasValidLastname && hasValidCountry && hasValidCity && hasValidGender && hasValidDateOfBirth);
  }, [firstname, lastname, selectedCountry, selectedCity, gender, anotherGender.genderName, dateOfBirth]);

  // Update button state immediately when form validity changes
  useEffect(() => {
    setButtonDisabled(!isFormValid);
  }, [isFormValid, setButtonDisabled]);

  useEffect(() => {
    if (selectedCountry.alpha2) {
      setCountryCode(selectedCountry.alpha2);
      setSelectedCity({});
    }
  }, [selectedCountry.alpha2, setCountryCode]);

  useEffect(() => {
    if (selectedCity.asciiName) {
      setCity(selectedCity.asciiName);
    }
  }, [selectedCity.asciiName, setCity]);

  useEffect(() => {
    if (anotherGender.genderName) {
      setGenderSelectState(false);
      setGender(anotherGender.genderName);
    }
  }, [anotherGender.genderName, setGender]);

  const currentLanguage = sessionStorage.getItem('language') || 'en';
  
  // Get localized countries list (no API call needed, let cmdk handle filtering)
  const countriesList = useMemo(() => {
    return getLocalizedCountries(currentLanguage);
  }, [currentLanguage]);

  // Load cities asynchronously when country is selected
  useEffect(() => {
    if (!selectedCountry.alpha2) {
      setCitiesList([]);
      return;
    }
    
    // Try the synchronous loader first for debugging
    const citiesFromLoader = getCitiesForCountry(selectedCountry.alpha2);
    
    if (citiesFromLoader.length > 0) {
      // Map to expected format, préserver les données originales
      const mappedCities = citiesFromLoader.map(city => ({
        [currentLanguage]: city.name || '',
        asciiName: city.name || '',
        originalCity: city, // Préserver les données originales
      }));
      setCitiesList(mappedCities);
      setIsLoadingCities(false);
      return;
    }

    // Fallback to async method
    
    // Get initial cached data synchronously if available (without search filter)
    const cachedCities = getLocalizedCities(selectedCountry.alpha2, currentLanguage);
    if (cachedCities.length > 0) {
      setCitiesList(cachedCities);
    }

    // Load cities asynchronously (without search filter - let cmdk handle filtering)
    setIsLoadingCities(true);
    getLocalizedCitiesAsync(selectedCountry.alpha2, currentLanguage)
      .then(cities => {
        setCitiesList(cities);
        setIsLoadingCities(false);
      })
      .catch(() => {
        setIsLoadingCities(false);
        setCitiesList([]);
      });
  }, [selectedCountry.alpha2, currentLanguage]);

  // Pré-remplir la ville LinkedIn une fois que les villes sont chargées
  useEffect(() => {
    if (linkedInCity && citiesList.length > 0 && !selectedCity.asciiName) {
      // Chercher la ville dans la liste des villes chargées
      const foundCity = citiesList.find(
        (city: any) => {
          const cityName = city[currentLanguage]?.toLowerCase() || city.asciiName?.toLowerCase();
          return cityName === linkedInCity.toLowerCase();
        }
      );
      
      if (foundCity) {
        setSelectedCity(foundCity);
        setLinkedInCity(null); // Nettoyer après utilisation
      } else {
        // Si la ville n'est pas trouvée, créer un objet avec le nom de la ville
        setSelectedCity({
          [currentLanguage]: linkedInCity,
          asciiName: linkedInCity,
        });
        setLinkedInCity(null); // Nettoyer après utilisation
      }
    }
  }, [citiesList, linkedInCity, currentLanguage, selectedCity.asciiName]);

  const t = useTranslations('onboarding.detailProfile');

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

  const handleAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation du fichier
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Format de fichier non supporté. Utilisez JPG, PNG ou WebP.');
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB pour avatar
    if (file.size > maxSize) {
      toast.error('Le fichier est trop volumineux. Taille maximum : 2MB.');
      return;
    }

    // Ouvrir le modal de crop
    setSelectedFile(file);
    setIsCropModalOpen(true);
  };

  const handleCropComplete = (croppedFile: File) => {
    // Créer une prévisualisation de l'image croppée
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewUrl = e.target?.result as string;
      setProfilePicture(previewUrl);
    };
    reader.readAsDataURL(croppedFile);

    // Stocker le fichier dans le contexte pour l'upload à la fin
    setAvatarFile(croppedFile);
    setIsCropModalOpen(false);
    setSelectedFile(null);
    setIsUploading(false);
    toast.success('Photo de profil sélectionnée !');
  };

  const handleCropCancel = () => {
    setIsCropModalOpen(false);
    setSelectedFile(null);
    // Reset l'input file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLinkedInSuccess = async (data: any) => {
    // Pré-remplir les champs du formulaire avec les données LinkedIn
    if (data.profile) {
      if (data.profile.firstName) {
        setFirstname(data.profile.firstName);
      }
      if (data.profile.lastName) {
        setLastname(data.profile.lastName);
      }
      
      // Pré-remplir le pays et la ville si disponibles
      if (data.profile.countryCode) {
        setCountryCode(data.profile.countryCode);
        
        // Trouver le pays dans la liste des pays localisés
        const countriesList = getLocalizedCountries(currentLanguage);
        const foundCountry = countriesList.find(
          (country: any) => country.alpha2?.toUpperCase() === data.profile.countryCode.toUpperCase()
        );
        if (foundCountry) {
          setSelectedCountry(foundCountry);
        }
      }
      
      if (data.profile.city) {
        setCity(data.profile.city);
        // Stocker temporairement la ville pour la pré-remplir une fois les villes chargées
        setLinkedInCity(data.profile.city);
      }
      
      if (data.profile.profilePictureUrl) {
        setProfilePicture(data.profile.profilePictureUrl);
        // Télécharger l'image et la convertir en File pour l'avatar
        try {
          const response = await fetch(data.profile.profilePictureUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
          }
          const blob = await response.blob();
          const file = new File([blob], 'linkedin-avatar.jpg', { type: blob.type || 'image/jpeg' });
          setAvatarFile(file);
        } catch {
          toast.warning('Photo de profil LinkedIn affichée mais non téléchargée. Vous pourrez l\'uploader manuellement.');
        }
      }
    }
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* LinkedIn Onboarding Modal */}
      <LinkedInOnboardingModal
        open={showLinkedInModal}
        onOpenChange={setShowLinkedInModal}
        onSuccess={handleLinkedInSuccess}
      />

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#101828] mb-2">Créons votre profil</h2>
        <p className="text-sm sm:text-base text-[#475467] mb-4 px-2">
          Remplissez vos informations personnelles pour personnaliser votre expérience
        </p>

        {/* NOUVEAU : Bouton LinkedIn */}
        <div className="flex flex-col items-center gap-4 my-6">
          <Button
            onClick={() => setShowLinkedInModal(true)}
            color="secondary"
            className="w-full max-w-md flex items-center justify-center gap-3 py-6 border-2 border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.2283 0H1.77167C1.30179 0 0.851161 0.186657 0.518909 0.518909C0.186657 0.851161 0 1.30179 0 1.77167V22.2283C0 22.6982 0.186657 23.1488 0.518909 23.4811C0.851161 23.8133 1.30179 24 1.77167 24H22.2283C22.6982 24 23.1488 23.8133 23.4811 23.4811C23.8133 23.1488 24 22.6982 24 22.2283V1.77167C24 1.30179 23.8133 0.851161 23.4811 0.518909C23.1488 0.186657 22.6982 0 22.2283 0ZM7.15333 20.445H3.545V8.98333H7.15333V20.445ZM5.34667 7.395C4.93736 7.3927 4.53792 7.2692 4.19873 7.04009C3.85955 6.81098 3.59584 6.48653 3.44088 6.10769C3.28591 5.72885 3.24665 5.31259 3.32803 4.91145C3.40941 4.51032 3.6078 4.14228 3.89816 3.85378C4.18851 3.56529 4.55782 3.36927 4.95947 3.29046C5.36112 3.21165 5.77711 3.25359 6.15495 3.41099C6.53279 3.56838 6.85554 3.83417 7.08247 4.17481C7.30939 4.51546 7.43032 4.91569 7.43 5.325C7.43386 5.59903 7.38251 5.87104 7.27901 6.1248C7.17551 6.37857 7.02198 6.6089 6.82757 6.80207C6.63316 6.99523 6.40185 7.14728 6.14742 7.24915C5.893 7.35102 5.62067 7.40062 5.34667 7.395ZM20.4533 20.455H16.8467V14.1933C16.8467 12.3467 16.0617 11.7767 15.0483 11.7767C13.9783 11.7767 12.9283 12.5833 12.9283 14.24V20.455H9.32V8.99167H12.79V10.58H12.8367C13.185 9.875 14.405 8.67 16.2667 8.67C18.28 8.67 20.455 9.865 20.455 13.365L20.4533 20.455Z"/>
            </svg>
            Créer mon profil avec LinkedIn
          </Button>
          
          <div className="flex items-center gap-3 w-full max-w-md">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-sm text-gray-500">ou remplir manuellement</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>
        </div>

        {/* Indicateur de progression */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm text-[#475467] mb-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#5E6AD2] rounded-full"></div>
            <span>Complété</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <span>
            {progress}/{total} champ{progress > 1 ? 's' : ''} rempli
            {progress > 1 ? 's' : ''}
          </span>
        </div>

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
            {progress < total ? (
              <span className="text-orange-600">
                Il vous reste {total - progress} champ
                {total - progress > 1 ? 's' : ''} à remplir
              </span>
            ) : (
              <span className="text-green-600">Parfait ! Votre profil est complet</span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Form Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4 sm:gap-6 items-center w-full"
      >
        {/* Avatar Section */}
        <motion.div variants={fieldVariants} className="flex flex-col items-center">
          <motion.div
            className="relative w-24 h-24 rounded-full bg-gray-100 flex justify-center items-center shadow-[0_0_4px_4px_rgba(67, 255, 100, 0.85)] cursor-pointer group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAvatarUpload}
          >
            {profilePicture ? (
              <Avatar
                size="2xl"
                src={profilePicture}
                className="w-full h-full overflow-hidden"
              />
            ) : (
              <User className="w-12 h-12 text-gray-600 group-hover:text-[#5E6AD2] transition-colors" />
            )}

            {/* Overlay pour l'upload */}
            <motion.div
              className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            >
              {isUploading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <Plus className="w-6 h-6 text-white" />
              )}
            </motion.div>
          </motion.div>

          <motion.button
            onClick={handleAvatarUpload}
            className="mt-4 text-gray-700 text-center text-sm font-medium hover:text-[#5E6AD2] transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isUploading ? 'Upload en cours...' : t('addPhoto')}
          </motion.button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          <AvatarCropModal
            file={selectedFile}
            isOpen={isCropModalOpen}
            onClose={handleCropCancel}
            onCropComplete={handleCropComplete}
          />
        </motion.div>

        {/* Name Fields */}
        <motion.div variants={fieldVariants} className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full">
          <div className="flex flex-col gap-1.5 w-full sm:w-1/2">
            <Label className="text-gray-700 text-sm font-medium flex items-center gap-2" htmlFor="firstname">
              {t('firstname')}
              {validations.firstname && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 bg-green-500 rounded-full"
                />
              )}
            </Label>
            <Input
              onChange={setFirstname}
              onBlur={() => handleFieldTouch('firstname')}
              id="firstname"
              value={firstname}
              placeholder={t('firstnamePlaceholder')}
              className={`w-full text-gray-700 text-sm font-normal transition-all duration-200 focus:ring-2 focus:ring-[#5E6AD2]/20 ${
                errors.firstname
                  ? 'border-red-500 bg-red-50'
                  : validations.firstname
                    ? 'border-green-500 bg-green-50'
                    : ''
              }`}
              aria-describedby={errors.firstname ? 'firstname-error' : undefined}
              aria-invalid={!!errors.firstname}
            />
            {errors.firstname && touched.firstname && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                id="firstname-error"
                className="text-xs text-red-600 mt-1"
                role="alert"
              >
                {errors.firstname}
              </motion.p>
            )}
          </div>
          <div className="flex flex-col gap-1.5 w-full sm:w-1/2">
            <Label className="text-gray-700 text-sm font-medium flex items-center gap-2" htmlFor="lastname">
              {t('lastname')}
              {lastname.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 bg-green-500 rounded-full"
                />
              )}
            </Label>
            <Input
              id="lastname"
              value={lastname}
              onChange={setLastname}
              onBlur={() => handleFieldTouch('lastname')}
              placeholder={t('lastnamePlaceholder')}
              className={`w-full text-gray-700 text-sm font-normal transition-all duration-200 focus:ring-2 focus:ring-[#5E6AD2]/20 ${
                errors.lastname
                  ? 'border-red-500 bg-red-50'
                  : validations.lastname
                    ? 'border-green-500 bg-green-50'
                    : ''
              }`}
              aria-describedby={errors.lastname ? 'lastname-error' : undefined}
              aria-invalid={!!errors.lastname}
            />
            {errors.lastname && touched.lastname && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                id="lastname-error"
                className="text-xs text-red-600 mt-1"
                role="alert"
              >
                {errors.lastname}
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Gender and Date Fields */}
        <motion.div variants={fieldVariants} className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full">
          <div className="flex flex-col gap-1.5 w-full sm:w-1/2">
            <Label className="text-gray-700 text-sm font-medium flex items-center gap-2" htmlFor="gender">
              {t('gender')}
              {(gender.length > 0 || anotherGender.genderName.length > 0) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 bg-green-500 rounded-full"
                />
              )}
            </Label>
            <Dialog open={genderSelectState} onOpenChange={setGenderSelectState}>
              <Select
                selectedKey={gender}
                onSelectionChange={(key) => {
                  if (key === '__add_gender__') {
                    setGenderSelectState(true);
                    return;
                  }
                  setGender(key as string);
                }}
                placeholder={t('genderPlaceholder')}
                className="w-full transition-all duration-200 focus:ring-2 focus:ring-[#5E6AD2]/20"
              >
                <Select.Item id="man">Homme</Select.Item>
                <Select.Item id="woman">Femme</Select.Item>
                {anotherGender.genderName ? (
                  <Select.Item id={anotherGender.genderName}>{anotherGender.genderName}</Select.Item>
                ) : null}
                <Select.Item id="__add_gender__">Ajouter un genre</Select.Item>
              </Select>
              <ModalGender />
            </Dialog>
          </div>
          <div className="flex flex-col gap-1.5 w-full sm:w-1/2">
            <Label className="text-gray-700 text-sm font-medium flex items-center gap-2" htmlFor="birthday">
              {t('dateOfBirth')}
              {dateOfBirth.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 bg-green-500 rounded-full"
                />
              )}
            </Label>
            <DatePicker
              aria-label={t('dateOfBirth')}
              className={`w-full text-gray-700 text-sm font-normal transition-all duration-200 focus:ring-2 focus:ring-[#5E6AD2]/20 ${
                errors.dateOfBirth
                  ? 'border-red-500 bg-red-50'
                  : validations.dateOfBirth
                    ? 'border-green-500 bg-green-50'
                    : ''
              }`}
              value={dateOfBirth ? parseDate(dateOfBirth) : null}
              onChange={(value: DateValue | null) => {
                if (value) {
                  const dateStr = `${String(value.year).padStart(4, '0')}-${String(value.month).padStart(2, '0')}-${String(value.day).padStart(2, '0')}`;
                  setDateOfBirth(dateStr);
                  handleFieldTouch('dateOfBirth');
                } else {
                  setDateOfBirth('');
                }
              }}
            />
            {errors.dateOfBirth && touched.dateOfBirth && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                id="dateOfBirth-error"
                className="text-xs text-red-600 mt-1"
                role="alert"
              >
                {errors.dateOfBirth}
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Location Fields */}
        <motion.div variants={fieldVariants} className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full">
          <div className="flex flex-col gap-1.5 w-full sm:w-1/2">
            <Label className="text-gray-700 text-sm font-medium flex items-center gap-2" htmlFor="country">
              Country
              {!isEmptyObject(selectedCountry) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 bg-green-500 rounded-full"
                />
              )}
            </Label>
            <div className="flex flex-col gap-1.5 w-full">
              <InputSelect
                search={countrySearch}
                setSearch={setCountrySearch}
                data={countriesList}
                keyLabel={currentLanguage}
                messageNotFound="No country found."
                placeholder="Select a country"
                placeholderInput="Search a country"
                value={selectedCountry}
                setValue={setSelectedCountry}
                defaultKey="alpha2"
                isDisabled={false}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5 w-full sm:w-1/2">
            <Label className="text-gray-700 text-sm font-medium flex items-center gap-2" htmlFor="city">
              City
              {!isEmptyObject(selectedCity) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 bg-green-500 rounded-full"
                />
              )}
            </Label>
            <div className="flex flex-col gap-1.5 w-full">
              <InputSelect
                search={citySearch}
                setSearch={setCitySearch}
                data={citiesList}
                keyLabel={currentLanguage}
                defaultKey={'asciiName'}
                messageNotFound="No city found."
                placeholder="Select a city"
                placeholderInput="Search a city"
                value={selectedCity}
                setValue={setSelectedCity}
                isDisabled={isEmptyObject(selectedCountry)}
              />
            </div>
          </div>
        </motion.div>

        {/* Referral Code Input (only if no code from URL) */}
        {!getCookie('referredByCode') && (
          <motion.div variants={fieldVariants} className="flex flex-col gap-1.5 w-full">
            <Label className="text-gray-700 text-sm font-medium" htmlFor="referralCode">
              Code de parrainage (optionnel)
            </Label>
            <Input
              id="referralCode"
              placeholder="Entrez le code de votre parrain"
              value={referredByCode}
              onChange={setReferredByCode}
            />
            <p className="text-xs text-gray-500">
              Si quelqu'un vous a référé, entrez son code de parrainage pour obtenir un accès prioritaire.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default StepProfile;
