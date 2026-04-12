'use client';

import { useOnboardingContext } from '../OnboardingContext';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ProfileRoleSelector } from '@/components/profile/ProfileRoleSelector';
import { ProfileRoleBadge } from '@/components/profile/ProfileRoleBadge';
import { ProfileRole, type GenderPreference } from '@/sharing-enum/profile';

const StepRole = () => {
  const t = useTranslations('onboarding.roles');
  const {
    mainRole,
    setMainRole,
    secondaryRole,
    setSecondaryRole,
    setButtonDisabled,
    anotherGender,
  } = useOnboardingContext();

  // Convertir addressGender en GenderPreference pour les badges
  const genderPreference = useMemo((): GenderPreference => {
    switch (anotherGender.addressGender) {
      case 'woman':
        return 'FEMALE';
      case 'man':
        return 'MALE';
      default:
        return 'OTHER';
    }
  }, [anotherGender.addressGender]);

  const [selectedRoles, setSelectedRoles] = useState<ProfileRole[]>([]);

  // Synchroniser selectedRoles avec mainRole et secondaryRole
  useEffect(() => {
    const roles: ProfileRole[] = [];
    if (mainRole) roles.push(mainRole);
    if (secondaryRole && secondaryRole !== mainRole) roles.push(secondaryRole);
    setSelectedRoles(roles);
  }, [mainRole, secondaryRole]);

  // Mettre à jour mainRole et secondaryRole quand selectedRoles change
  const handleRolesChange = (roles: ProfileRole[]) => {
    setSelectedRoles(roles);
    
    if (roles.length === 0) {
      setMainRole(null);
      setSecondaryRole(null);
    } else if (roles.length === 1) {
      setMainRole(roles[0]);
      setSecondaryRole(null);
    } else {
      setMainRole(roles[0]);
      setSecondaryRole(roles[1]);
    }
  };

  // Activer le bouton si au moins un rôle principal est sélectionné
  useEffect(() => {
    if (mainRole) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [mainRole, setButtonDisabled]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
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
          {t('title')}
        </h2>
        <p className="text-sm sm:text-base text-[#475467] mb-4 px-2">
          {t('description')}
        </p>

        {/* Indicateur de progression */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm text-[#475467] mb-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#5E6AD2] rounded-full"></div>
            <span>{t('selected')}</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <span>
            {selectedRoles.length}/2 {t('rolesSelected')}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto mb-4 sm:mb-6 px-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full transition-all duration-300 ${
                mainRole ? 'bg-green-500' : 'bg-[#5E6AD2]'
              }`}
              initial={{ width: 0 }}
              animate={{
                width: mainRole
                  ? secondaryRole
                    ? '100%'
                    : '50%'
                  : '0%',
              }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {!mainRole ? (
              <span className="text-gray-500">{t('selectMainRole')}</span>
            ) : !secondaryRole ? (
              <span className="text-orange-600">{t('optionalSecondaryRole')}</span>
            ) : (
              <span className="text-green-600">{t('rolesComplete')}</span>
            )}
          </div>
        </div>

        {/* Badges des rôles sélectionnés */}
        {(mainRole || secondaryRole) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-6"
          >
            {mainRole && (
              <div className="flex flex-col items-center gap-1">
                <ProfileRoleBadge role={mainRole} variant="default" genderPreference={genderPreference} />
                <span className="text-xs font-medium text-gray-600">{t('mainRoleLabel')}</span>
              </div>
            )}
            {secondaryRole && (
              <div className="flex flex-col items-center gap-1">
                <ProfileRoleBadge role={secondaryRole} variant="default" genderPreference={genderPreference} />
                <span className="text-xs font-medium text-gray-500">{t('secondaryRoleLabel')}</span>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Form Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center"
      >
        <motion.div variants={fieldVariants} className="w-full">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {t('selectRolesTitle')}
            </h3>
            <p className="text-sm text-gray-500">
              {t('selectRolesDescription')}
            </p>
          </div>

          <ProfileRoleSelector
            value={selectedRoles}
            onChange={handleRolesChange}
            max={2}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StepRole;
