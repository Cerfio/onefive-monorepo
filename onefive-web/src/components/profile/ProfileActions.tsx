'use client';

import { useState, useEffect } from 'react';
import { 
  UsersPlus, 
  Calendar, 
  File02, 
  Tag01, 
  UsersCheck,
  MessageChatSquare
} from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import { CloseButton } from '@/components/base/buttons/close-button';
import { Badge } from '@/components/base/badges/badges';
import { 
  Dialog, 
  Modal, 
  ModalOverlay 
} from '@/components/application/modals/modal';
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components";
import { Dropdown } from '@/components/base/dropdown/dropdown';
import { Input } from '@/components/base/input/input';
import { TextArea } from '@/components/base/textarea/textarea';
import { toast } from 'sonner';
import { useToggleProfileFollow } from '@/hooks/useFollow';
import { useSendConnectionRequest, useConnectionStatus, useAcceptConnectionRequest, useRemoveConnection, useCancelConnectionRequest } from '@/hooks/useConnection';
import { Clock, CheckCircle, Trash01 } from '@untitledui/icons';
import { useMeProfile } from '@/queries/profile';
import { CancelConnectionModal } from '@/components/modals/CancelConnectionModal';
import { useNavigateToConversation } from '@/hooks/useNavigateToConversation';

// Types pour la gestion relationnelle
interface ProfileTag {
  id: string;
  label: string;
  icon: string;
  color: string;
}

interface ProfileReminder {
  id: string;
  date: string;
  time: string;
  reason: string;
  profileId: string;
}

interface ProfileNote {
  id: string;
  content: string;
  createdAt: string;
  profileId: string;
}

// Tags prédéfinis
const predefinedTags: ProfileTag[] = [
  { id: 'meet', label: 'À rencontrer', icon: '🤝', color: 'blue' },
  { id: 'investor', label: 'Investisseur potentiel', icon: '💰', color: 'green' },
  { id: 'mentor', label: 'Mentor', icon: '📚', color: 'purple' },
  { id: 'partner', label: 'Partenaire stratégique', icon: '🚀', color: 'orange' },
];

interface ProfileActionsProps {
  profileId: string;
  profileName: string;
  isCurrentUser: boolean;
  currentTags?: string[];
  onTagChange?: (tags: string[]) => void;
  linkedinUrl?: string;
  isFollowing?: boolean;
  profileData?: any; // Pour récupérer isFollowing depuis les données du profil
}

export default function ProfileActions({
  profileId,
  profileName,
  isCurrentUser,
  currentTags = [],
  onTagChange,
  linkedinUrl: _linkedinUrl,
  isFollowing = false,
  profileData
}: ProfileActionsProps) {
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  // Utiliser isFollowing depuis profileData si disponible, sinon la prop
  const actualIsFollowing = profileData?.isFollowing ?? isFollowing;
  const [following, setFollowing] = useState(actualIsFollowing);

  // Synchroniser l'état local avec les données du profil quand elles arrivent
  useEffect(() => {
    if (profileData?.isFollowing !== undefined) {
      setFollowing(profileData.isFollowing);
    } else if (isFollowing !== undefined) {
      setFollowing(isFollowing);
    }
  }, [profileData?.isFollowing, isFollowing]);

  const followProfile = useToggleProfileFollow();
  const sendConnectionRequest = useSendConnectionRequest();
  const acceptConnectionRequest = useAcceptConnectionRequest();
  const removeConnection = useRemoveConnection();
  const cancelConnectionRequest = useCancelConnectionRequest();
  const { data: connectionStatus, isLoading: isLoadingConnectionStatus } = useConnectionStatus(profileId);
  const { data: meProfile } = useMeProfile();
  const { navigateToConversation, isLoading: isNavigatingToConversation } = useNavigateToConversation();
  const [isRemoveConnectionModalOpen, setIsRemoveConnectionModalOpen] = useState(false);
  const [isCancelConnectionModalOpen, setIsCancelConnectionModalOpen] = useState(false);

  // Handler pour le toggle du follow avec gestion d'erreur
  const handleFollowToggle = () => {
    const currentFollowingState = following;
    const newFollowingState = !currentFollowingState;
    
    // Mise à jour optimiste de l'état local
    setFollowing(newFollowingState);
    
    // Appeler toggle avec l'état actuel (avant le changement)
    // Le hook va décider de follow ou unfollow basé sur cet état
    followProfile.toggle(profileId, currentFollowingState);
  };
  
  // Déterminer si c'est une demande entrante (l'autre personne nous a envoyé une demande)
  const isIncomingRequest = connectionStatus?.status === 'PENDING' && 
    connectionStatus?.requesterId !== meProfile?.id;
  
  const handleRemoveConnection = () => {
    removeConnection.mutate(profileId);
    setIsRemoveConnectionModalOpen(false);
  };

  const handleCancelConnection = () => {
    cancelConnectionRequest.mutate(profileId, {
      onSuccess: () => {
        setIsCancelConnectionModalOpen(false);
      }
    });
  };
  const [customTag, setCustomTag] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [reminderReason, setReminderReason] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const handleTagToggle = (tagId: string) => {
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(t => t !== tagId)
      : [...currentTags, tagId];
    
    onTagChange?.(newTags);
    toast.success(`Tag ${currentTags.includes(tagId) ? 'retiré' : 'ajouté'} avec succès`);
  };

  const handleAddCustomTag = () => {
    if (customTag.trim()) {
      const _newTag = { id: `custom-${Date.now()}`, label: customTag, icon: '🏷️', color: 'gray' };
      // Ici on ajouterait le tag personnalisé à la liste
      setCustomTag('');
      toast.success('Tag personnalisé ajouté');
    }
  };

  const handleCreateReminder = () => {
    if (reminderDate && reminderTime && reminderReason) {
      const _reminder: ProfileReminder = {
        id: `reminder-${Date.now()}`,
        date: reminderDate,
        time: reminderTime,
        reason: reminderReason,
        profileId
      };
      
      // Ici on sauvegarderait le rappel
      toast.success('Rappel créé avec succès');
      setIsReminderModalOpen(false);
      setReminderDate('');
      setReminderTime('');
      setReminderReason('');
    }
  };

  const handleSaveNote = () => {
    if (noteContent.trim()) {
      const _note: ProfileNote = {
        id: `note-${Date.now()}`,
        content: noteContent,
        createdAt: new Date().toISOString(),
        profileId
      };
      
      // Ici on sauvegarderait la note
      toast.success('Note sauvegardée');
      setIsNoteModalOpen(false);
      setNoteContent('');
    }
  };

  if (isCurrentUser) {
    return null; // Pas d'actions pour son propre profil
  }

  return (
    <>
      {/* Boutons d'action principaux */}
      <div className="flex gap-2">
        {/* Bouton Follow - Style Onefive */}
        <Button
          color="primary"
          size="md"
          className="bg-[#5E6AD2] hover:bg-[#4F58B8] text-white gap-2"
          iconLeading={<UsersPlus data-icon />}
          onClick={handleFollowToggle}
          disabled={followProfile.isLoading}
        >
          {followProfile.isLoading ? '...' : (following ? 'Suivi' : 'Follow')}
        </Button>
        
        {/* Bouton Se connecter / Pending / Accepter / Connecté */}
        {(() => {
          const status = connectionStatus?.status;
          const isPending = status === 'PENDING';
          const isAccepted = status === 'ACCEPTED';
          
          if (isAccepted) {
            return (
              <Button 
                color="secondary"
                size="md"
                className="border-green-200 text-green-700 bg-green-50 hover:bg-green-100 gap-2"
                iconLeading={<UsersCheck data-icon />}
                disabled
              >
                Connecté
              </Button>
            );
          }
          
          if (isPending && isIncomingRequest) {
            // Demande entrante : afficher bouton Accepter
            return (
              <Button 
                color="primary"
                size="md"
                className="bg-[#5E6AD2] hover:bg-[#4F58B8] text-white gap-2"
                iconLeading={<CheckCircle data-icon />}
                onClick={() => acceptConnectionRequest.mutate(profileId)}
                disabled={acceptConnectionRequest.isPending}
              >
                {acceptConnectionRequest.isPending ? '...' : 'Accepter'}
              </Button>
            );
          }
          
          if (isPending) {
            // Demande sortante : afficher bouton cliquable pour annuler
            return (
              <Button 
                color="secondary"
                size="md"
                className="border-[#5E6AD2] text-[#5E6AD2] hover:bg-red-50 hover:text-red-600 hover:border-red-300 gap-2"
                iconLeading={<Clock data-icon />}
                onClick={() => setIsCancelConnectionModalOpen(true)}
                title="Cliquer pour annuler la demande"
              >
                Demande envoyée
              </Button>
            );
          }
          
          return (
            <Button 
              color="secondary"
              size="md"
              className="border-[#5E6AD2] text-[#5E6AD2] hover:bg-[#5E6AD2] hover:text-white gap-2"
              iconLeading={<UsersCheck data-icon />}
              onClick={() => sendConnectionRequest.mutate(profileId)}
              disabled={sendConnectionRequest.isPending || isLoadingConnectionStatus}
            >
              {sendConnectionRequest.isPending ? '...' : 'Se connecter'}
            </Button>
          );
        })()}
        
        {/* Bouton Envoyer un message */}
        <Button 
          color="secondary"
          size="md"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 gap-2"
          iconLeading={<MessageChatSquare data-icon />}
          onClick={() => navigateToConversation(profileId)}
          disabled={isNavigatingToConversation}
        >
          {isNavigatingToConversation ? 'Ouverture...' : 'Envoyer un message'}
        </Button>

        {/* Menu d'actions avancées */}
        <Dropdown.Root>
          <Dropdown.DotsButton />

          <Dropdown.Popover>
            <Dropdown.Menu>
              <Dropdown.Section>
                <Dropdown.Item icon={Tag01} onAction={() => setIsTagModalOpen(true)}>
                  Ajouter à mes listes
                </Dropdown.Item>
                
                <Dropdown.Item icon={Calendar} onAction={() => setIsReminderModalOpen(true)}>
                  Créer un rappel
                </Dropdown.Item>
                
                <Dropdown.Item icon={File02} onAction={() => setIsNoteModalOpen(true)}>
                  Note privée
                </Dropdown.Item>
                
                {/* Option pour supprimer la connexion si elle est acceptée */}
                {connectionStatus?.status === 'ACCEPTED' && (
                  <Dropdown.Item 
                    icon={Trash01} 
                    onAction={() => setIsRemoveConnectionModalOpen(true)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Supprimer la connexion
                  </Dropdown.Item>
                )}
              </Dropdown.Section>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown.Root>
      </div>

      {/* Tags actuels */}
      {currentTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {currentTags.map(tagId => {
            const tag = predefinedTags.find(t => t.id === tagId);
            return tag ? (
              <Badge key={tagId} type="pill-color" color="brand" size="sm" className={`bg-${tag.color}-100 text-${tag.color}-800`}>
                {tag.icon} {tag.label}
              </Badge>
            ) : null;
          })}
        </div>
      )}

      {/* Modal pour les tags */}
      <AriaDialogTrigger isOpen={isTagModalOpen} onOpenChange={setIsTagModalOpen}>
        <ModalOverlay isDismissable>
          <Modal>
            <Dialog>
              <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-primary shadow-xl">
                <CloseButton onClick={() => setIsTagModalOpen(false)} theme="light" size="lg" className="absolute top-3 right-3" />
                <div className="flex flex-col gap-5 px-4 py-6 md:px-6 md:pt-8">
                  <AriaHeading slot="title" className="text-lg font-semibold text-primary">
                    Ajouter {profileName} à mes listes
                  </AriaHeading>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      {predefinedTags.map(tag => (
                        <Button
                          key={tag.id}
                          color={currentTags.includes(tag.id) ? "primary" : "secondary"}
                          size="md"
                          className="justify-start gap-2"
                          onClick={() => handleTagToggle(tag.id)}
                        >
                          {tag.icon} {tag.label}
                        </Button>
                      ))}
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-secondary">Tag personnalisé</p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ex: Contact LinkedIn"
                          value={customTag}
                          onChange={setCustomTag}
                        />
                        <Button color="primary" size="md" onClick={handleAddCustomTag} disabled={!customTag.trim()}>
                          Ajouter
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Dialog>
          </Modal>
        </ModalOverlay>
      </AriaDialogTrigger>

      {/* Modal pour les rappels */}
      <AriaDialogTrigger isOpen={isReminderModalOpen} onOpenChange={setIsReminderModalOpen}>
        <ModalOverlay isDismissable>
          <Modal>
            <Dialog>
              <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-primary shadow-xl">
                <CloseButton onClick={() => setIsReminderModalOpen(false)} theme="light" size="lg" className="absolute top-3 right-3" />
                <div className="flex flex-col gap-5 px-4 py-6 md:px-6 md:pt-8">
                  <AriaHeading slot="title" className="text-lg font-semibold text-primary">
                    Créer un rappel pour {profileName}
                  </AriaHeading>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-secondary">Date</p>
                        <Input
                          type="date"
                          value={reminderDate}
                          onChange={setReminderDate}
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-secondary">Heure</p>
                        <Input
                          type="time"
                          value={reminderTime}
                          onChange={setReminderTime}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-secondary">Raison / Note</p>
                      <TextArea
                        placeholder="Ex: Suivre sur le projet X..."
                        value={reminderReason}
                        onChange={(e) => setReminderReason(e.target.value)}
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button color="secondary" size="md" onClick={() => setIsReminderModalOpen(false)}>
                        Annuler
                      </Button>
                      <Button color="primary" size="md" onClick={handleCreateReminder} disabled={!reminderDate || !reminderTime || !reminderReason}>
                        Créer le rappel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Dialog>
          </Modal>
        </ModalOverlay>
      </AriaDialogTrigger>

      {/* Modal pour les notes privées */}
      <AriaDialogTrigger isOpen={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
        <ModalOverlay isDismissable>
          <Modal>
            <Dialog>
              <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-primary shadow-xl">
                <CloseButton onClick={() => setIsNoteModalOpen(false)} theme="light" size="lg" className="absolute top-3 right-3" />
                <div className="flex flex-col gap-5 px-4 py-6 md:px-6 md:pt-8">
                  <AriaHeading slot="title" className="text-lg font-semibold text-primary">
                    Note privée sur {profileName}
                  </AriaHeading>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-secondary">Note (privée)</p>
                      <TextArea
                        placeholder="Ex: Intéressé par notre solution, à recontacter en mars..."
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        rows={4}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button color="secondary" size="md" onClick={() => setIsNoteModalOpen(false)}>
                        Annuler
                      </Button>
                      <Button color="primary" size="md" onClick={handleSaveNote} disabled={!noteContent.trim()}>
                        Sauvegarder
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Dialog>
          </Modal>
        </ModalOverlay>
      </AriaDialogTrigger>

      {/* Modal de confirmation pour supprimer la connexion */}
      <AriaDialogTrigger isOpen={isRemoveConnectionModalOpen} onOpenChange={setIsRemoveConnectionModalOpen}>
        <ModalOverlay isDismissable>
          <Modal>
            <Dialog>
              <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-primary shadow-xl">
                <CloseButton onClick={() => setIsRemoveConnectionModalOpen(false)} theme="light" size="lg" className="absolute top-3 right-3" />
                <div className="flex flex-col gap-5 px-4 py-6 md:px-6 md:pt-8">
                  <AriaHeading slot="title" className="text-lg font-semibold text-primary">
                    Supprimer la connexion
                  </AriaHeading>
                  
                  <div className="space-y-4">
                    <p className="text-sm text-secondary">
                      Êtes-vous sûr de vouloir supprimer la connexion avec <strong>{profileName}</strong> ? Cette action est irréversible.
                    </p>
                    
                    <div className="flex justify-end gap-2">
                      <Button 
                        color="secondary" 
                        size="md" 
                        onClick={() => setIsRemoveConnectionModalOpen(false)}
                        disabled={removeConnection.isPending}
                      >
                        Annuler
                      </Button>
                      <Button 
                        color="primary" 
                        size="md" 
                        onClick={handleRemoveConnection}
                        disabled={removeConnection.isPending}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        iconLeading={<Trash01 data-icon />}
                      >
                        {removeConnection.isPending ? 'Suppression...' : 'Supprimer'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Dialog>
          </Modal>
        </ModalOverlay>
      </AriaDialogTrigger>

      {/* Modal de confirmation pour annuler la demande */}
      <CancelConnectionModal
        isOpen={isCancelConnectionModalOpen}
        onClose={() => setIsCancelConnectionModalOpen(false)}
        onConfirm={handleCancelConnection}
        personName={profileName}
        isLoading={cancelConnectionRequest.isPending}
      />
    </>
  );
} 