import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Input } from '@/components/base/input/input';
import { PositionSelect } from '@/components/startup/PositionSelect';
import { Button } from '@/components/base/buttons/button';
import { Avatar } from '@/components/base/avatar/avatar';
import { Badge } from '@/components/base/badges/badges';
import { Trash2, Plus, CheckCircle2, Users, Loader2 } from 'lucide-react';
import { SmartProfileSearch } from '@/components/startup/SmartProfileSearch';
import { ProfileSearchResult, useAddMember, useUpdateMember, useRemoveMember } from '@/queries/startup';
import { Modal, ModalOverlay, Dialog as ModalDialog } from '@/components/application/modals/modal';
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from 'react-aria-components';
import { CloseButton } from '@/components/base/buttons/close-button';
import { resolveAvatarUrl } from '@/utils/avatar';
import { VALIDATION_LIMITS } from '@/constants/validation-limits';

const founderSchema = z.object({
  id: z.string().optional(),
  memberId: z.string().optional(),
  profileId: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  name: z.string().min(VALIDATION_LIMITS.STARTUP.NAME_MIN, 'Nom requis').max(VALIDATION_LIMITS.STARTUP.NAME_MAX, `Maximum ${VALIDATION_LIMITS.STARTUP.NAME_MAX} caractères`),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  position: z.string().min(VALIDATION_LIMITS.STARTUP.NAME_MIN, 'Rôle requis').max(VALIDATION_LIMITS.STARTUP.POSITION_MAX, `Maximum ${VALIDATION_LIMITS.STARTUP.POSITION_MAX} caractères`),
  equity: z.number().min(VALIDATION_LIMITS.STARTUP.EQUITY_MIN, 'Minimum 0%').max(VALIDATION_LIMITS.STARTUP.EQUITY_MAX, 'Maximum 100%'),
  avatar: z.string().optional(),
  isNew: z.boolean().optional(),
});

const editAllFoundersSchema = z.object({
  founders: z.array(founderSchema).min(VALIDATION_LIMITS.STARTUP.NAME_MIN, 'Au moins un fondateur requis'),
}).refine((data) => {
  const totalEquity = data.founders.reduce((sum, founder) => sum + founder.equity, 0);
  return totalEquity <= VALIDATION_LIMITS.STARTUP.EQUITY_MAX;
}, {
  message: 'Le total des parts ne peut pas dépasser 100%',
  path: ['founders'],
});

type EditAllFoundersForm = z.infer<typeof editAllFoundersSchema>;

interface FounderData {
  id: string;
  memberId?: string;
  name: string;
  position?: string;
  role?: string;
  capitalStock: string | number | null;
  avatar?: string;
  email?: string;
  profileId?: string;
}

interface EditAllFoundersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startupId: string;
  founders: FounderData[];
  onSuccess?: () => void;
}

export const EditAllFoundersModal: React.FC<EditAllFoundersModalProps> = ({
  open,
  onOpenChange,
  startupId,
  founders,
  onSuccess,
}) => {
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [equityValues, setEquityValues] = useState<number[]>([]);
  const [isAddFounderModalOpen, setIsAddFounderModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const originalFoundersRef = useRef<FounderData[]>([]);

  const addMemberMutation = useAddMember();
  const updateMemberMutation = useUpdateMember();
  const removeMemberMutation = useRemoveMember();

  const getDefaultFounders = () => {
    return founders.map((founder) => {
      const raw = founder.capitalStock;
      const capitalStockNumber =
        typeof raw === 'number'
          ? raw
          : typeof raw === 'string'
            ? parseFloat(raw.replace('%', '').trim()) || 0
            : 0;
      const nameParts = founder.name.split(' ');
      return {
        id: founder.id,
        memberId: founder.memberId,
        profileId: founder.profileId || founder.id,
        name: founder.name,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: founder.email || '',
        position: founder.position || founder.role || '',
        equity: capitalStockNumber,
        avatar: resolveAvatarUrl(founder.avatar) || founder.avatar,
        isNew: false,
      };
    });
  };

  const form = useForm<EditAllFoundersForm>({
    resolver: zodResolver(editAllFoundersSchema),
    mode: 'onChange',
    defaultValues: {
      founders: getDefaultFounders(),
    }
  });

  const { fields, append, remove: removeFounder } = useFieldArray({
    control: form.control,
    name: 'founders',
  });

  // Wrapper pour remove qui met à jour equityValues et revalide
  const remove = (index: number) => {
    removeFounder(index);
    setEquityValues(prev => prev.filter((_, i) => i !== index));
    setTimeout(() => form.trigger(), 0);
  };

  // Surveiller tous les champs pour une mise à jour en temps réel
  const formValues = form.watch();
  const watchedFounders = formValues.founders;
  const errors = form.formState.errors;

  useEffect(() => {
    if (open && founders.length > 0) {
      const defaultFounders = getDefaultFounders();
      form.reset({
        founders: defaultFounders,
      });
      originalFoundersRef.current = [...founders];
      setSelectedProfiles(founders.map(f => f.id).filter(Boolean) as string[]);
      setEquityValues(defaultFounders.map(f => f.equity || 0));
      // Trigger validation so isValid reflects the initial data immediately
      setTimeout(() => form.trigger(), 0);
    }
  }, [open]);

  // Synchroniser equityValues avec les changements du formulaire (ajout/suppression)
  useEffect(() => {
    const currentFounders = form.getValues('founders');
    if (currentFounders) {
      const newEquityValues = currentFounders.map(f => f.equity || 0);
      // Mettre à jour seulement si la longueur a changé (ajout/suppression)
      if (newEquityValues.length !== equityValues.length) {
        setEquityValues(newEquityValues);
      }
    }
  }, [fields.length]);

  // Calcul du total des parts restantes - se met à jour en temps réel
  const totalEquity = useMemo(() => {
    const total = equityValues.reduce((sum, equity) => sum + (equity || 0), 0);
    return Math.max(0, 100 - total);
  }, [equityValues]);

  // Vérifier la validité du formulaire
  const isFormValid = React.useMemo(() => {
    if (!watchedFounders || !Array.isArray(watchedFounders) || watchedFounders.length === 0) {
      return false;
    }

    const allFoundersValid = watchedFounders.every((founder, index) => {
      const hasName = founder.name && founder.name.trim() !== '';
      const hasPosition = founder.position && founder.position.trim() !== '';
      const hasValidEquity = typeof founder.equity === 'number' && founder.equity >= 0 && founder.equity <= 100;
      
      const founderErrors = errors.founders?.[index];
      const hasNoErrors = !founderErrors || Object.keys(founderErrors).length === 0;
      
      return hasName && hasPosition && hasValidEquity && hasNoErrors;
    });

    const totalParts = watchedFounders.reduce((sum, founder) => sum + (founder.equity || 0), 0);
    const equityValid = totalParts <= 100;

    const hasNoGlobalErrors = !errors.founders || errors.founders.message === undefined;

    return allFoundersValid && equityValid && totalEquity >= 0 && hasNoGlobalErrors && form.formState.isValid;
  }, [watchedFounders, errors, totalEquity, form.formState.isValid]);

  const handleProfileSelect = (profile: ProfileSearchResult) => {
    const newFounder = {
      profileId: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      name: `${profile.firstName} ${profile.lastName}`,
      email: `user-${profile.id}@onefive.local`,
      position: '',
      equity: 0,
      avatar: profile.avatar,
      isNew: true,
    };

    append(newFounder);
    setSelectedProfiles(prev => [...prev, profile.id]);
    // Mettre à jour les valeurs d'equity immédiatement
    setEquityValues(prev => [...prev, 0]);
  };

  const handleEmailInvite = (email: string, firstName: string, lastName: string) => {
    const newFounder = {
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email: email,
      position: '',
      equity: 0,
      avatar: undefined,
      isNew: true,
    };

    append(newFounder);
    // Mettre à jour les valeurs d'equity immédiatement
    setEquityValues(prev => [...prev, 0]);
  };

  const updateFounderField = (index: number, field: keyof EditAllFoundersForm['founders'][0], value: any) => {
    form.setValue(`founders.${index}.${field}` as any, value, { 
      shouldValidate: true, 
      shouldTouch: true,
      shouldDirty: true 
    });
    // Mettre à jour le state local immédiatement pour les equity
    if (field === 'equity') {
      setEquityValues(prev => {
        const newValues = [...prev];
        newValues[index] = typeof value === 'number' ? value : parseFloat(value) || 0;
        return newValues;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit(async (data) => {
      setIsSaving(true);
      try {
        const original = originalFoundersRef.current;

        // Use profileId (= profile.id) as the stable identifier — always available
        // regardless of whether the backend has returned memberId yet.
        // The backend update/remove handlers accept both memberId and profileId.
        const originalProfileIds = new Set(original.map(f => f.id).filter(Boolean));
        const currentProfileIds = new Set(
          data.founders.map(f => f.profileId).filter(Boolean)
        );

        const removedFounders = original.filter(
          f => f.id && !currentProfileIds.has(f.id)
        );

        const updatedFounders = data.founders.filter(f => {
          if (f.isNew || !f.profileId) return false;
          const orig = original.find(o => o.id === f.profileId);
          if (!orig) return false;
          const raw = orig.capitalStock;
          const origEquity =
            typeof raw === 'number'
              ? raw
              : typeof raw === 'string'
                ? parseFloat(raw.replace('%', '').trim()) || 0
                : 0;
          const origPosition = orig.position || orig.role || '';
          return f.position !== origPosition || f.equity !== origEquity;
        });

        // Truly new: profileId not present in the original founders list at all
        const newFounders = data.founders.filter(
          f => f.isNew || !f.profileId || !originalProfileIds.has(f.profileId)
        );

        const promises: Promise<unknown>[] = [];

        for (const founder of removedFounders) {
          // Use memberId if available, fall back to profileId (id)
          const identifier = founder.memberId || founder.id;
          if (identifier) {
            promises.push(
              removeMemberMutation.mutateAsync({
                startupId,
                memberId: identifier,
              })
            );
          }
        }

        for (const founder of updatedFounders) {
          // Use memberId if available, fall back to profileId
          const identifier = founder.memberId || founder.profileId;
          if (identifier) {
            promises.push(
              updateMemberMutation.mutateAsync({
                startupId,
                memberId: identifier,
                payload: {
                  position: founder.position,
                  equity: founder.equity,
                  isFounder: true,
                },
              })
            );
          }
        }

        for (const founder of newFounders) {
          promises.push(
            addMemberMutation.mutateAsync({
              startupId,
              payload: {
                profileId: founder.profileId || undefined,
                email: founder.email && !founder.email.includes('onefive.local') ? founder.email : undefined,
                firstName: founder.firstName || undefined,
                lastName: founder.lastName || undefined,
                position: founder.position,
                isFounder: true,
                equity: founder.equity,
              },
            })
          );
        }

        await Promise.all(promises);
        toast.success('Fondateurs mis à jour avec succès !');
        onSuccess?.();
        onOpenChange(false);
      } catch (err: any) {
        toast.error(err.message || 'Erreur lors de la sauvegarde');
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const handleAddNew = () => {
    setIsAddFounderModalOpen(true);
  };

  return (
    <>
      <AriaDialogTrigger isOpen={open} onOpenChange={onOpenChange}>
        <button type="button" style={{ display: 'none' }}>Toggle founders modal</button>
        <ModalOverlay isDismissable>
          <Modal className="max-w-4xl">
            <ModalDialog>
              <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl transition-all">
                <CloseButton
                  onClick={() => onOpenChange(false)}
                  theme="light"
                  size="lg"
                  className="absolute right-3 top-3 z-10"
                />

                {/* Header */}
                <div className="flex flex-col gap-0.5 px-4 pt-5 sm:px-6 sm:pt-6">
                  <AriaHeading slot="title" className="text-md font-semibold text-primary flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-violet-100 rounded-lg">
                      <Users className="h-5 w-5 text-violet-600" />
                    </div>
                    Gérer les fondateurs et leurs parts
                  </AriaHeading>
                  <p className="text-sm text-tertiary">
                    Ajoutez, modifiez ou ajustez les parts des membres fondateurs.
                  </p>
                </div>

                <div className="h-5 w-full" />

                <form onSubmit={handleSubmit} className="flex flex-col">
                  <div className="flex flex-col gap-4 px-4 sm:px-6 max-h-[60vh] overflow-y-auto">
                    {/* Add Founder Button */}
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={handleAddNew}
                        color="primary"
                        iconLeading={<Plus data-icon />}
                      >
                        Ajouter un fondateur
                      </Button>
                    </div>

                    {/* Founders List */}
                    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Membre</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Rôle</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Parts (%)</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 w-20"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {fields.map((field, index) => {
                            const founder = watchedFounders?.[index];
                            const isYC = founder?.name?.includes('YC') || false;
                            const avatarUrl = resolveAvatarUrl(field.avatar);

                            return (
                              <tr key={field.id} className="transition-colors hover:bg-gray-50">
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-3">
                                    <Avatar
                                      size="md"
                                      src={avatarUrl}
                                      alt={field.name}
                                      initials={field.firstName && field.lastName
                                        ? `${field.firstName[0]}${field.lastName[0]}`
                                        : field.name
                                          ? getInitials(field.name)
                                          : '?'}
                                      className="shrink-0 ring-2 ring-white shadow-sm"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2">
                                        <div className="truncate text-sm font-medium text-gray-900">
                                          {field.name || (field.firstName && field.lastName ? `${field.firstName} ${field.lastName}` : field.email)}
                                        </div>
                                        {isYC && (
                                          <Badge color="warning" size="sm" className="flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" />
                                            YC
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="text-xs text-gray-500 truncate">
                                        {field.email && !field.email.includes('onefive.local') ? field.email : ''}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="w-40">
                                    <PositionSelect
                                      value={form.watch(`founders.${index}.position`) || ''}
                                      onChange={(value) => updateFounderField(index, 'position', value)}
                                      isInvalid={!!form.formState.errors.founders?.[index]?.position}
                                      hint={form.formState.errors.founders?.[index]?.position?.message}
                                    />
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="w-20">
                                    <Input
                                      type="number"
                                      value={form.watch(`founders.${index}.equity`)?.toString() || '0'}
                                      onChange={(value: string) => {
                                        const numValue = value === '' ? 0 : parseInt(value, 10);
                                        if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                                          updateFounderField(index, 'equity', numValue);
                                        }
                                      }}
                                    />
                                    {form.formState.errors.founders?.[index]?.equity && (
                                      <p className="mt-1 text-xs text-red-500">
                                        {form.formState.errors.founders[index]?.equity?.message}
                                      </p>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-right">
                                  <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    disabled={fields.length === 1}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    title={fields.length === 1 ? 'Au moins un fondateur requis' : 'Supprimer'}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Equity Summary */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">{fields.length}</span> fondateur{fields.length > 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-gray-600">
                            Total : <span className="font-semibold text-gray-900">{equityValues.reduce((sum, equity) => sum + (equity || 0), 0)}%</span>
                          </div>
                          <div className={`font-semibold ${totalEquity < 0 ? 'text-red-600' : totalEquity === 0 ? 'text-green-600' : 'text-amber-600'}`}>
                            Restant : {totalEquity}%
                          </div>
                        </div>
                      </div>
                      {errors.founders?.message && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-sm font-medium text-red-600">{errors.founders.message}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        color="secondary"
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="flex-1"
                      >
                        Annuler
                      </Button>
                      <Button
                        color="primary"
                        type="submit"
                        isDisabled={!isFormValid || isSaving}
                        className="flex-1"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Enregistrement...
                          </>
                        ) : (
                          'Enregistrer les modifications'
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="h-6 w-full" />
                </form>
              </div>
            </ModalDialog>
          </Modal>
        </ModalOverlay>
      </AriaDialogTrigger>

      <AriaDialogTrigger isOpen={isAddFounderModalOpen} onOpenChange={setIsAddFounderModalOpen}>
        <button type="button" style={{ display: 'none' }}>Toggle add founder modal</button>
        <ModalOverlay isDismissable>
          <Modal className="max-w-md">
            <ModalDialog>
              <div className="relative w-full overflow-hidden rounded-xl bg-white shadow-xl transition-all">
                <CloseButton
                  onClick={() => setIsAddFounderModalOpen(false)}
                  theme="light"
                  size="sm"
                  className="absolute right-4 top-4 z-10"
                />
                <div className="flex flex-col gap-2 text-center sm:text-left px-6 pt-6">
                  <AriaHeading slot="title" className="text-lg leading-none font-semibold">
                    Ajouter un fondateur
                  </AriaHeading>
                </div>
                <div className="p-6 pt-4">
                  <SmartProfileSearch
                    onProfileSelect={(profile) => {
                      handleProfileSelect(profile);
                      setIsAddFounderModalOpen(false);
                    }}
                    onEmailInvite={(email, firstName, lastName) => {
                      handleEmailInvite(email, firstName, lastName);
                      setIsAddFounderModalOpen(false);
                    }}
                    selectedProfiles={selectedProfiles}
                    maxResults={5}
                    placeholder="Rechercher sur OneFive ou entrer un email..."
                  />
                </div>
              </div>
            </ModalDialog>
          </Modal>
        </ModalOverlay>
      </AriaDialogTrigger>
    </>
  );
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export default EditAllFoundersModal;

