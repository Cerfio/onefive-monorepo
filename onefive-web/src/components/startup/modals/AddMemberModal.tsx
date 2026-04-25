'use client';

import React, { useState } from 'react';
import { Button } from '@/components/base/buttons/button';
import { CloseButton } from '@/components/base/buttons/close-button';
import { Modal, ModalOverlay, Dialog } from '@/components/application/modals/modal';
import { Input } from '@/components/base/input/input';
import { TextArea } from '@/components/base/textarea/textarea';
import { SmartProfileSearch } from '@/components/startup/SmartProfileSearch';
import { ProfileSearchResult, useAddMember } from '@/queries/startup';
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from 'react-aria-components';
import { Users, Mail, UserPlus, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar } from '@/components/base/avatar/avatar';
import { resolveAvatarUrl } from '@/utils/avatar';
import { Checkbox } from '@/components/base/checkbox/checkbox';
import { PositionSelect } from '@/components/startup/PositionSelect';

interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean, success?: boolean) => void;
  startupId: string;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
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
    isFounder: false,
    equity: 0,
    showEquity: false,
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
    setErrors({});
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

    if (form.isFounder && form.showEquity && (form.equity < 0 || form.equity > 100)) {
      newErrors.equity = 'L\'equity doit être entre 0 et 100%';
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
          isFounder: form.isFounder,
          equity: form.isFounder && form.showEquity ? form.equity : undefined,
          message: form.message || undefined,
        },
      });

      handleClose();
      onOpenChange(false, true);
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };

  const handleClose = () => {
    setSelectedProfile(null);
    setForm({
      email: '',
      firstName: '',
      lastName: '',
      position: '',
      isFounder: false,
      equity: 0,
      showEquity: false,
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
                    Ajouter à l'équipe
                  </AriaHeading>
                  <p className="text-sm text-tertiary">Ajoutez un fondateur ou un membre d'équipe</p>
                </div>
              </div>

              <div className="h-5 w-full" />

              <form onSubmit={onSubmit} className="space-y-5 py-4 max-h-[60vh] overflow-y-auto px-4 sm:px-6">
                {/* Founder toggle */}
                <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                  <Checkbox
                    isSelected={form.isFounder}
                    onChange={(isSelected) => {
                      setForm({ ...form, isFounder: isSelected, position: '', equity: 0, showEquity: false });
                    }}
                    label="Fondateur"
                    hint={form.isFounder ? 'Avec parts optionnelles' : 'Membre d\'équipe classique'}
                    className="flex-1"
                  />
                </div>

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
                        <Button type="button" color="secondary" size="sm" onClick={handleClearProfile}>
                          Changer
                        </Button>
                      </div>
                    ) : (
                      <>
                        <SmartProfileSearch
                          onProfileSelect={handleProfileSelect}
                          onEmailInvite={(email, firstName, lastName) => {
                            setForm({ ...form, email, firstName, lastName });
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
                  label="Titre / Position *"
                  value={form.position}
                  onChange={(value) => setForm({ ...form, position: value })}
                  isInvalid={!!errors.position}
                  hint={errors.position}
                />

                {/* Equity (only if founder) */}
                {form.isFounder && (
                  <div className="space-y-3">
                    <Checkbox
                      isSelected={form.showEquity}
                      onChange={(isSelected) => setForm({ ...form, showEquity: isSelected, equity: 0 })}
                      label="Afficher les parts (equity)"
                    />
                    {form.showEquity && (
                      <div className="w-32">
                        <Input
                          label="Equity (%)"
                          type="number"
                          placeholder="0"
                          value={form.equity.toString()}
                          onChange={(value: string) => {
                            const num = value === '' ? 0 : parseInt(value, 10);
                            if (!isNaN(num) && num >= 0 && num <= 100) {
                              setForm({ ...form, equity: num });
                            }
                          }}
                          isInvalid={!!errors.equity}
                          hint={errors.equity}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Message */}
                <TextArea
                  label="Message personnalisé (optionnel)"
                  placeholder="Ajoutez un message personnel à l'invitation..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={3}
                />
              </form>

              <div className="z-10 flex flex-1 flex-col-reverse gap-3 p-4 pt-6 sm:flex sm:flex-row sm:items-center sm:justify-end sm:px-6 sm:pt-8 sm:pb-6">
                <Button color="secondary" size="lg" onClick={handleClose}>
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
                    form.isFounder ? 'Ajouter le fondateur' : 'Envoyer l\'invitation'
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

export default AddMemberModal;
