import React, { useState, useEffect, useMemo } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/base/input/input';
import { Button } from '@/components/base/buttons/button';
import { Avatar } from '@/components/base/avatar/avatar';
import { Select } from '@/components/base/select/select';
import { Badge } from '@/components/base/badges/badges';
import { Trash2, SkipForward, X } from 'lucide-react';
import { SmartProfileSearch } from '@/components/startup/SmartProfileSearch';
import { ProfileSearchResult, useManageStartupInvitation } from '@/queries/startup';
import { useQuery } from '@tanstack/react-query';
import { selfProfile } from '@/queries/profile';
import { resolveAvatarUrl } from '@/utils/avatar';
import { VALIDATION_LIMITS } from '@/constants/validation-limits';

const teamMemberSchema = z.object({
  profileId: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email('Email invalide'),
  position: z.string().min(VALIDATION_LIMITS.STARTUP.NAME_MIN, 'Poste requis').max(VALIDATION_LIMITS.STARTUP.POSITION_MAX, `Maximum ${VALIDATION_LIMITS.STARTUP.POSITION_MAX} caractères`),
  equity: z.number().min(VALIDATION_LIMITS.STARTUP.EQUITY_MIN, 'Minimum 0%').max(VALIDATION_LIMITS.STARTUP.EQUITY_MAX, 'Maximum 100%'),
  status: z.enum(['existing', 'invited']),
  avatar: z.string().optional(),
  invitationId: z.string().optional(),
});

const teamStepSchema = z.object({
  members: z.array(teamMemberSchema).min(VALIDATION_LIMITS.STARTUP.NAME_MIN, 'Au moins un membre requis'),
}).refine((data) => {
  const totalEquity = data.members.reduce((sum, member) => sum + member.equity, 0);
  return totalEquity <= VALIDATION_LIMITS.STARTUP.EQUITY_MAX;
}, {
  message: 'Le total des parts ne peut pas dépasser 100%',
  path: ['members'],
});

type TeamForm = z.infer<typeof teamStepSchema>;

interface TeamStepProps {
  onNext: (data: TeamForm) => void;
  onBack: () => void;
  data?: Partial<TeamForm>;
  onDataChange?: (data: Partial<TeamForm>) => void;
}

export const TeamStep = ({ onNext, onBack, data, onDataChange }: TeamStepProps) => {
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const manageInvitation = useManageStartupInvitation();

  // Récupérer les informations de l'utilisateur actuel
  const { data: currentUser } = useQuery({
    queryKey: ['selfProfile'],
    queryFn: selfProfile,
  });

  // Créer le membre par défaut avec l'utilisateur actuel
  const getDefaultMember = () => {
    if (currentUser) {
      return {
        profileId: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: `member-${currentUser.id}@onefive.local`,
        position: 'Founder',
        equity: 100,
        status: 'existing' as const,
        avatar: currentUser.avatar,
      };
    }
    return {
      profileId: '',
      firstName: '',
      lastName: '',
      email: 'creator@onefive.local',
      position: 'Founder',
      equity: 100,
      status: 'existing' as const,
      avatar: undefined,
    };
  };

  const form = useForm<TeamForm>({
    resolver: zodResolver(teamStepSchema),
    mode: 'onTouched',
    defaultValues: {
      members: data?.members || [getDefaultMember()],
    }
  });

  // Synchroniser le créateur quand currentUser charge (le formulaire peut être initialisé avant)
  useEffect(() => {
    if (!currentUser || !form.getValues('members')?.length) return;
    const members = form.getValues('members');
    const firstMember = members[0];
    const isCreatorPlaceholder = firstMember?.email === 'creator@onefive.local' || (!firstMember?.profileId && firstMember?.status === 'existing');
    if (isCreatorPlaceholder) {
      form.setValue('members.0', {
        profileId: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: `member-${currentUser.id}@onefive.local`,
        position: firstMember?.position ?? 'Founder',
        equity: firstMember?.equity ?? 100,
        status: 'existing' as const,
        avatar: currentUser.avatar,
      }, { shouldValidate: true });
    }
  }, [currentUser]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'members',
  });

  const watchedMembers = form.watch('members');
  const errors = form.formState.errors;
  const _touched = form.formState.touchedFields;

  // Calcul du total des parts (réactif)
  const totalEquity = useMemo(() => {
    if (watchedMembers && Array.isArray(watchedMembers)) {
      const total = watchedMembers.reduce((sum, member) => sum + (member.equity || 0), 0);
      return Math.max(0, 100 - total);
    }
    return 100;
  }, [watchedMembers]);

  // Vérifier la validité du formulaire pour activer le bouton
  const isFormValid = React.useMemo(() => {
    if (!watchedMembers || !Array.isArray(watchedMembers) || watchedMembers.length === 0) {
      return false;
    }

    // Vérifier que tous les membres ont un rôle (position) et que les parts sont valides
    const allMembersValid = watchedMembers.every((member, index) => {
      const hasPosition = member.position && member.position.trim() !== '';
      const hasValidEquity = typeof member.equity === 'number' && member.equity >= 0 && member.equity <= 100;
      // Vérifier que l'email est valide (Zod le valide déjà, mais on vérifie aussi la présence)
      const hasValidEmail = member.email && member.email.trim() !== '' && member.email.includes('@');
      
      // Vérifier qu'il n'y a pas d'erreurs de validation pour ce membre
      const memberErrors = errors.members?.[index];
      const hasNoErrors = !memberErrors || Object.keys(memberErrors).length === 0;
      
      return hasPosition && hasValidEquity && hasValidEmail && hasNoErrors;
    });

    // Vérifier que le total des parts ne dépasse pas 100%
    const totalParts = watchedMembers.reduce((sum, member) => sum + (member.equity || 0), 0);
    const equityValid = totalParts <= 100;

    // Vérifier qu'il n'y a pas d'erreurs globales
    const hasNoGlobalErrors = !errors.members || errors.members.message === undefined;

    return allMembersValid && equityValid && totalEquity >= 0 && hasNoGlobalErrors && form.formState.isValid;
  }, [watchedMembers, errors, totalEquity, form.formState.isValid]);

  // Mettre à jour les données parent (optimisé pour éviter les boucles infinies)
  useEffect(() => {
    if (watchedMembers) {
      onDataChange?.({ members: watchedMembers });
    }
  }, [watchedMembers]); // Retirer onDataChange des dépendances pour éviter les boucles

  const handleProfileSelect = (profile: ProfileSearchResult) => {
    const newMember = {
      profileId: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: `user-${profile.id}@onefive.local`, // Email placeholder valide pour validation
      position: '',
      equity: 0,
      status: 'existing' as const,
      avatar: profile.avatar,
    };

    append(newMember);
    setSelectedProfiles(prev => [...prev, profile.id]);

    // Ajuster automatiquement les parts de l'utilisateur actuel si c'est le premier ajout
    if (fields.length === 1 && currentUser) {
      const currentUserIndex = fields.findIndex(field => field.profileId === currentUser.id);
      if (currentUserIndex !== -1) {
        // Réduire les parts de l'utilisateur actuel à 80% et donner 20% au nouveau membre
        form.setValue(`members.${currentUserIndex}.equity`, 80);
        form.setValue(`members.${fields.length}.equity`, 20);
      }
    }
  };

  const handleEmailInvite = (email: string, firstName: string, lastName: string) => {
    const newMember = {
      profileId: '',
      firstName,
      lastName,
      email: email, // Utiliser l'email réel directement
      position: '',
      equity: 0,
      status: 'invited' as const,
      avatar: undefined,
    };

    append(newMember);

    // Ajuster automatiquement les parts de l'utilisateur actuel si c'est le premier ajout
    if (fields.length === 1 && currentUser) {
      const currentUserIndex = fields.findIndex(field => field.profileId === currentUser.id);
      if (currentUserIndex !== -1) {
        // Réduire les parts de l'utilisateur actuel à 80% et donner 20% au nouveau membre
        form.setValue(`members.${currentUserIndex}.equity`, 80);
        form.setValue(`members.${fields.length}.equity`, 20);
      }
    }
  };

  const handleSkip = () => {
    // Créer juste avec le créateur (utilisateur actuel)
    onNext({
      members: [getDefaultMember()]
    });
  };

  const updateMemberField = (index: number, field: keyof TeamForm['members'][0], value: any) => {
    form.setValue(`members.${index}.${field}` as any, value, { shouldValidate: true, shouldTouch: true });
  };

  return (
    <div className="space-y-6">
      {/* Recherche d'utilisateurs - Flow 4: Smart Search */}
      <div className="space-y-4">
        <SmartProfileSearch
          onProfileSelect={handleProfileSelect}
          onEmailInvite={handleEmailInvite}
          selectedProfiles={selectedProfiles}
          maxResults={5}
          placeholder="Rechercher sur OneFive ou entrer un email..."
        />
      </div>

      {/* Liste des membres ajoutés - Design Table Moderne */}
      <div className="overflow-hidden border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Membre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Rôle</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Parts</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {fields.map((field, index) => (
              <tr key={field.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      size="md"
                      src={resolveAvatarUrl(field.avatar)}
                      alt={field.firstName && field.lastName ? `${field.firstName} ${field.lastName}` : field.email}
                      initials={field.status === 'existing' && field.firstName && field.lastName
                        ? `${field.firstName[0]}${field.lastName[0]}`
                        : '?'}
                    />
                    <div>
                      <div className="font-medium text-sm">
                        {field.status === 'existing' && field.firstName && field.lastName
                          ? `${field.firstName} ${field.lastName}`
                          : field.status === 'invited' && field.firstName && field.lastName
                          ? `${field.firstName} ${field.lastName}`
                          : field.email
                        }
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {field.profileId === currentUser?.id && (
                          <Badge type="pill-color" color="gray" size="sm">Vous</Badge>
                        )}
                        {field.status === 'invited' && (
                          <Badge type="pill-color" color="gray" size="sm">Invitation envoyée</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <Select
                    selectedKey={form.watch(`members.${index}.position`)}
                    onSelectionChange={(key) => updateMemberField(index, 'position', key as string)}
                    items={[
                      { id: 'CEO', label: 'CEO' },
                      { id: 'CTO', label: 'CTO' },
                      { id: 'CMO', label: 'CMO' },
                      { id: 'CFO', label: 'CFO' },
                      { id: 'Co-founder', label: 'Co-founder' },
                      { id: 'Lead Developer', label: 'Lead Developer' },
                      { id: 'Product Manager', label: 'Product Manager' },
                      { id: 'Designer', label: 'Designer' }
                    ]}
                  >
                    {(item) => <Select.Item id={item.id} label={item.label} />}
                  </Select>
                  {form.formState.errors.members?.[index]?.position && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.members[index]?.position?.message}
                    </p>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="w-24">
                    <Input
                      type="number"
                      value={form.watch(`members.${index}.equity`)?.toString() || '0'}
                      onChange={(value: string) => {
                        const numValue = value === '' ? 0 : parseInt(value, 10);
                        if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                          updateMemberField(index, 'equity', numValue);
                        }
                      }}
                    />
                  </div>
                  {form.formState.errors.members?.[index]?.equity && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.members[index]?.equity?.message}
                    </p>
                  )}
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {field.status === 'invited' && (
                      <Button
                        type="button"
                        color="tertiary"
                        size="sm"
                        onClick={() => {
                          if (field.invitationId) {
                            manageInvitation.mutate({ invitationId: field.invitationId, action: 'cancel' });
                          }
                          remove(index);
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                        aria-label="Annuler l'invitation"
                        iconLeading={<X data-icon />}
                      />
                    )}
                    <Button
                      type="button"
                      color="tertiary"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                      isDisabled={fields.length === 1 || field.profileId === currentUser?.id}
                      aria-label={field.profileId === currentUser?.id ? "Vous ne pouvez pas vous supprimer" : "Supprimer"}
                      iconLeading={<Trash2 data-icon />}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 gap-3">
        <Button type="button" color="secondary" onClick={onBack}>
          Retour
        </Button>

        <div className="flex gap-3">
          <Button
            type="button"
            color="tertiary"
            onClick={handleSkip}
            className="text-gray-600"
            iconLeading={<SkipForward data-icon />}
          >
            Plus tard
          </Button>
          <Button
            type="submit"
            color="primary"
            onClick={form.handleSubmit(onNext)}
            isDisabled={!isFormValid}
            className="bg-[#5E6AD2] hover:bg-[#5E6AD2]/90"
          >
            Créer la startup
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TeamStep;
