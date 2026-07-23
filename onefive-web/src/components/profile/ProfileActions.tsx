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
import { addCrmNote, addCrmReminder, getCrmContact, completeCrmReminder } from '@/queries/crm';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

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

const tagColorMap: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  purple: 'bg-purple-100 text-purple-800',
  orange: 'bg-orange-100 text-orange-800',
};

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
  onTagChange: _onTagChange,
  linkedinUrl: _linkedinUrl,
  isFollowing = false,
  profileData
}: ProfileActionsProps) {
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectMessage, setConnectMessage] = useState('');

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

  const crmQueryClient = useQueryClient();
  const { data: crmContact } = useQuery({
    queryKey: ['crm-contact', profileId],
    queryFn: () => getCrmContact(profileId),
    enabled: !isCurrentUser && (isNoteModalOpen || isReminderModalOpen),
  });
  const completeReminderMut = useMutation({
    mutationFn: (reminderId: string) => completeCrmReminder(reminderId),
    onSuccess: () =>
      crmQueryClient.invalidateQueries({ queryKey: ['crm-contact', profileId] }),
  });

  const handleTagToggle = (_tagId: string) => {
    // Les listes/tags de contacts ne sont pas encore persistés côté serveur
    // (le CRM ne gère que stage/notes/rappels). On reste honnête — comme pour
    // les tags personnalisés — plutôt que de simuler un succès non sauvegardé.
    toast.info('Les listes de contacts arrivent bientôt');
  };

  const handleAddCustomTag = () => {
    if (customTag.trim()) {
      setCustomTag('');
      // Pas encore persisté côté serveur : rester honnête plutôt que simuler un succès.
      toast.info('Les tags personnalisés arrivent bientôt');
    }
  };

  const handleCreateReminder = async () => {
    if (reminderDate && reminderTime && reminderReason) {
      try {
        await addCrmReminder(
          profileId,
          reminderReason,
          new Date(`${reminderDate}T${reminderTime}`).toISOString(),
        );
        crmQueryClient.invalidateQueries({ queryKey: ['crm-contact', profileId] });
        toast.success('Rappel créé');
        setIsReminderModalOpen(false);
        setReminderDate('');
        setReminderTime('');
        setReminderReason('');
      } catch {
        toast.error('Erreur lors de la création du rappel');
      }
    }
  };

  const handleSaveNote = async () => {
    if (noteContent.trim()) {
      try {
        await addCrmNote(profileId, noteContent.trim());
        crmQueryClient.invalidateQueries({ queryKey: ['crm-contact', profileId] });
        toast.success('Note enregistrée');
        setIsNoteModalOpen(false);
        setNoteContent('');
      } catch {
        toast.error("Erreur lors de l'enregistrement de la note");
      }
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
          isDisabled={followProfile.isLoading}
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
                isDisabled={acceptConnectionRequest.isPending}
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
              onClick={() => setIsConnectModalOpen(true)}
              isDisabled={sendConnectionRequest.isPending || isLoadingConnectionStatus}
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
          isDisabled={isNavigatingToConversation}
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
              <Badge key={tagId} type="pill-color" color="brand" size="sm" className={tagColorMap[tag.color] ?? 'bg-gray-100 text-gray-800'}>
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
                        <Button color="primary" size="md" onClick={handleAddCustomTag} isDisabled={!customTag.trim()}>
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
                    
                    {crmContact && crmContact.reminders.length > 0 && (
                      <div className="space-y-2 border-t border-gray-100 pt-3">
                        <p className="text-sm font-medium text-secondary">Rappels enregistrés</p>
                        <ul className="space-y-1.5 max-h-48 overflow-y-auto">
                          {crmContact.reminders.map((r) => (
                            <li key={r.id} className="flex items-start gap-2 text-sm">
                              <button
                                type="button"
                                onClick={() => completeReminderMut.mutate(r.id)}
                                disabled={r.done || completeReminderMut.isPending}
                                className="mt-0.5 shrink-0 text-gray-400 hover:text-green-600 disabled:opacity-50"
                                title={r.done ? 'Fait' : 'Marquer comme fait'}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <div className={r.done ? 'line-through text-gray-400' : 'text-gray-700'}>
                                <p>{r.reason}</p>
                                <p className="text-xs text-gray-400">
                                  {new Date(r.dueAt).toLocaleString('fr-FR', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                  })}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                        <p className="text-xs text-tertiary">
                          Vos rappels s&apos;affichent ici sur ce contact. Cochez-les une fois traités.
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end gap-2">
                      <Button color="secondary" size="md" onClick={() => setIsReminderModalOpen(false)}>
                        Annuler
                      </Button>
                      <Button color="primary" size="md" onClick={handleCreateReminder} isDisabled={!reminderDate || !reminderTime || !reminderReason}>
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
                    
                    {crmContact && crmContact.notes.length > 0 && (
                      <div className="space-y-2 border-t border-gray-100 pt-3">
                        <p className="text-sm font-medium text-secondary">Notes enregistrées</p>
                        <ul className="space-y-2 max-h-48 overflow-y-auto">
                          {crmContact.notes.map((n) => (
                            <li key={n.id} className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                              <p className="whitespace-pre-wrap">{n.content}</p>
                              <p className="mt-1 text-xs text-gray-400">
                                {new Date(n.createdAt).toLocaleDateString('fr-FR', { dateStyle: 'medium' })}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex justify-end gap-2">
                      <Button color="secondary" size="md" onClick={() => setIsNoteModalOpen(false)}>
                        Annuler
                      </Button>
                      <Button color="primary" size="md" onClick={handleSaveNote} isDisabled={!noteContent.trim()}>
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

      {/* Modal de demande de connexion avec message de contexte optionnel */}
      <AriaDialogTrigger isOpen={isConnectModalOpen} onOpenChange={setIsConnectModalOpen}>
        <ModalOverlay isDismissable>
          <Modal>
            <Dialog>
              <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-primary shadow-xl">
                <CloseButton onClick={() => setIsConnectModalOpen(false)} theme="light" size="lg" className="absolute top-3 right-3" />
                <div className="flex flex-col gap-5 px-4 py-6 md:px-6 md:pt-8">
                  <AriaHeading slot="title" className="text-lg font-semibold text-primary">
                    Se connecter avec {profileName}
                  </AriaHeading>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-secondary">Message de contexte (optionnel)</p>
                      <TextArea
                        placeholder="Ex: On s'est croisés à l'event X, j'aimerais échanger sur…"
                        value={connectMessage}
                        onChange={(e) => setConnectMessage(e.target.value)}
                        rows={4}
                        maxLength={500}
                      />
                      <p className="text-xs text-tertiary">Aide {profileName} à comprendre pourquoi vous vous connectez.</p>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button color="secondary" size="md" onClick={() => setIsConnectModalOpen(false)}>
                        Annuler
                      </Button>
                      <Button
                        color="primary"
                        size="md"
                        isDisabled={sendConnectionRequest.isPending}
                        onClick={() => {
                          sendConnectionRequest.mutate(
                            { profileId, message: connectMessage.trim() || undefined },
                            {
                              onSuccess: () => {
                                setIsConnectModalOpen(false);
                                setConnectMessage('');
                              },
                            },
                          );
                        }}
                      >
                        {sendConnectionRequest.isPending ? 'Envoi…' : 'Envoyer la demande'}
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
                        isDisabled={removeConnection.isPending}
                      >
                        Annuler
                      </Button>
                      <Button 
                        color="primary" 
                        size="md" 
                        onClick={handleRemoveConnection}
                        isDisabled={removeConnection.isPending}
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