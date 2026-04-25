import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/base/input/input';
import { PositionSelect } from '@/components/startup/PositionSelect';
import { Button } from '@/components/base/buttons/button';
import { Avatar } from '@/components/base/avatar/avatar';
import { Select } from '@/components/base/select/select';
import { Checkbox } from '@/components/base/checkbox/checkbox';
import { Trash2, Users, X, Pencil, Loader2, Shield, ShieldCheck } from 'lucide-react';
import { useUpdateMember, useRemoveMember } from '@/queries/startup';
import { Modal, ModalOverlay, Dialog as ModalDialog } from '@/components/application/modals/modal';
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from 'react-aria-components';
import { CloseButton } from '@/components/base/buttons/close-button';
import { resolveAvatarUrl } from '@/utils/avatar';
import { ConfirmWithNameModal } from './ConfirmWithNameModal';
import type { MemberData } from '@/components/startup/MembersTable';

interface FounderData {
  id: string;
  memberId?: string;
  name: string;
  position?: string;
  role?: string;
  capitalStock?: string | number | null;
  avatar?: string;
  email?: string;
  profileId?: string;
}

interface EditTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startupId: string;
  founders: FounderData[];
  teamMembers: MemberData[];
  userRole?: string;
  currentProfileId?: string;
  onSuccess?: () => void;
}

interface UnifiedMember {
  id: string;
  memberId?: string;
  profileId?: string;
  name: string;
  position: string;
  role: string;
  isFounder: boolean;
  equity: number;
  avatar?: string | null;
  email?: string;
}

const PERMISSION_ROLE_OPTIONS = [
  { id: 'ADMIN', label: 'Admin' },
  { id: 'MEMBER', label: 'Membre' },
];

const PERMISSION_ROLE_LABELS: Record<string, string> = {
  'SUPER_ADMIN': 'Créateur',
  'ADMIN': 'Admin',
  'MEMBER': 'Membre',
};

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function parseEquity(raw: string | number | null | undefined): number {
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') return parseFloat(raw.replace('%', '').trim()) || 0;
  return 0;
}

function buildUnifiedList(founders: FounderData[], teamMembers: MemberData[]): UnifiedMember[] {
  const list: UnifiedMember[] = [];

  for (const f of founders) {
    list.push({
      id: f.id,
      memberId: f.memberId,
      profileId: f.profileId || f.id,
      name: f.name,
      position: f.position || '',
      role: f.role || 'ADMIN',
      isFounder: true,
      equity: parseEquity(f.capitalStock),
      avatar: f.avatar,
      email: f.email,
    });
  }

  for (const m of teamMembers) {
    if (list.some(existing => existing.id === m.id || existing.profileId === m.profileId)) continue;
    list.push({
      id: m.id,
      memberId: m.memberId,
      profileId: m.profileId,
      name: m.name,
      position: m.position || '',
      role: m.role || 'MEMBER',
      isFounder: m.isFounder ?? false,
      equity: m.equity ?? 0,
      avatar: m.avatar,
      email: m.email,
    });
  }

  return list;
}

interface EditForm {
  position: string;
  role: string;
  isFounder: boolean;
  showEquity: boolean;
  equity: number;
}

export const EditTeamModal: React.FC<EditTeamModalProps> = ({
  open,
  onOpenChange,
  startupId,
  founders,
  teamMembers,
  userRole,
  currentProfileId,
  onSuccess,
}) => {
  const [members, setMembers] = useState<UnifiedMember[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ position: '', role: 'MEMBER', isFounder: false, showEquity: false, equity: 0 });
  const [savingId, setSavingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmRemoveMember, setConfirmRemoveMember] = useState<UnifiedMember | null>(null);

  const updateMemberMutation = useUpdateMember();
  const removeMemberMutation = useRemoveMember();

  const isCreator = userRole === 'SUPER_ADMIN';

  useEffect(() => {
    if (open) {
      setMembers(buildUnifiedList(founders, teamMembers));
      setEditingId(null);
      setEditForm({ position: '', role: 'MEMBER', isFounder: false, showEquity: false, equity: 0 });
    }
  }, [open, founders, teamMembers]);

  const foundersCount = members.filter(m => m.isFounder).length;
  const membersCount = members.filter(m => !m.isFounder).length;
  const totalEquity = useMemo(() => members.reduce((sum, m) => sum + m.equity, 0), [members]);
  const remainingEquity = 100 - totalEquity;

  const projectedTotalForEdit = useMemo(() => {
    if (!editingId) return totalEquity;
    const member = members.find(m => m.id === editingId);
    if (!member) return totalEquity;
    const newEquity = editForm.isFounder && editForm.showEquity ? editForm.equity : 0;
    return totalEquity - member.equity + newEquity;
  }, [editingId, members, totalEquity, editForm.isFounder, editForm.showEquity, editForm.equity]);

  const isEquityOverflow = projectedTotalForEdit > 100;

  const isSelf = (member: UnifiedMember) =>
    !!currentProfileId && (member.profileId === currentProfileId || member.id === currentProfileId);

  const canEditMember = (member: UnifiedMember) => {
    // Always allow editing one's own profile
    if (isSelf(member)) return true;
    // A SUPER_ADMIN entry can only be edited by the creator (themselves — covered above via isSelf,
    // but also allow via isCreator in case currentProfileId is not yet resolved)
    if (member.role === 'SUPER_ADMIN') return isCreator;
    // Only the creator can edit an admin
    if (member.role === 'ADMIN' && !isCreator) return false;
    return true;
  };

  const canRemoveMember = (member: UnifiedMember) => {
    // Cannot remove the creator
    if (member.role === 'SUPER_ADMIN') return false;
    // Only the creator can remove an admin
    if (member.role === 'ADMIN' && !isCreator) return false;
    return true;
  };

  const startEdit = (member: UnifiedMember) => {
    setEditingId(member.id);
    setEditForm({
      position: member.position,
      role: member.role === 'SUPER_ADMIN' ? 'ADMIN' : member.role,
      isFounder: member.isFounder,
      showEquity: member.isFounder && member.equity > 0,
      equity: member.equity,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ position: '', role: 'MEMBER', isFounder: false, showEquity: false, equity: 0 });
  };

  const saveEdit = async (member: UnifiedMember) => {
    const identifier = member.memberId || member.profileId || member.id;
    if (!identifier) return;

    const newEquity = editForm.isFounder && editForm.showEquity ? editForm.equity : 0;
    const projectedTotal = totalEquity - member.equity + newEquity;
    if (projectedTotal > 100) {
      toast.error('Le total des parts ne peut pas dépasser 100%');
      return;
    }

    setSavingId(member.id);
    try {
      await updateMemberMutation.mutateAsync({
        startupId,
        memberId: identifier,
        payload: {
          position: editForm.position,
          role: editForm.role as 'ADMIN' | 'MEMBER',
          isFounder: editForm.isFounder,
          equity: editForm.isFounder && editForm.showEquity ? editForm.equity : 0,
        },
      });

      setMembers(prev => prev.map(m =>
        m.id === member.id
          ? { ...m, position: editForm.position, role: editForm.role, isFounder: editForm.isFounder, equity: editForm.isFounder && editForm.showEquity ? editForm.equity : 0 }
          : m
      ));
      setEditingId(null);
      toast.success('Membre mis à jour');
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setSavingId(null);
    }
  };

  const handleRemoveConfirmed = async () => {
    if (!confirmRemoveMember) return;
    const member = confirmRemoveMember;
    const identifier = member.memberId || member.profileId || member.id;
    if (!identifier) return;

    setRemovingId(member.id);
    setConfirmRemoveMember(null);
    try {
      await removeMemberMutation.mutateAsync({ startupId, memberId: identifier });
      setMembers(prev => prev.filter(m => m.id !== member.id));
      if (editingId === member.id) cancelEdit();
      toast.success('Membre retiré');
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <>
      <AriaDialogTrigger isOpen={open} onOpenChange={onOpenChange}>
        <button type="button" style={{ display: 'none' }}>Trigger</button>
        <ModalOverlay isDismissable>
          <Modal className="max-w-2xl">
            <ModalDialog>
              <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl">
                <CloseButton onClick={() => onOpenChange(false)} theme="light" size="lg" className="absolute right-3 top-3 z-10" />

                <div className="px-4 pt-5 sm:px-6 sm:pt-6">
                  <div className="flex flex-col gap-0.5">
                    <AriaHeading slot="title" className="text-md font-semibold text-primary flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
                        <Users className="h-5 w-5 text-violet-600" />
                      </div>
                      Gérer l'équipe
                    </AriaHeading>
                    <p className="text-sm text-tertiary">
                      Fondateurs ({foundersCount}) · Membres ({membersCount})
                    </p>
                  </div>
                </div>

                <div className="mt-5 max-h-[60vh] overflow-y-auto">
                  {members.length === 0 ? (
                    <div className="py-12 text-center text-sm text-tertiary">
                      Aucun membre. Ajoutez quelqu'un pour commencer.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {members.map(member => {
                        const isEditing = editingId === member.id;
                        const avatarUrl = resolveAvatarUrl(member.avatar);
                        const editable = canEditMember(member);
                        const removable = canRemoveMember(member);

                        return (
                          <div key={member.id}>
                            <div className={`flex items-center gap-3 px-4 py-3.5 sm:px-6 group transition-colors ${isEditing ? 'bg-violet-50/40' : 'hover:bg-gray-50/50'}`}>
                              <Avatar
                                size="md"
                                src={avatarUrl}
                                alt={member.name}
                                initials={getInitials(member.name)}
                                className="shrink-0 ring-2 ring-white shadow-sm"
                              />

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="truncate text-sm font-medium text-primary">{member.name}</span>
                                  {member.isFounder && (
                                    <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
                                      Fondateur
                                    </span>
                                  )}
                                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
                                    member.role === 'SUPER_ADMIN' ? 'border-purple-200 bg-purple-50 text-purple-700' :
                                    member.role === 'ADMIN' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                                    'border-gray-200 bg-gray-50 text-gray-700'
                                  }`}>
                                    {member.role === 'SUPER_ADMIN' || member.role === 'ADMIN' ? <ShieldCheck className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                                    {PERMISSION_ROLE_LABELS[member.role] || member.role}
                                  </span>
                                </div>
                                {member.position && (
                                  <span className="text-xs text-tertiary">{member.position}</span>
                                )}
                              </div>

                              {member.isFounder && member.equity > 0 && (
                                <div className="hidden sm:flex items-center gap-2 shrink-0">
                                  <span className="text-sm font-medium text-secondary">{member.equity}%</span>
                                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                                    <div className="h-full rounded-full bg-violet-400" style={{ width: `${member.equity}%` }} />
                                  </div>
                                </div>
                              )}

                              <div className="flex shrink-0 items-center gap-0.5">
                                {editable && (
                                  isEditing ? (
                                    <button
                                      onClick={cancelEdit}
                                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => startEdit(member)}
                                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-violet-50 hover:text-violet-600 opacity-0 group-hover:opacity-100"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </button>
                                  )
                                )}
                                {removable && (
                                    <button
                                      onClick={() => setConfirmRemoveMember(member)}
                                      disabled={removingId === member.id}
                                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                    >
                                    {removingId === member.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>

                            {isEditing && (
                              <div className="border-t border-violet-100/50 bg-violet-50/20 px-4 py-4 sm:px-6">
                                <div className="max-w-md space-y-4">
                                  <PositionSelect
                                    label="Poste"
                                    value={editForm.position}
                                    onChange={(value) => setEditForm(prev => ({ ...prev, position: value }))}
                                    placeholder="Ex: CEO, CTO, Product Manager..."
                                  />

                                  {member.role !== 'SUPER_ADMIN' && (
                                    <div>
                                      <label className="mb-1.5 block text-sm font-medium text-secondary">Rôle (permissions)</label>
                                      <Select
                                        aria-label="Rôle"
                                        selectedKey={editForm.role}
                                        onSelectionChange={(key) => setEditForm(prev => ({ ...prev, role: key as string }))}
                                        items={PERMISSION_ROLE_OPTIONS}
                                        placeholder="Sélectionner..."
                                      >
                                        {(item) => <Select.Item id={item.id} label={item.label} />}
                                      </Select>
                                      <p className="mt-1 text-xs text-tertiary">
                                        {editForm.role === 'ADMIN' ? 'Peut modifier la startup et gérer les membres' : 'Lecture seule'}
                                      </p>
                                    </div>
                                  )}

                                  <Checkbox
                                    isSelected={editForm.isFounder}
                                    onChange={(checked) => setEditForm(prev => ({
                                      ...prev,
                                      isFounder: checked,
                                      showEquity: checked ? prev.showEquity : false,
                                      equity: checked ? prev.equity : 0,
                                    }))}
                                    label="Fondateur"
                                    hint="Cochez si cette personne est co-fondatrice"
                                  />

                                  {editForm.isFounder && (
                                    <>
                                      <Checkbox
                                        isSelected={editForm.showEquity}
                                        onChange={(checked) => setEditForm(prev => ({
                                          ...prev,
                                          showEquity: checked,
                                          equity: checked ? prev.equity : 0,
                                        }))}
                                        label="Afficher les parts (equity)"
                                        hint="Optionnel. Cochez pour définir un pourcentage."
                                      />
                                      {editForm.showEquity && (
                                        <>
                                          <div className="w-32">
                                            <Input
                                              label="Equity (%)"
                                              type="number"
                                              value={editForm.equity.toString()}
                                              onChange={(value: string) => {
                                                const num = value === '' ? 0 : parseInt(value, 10);
                                                if (!isNaN(num) && num >= 0 && num <= 100) {
                                                  setEditForm(prev => ({ ...prev, equity: num }));
                                                }
                                              }}
                                            />
                                          </div>
                                          {isEquityOverflow && (
                                            <p className="text-sm text-red-600">
                                              Le total des parts ne peut pas dépasser 100% (actuellement {projectedTotalForEdit}%).
                                            </p>
                                          )}
                                        </>
                                      )}
                                    </>
                                  )}

                                  <div className="flex gap-2 pt-1">
                                    <Button color="secondary" size="sm" onClick={cancelEdit}>
                                      Annuler
                                    </Button>
                                    <Button
                                      color="primary"
                                      size="sm"
                                      onClick={() => saveEdit(member)}
                                      isDisabled={savingId === member.id || !editForm.position.trim() || isEquityOverflow}
                                    >
                                      {savingId === member.id ? (
                                        <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Enregistrement...</>
                                      ) : (
                                        'Enregistrer'
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {members.some(m => m.isFounder) && (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 py-3.5 sm:px-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-tertiary">
                        {members.length} membre{members.length > 1 ? 's' : ''}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-secondary">
                          Total : <span className="font-semibold text-primary">{totalEquity}%</span>
                        </span>
                        <span className={`font-semibold ${remainingEquity < 0 ? 'text-red-600' : remainingEquity === 0 ? 'text-green-600' : 'text-amber-600'}`}>
                          Restant : {remainingEquity}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="h-1" />
              </div>
            </ModalDialog>
          </Modal>
        </ModalOverlay>
      </AriaDialogTrigger>

      {confirmRemoveMember && (
        <ConfirmWithNameModal
          open={!!confirmRemoveMember}
          onOpenChange={(open) => { if (!open) setConfirmRemoveMember(null); }}
          title="Retirer un membre"
          description={`Vous êtes sur le point de retirer ${confirmRemoveMember.name} de l'équipe. Cette action est irréversible.`}
          confirmLabel="Retirer"
          nameToConfirm={confirmRemoveMember.name}
          variant="danger"
          isLoading={removingId === confirmRemoveMember.id}
          onConfirm={handleRemoveConfirmed}
        />
      )}
    </>
  );
};

export default EditTeamModal;
