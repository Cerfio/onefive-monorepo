'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/base/badges/badges';
import { UserPlus, Settings, LogOut, Clock, Mail, User2, X, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FoundersTable } from './FoundersTable';
import { MembersTable, MemberData } from './MembersTable';
import { AddMemberModal } from './modals/AddMemberModal';
import { EditTeamModal } from './modals/EditTeamModal';
import { ConfirmWithNameModal } from './modals/ConfirmWithNameModal';
import { ConfirmModal } from './modals/ConfirmModal';
import { TransferOwnershipModal } from './modals/TransferOwnershipModal';
import {
  useLeaveStartup,
  useDeleteStartup,
  useStartupPendingInvitations,
  useCancelStartupInvitation,
  PendingInvitation,
} from '@/queries/startup';

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

interface TeamSectionProps {
  founders: FounderData[];
  teamMembers: MemberData[];
  startupId: string;
  startupName?: string;
  userRole?: string;
  currentProfileId?: string;
  canEdit?: boolean;
  isMember?: boolean;
  onUpdate?: () => void;
  /** Contrôlé par la page : ouverture des modals Transférer / Supprimer / Quitter depuis le header */
  transferModalOpen?: boolean;
  onTransferModalOpenChange?: (open: boolean) => void;
  deleteModalOpen?: boolean;
  onDeleteModalOpenChange?: (open: boolean) => void;
  leaveModalOpen?: boolean;
  onLeaveModalOpenChange?: (open: boolean) => void;
}

export const TeamSection: React.FC<TeamSectionProps> = ({
  founders,
  teamMembers,
  startupId,
  startupName,
  userRole,
  currentProfileId,
  canEdit,
  isMember,
  onUpdate,
  transferModalOpen: controlledTransferOpen,
  onTransferModalOpenChange: onControlledTransferChange,
  deleteModalOpen: controlledDeleteOpen,
  onDeleteModalOpenChange: onControlledDeleteChange,
  leaveModalOpen: controlledLeaveOpen,
  onLeaveModalOpenChange: onControlledLeaveChange,
}) => {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [internalLeaveOpen, setInternalLeaveOpen] = useState(false);
  const isLeaveModalOpen = controlledLeaveOpen ?? internalLeaveOpen;
  const setIsLeaveModalOpen = onControlledLeaveChange ?? setInternalLeaveOpen;
  const [internalTransferOpen, setInternalTransferOpen] = useState(false);
  const [internalDeleteOpen, setInternalDeleteOpen] = useState(false);

  const isTransferModalOpen = controlledTransferOpen ?? internalTransferOpen;
  const setIsTransferModalOpen = onControlledTransferChange ?? setInternalTransferOpen;
  const isDeleteModalOpen = controlledDeleteOpen ?? internalDeleteOpen;
  const setIsDeleteModalOpen = onControlledDeleteChange ?? setInternalDeleteOpen;

  const hasEditPermissions = canEdit && (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN');
  const isCreator = userRole === 'SUPER_ADMIN';
  const showCapitalColumn = founders.some((f) => f.capitalStock != null && f.capitalStock !== '—');

  const leaveStartupMutation = useLeaveStartup();
  const deleteStartupMutation = useDeleteStartup();
  const cancelInvitationMutation = useCancelStartupInvitation();
  const [cancellingInvitationId, setCancellingInvitationId] = useState<string | null>(null);
  const [confirmCancelInvitation, setConfirmCancelInvitation] = useState<PendingInvitation | null>(null);
  const { data: pendingInvitations = [] } = useStartupPendingInvitations(startupId, hasEditPermissions === true);

  const handleCancelInvitationConfirmed = async () => {
    if (!confirmCancelInvitation) return;
    const invitationId = confirmCancelInvitation.id;
    setCancellingInvitationId(invitationId);
    try {
      await cancelInvitationMutation.mutateAsync({ startupId, invitationId });
      setConfirmCancelInvitation(null);
      handleSuccess();
    } finally {
      setCancellingInvitationId(null);
    }
  };

  const handleSuccess = () => {
    onUpdate?.();
  };

  const handleLeave = async () => {
    try {
      await leaveStartupMutation.mutateAsync(startupId);
      setIsLeaveModalOpen(false);
      router.push('/');
    } catch {
      // error handled by mutation
    }
  };

  const handleDelete = async () => {
    try {
      await deleteStartupMutation.mutateAsync(startupId);
      setIsDeleteModalOpen(false);
      router.push('/');
    } catch {
      // error handled by mutation
    }
  };

  const allMembers = [...founders, ...teamMembers];
  const transferCandidates = allMembers.filter(
    (m) => m.role !== 'SUPER_ADMIN',
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-0 w-full">
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <h3 className="text-base font-semibold text-gray-900">Équipe</h3>
        <div className="flex items-center gap-2">
          {hasEditPermissions && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                className="text-xs"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs"
              >
                <Settings className="w-4 h-4 mr-2" />
                Gérer
              </Button>
            </>
          )}
          {isMember && !isCreator && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLeaveModalOpen(true)}
              className="text-xs text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Quitter
            </Button>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        <FoundersTable
          founders={founders}
          startupId={startupId}
          userRole={userRole}
          canEdit={canEdit}
          hideActions
        />
        <MembersTable
          members={teamMembers}
          startupId={startupId}
          userRole={userRole}
          canEdit={canEdit}
          isMember={isMember}
          hideActions
          showCapitalColumn={showCapitalColumn}
        />

        {/* Pending invitations */}
        {hasEditPermissions && pendingInvitations.length > 0 && (
          <div className="px-6 py-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-amber-500" />
              <h4 className="text-sm font-semibold text-gray-700">
                Invitations en cours ({pendingInvitations.length})
              </h4>
            </div>
            <div className="space-y-2">
              {pendingInvitations.map((inv: PendingInvitation) => (
                <div
                  key={inv.id}
                  className="flex items-center gap-3 rounded-lg border border-amber-100 bg-amber-50/50 px-4 py-2.5 group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                    {inv.invitedProfile ? (
                      <User2 className="h-4 w-4 text-amber-600" />
                    ) : (
                      <Mail className="h-4 w-4 text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-900 truncate block">
                      {inv.invitedProfile?.name || `${inv.firstName || ''} ${inv.lastName || ''}`.trim() || 'Invitation en attente'}
                    </span>
                    <span className="text-xs text-gray-500">{inv.position}</span>
                  </div>
                  <Badge type="pill-color" color="warning" size="sm">
                    En attente
                  </Badge>
                  <button
                    onClick={() => setConfirmCancelInvitation(inv)}
                    disabled={cancellingInvitationId === inv.id}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    title="Annuler l'invitation"
                  >
                    {cancellingInvitationId === inv.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AddMemberModal
        open={isAddModalOpen}
        onOpenChange={(open, success) => {
          setIsAddModalOpen(open);
          if (!open && success) handleSuccess();
        }}
        startupId={startupId}
      />

      <EditTeamModal
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) handleSuccess();
        }}
        startupId={startupId}
        founders={founders}
        teamMembers={teamMembers}
        userRole={userRole}
        currentProfileId={currentProfileId}
        onSuccess={handleSuccess}
      />

      {/* Leave startup confirmation */}
      {isMember && !isCreator && (
        <ConfirmWithNameModal
          open={isLeaveModalOpen}
          onOpenChange={setIsLeaveModalOpen}
          title="Quitter la startup"
          description="Vous êtes sur le point de quitter cette startup. Vous perdrez l'accès à toutes les données. Cette action est irréversible."
          confirmLabel="Quitter"
          nameToConfirm={startupName || 'startup'}
          variant="warning"
          isLoading={leaveStartupMutation.isPending}
          onConfirm={handleLeave}
        />
      )}

      {/* Transfer ownership modal */}
      {isCreator && (
        <TransferOwnershipModal
          open={isTransferModalOpen}
          onOpenChange={setIsTransferModalOpen}
          startupId={startupId}
          startupName={startupName || ''}
          candidates={transferCandidates}
          onSuccess={() => {
            setIsTransferModalOpen(false);
            handleSuccess();
          }}
        />
      )}

      {/* Cancel invitation confirmation */}
      {confirmCancelInvitation && (
        <ConfirmModal
          open={!!confirmCancelInvitation}
          onOpenChange={(open) => {
            if (!open) setConfirmCancelInvitation(null);
          }}
          title="Annuler l'invitation"
          description={`Êtes-vous sûr de vouloir annuler l'invitation de ${confirmCancelInvitation.invitedProfile?.name || `${confirmCancelInvitation.firstName || ''} ${confirmCancelInvitation.lastName || ''}`.trim() || 'cette personne'} ?`}
          confirmLabel="Annuler l'invitation"
          variant="warning"
          isLoading={cancellingInvitationId === confirmCancelInvitation.id}
          onConfirm={handleCancelInvitationConfirmed}
        />
      )}

      {/* Delete startup confirmation */}
      {isCreator && (
        <ConfirmWithNameModal
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          title="Supprimer la startup"
          description="Cette action supprimera définitivement la startup, tous ses membres, invitations et données associées. Cette action est irréversible."
          confirmLabel="Supprimer définitivement"
          nameToConfirm={startupName || 'startup'}
          variant="danger"
          isLoading={deleteStartupMutation.isPending}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};
