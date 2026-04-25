import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import { Building01, MarkerPin01, Tag01, UsersPlus, CheckCircle } from '@untitledui/icons';
import { Progress } from '@/components/application/progress-steps/progress-steps';
import type { ProgressFeaturedIconType } from '@/components/application/progress-steps/progress-types';
import { DialogTrigger, ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal';
import { CloseButton } from '@/components/base/buttons/close-button';
import { Button } from '@/components/base/buttons/button';
import { IdentityStep } from './steps/IdentityStep';
import { DetailsStep } from './steps/DetailsStep';
import { SectorsStep } from './steps/SectorsStep';
import { TeamStep } from './steps/TeamStep';
import { ReviewStep } from './steps/ReviewStep';
import { useCreateStartup } from '@/queries/startup';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface CreateStartupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateStartupModal = ({ open, onOpenChange }: CreateStartupModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const createStartup = useCreateStartup();
  const router = useRouter();

  const handleNext = (data: any) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);
    setCurrentStep(currentStep + 1);
  };

  const handleImport = (importedData: any) => {
    setFormData((prev: any) => ({ ...prev, ...importedData }));
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (data: any) => {
    const finalData = { ...formData, ...data };

    // Structure des données pour l'API
    const apiData = {
      name: finalData.name,
      tagline: finalData.tagline,
      description: finalData.description,
      website: finalData.website || undefined,
      linkedin: finalData.linkedin || undefined,
      foundedDate: finalData.foundedDate.toISOString().split('T')[0],
      countryCode: finalData.countryCode,
      city: finalData.city,
      categories: finalData.categories,
      logo: finalData.logo || undefined,
      coverImage: finalData.coverImage || undefined,
      invitations: finalData.members?.map((member: any) => ({
        profileId: member.profileId || undefined,
        email: member.email?.includes('<') ? member.email.split('<')[1].replace('>', '') : undefined,
        firstName: member.firstName || undefined,
        lastName: member.lastName || undefined,
        position: member.position,
        equity: member.equity,
        message: member.message || undefined,
      })).filter((inv: any) => inv.profileId || inv.email) || [],
    };

    createStartup.mutate(apiData, {
      onSuccess: (response) => {
        // Toast de succès
        toast.success('🎉 Startup créée avec succès !', {
          description: `${finalData.name} est maintenant en ligne sur OneFive`,
          duration: 5000,
        });
        
        // Fermer le modal
        onOpenChange(false);
        resetModal();
        
        // Rediriger vers la page de la startup créée
        if (response?.id) {
          setTimeout(() => {
            router.push(`/startup/${response.id}`);
          }, 500);
        }
      },
      onError: (error: any) => {
        console.error('Erreur lors de la création de la startup:', error);
        
        toast.error('❌ Erreur lors de la création', {
          description: error?.message || 'Une erreur est survenue. Veuillez réessayer.',
          duration: 5000,
          action: {
            label: 'Réessayer',
            onClick: () => handleSubmit(data),
          },
        });
      }
    });
  };

  const resetModal = () => {
    setCurrentStep(1);
    setFormData({});
    setShowCloseConfirmation(false);
  };

  const handleClose = () => {
    // Vérifier s'il y a des données saisies
    const hasData = Object.keys(formData).length > 0 || currentStep > 1;
    if (hasData) {
      setShowCloseConfirmation(true);
    } else {
      onOpenChange(false);
      resetModal();
    }
  };

  const confirmClose = () => {
    onOpenChange(false);
    resetModal();
  };

  const handleDataChange = React.useCallback((data: any) => {
    setFormData((prevData: any) => ({ ...prevData, ...data }));
  }, []);

  // Configuration des étapes avec icônes Untitle UI
  const steps: ProgressFeaturedIconType[] = [
    {
      title: 'Identité',
      description: 'Nom et description',
      status: currentStep === 1 ? 'current' : currentStep > 1 ? 'complete' : 'incomplete',
      icon: Building01,
      connector: true,
    },
    {
      title: 'Détails',
      description: 'Localisation et contacts',
      status: currentStep === 2 ? 'current' : currentStep > 2 ? 'complete' : 'incomplete',
      icon: MarkerPin01,
      connector: true,
    },
    {
      title: 'Secteurs',
      description: 'Catégories et médias',
      status: currentStep === 3 ? 'current' : currentStep > 3 ? 'complete' : 'incomplete',
      icon: Tag01,
      connector: true,
    },
    {
      title: 'Équipe',
      description: 'Co-fondateurs et parts',
      status: currentStep === 4 ? 'current' : currentStep > 4 ? 'complete' : 'incomplete',
      icon: UsersPlus,
      connector: true,
    },
    {
      title: 'Récapitulatif',
      description: 'Vérification finale',
      status: currentStep === 5 ? 'current' : currentStep > 5 ? 'complete' : 'incomplete',
      icon: CheckCircle,
      connector: false,
    },
  ];

  // Configuration des métadonnées des étapes (inspiré des patterns Untitled UI)
  const stepMetadata = {
    1: {
      title: 'Identité de votre startup',
      description: 'Donnez un nom et une description à votre startup'
    },
    2: {
      title: 'Détails et localisation',
      description: 'Ajoutez vos informations de contact et localisation'
    },
    3: {
      title: 'Secteurs et médias',
      description: 'Définissez vos secteurs d\'activité et ajoutez vos visuels'
    },
    4: {
      title: 'Équipe fondatrice',
      description: 'Ajoutez vos co-fondateurs et définissez les rôles'
    },
    5: {
      title: 'Récapitulatif',
      description: 'Vérifiez toutes les informations avant de créer votre startup'
    }
  };

  const currentMetadata = stepMetadata[currentStep as keyof typeof stepMetadata];

  return (
    <DialogTrigger isOpen={open} onOpenChange={onOpenChange}>
      <ModalOverlay>
        <Modal>
          <Dialog>
            <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl sm:max-w-4xl">
              <CloseButton onClick={handleClose} theme="light" size="lg" className="absolute top-3 right-3 z-20" />

              {/* Header */}
              <div className="flex flex-col gap-0.5 px-4 pt-5 sm:px-6 sm:pt-6">
                {/* Progress Header */}
                <div className="hidden md:block mb-4">
                  <Progress.IconsWithText
                    type="featured-icon"
                    items={steps}
                    size="sm"
                    orientation="horizontal"
                    className="justify-center"
                  />
                </div>
                <div className="md:hidden mb-4">
                  <Progress.IconsWithText
                    type="featured-icon"
                    items={steps}
                    size="sm"
                    orientation="vertical"
                    className="justify-start"
                  />
                </div>

                {/* Step Title & Description */}
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    {currentStep === 5 && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                    <h2 className="text-xl font-semibold text-primary">
                      {currentMetadata.title}
                    </h2>
                  </div>
                  <p className="text-sm text-tertiary">
                    {currentMetadata.description}
                  </p>
                </div>
              </div>

              <div className="h-5 w-full" />

              {/* Step Content */}
              <div className="px-4 sm:px-6 pb-6">
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="h-full"
                    >
                      <IdentityStep
                        onNext={handleNext}
                        data={formData}
                        onDataChange={handleDataChange}
                        onImport={handleImport}
                      />
                    </motion.div>
                  )}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="h-full"
                    >
                      <DetailsStep
                        onNext={handleNext}
                        onBack={handleBack}
                        data={formData}
                        onDataChange={handleDataChange}
                      />
                    </motion.div>
                  )}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="h-full"
                    >
                      <SectorsStep
                        onNext={handleNext}
                        onBack={handleBack}
                        data={formData}
                        onDataChange={handleDataChange}
                      />
                    </motion.div>
                  )}
                  {currentStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="h-full"
                    >
                      <TeamStep
                        onNext={handleNext}
                        onBack={handleBack}
                        data={formData}
                        onDataChange={handleDataChange}
                      />
                    </motion.div>
                  )}
                  {currentStep === 5 && (
                    <motion.div
                      key="step5"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="h-full"
                    >
                      <ReviewStep
                        onNext={handleSubmit}
                        onBack={handleBack}
                        onEdit={(step) => setCurrentStep(step)}
                        data={formData}
                        isSubmitting={createStartup.isPending}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>

      {/* Loading overlay */}
      {createStartup.isPending && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 text-[#5E6AD2] animate-spin" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Création en cours...
                </h3>
                <p className="text-sm text-gray-600">
                  Nous créons votre startup sur OneFive
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#5E6AD2] to-[#7C3AED] animate-pulse w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de fermeture */}
      {showCloseConfirmation && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Quitter la création ?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Vous avez des données saisies. Êtes-vous sûr de vouloir fermer cette modal ? Toutes vos données seront perdues.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                size="sm"
                color="secondary"
                onClick={() => setShowCloseConfirmation(false)}
              >
                Annuler
              </Button>
              <Button
                size="sm"
                color="primary"
                onClick={confirmClose}
              >
                Quitter
              </Button>
            </div>
          </div>
        </div>
      )}
    </DialogTrigger>
  );
};
