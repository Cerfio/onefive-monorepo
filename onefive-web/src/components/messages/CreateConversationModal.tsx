'use client';

import { useState, useEffect, useCallback } from 'react';
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from 'react-aria-components';
import { Dialog, Modal, ModalOverlay } from '@/components/application/modals/modal';
import { Button } from '@/components/base/buttons/button';
import { CloseButton } from '@/components/base/buttons/close-button';
import { Input } from '@/components/base/input/input';
import { TextArea } from '@/components/base/textarea/textarea';
import { AvatarLabelGroup } from '@/components/base/avatar/avatar-label-group';
import { Badge } from '@/components/base/badges/badges';
import { MessageChatCircle, SearchLg, X } from '@untitledui/icons';
import { useSearchProfiles, type Profile } from '@/hooks/useSearchProfiles';
import { useCreateConversation } from '@/hooks/useMessaging';
import { toast } from 'sonner';
import { VALIDATION_LIMITS } from '@/constants/validation-limits';

interface CreateConversationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated?: (conversationId: string) => void;
}

export const CreateConversationModal = ({
  isOpen,
  onOpenChange,
  onConversationCreated,
}: CreateConversationModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<Profile[]>([]);
  const [initialMessage, setInitialMessage] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const { data: searchResults = [], isLoading: isSearching } = useSearchProfiles(
    debouncedSearchQuery,
    10
  );
  const createConversation = useCreateConversation();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleClose = useCallback(() => {
    setSearchQuery('');
    setSelectedParticipants([]);
    setSelectedProfiles([]);
    setInitialMessage('');
    setDebouncedSearchQuery('');
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSelectParticipant = useCallback((profile: Profile) => {
    setSelectedParticipants(prev => {
      if (prev.includes(profile.id)) {
        return prev.filter(id => id !== profile.id);
      }
      return [...prev, profile.id];
    });
    setSelectedProfiles(prev => {
      if (prev.some(p => p.id === profile.id)) {
        return prev.filter(p => p.id !== profile.id);
      }
      return [...prev, profile];
    });
    setSearchQuery('');
  }, []);

  const handleRemoveParticipant = useCallback((profileId: string) => {
    setSelectedParticipants(prev => prev.filter(id => id !== profileId));
    setSelectedProfiles(prev => prev.filter(p => p.id !== profileId));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedParticipants.length === 0) {
      toast.error('Veuillez sélectionner au moins un participant');
      return;
    }

    try {
      const result = await createConversation.mutateAsync({
        participantIds: selectedParticipants,
        type: selectedParticipants.length === 1 ? 'DIRECT' : 'GROUP',
        initialMessage: initialMessage.trim() || undefined,
      });

      toast.success('Conversation créée avec succès');
      handleClose();
      
      if (onConversationCreated && result.id) {
        onConversationCreated(result.id);
      }
    } catch {
      // Error is already handled by the hook
    }
  }, [selectedParticipants, initialMessage, createConversation, handleClose, onConversationCreated]);

  const availableResults = searchResults.filter(p => !selectedParticipants.includes(p.id));

  return (
    <AriaDialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalOverlay isDismissable>
        <Modal>
          <Dialog>
            <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl transition-all sm:max-w-[600px]">
              <CloseButton
                onClick={handleClose}
                theme="light"
                size="lg"
                className="absolute top-3 right-3 z-10"
              />
              
              <div className="flex flex-col gap-4 px-4 pt-5 sm:px-6 sm:pt-6">
                <div className="relative w-max">
                  <MessageChatCircle className="h-8 w-8 text-[#5E6AD2]" data-icon />
                </div>
                <div className="z-10 flex flex-col gap-0.5">
                  <AriaHeading slot="title" className="text-md font-semibold text-primary">
                    Nouveau message
                  </AriaHeading>
                  <p className="text-sm text-tertiary">
                    Sélectionnez un ou plusieurs contacts pour démarrer une conversation
                  </p>
                </div>
              </div>

              <div className="h-5 w-full" />

              <form onSubmit={handleSubmit} className="relative flex flex-col px-4 sm:px-6">
                {/* Search Input */}
                <div className="mb-4">
                  <Input
                    icon={SearchLg}
                    size="md"
                    placeholder="Rechercher un contact..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    isDisabled={createConversation.isPending}
                  />
                </div>

                {/* Selected Participants */}
                {selectedProfiles.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {selectedProfiles.map(profile => (
                      <Badge
                        key={profile.id}
                        size="md"
                        type="pill-color"
                        color="brand"
                        className="flex items-center gap-2 pr-1"
                      >
                        <span className="text-sm">
                          {profile.firstName} {profile.lastName}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveParticipant(profile.id)}
                          className="ml-1 rounded-full hover:bg-white/20 p-0.5"
                          disabled={createConversation.isPending}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Search Results */}
                {searchQuery && availableResults.length > 0 && (
                  <div className="mb-4 max-h-60 overflow-y-auto rounded-lg border border-secondary bg-primary">
                    {availableResults.map(profile => (
                      <button
                        key={profile.id}
                        type="button"
                        onClick={() => handleSelectParticipant(profile)}
                        className="w-full p-3 hover:bg-secondary_subtle transition-colors text-left border-b border-secondary last:border-b-0"
                        disabled={createConversation.isPending}
                      >
                        <AvatarLabelGroup
                          size="md"
                          src={profile.avatar ?? ''}
                          alt={`${profile.firstName} ${profile.lastName}`}
                          title={`${profile.firstName} ${profile.lastName}`}
                          subtitle={profile.highlight || 'Membre'}
                        />
                      </button>
                    ))}
                  </div>
                )}

                {searchQuery && !isSearching && availableResults.length === 0 && (
                  <div className="mb-4 text-center py-4 text-sm text-tertiary">
                    Aucun résultat trouvé
                  </div>
                )}

                {/* Initial Message (optional) */}
                {selectedParticipants.length > 0 && (
                  <div className="mb-4">
                    <TextArea
                      aria-label="Message initial"
                      placeholder="Écrire un message (optionnel)..."
                      value={initialMessage}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInitialMessage(e.target.value)}
                      maxLength={VALIDATION_LIMITS.MESSAGING.INITIAL_MESSAGE_MAX}
                      className="min-h-24"
                      isDisabled={createConversation.isPending}
                    />
                    {initialMessage.length > VALIDATION_LIMITS.MESSAGING.INITIAL_MESSAGE_MAX * 0.8 && (
                      <p className={`text-xs mt-1 ${initialMessage.length >= VALIDATION_LIMITS.MESSAGING.INITIAL_MESSAGE_MAX ? 'text-red-500' : 'text-yellow-600'}`}>
                        {initialMessage.length} / {VALIDATION_LIMITS.MESSAGING.INITIAL_MESSAGE_MAX}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="z-10 flex flex-1 flex-col-reverse gap-3 p-4 pt-6 *:grow sm:grid sm:grid-cols-2 sm:px-0 sm:pt-8 sm:pb-6">
                  <Button
                    color="secondary"
                    onClick={handleClose}
                    isDisabled={createConversation.isPending}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    isDisabled={selectedParticipants.length === 0 || createConversation.isPending}
                    isLoading={createConversation.isPending}
                  >
                    {selectedParticipants.length === 1 ? 'Créer la conversation' : 'Créer le groupe'}
                  </Button>
                </div>
              </form>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </AriaDialogTrigger>
  );
};

