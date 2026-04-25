'use client';

import React, { useState } from 'react';
import { Button } from '@/components/base/buttons/button';
import { CloseButton } from '@/components/base/buttons/close-button';
import { Modal, ModalOverlay, Dialog } from '@/components/application/modals/modal';
import { Input } from '@/components/base/input/input';
import { PositionSelect } from '@/components/startup/PositionSelect';
import { TextArea } from '@/components/base/textarea/textarea';
import { Select } from '@/components/base/select/select';
import { SmartProfileSearch } from '@/components/startup/SmartProfileSearch';
import { ProfileSearchResult, useAddMember } from '@/queries/startup';
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components";
import { Users, Mail, UserPlus, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/base/tabs/tabs';
import { Avatar } from '@/components/base/avatar/avatar';
import { resolveAvatarUrl } from '@/utils/avatar';

interface EditMembersModalProps {
  open: boolean;
  onOpenChange: (open: boolean, success?: boolean) => void;
  startupId: string;
}

const ROLE_OPTIONS = [
  { id: 'MEMBER', label: 'Membre' },
  { id: 'ADMIN', label: 'Admin' },
];

export const EditMembersModal: React.FC<EditMembersModalProps> = ({
  open,
  onOpenChange,
  startupId,
}) => {
  const [selectedProfile, setSelectedProfile] = useState<ProfileSearchResult | null>(null);
  const [inviteMode, setInviteMode] = useState<'search' | 'email'>('search');
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    position: '',
    role: 'MEMBER' as 'ADMIN' | 'MEMBER',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const addMemberMutation = useAddMember();

  const handleProfileSelect = (profile: ProfileSearchResult) => {
    setSelectedProfile(profile);
    setForm({
      ...form,
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
    });
    // Clear profile error when selecting
    setErrors((prev) => {
      const { profile: _, ...rest } = prev;
      return rest;
    });
  };

  const handleClearProfile = () => {
    setSelectedProfile(null);
  };

  const handleInviteModeChange = (mode: 'search' | 'email') => {
    setInviteMode(mode);
    // Clear errors when switching mode
    setErrors({});
    // Clear selected profile when switching to email
    if (mode === 'email') {
      setSelectedProfile(null);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (inviteMode === 'search' && !selectedProfile) {
      newErrors.profile = 'Sélectionnez un profil';
    }
    
    if (inviteMode === 'email') {
      if (!form.email) {
        newErrors.email = 'Email requis';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        newErrors.email = 'Email invalide';
      }
    }
    
    if (!form.position.trim()) {
      newErrors.position = 'Position requise';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await addMemberMutation.mutateAsync({
        startupId,
        payload: {
          profileId: selectedProfile?.id,
          email: inviteMode === 'email' ? form.email : undefined,
          firstName: form.firstName || undefined,
          lastName: form.lastName || undefined,
          position: form.position,
          role: form.role,
          message: form.message || undefined,
        },
      });
      
      // Reset form and close modal
      handleClose();
      onOpenChange(false, true);
    } catch (error) {
      console.error('Failed to invite member:', error);
    }
  };

  const handleClose = () => {
    setSelectedProfile(null);
    setForm({
      email: '',
      firstName: '',
      lastName: '',
      position: '',
      role: 'MEMBER',
      message: '',
    });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <AriaDialogTrigger isOpen={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <Button style={{ display: 'none' }}>Trigger</Button>
      <ModalOverlay isDismissable>
        <Modal>
          <Dialog>
            <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl transition-all sm:max-w-2xl">
              <CloseButton onClick={handleClose} theme="light" size="lg" className="absolute top-3 right-3" />
              
              <div className="flex items-center gap-3 px-4 pt-5 sm:px-6 sm:pt-6">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <AriaHeading slot="title" className="text-md font-semibold text-primary">
                    Inviter un membre
                  </AriaHeading>
                  <p className="text-sm text-tertiary">Ajoutez un nouveau membre à l'équipe</p>
                </div>
              </div>

              <div className="h-5 w-full" />

              <form onSubmit={onSubmit} className="space-y-5 py-4 max-h-[60vh] overflow-y-auto px-4 sm:px-6">
                {/* Tabs for invite method */}
                <Tabs value={inviteMode} onValueChange={(v) => handleInviteModeChange(v as 'search' | 'email')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="search" className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Rechercher
                    </TabsTrigger>
                    <TabsTrigger value="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Par email
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="search" className="mt-4">
                    {selectedProfile ? (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Avatar
                          size="md"
                          src={resolveAvatarUrl(selectedProfile.avatar)}
                          initials={`${selectedProfile.firstName?.[0] ?? ''}${selectedProfile.lastName?.[0] ?? ''}`}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{selectedProfile.name}</p>
                          {selectedProfile.highlight && (
                            <p className="text-sm text-gray-500">{selectedProfile.highlight}</p>
                          )}
                        </div>
                        <Button
                          type="button"
                          color="secondary"
                          size="sm"
                          onClick={handleClearProfile}
                        >
                          Changer
                        </Button>
                      </div>
                    ) : (
                      <>
                        <SmartProfileSearch
                          onProfileSelect={handleProfileSelect}
                          onEmailInvite={(email, firstName, lastName) => {
                            setForm({
                              ...form,
                              email,
                              firstName,
                              lastName,
                            });
                            setInviteMode('email');
                          }}
                          selectedProfiles={[]}
                          placeholder="Rechercher un utilisateur..."
                        />
                        {errors.profile && (
                          <p className="mt-1 text-sm text-red-500">{errors.profile}</p>
                        )}
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="email" className="mt-4 space-y-4">
                    <Input
                      label="Email *"
                      type="email"
                      placeholder="email@exemple.com"
                      value={form.email}
                      onChange={(value) => setForm({ ...form, email: value })}
                      isInvalid={!!errors.email}
                      hint={errors.email}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Prénom"
                        placeholder="Prénom"
                        value={form.firstName}
                        onChange={(value) => setForm({ ...form, firstName: value })}
                      />
                      <Input
                        label="Nom"
                        placeholder="Nom"
                        value={form.lastName}
                        onChange={(value) => setForm({ ...form, lastName: value })}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Position */}
                <PositionSelect
                  label="Titre/Position"
                  value={form.position}
                  onChange={(value) => setForm({ ...form, position: value })}
                  isInvalid={!!errors.position}
                  hint={errors.position || undefined}
                />
                {!errors.position && (
                  <p className="mt-1 text-xs text-tertiary">
                    Le titre de la personne dans la startup
                  </p>
                )}

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Rôle
                  </label>
                  <Select
                    selectedKey={form.role}
                    onSelectionChange={(key) => setForm({ ...form, role: key as 'ADMIN' | 'MEMBER' })}
                    items={ROLE_OPTIONS}
                  >
                    {(item) => <Select.Item key={item.id} id={item.id}>{item.label}</Select.Item>}
                  </Select>
                  <p className="mt-1 text-xs text-tertiary">
                    Admin: peut modifier la page. Membre: consultation uniquement.
                  </p>
                </div>

                {/* Message (optional) */}
                <TextArea
                  label="Message personnalisé (optionnel)"
                  placeholder="Ajoutez un message personnel à l'invitation..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={3}
                />
              </form>

              <div className="z-10 flex flex-1 flex-col-reverse gap-3 p-4 pt-6 sm:flex sm:flex-row sm:items-center sm:justify-end sm:px-6 sm:pt-8 sm:pb-6">
                <Button
                  color="secondary"
                  size="lg"
                  onClick={handleClose}
                >
                  Annuler
                </Button>
                <Button
                  color="primary"
                  size="lg"
                  onClick={onSubmit}
                  isDisabled={addMemberMutation.isPending}
                >
                  {addMemberMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    'Envoyer l\'invitation'
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

export default EditMembersModal;
