'use client';

import React from 'react';
import { Button } from '@/components/base/buttons/button';
import { CloseButton } from '@/components/base/buttons/close-button';
import { Modal, ModalOverlay, Dialog } from '@/components/application/modals/modal';
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from 'react-aria-components';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  variant?: 'danger' | 'warning' | 'default';
  isLoading?: boolean;
  onConfirm: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  variant = 'default',
  isLoading = false,
  onConfirm,
}) => {
  const variantColors =
    variant === 'danger'
      ? { icon: 'bg-red-100 text-red-600', button: 'bg-red-600 hover:bg-red-700 text-white' }
      : variant === 'warning'
        ? { icon: 'bg-amber-100 text-amber-600', button: 'bg-amber-600 hover:bg-amber-700 text-white' }
        : { icon: 'bg-gray-100 text-gray-600', button: 'bg-gray-900 hover:bg-gray-800 text-white' };

  return (
    <AriaDialogTrigger isOpen={open} onOpenChange={onOpenChange}>
      <button type="button" style={{ display: 'none' }}>
        Trigger
      </button>
      <ModalOverlay isDismissable>
        <Modal className="max-w-md">
          <Dialog>
            <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl">
              <CloseButton
                onClick={() => onOpenChange(false)}
                theme="light"
                size="lg"
                className="absolute right-3 top-3 z-10"
              />

              <div className="px-6 pt-6 pb-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${variantColors.icon}`}
                  >
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <AriaHeading slot="title" className="text-base font-semibold text-primary">
                      {title}
                    </AriaHeading>
                    <p className="mt-2 text-sm text-tertiary leading-relaxed">{description}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
                <Button color="secondary" size="sm" onClick={() => onOpenChange(false)}>
                  Annuler
                </Button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${variantColors.button}`}
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {confirmLabel}
                </button>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </AriaDialogTrigger>
  );
};
