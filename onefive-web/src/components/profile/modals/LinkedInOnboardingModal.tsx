'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../../base/buttons/button';
import { CloseButton } from '../../base/buttons/close-button';
import { Modal, ModalOverlay, Dialog } from '../../application/modals/modal';
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from 'react-aria-components';
import { AlertCircle, Loader2, ExternalLink, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/utils/kyInstance';
import { LinkedInOnboardingData } from '@/features/auth/Onboarding/OnboardingContext';

interface LinkedInOnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (data: LinkedInOnboardingData) => void;
}

type Step = 'input' | 'loading';

export const LinkedInOnboardingModal = ({ 
  open, 
  onOpenChange, 
  onSuccess
}: LinkedInOnboardingModalProps) => {
  const [step, setStep] = useState<Step>('input');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);

  // Réinitialiser quand le modal s'ouvre
  useEffect(() => {
    if (open) {
      setStep('input');
      setLinkedinUrl('');
      setUrlError(null);
    }
  }, [open]);

  // Valider l'URL LinkedIn
  const validateLinkedInUrl = (url: string): boolean => {
    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/;
    return linkedinRegex.test(url.trim());
  };

  // Mutation pour récupérer les données LinkedIn
  const fetchLinkedInData = useMutation({
    mutationFn: async (url: string) => {
      const response = await api.post(
        'linkedin-sync/onboarding/complete',
        { 
          json: { linkedinUrl: url }, 
          timeout: 150000, // 2 minutes 30 secondes pour le scraping LinkedIn
        }
      );
      return response.json() as Promise<{ success: boolean; data: LinkedInOnboardingData }>;
    },
    onSuccess: (data) => {
      toast.success('Données LinkedIn récupérées avec succès !');
      onSuccess(data.data);
      onOpenChange(false);
    },
    onError: (error: any) => {
      setStep('input');
      const errorMessage = error?.response?.status === 429
        ? 'Vous devez attendre 24h entre chaque synchronisation'
        : error?.response?.status === 400
        ? 'URL invalide ou profil non accessible. Vérifiez que votre profil LinkedIn est public.'
        : 'Erreur lors de la récupération du profil LinkedIn. Vérifiez l\'URL.';
      toast.error(errorMessage);
      setUrlError(errorMessage);
    },
  });

  const handleStartSync = () => {
    const trimmedUrl = linkedinUrl.trim();
    
    if (!trimmedUrl) {
      setUrlError('Veuillez entrer votre URL LinkedIn');
      return;
    }
    
    if (!validateLinkedInUrl(trimmedUrl)) {
      setUrlError('URL invalide. Format attendu : https://www.linkedin.com/in/votre-profil');
      return;
    }
    
    setUrlError(null);
    setStep('loading');
    fetchLinkedInData.mutate(trimmedUrl);
  };

  return (
    <AriaDialogTrigger isOpen={open} onOpenChange={onOpenChange}>
      <Button style={{ display: 'none' }}>Trigger</Button>
      <ModalOverlay isDismissable={step !== 'loading'}>
        <Modal className="max-w-lg">
          <Dialog>
            <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl transition-all flex flex-col max-h-[90vh]">
              <CloseButton 
                onClick={() => onOpenChange(false)} 
                theme="light" 
                size="lg" 
                className="absolute top-3 right-3 z-10"
                isDisabled={step === 'loading'}
              />

              {/* Header */}
              <div className="flex flex-col gap-0.5 px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
                <AriaHeading slot="title" className="text-lg font-semibold text-primary flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-xl">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M22.2283 0H1.77167C1.30179 0 0.851161 0.186657 0.518909 0.518909C0.186657 0.851161 0 1.30179 0 1.77167V22.2283C0 22.6982 0.186657 23.1488 0.518909 23.4811C0.851161 23.8133 1.30179 24 1.77167 24H22.2283C22.6982 24 23.1488 23.8133 23.4811 23.4811C23.8133 23.1488 24 22.6982 24 22.2283V1.77167C24 1.30179 23.8133 0.851161 23.4811 0.518909C23.1488 0.186657 22.6982 0 22.2283 0ZM7.15333 20.445H3.545V8.98333H7.15333V20.445ZM5.34667 7.395C4.93736 7.3927 4.53792 7.2692 4.19873 7.04009C3.85955 6.81098 3.59584 6.48653 3.44088 6.10769C3.28591 5.72885 3.24665 5.31259 3.32803 4.91145C3.40941 4.51032 3.6078 4.14228 3.89816 3.85378C4.18851 3.56529 4.55782 3.36927 4.95947 3.29046C5.36112 3.21165 5.77711 3.25359 6.15495 3.41099C6.53279 3.56838 6.85554 3.83417 7.08247 4.17481C7.30939 4.51546 7.43032 4.91569 7.43 5.325C7.43386 5.59903 7.38251 5.87104 7.27901 6.1248C7.17551 6.37857 7.02198 6.6089 6.82757 6.80207C6.63316 6.99523 6.40185 7.14728 6.14742 7.24915C5.893 7.35102 5.62067 7.40062 5.34667 7.395ZM20.4533 20.455H16.8467V14.1933C16.8467 12.3467 16.0617 11.7767 15.0483 11.7767C13.9783 11.7767 12.9283 12.5833 12.9283 14.24V20.455H9.32V8.99167H12.79V10.58H12.8367C13.185 9.875 14.405 8.67 16.2667 8.67C18.28 8.67 20.455 9.865 20.455 13.365L20.4533 20.455Z" fill="#0A66C2"/>
                    </svg>
                  </div>
                  {step === 'input' && 'Créer mon profil avec LinkedIn'}
                  {step === 'loading' && 'Récupération en cours...'}
                </AriaHeading>
                <p className="text-sm text-tertiary">
                  {step === 'input' && 'Entrez votre URL LinkedIn pour importer automatiquement vos informations'}
                  {step === 'loading' && 'Nous analysons votre profil LinkedIn, veuillez patienter...'}
                </p>
              </div>

              {/* Content */}
              <div className="px-6 py-4 overflow-y-auto flex-1 min-h-0">
                {/* Step 1: URL Input */}
                {step === 'input' && (
                  <div className="space-y-6 py-4">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                          <path d="M22.2283 0H1.77167C1.30179 0 0.851161 0.186657 0.518909 0.518909C0.186657 0.851161 0 1.30179 0 1.77167V22.2283C0 22.6982 0.186657 23.1488 0.518909 23.4811C0.851161 23.8133 1.30179 24 1.77167 24H22.2283C22.6982 24 23.1488 23.8133 23.4811 23.4811C23.8133 23.1488 24 22.6982 24 22.2283V1.77167C24 1.30179 23.8133 0.851161 23.4811 0.518909C23.1488 0.186657 22.6982 0 22.2283 0ZM7.15333 20.445H3.545V8.98333H7.15333V20.445ZM5.34667 7.395C4.93736 7.3927 4.53792 7.2692 4.19873 7.04009C3.85955 6.81098 3.59584 6.48653 3.44088 6.10769C3.28591 5.72885 3.24665 5.31259 3.32803 4.91145C3.40941 4.51032 3.6078 4.14228 3.89816 3.85378C4.18851 3.56529 4.55782 3.36927 4.95947 3.29046C5.36112 3.21165 5.77711 3.25359 6.15495 3.41099C6.53279 3.56838 6.85554 3.83417 7.08247 4.17481C7.30939 4.51546 7.43032 4.91569 7.43 5.325C7.43386 5.59903 7.38251 5.87104 7.27901 6.1248C7.17551 6.37857 7.02198 6.6089 6.82757 6.80207C6.63316 6.99523 6.40185 7.14728 6.14742 7.24915C5.893 7.35102 5.62067 7.40062 5.34667 7.395ZM20.4533 20.455H16.8467V14.1933C16.8467 12.3467 16.0617 11.7767 15.0483 11.7767C13.9783 11.7767 12.9283 12.5833 12.9283 14.24V20.455H9.32V8.99167H12.79V10.58H12.8367C13.185 9.875 14.405 8.67 16.2667 8.67C18.28 8.67 20.455 9.865 20.455 13.365L20.4533 20.455Z" fill="#0A66C2"/>
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Importez vos données LinkedIn
                      </h3>
                      <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                        Entrez l'URL de votre profil LinkedIn pour pré-remplir automatiquement votre nom, votre localisation et votre photo de profil.
                      </p>
                    </div>

                    {/* Input URL LinkedIn */}
                    <div className="space-y-2">
                      <label htmlFor="linkedin-url" className="block text-sm font-medium text-gray-700">
                        URL de votre profil LinkedIn
                      </label>
                      <div className="relative">
                        <input
                          id="linkedin-url"
                          type="url"
                          value={linkedinUrl}
                          onChange={(e) => {
                            setLinkedinUrl(e.target.value);
                            setUrlError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleStartSync();
                            }
                          }}
                          placeholder="https://www.linkedin.com/in/votre-profil"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                            urlError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                        <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                      {urlError && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {urlError}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        💡 Trouvez votre URL sur LinkedIn → Votre profil → Copiez l'URL de la barre d'adresse
                      </p>
                    </div>

                    <Button
                      color="primary"
                      size="md"
                      onClick={handleStartSync}
                      className="w-full bg-[#0A66C2] hover:bg-[#004182]"
                      isDisabled={!linkedinUrl.trim() || fetchLinkedInData.isPending}
                    >
                      Récupérer mes données
                    </Button>

                    <div className="space-y-2 text-sm text-gray-500">
                      <p className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Vos données restent privées et sécurisées
                      </p>
                      <p className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Nom, localisation et photo pré-remplis pour vous
                      </p>
                      <p className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Aucune publication sur votre compte LinkedIn
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 2: Loading */}
                {step === 'loading' && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-600">Récupération de vos données LinkedIn...</p>
                    <p className="text-sm text-gray-400 mt-2">Cela peut prendre jusqu'à 2 minutes</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end items-center shrink-0">
                <Button
                  color="secondary"
                  onClick={() => onOpenChange(false)}
                  disabled={step === 'loading'}
                >
                  Annuler
                </Button>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </AriaDialogTrigger>
  );
};

