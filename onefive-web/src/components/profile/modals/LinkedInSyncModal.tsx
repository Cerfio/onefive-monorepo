'use client';

import { useState } from 'react';
import { Button } from '../../base/buttons/button';
import { CloseButton } from '../../base/buttons/close-button';
import { Modal, ModalOverlay, Dialog } from '../../application/modals/modal';
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components";
import { CheckCircle, Shield, Lock } from 'lucide-react';
import LinkedInSquareIcon from '@/components/shared/LinkedInSquareIcon';

interface LinkedInSyncModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const LinkedInSyncModal = ({ open, onOpenChange, onConfirm }: LinkedInSyncModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = () => {
    setIsLoading(true);
    onConfirm();
  };

  const syncBenefits = [
    {
      title: 'Expérience professionnelle',
      description: 'Mise à jour automatique de vos postes et responsabilités'
    },
    {
      title: 'Formation et diplômes',
      description: 'Synchronisation de votre parcours académique'
    },
    {
      title: 'Compétences validées',
      description: 'Import de vos compétences avec les recommandations'
    },
    {
      title: 'Photo de profil',
      description: 'Mise à jour de votre avatar professionnel'
    },
    {
      title: 'Informations de contact',
      description: 'Synchronisation de votre localisation et liens'
    }
  ];

  const privacyInfo = [
    'Nous ne stockons que les informations nécessaires à votre profil',
    'Vos données LinkedIn restent privées et sécurisées',
    'Vous pouvez révoquer l\'accès à tout moment dans vos paramètres',
    'Synchronisation uniquement avec votre consentement explicite'
  ];

  return (
    <AriaDialogTrigger isOpen={open} onOpenChange={onOpenChange}>
      <Button style={{ display: 'none' }}>Trigger</Button>
      <ModalOverlay isDismissable>
        <Modal>
          <Dialog>
            <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl transition-all sm:max-w-2xl">
              <CloseButton onClick={() => onOpenChange(false)} theme="light" size="lg" className="absolute top-3 right-3" />
              
              <div className="flex flex-col gap-0.5 px-4 pt-5 sm:px-6 sm:pt-6">
                <AriaHeading slot="title" className="text-md font-semibold text-primary flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg overflow-hidden">
                    <LinkedInSquareIcon size={32} />
                  </div>
                  Synchroniser avec LinkedIn
                </AriaHeading>
                <p className="text-sm text-tertiary">
                  Mettez à jour votre profil Onefive automatiquement avec vos informations LinkedIn professionnelles
                </p>
              </div>

              <div className="h-5 w-full" />
              
              <div className="flex flex-col gap-6 px-4 sm:px-6 max-h-[70vh] overflow-y-auto">
                {/* Avantages de la synchronisation */}
                <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 flex items-center justify-center bg-green-100 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-green-900">Ce qui sera synchronisé</h4>
                  </div>
                  <div className="space-y-4">
                    {syncBenefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <p className="font-medium text-green-900 text-sm">{benefit.title}</p>
                          <p className="text-sm text-green-700">{benefit.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Informations de confidentialité */}
                <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-lg">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-blue-900">Confidentialité et sécurité</h4>
                  </div>
                  <div className="space-y-3">
                    {privacyInfo.map((info, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-blue-800">{info}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Permissions requises */}
                <div className="p-6 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-amber-100 rounded-lg">
                      <Lock className="h-5 w-5 text-amber-600" />
                    </div>
                    <h4 className="font-semibold text-amber-900">Permissions LinkedIn</h4>
                  </div>
                  <p className="text-sm text-amber-800">
                    LinkedIn vous demandera d'autoriser l'accès à votre profil public et vos informations de base. 
                    Cette autorisation est révocable à tout moment depuis votre compte LinkedIn.
                  </p>
                  <div className="mt-3 p-3 bg-amber-100 rounded-lg">
                    <p className="text-xs text-amber-700 font-medium mb-1">
                      Please note:
                    </p>
                    <ul className="space-y-1">
                      <li className="text-xs text-amber-700 flex items-start gap-1.5">
                        <span className="mt-1 w-1 h-1 rounded-full bg-amber-600 shrink-0" />
                        After importing, your existing data in your resume will be overridden.
                      </li>
                      <li className="text-xs text-amber-700 flex items-start gap-1.5">
                        <span className="mt-1 w-1 h-1 rounded-full bg-amber-600 shrink-0" />
                        You can import up to 5 times per quarter (resets every 3 months).
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    color="secondary"
                    onClick={() => onOpenChange(false)}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    Annuler
                  </Button>
                  <Button
                    color="primary"
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? 'Redirection vers LinkedIn...' : 'Continuer avec LinkedIn'}
                  </Button>
                </div>
              </div>
              
              <div className="h-6 w-full" />
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </AriaDialogTrigger>
  );
}; 