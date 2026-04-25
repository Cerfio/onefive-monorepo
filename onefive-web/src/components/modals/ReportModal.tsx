'use client';

import { useState, type MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/base/dialog/alert-dialog';
import { Button } from '@/components/base/buttons/button';
import { IconNotification } from '@/components/application/notifications/notifications';
import { Check, Stars02 } from '@untitledui/icons';
import { createReport, type ReportResourceType, type ReportReason } from '@/queries/report';

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];

const Confetti = () => (
  <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 99999 }}>
    {[...Array(60)].map((_, i) => (
      <motion.div
        key={i}
        style={{
          position: 'absolute',
          borderRadius: '50%',
          backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)],
          left: `${Math.random() * 100}%`,
          top: '-20px',
          width: `${Math.random() * 10 + 6}px`,
          height: `${Math.random() * 10 + 6}px`,
        }}
        initial={{ y: -20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800), rotate: 0, scale: 0 }}
        animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800), rotate: 360, scale: 1 }}
        transition={{ duration: 4 + Math.random() * 3, ease: 'easeOut', delay: Math.random() }}
      />
    ))}
  </div>
);

const REASONS: { value: ReportReason; label: string }[] = [
  { value: 'SPAM', label: 'Spam' },
  { value: 'HARASSMENT', label: 'Harcèlement' },
  { value: 'INAPPROPRIATE_CONTENT', label: 'Contenu inapproprié' },
  { value: 'MISINFORMATION', label: 'Désinformation' },
  { value: 'IMPERSONATION', label: "Usurpation d'identité" },
  { value: 'OTHER', label: 'Autre' },
];

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceType: ReportResourceType;
  resourceId: string;
}

export function ReportModal({ isOpen, onClose, resourceType, resourceId }: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason>('INAPPROPRIATE_CONTENT');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const reset = () => {
    setReason('INAPPROPRIATE_CONTENT');
    setMessage('');
    setIsLoading(false);
    setShowSuccess(false);
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 500);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await createReport({
        resourceType,
        resourceId,
        reason,
        message: message.trim() || undefined,
      });

      setShowSuccess(true);
      setShowConfetti(true);

      setTimeout(() => {
        handleClose();
        toast.custom((t) => (
          <IconNotification
            title="Signalement envoyé !"
            description="Ton signalement a bien été transmis à l'équipe OneFive 🛡️"
            color="success"
            confirmLabel="Parfait"
            onClose={() => toast.dismiss(t)}
            onConfirm={() => toast.dismiss(t)}
          />
        ));
      }, 2000);

      setTimeout(() => setShowConfetti(false), 6000);
    } catch (error: unknown) {
      const errorMsg =
        error && typeof error === 'object' && 'response' in error
          ? await (error as any).response
              .json()
              .then((b: any) => b?.error?.message)
              .catch(() => null)
          : null;
      toast.custom((t) => (
        <IconNotification
          title="Erreur"
          description={errorMsg || "Erreur lors de l'envoi du signalement."}
          color="error"
          onClose={() => toast.dismiss(t)}
        />
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showConfetti && <Confetti />}
      <AlertDialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <AlertDialogContent>
          <AnimatePresence mode="wait">
            {!showSuccess ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle>Signaler ce contenu</AlertDialogTitle>
                  <AlertDialogDescription>
                    Ton signalement sera examiné par l&apos;équipe OneFive.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Raison *</label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value as ReportReason)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {REASONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message (optionnel)</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Décris le problème en quelques mots…"
                      maxLength={500}
                      rows={3}
                      className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500">{message.length}/500</p>
                  </div>
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isLoading}>Annuler</AlertDialogCancel>
                  <Button
                    color="primary-destructive"
                    size="sm"
                    isDisabled={isLoading}
                    isLoading={isLoading}
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault();
                      handleSubmit();
                    }}
                  >
                    {isLoading ? 'Envoi…' : 'Signaler'}
                  </Button>
                </AlertDialogFooter>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="py-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
                >
                  <Check className="h-8 w-8 text-green-600" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">Signalement envoyé !</h3>
                  <p className="mb-4 text-sm text-gray-600">
                    Merci, notre équipe va examiner ce contenu 🛡️
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
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
