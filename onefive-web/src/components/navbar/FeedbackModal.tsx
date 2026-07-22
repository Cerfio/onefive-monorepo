'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/base/buttons/button';
import { TextArea } from '@/components/base/textarea/textarea';
import { Label } from '@/components/base/label/label';
import { BadgeWithDot } from '@/components/base/badges/badges';
import { RadioButton, RadioGroup } from '@/components/base/radio-buttons/radio-buttons';
import { Dialog, Modal, ModalOverlay } from '@/components/application/modals/modal';
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from 'react-aria-components';
import { IconNotification } from '@/components/application/notifications/notifications';
import { 
  AlertCircle, 
  Zap, 
  MessageChatCircle, 
  ZapFast, 
  UploadCloud02, 
  Link03,
  Monitor02,
  Clock,
  User01,
  Send01,
  Check,
  Stars02,
  ImageUser,
  Trash01
} from '@untitledui/icons';
import { createFeedback, type FeedbackType as FeedbackTypeApi } from '@/queries/report';
import { useMe } from '@/hooks/useUser';
import posthog from 'posthog-js';

interface FeedbackModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type FeedbackType = 'bug' | 'suggestion' | 'comment' | 'functional';

interface FeedbackData {
  type: FeedbackType;
  message: string;
  screenshot?: File;
  url: string;
  browserInfo: string;
  userEmail?: string;
}

const _feedbackTypes = [
  {
    value: 'bug' as const,
    title: 'Bug',
    icon: AlertCircle,
    description: 'Signaler un dysfonctionnement',
    secondaryTitle: 'Problème technique'
  },
  {
    value: 'suggestion' as const,
    title: 'Suggestion',
    icon: Zap,
    description: 'Proposer une amélioration',
    secondaryTitle: 'Idée d\'amélioration'
  },
  {
    value: 'comment' as const,
    title: 'Commentaire',
    icon: MessageChatCircle,
    description: 'Partager votre avis',
    secondaryTitle: 'Retour général'
  },
  {
    value: 'functional' as const,
    title: 'Problème fonctionnel',
    icon: ZapFast,
    description: 'Signaler un problème d\'utilisation',
    secondaryTitle: 'Problème d\'usage'
  }
];

// Composant Confettis ronds
const Confetti = () => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
  
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 99999 }}>
      {[...Array(60)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            borderRadius: '50%',
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            left: `${Math.random() * 100}%`,
            top: '-20px',
            width: `${Math.random() * 10 + 6}px`,
            height: `${Math.random() * 10 + 6}px`
          }}
          initial={{ 
            y: -20,
            x: Math.random() * window.innerWidth,
            rotate: 0,
            scale: 0
          }}
          animate={{ 
            y: window.innerHeight + 20,
            x: Math.random() * window.innerWidth,
            rotate: 360,
            scale: 1
          }}
          transition={{ 
            duration: 4 + Math.random() * 3,
            ease: "easeOut",
            delay: Math.random() * 1
          }}
        />
      ))}
    </div>
  );
};

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onOpenChange }) => {
  const { data: user } = useMe();
  const [_step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    type: 'bug',
    message: '',
    url: '',
    browserInfo: '',
    userEmail: ''
  });

  // Auto-fill URL and browser info on mount
  useEffect(() => {
    if (isOpen) {
      const currentUrl = window.location.href;
      const browserInfo = `${navigator.userAgent} | ${navigator.language} | ${screen.width}x${screen.height}`;
      
      setFeedbackData(prev => ({
        ...prev,
        url: currentUrl,
        browserInfo: browserInfo
      }));
    }
  }, [isOpen]);

  const resetModal = () => {
    setStep(1);
    setIsSubmitting(false);
    setShowSuccess(false);
    // Ne pas arrêter les confettis immédiatement
    setFeedbackData({
      type: 'bug',
      message: '',
      url: '',
      browserInfo: '',
      userEmail: ''
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    // Délai plus long pour laisser les confettis finir
    setTimeout(resetModal, 1000);
  };

  const _stopConfetti = () => {
    setShowConfetti(false);
  };

  const handleSubmit = async () => {
    if (!feedbackData.message.trim()) {
      toast.custom((t) => (
        <IconNotification
          title="Champ requis"
          description="Veuillez saisir votre retour avant d'envoyer le feedback."
          color="error"
          onClose={() => toast.dismiss(t)}
        />
      ));
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createFeedback({
        type: feedbackData.type.toUpperCase() as FeedbackTypeApi,
        message: feedbackData.message,
        url: feedbackData.url || undefined,
        browserInfo: feedbackData.browserInfo || undefined,
        screenshot: feedbackData.screenshot,
      });
      
      posthog.capture('feedback_submitted');
      setShowSuccess(true);
      setShowConfetti(true);
      
      // Fermer la modale après succès mais garder les confettis
      setTimeout(() => {
        handleClose();
        toast.custom((t) => (
          <IconNotification
            title="Feedback envoyé avec succès !"
            description="Ton retour a bien été envoyé, l'équipe Onefive te lit 🧠"
            color="success"
            confirmLabel="Parfait"
            onClose={() => toast.dismiss(t)}
            onConfirm={() => toast.dismiss(t)}
          />
        ));
      }, 2000);
      
      // Arrêter les confettis après 6 secondes (plus longtemps)
      setTimeout(() => {
        setShowConfetti(false);
      }, 6000);
      
    } catch {
      toast.custom((t) => (
        <IconNotification
          title="Erreur d'envoi"
          description="Une erreur s'est produite lors de l'envoi du feedback. Veuillez réessayer."
          color="error"
          confirmLabel="Réessayer"
          onClose={() => toast.dismiss(t)}
          onConfirm={() => {
            toast.dismiss(t);
            handleSubmit();
          }}
        />
      ));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.custom((t) => (
          <IconNotification
            title="Fichier trop volumineux"
            description="La taille du fichier doit être inférieure à 5MB."
            color="error"
            onClose={() => toast.dismiss(t)}
          />
        ));
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.custom((t) => (
          <IconNotification
            title="Format non supporté"
            description="Seules les images sont acceptées (PNG, JPG, GIF…)."
            color="error"
            onClose={() => toast.dismiss(t)}
          />
        ));
        return;
      }
      setFeedbackData(prev => ({ ...prev, screenshot: file }));
    }
  };

  const removeScreenshot = () => {
    setFeedbackData(prev => ({ ...prev, screenshot: undefined }));
  };

  return (
    <>
      {showConfetti && <Confetti />}
      <AriaDialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalOverlay isDismissable>
          <Modal>
            <Dialog>
              <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-primary shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex flex-col gap-4 px-6 pt-6">
                  <div className="flex items-center gap-3">
                    <MessageChatCircle className="h-5 w-5 text-[#5E6AD2]" />
                    <div>
                      <AriaHeading slot="title" className="text-lg font-semibold text-primary">
                        Feedback
                      </AriaHeading>
                      <p className="text-sm text-tertiary">
                        Aidez-nous à améliorer Onefive
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <AnimatePresence mode="wait">
                    {!showSuccess ? (
                      <motion.div
                        key="feedback-form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                      >
                        {/* Type de feedback */}
                        <div className="space-y-4">
                          <Label className="text-sm font-medium">Type de retour *</Label>
                          <RadioGroup 
                            aria-label="Type de feedback" 
                            value={feedbackData.type}
                            onChange={(value: string) => setFeedbackData(prev => ({ ...prev, type: value as FeedbackType }))}
                          >
                            <RadioButton 
                              label="Bug" 
                              hint="Signaler un dysfonctionnement ou un problème technique." 
                              value="bug" 
                            />
                            <RadioButton 
                              label="Suggestion" 
                              hint="Proposer une amélioration ou une nouvelle fonctionnalité." 
                              value="suggestion" 
                            />
                            <RadioButton 
                              label="Commentaire" 
                              hint="Partager votre avis général sur Onefive." 
                              value="comment" 
                            />
                            <RadioButton 
                              label="Problème fonctionnel" 
                              hint="Signaler un problème d'utilisation ou d'ergonomie." 
                              value="functional" 
                            />
                          </RadioGroup>
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                          <TextArea
                            label="Votre retour *"
                            placeholder="Décris ton retour en quelques lignes…"
                            value={feedbackData.message}
                            onChange={(e) => setFeedbackData(prev => ({ ...prev, message: e.target.value }))}
                            rows={4}
                            isRequired
                            hint={`${feedbackData.message.length}/500 caractères`}
                          />
                        </div>

                        {/* Options */}
                        <div className="space-y-4">
                          <Label className="text-sm font-medium">Options (facultatives)</Label>
                          
                          {/* Upload screenshot */}
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <UploadCloud02 className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-700">Capture d'écran</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {feedbackData.screenshot && (
                                <BadgeWithDot type="pill-color" color="gray" size="sm">
                                  {feedbackData.screenshot.name}
                                </BadgeWithDot>
                              )}
                              <Button
                                color="secondary"
                                size="sm"
                                onClick={() => document.getElementById('screenshot-upload')?.click()}
                              >
                                {feedbackData.screenshot ? 'Changer' : 'Ajouter'}
                              </Button>
                              <input
                                id="screenshot-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                            </div>
                          </div>

                          {feedbackData.screenshot && (
                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <ImageUser className="h-5 w-5 text-blue-600" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-blue-900 truncate">
                                  {feedbackData.screenshot.name}
                                </p>
                                <p className="text-xs text-blue-600">
                                  {(feedbackData.screenshot.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                              <Button
                                color="tertiary"
                                size="sm"
                                onClick={removeScreenshot}
                                iconLeading={<Trash01 data-icon />}
                              />
                            </div>
                          )}

                          {/* Informations automatiques */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Link03 className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-700">URL actuelle</span>
                              </div>
                              <BadgeWithDot type="pill-color" color="gray" size="sm">
                                {feedbackData.url}
                              </BadgeWithDot>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Monitor02 className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-700">Navigateur</span>
                              </div>
                              <BadgeWithDot type="pill-color" color="gray" size="sm">
                                Auto-détecté
                              </BadgeWithDot>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-700">Horodatage</span>
                              </div>
                              <BadgeWithDot type="pill-color" color="gray" size="sm">
                                {new Date().toLocaleString('fr-FR')}
                              </BadgeWithDot>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <User01 className="h-4 w-4 text-blue-600" />
                                <span className="text-sm text-blue-800">Identité</span>
                              </div>
                              <BadgeWithDot type="pill-color" color="brand" size="sm">
                                {user ? `${user.firstName} ${user.lastName}` : 'Vous'}
                              </BadgeWithDot>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4">
                          <Button
                            color="secondary"
                            size="md"
                            onClick={handleClose}
                            isDisabled={isSubmitting}
                          >
                            Annuler
                          </Button>
                          <Button
                            color="primary"
                            size="md"
                            onClick={handleSubmit}
                            isDisabled={isSubmitting || !feedbackData.message.trim()}
                            isLoading={isSubmitting}
                            iconLeading={<Send01 data-icon />}
                          >
                            {isSubmitting ? 'Envoi...' : 'Envoyer'}
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        style={{ textAlign: 'center', paddingTop: '2rem', paddingBottom: '2rem' }}
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                          style={{ marginBottom: '1rem' }}
                        >
                          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <Check className="h-8 w-8 text-green-600" />
                          </div>
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Merci pour ton retour !
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Ton message a bien été envoyé, l'équipe Onefive te lit 🧠
                          </p>
                          
                          <div className="flex justify-center gap-2">
                            <Stars02 className="h-5 w-5 text-yellow-500" />
                            <Stars02 className="h-4 w-4 text-blue-500" />
                            <Stars02 className="h-6 w-6 text-purple-500" />
                            <Stars02 className="h-4 w-4 text-green-500" />
                            <Stars02 className="h-5 w-5 text-red-500" />
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </Dialog>
          </Modal>
        </ModalOverlay>
      </AriaDialogTrigger>
    </>
  );
}; 