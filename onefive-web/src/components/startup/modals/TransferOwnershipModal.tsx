'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/base/buttons/button';
import { CloseButton } from '@/components/base/buttons/close-button';
import { Modal, ModalOverlay, Dialog } from '@/components/application/modals/modal';
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from 'react-aria-components';
import { Avatar } from '@/components/base/avatar/avatar';
import { ArrowRightLeft, Loader2, Check } from 'lucide-react';
import { resolveAvatarUrl } from '@/utils/avatar';
import { useTransferOwnership } from '@/queries/startup';

interface Candidate {
  id: string;
  memberId?: string;
  name: string;
  position?: string;
  role?: string;
  avatar?: string | null;
}

interface TransferOwnershipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startupId: string;
  startupName: string;
  candidates: Candidate[];
  onSuccess: () => void;
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

export const TransferOwnershipModal: React.FC<TransferOwnershipModalProps> = ({
  open,
  onOpenChange,
  startupId,
  startupName,
  candidates,
  onSuccess,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const transferMutation = useTransferOwnership();

  useEffect(() => {
    if (open) setSelectedId(null);
  }, [open]);

  const handleTransfer = async () => {
    if (!selectedId) return;
    try {
      await transferMutation.mutateAsync({
        startupId,
        newOwnerMemberId: selectedId,
      });
      onSuccess();
    } catch {
      // error handled by mutation
    }
  };

  return (
    <AriaDialogTrigger isOpen={open} onOpenChange={onOpenChange}>
      <button type="button" style={{ display: 'none' }}>Trigger</button>
      <ModalOverlay isDismissable>
        <Modal className="max-w-md">
          <Dialog>
            <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl">
              <CloseButton onClick={() => onOpenChange(false)} theme="light" size="lg" className="absolute right-3 top-3 z-10" />

              <div className="px-6 pt-6 pb-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <ArrowRightLeft className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <AriaHeading slot="title" className="text-base font-semibold text-primary">
                      Transférer la propriété
                    </AriaHeading>
                    <p className="mt-1 text-sm text-tertiary">
                      Sélectionnez le nouveau créateur de <strong>{startupName}</strong>. Vous deviendrez Admin.
                    </p>
                  </div>
                </div>

                <div className="mt-5 max-h-60 overflow-y-auto space-y-1">
                  {candidates.length === 0 ? (
                    <p className="text-sm text-tertiary text-center py-6">
                      Aucun membre éligible. Ajoutez un membre d'abord.
                    </p>
                  ) : (
                    candidates.map((c) => {
                      const avatarUrl = resolveAvatarUrl(c.avatar);
                      const isSelected = selectedId === (c.memberId || c.id);
                      return (
                        <button
                          key={c.id}
                          onClick={() => setSelectedId(c.memberId || c.id)}
                          className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                            isSelected ? 'bg-violet-50 ring-2 ring-violet-300' : 'hover:bg-gray-50'
                          }`}
                        >
                          <Avatar
                            size="sm"
                            src={avatarUrl}
                            alt={c.name}
                            initials={getInitials(c.name)}
                            className="shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-primary truncate block">{c.name}</span>
                            {c.position && <span className="text-xs text-tertiary">{c.position}</span>}
                          </div>
                          {isSelected && (
                            <Check className="h-5 w-5 text-violet-600 shrink-0" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
                <Button color="secondary" size="sm" onClick={() => onOpenChange(false)}>
                  Annuler
                </Button>
                <Button
                  color="primary"
                  size="sm"
                  onClick={handleTransfer}
                  isDisabled={!selectedId || transferMutation.isPending}
                >
                  {transferMutation.isPending ? (
                    <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Transfert...</>
                  ) : (
                    'Transférer'
                  )}
                </Button>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </AriaDialogTrigger>
  );
};
