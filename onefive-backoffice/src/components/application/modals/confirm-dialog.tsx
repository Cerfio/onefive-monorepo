'use client';

import { type ReactNode, useCallback, useRef, useState } from 'react';
import { Dialog, Modal, ModalOverlay } from './modal';
import { Button } from '@/components/base/buttons/button';
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icon';
import { AlertTriangle } from '@untitledui/icons';

type ConfirmDialogOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
};

type ConfirmDialogState = ConfirmDialogOptions & {
  resolve: (confirmed: boolean) => void;
};

let globalOpen: ((opts: ConfirmDialogOptions) => Promise<boolean>) | null = null;

export function useConfirm() {
  return useCallback((opts: ConfirmDialogOptions) => {
    if (!globalOpen) return Promise.resolve(false);
    return globalOpen(opts);
  }, []);
}

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmDialogState | null>(null);
  const resolveRef = useRef<((v: boolean) => void) | null>(null);

  globalOpen = useCallback((opts: ConfirmDialogOptions) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setState({ ...opts, resolve });
    });
  }, []);

  const close = (result: boolean) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setState(null);
  };

  const iconColor =
    state?.variant === 'danger' ? 'error' : state?.variant === 'warning' ? 'warning' : 'brand';
  const confirmColor =
    state?.variant === 'danger' ? 'primary-destructive' : 'primary';

  return (
    <>
      {children}
      {state && (
        <ModalOverlay isOpen onOpenChange={(open) => !open && close(false)}>
          <Modal className="max-w-md">
            <Dialog>
              <div className="w-full rounded-xl bg-primary p-6 shadow-xl ring-1 ring-secondary">
                <div className="mb-4 flex items-start gap-4">
                  <FeaturedIcon
                    color={iconColor}
                    theme="light"
                    icon={AlertTriangle}
                    size="md"
                  />
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-primary">{state.title}</h3>
                    {state.description && (
                      <p className="mt-1 text-sm text-tertiary">{state.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button color="secondary" onClick={() => close(false)}>
                    {state.cancelLabel ?? 'Annuler'}
                  </Button>
                  <Button color={confirmColor} onClick={() => close(true)}>
                    {state.confirmLabel ?? 'Confirmer'}
                  </Button>
                </div>
              </div>
            </Dialog>
          </Modal>
        </ModalOverlay>
      )}
    </>
  );
}
