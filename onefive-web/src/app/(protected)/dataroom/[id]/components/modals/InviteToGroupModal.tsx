"use client";
import React from "react";
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Input } from "@/components/base/input/input";
import { UserPlus01 } from "@untitledui/icons";
import { Group, InvitationStatus } from "../../types";

interface Profile {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

interface InviteToGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    inviteSearch: string;
    setInviteSearch: (search: string) => void;
    inviteEmail: string;
    setInviteEmail: (email: string) => void;
    selectedProfile: Profile | null;
    setSelectedProfile: (profile: Profile | null) => void;
    inviteTargetGroupId: string;
    groups: Group[];
    onInviteToGroup: (groupId: string, email: string, name: string) => void;
    isLoading?: boolean;
}

export const InviteToGroupModal: React.FC<InviteToGroupModalProps> = ({
    isOpen,
    onClose,
    inviteSearch,
    setInviteSearch,
    inviteEmail,
    setInviteEmail,
    selectedProfile,
    setSelectedProfile,
    inviteTargetGroupId,
    groups,
    onInviteToGroup,
    isLoading = false,
}) => {
    const handleClose = () => {
        setInviteSearch("");
        setInviteEmail("");
        setSelectedProfile(null);
        onClose();
    };

    const handleSearchChange = (value: string) => {
        setInviteSearch(value);
        setSelectedProfile(null);
        setInviteEmail(value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inviteTargetGroupId && (inviteEmail || selectedProfile) && !isLoading) {
            onInviteToGroup(inviteTargetGroupId, inviteEmail, selectedProfile?.name || '');
            handleClose();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading && (inviteEmail || selectedProfile)) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    const isFormValid = (() => {
        if (!inviteEmail && !selectedProfile) return false;
        if (!inviteTargetGroupId) return false;

        const targetGroup = groups.find(g => g.id === inviteTargetGroupId);
        if (!targetGroup) return false;

        const emailToCheck = inviteEmail || selectedProfile?.email;
        if (!emailToCheck) return false;

        // Vérifier si déjà membre
        const isExistingMember = targetGroup.members?.some(member => member.email === emailToCheck) || false;
        if (isExistingMember) return false;

        // Vérifier si invitation en attente
        const hasPendingInvitation = targetGroup.invitations?.some(invitation =>
            invitation.email === emailToCheck && invitation.status === InvitationStatus.PENDING
        ) || false;
        if (hasPendingInvitation) return false;

        return true;
    })();

    const targetGroup = groups.find(g => g.id === inviteTargetGroupId);

    return (
        <AriaDialogTrigger isOpen={isOpen} onOpenChange={onClose}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog>
                        <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl transition-all sm:max-w-100">
                            <CloseButton onClick={handleClose} theme="light" size="lg" className="absolute top-3 right-3" />
                            <div className="flex flex-col gap-4 px-4 pt-5 sm:px-6 sm:pt-6">
                                <div className="relative w-max">
                                    <UserPlus01 className="h-8 w-8 text-[#5E6AD2]" data-icon />
                                </div>
                                <div className="z-10 flex flex-col gap-0.5">
                                    <AriaHeading slot="title" className="text-md font-semibold text-primary">
                                        Inviter dans le groupe
                                    </AriaHeading>
                                    <p className="text-sm text-tertiary">
                                        Invitez une personne à rejoindre le groupe <strong>{targetGroup?.name}</strong>.
                                    </p>
                                </div>
                            </div>
                            <div className="h-5 w-full" />
                            <form onSubmit={handleSubmit} className="relative flex flex-col px-4 sm:px-6">
                                <Input
                                    size="md"
                                    label="Email de la personne à inviter"
                                    placeholder="Rechercher un profil ou saisir un email..."
                                    value={inviteSearch}
                                    onChange={handleSearchChange}
                                    onKeyDown={handleKeyDown}
                                    isDisabled={isLoading}
                                    isRequired
                                />
                                <div className="z-10 flex flex-1 flex-col-reverse gap-3 p-4 pt-6 *:grow sm:grid sm:grid-cols-2 sm:px-0 sm:pt-8 sm:pb-6">
                                    <Button
                                        color="secondary"
                                        onClick={handleClose}
                                        isDisabled={isLoading}
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        type="submit"
                                        color="primary"
                                        isDisabled={!isFormValid}
                                        isLoading={isLoading}
                                    >
                                        Inviter
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
