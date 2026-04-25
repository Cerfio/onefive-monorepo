import React, { useState, useEffect } from 'react';
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Badge } from "@/components/base/badges/badges";
import { Tabs } from "@/components/application/tabs/tabs";
import { AvatarLabelGroup } from "@/components/base/avatar/avatar-label-group";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { 
    Users01 as Users, 
    Mail01 as Mail, 
    Clock, 
    SearchSm as Search,
    UserPlus01 as UserPlus,
    Trash01 as Trash2,
    X,
    Send01 as Send,
    Shield01 as Shield,
    Folder
} from "@untitledui/icons";
import { Group, InvitationStatus, Member } from '../../types';
import { CloseButton } from "@/components/base/buttons/close-button";
import { useSearchProfiles } from '@/hooks/useSearchProfiles';
import { toast } from 'sonner';

interface GroupDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    group: Group | null;
    onInvite: (groupId: string, email: string, name?: string) => void;
    onInvitationResponse: (groupId: string, invitationId: string, status: 'accepted' | 'refused') => void;
    onRemoveMember?: (groupId: string, memberId: string) => void;
    onCancelInvitation?: (groupId: string, invitationId: string) => void;
    onUpdatePermissions?: (groupId: string, permissions: { [categoryId: string]: boolean }) => void;
    categories?: Array<{
        id: string;
        name: string;
        count: number | undefined;
    }>;
}

export const GroupDetailsModal: React.FC<GroupDetailsModalProps> = ({
    isOpen,
    onClose,
    group,
    onInvite,
    onInvitationResponse: _onInvitationResponse,
    onRemoveMember,
    onCancelInvitation,
    onUpdatePermissions,
    categories = [],
}) => {
    const [searchValue, setSearchValue] = useState('');
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [selectedPeople, setSelectedPeople] = useState<Array<{
        id?: string;
        name: string;
        email: string;
        avatar?: string;
        type: 'profile' | 'email';
    }>>([]);
    
    const [selectedTab, setSelectedTab] = useState('members');
    
    const [permissions, setPermissions] = useState<{ [categoryId: string]: boolean }>(
        group?.categoryAccess || {}
    );

    const [permissionsSaved, setPermissionsSaved] = useState(false);

    const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
    const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);

    const [invitationToCancel, setInvitationToCancel] = useState<any | null>(null);
    const [showCancelInvitationConfirmation, setShowCancelInvitationConfirmation] = useState(false);
    const [isCancellingInvitation, setIsCancellingInvitation] = useState(false);

    const { data: searchResults, isLoading: isSearching } = useSearchProfiles(searchValue, 5);

    useEffect(() => {
        if (group?.categoryAccess) {
            setPermissions(group.categoryAccess);
            setPermissionsSaved(false);
        }
    }, [group?.categoryAccess]);

    if (!group) return null;

    const isEmailFormat = searchValue.includes('@') && searchValue.includes('.');
    const canAddAsEmail = searchValue.length > 0 && 
        !selectedPeople.some(p => p.email === searchValue) &&
        !group?.members.some(member => member.email === searchValue) &&
        !group?.invitations.some(invitation => invitation.email === searchValue && invitation.status === InvitationStatus.PENDING);

    const addByEmail = () => {
        if (canAddAsEmail && isEmailFormat) {
            const name = searchValue.split('@')[0];
            setSelectedPeople(prev => [...prev, { name, email: searchValue, type: 'email' }]);
            setSearchValue('');
        }
    };

    const addProfile = (profile: { id: string; name: string; email: string | null; avatar: string | null }) => {
        if (!profile.email) return;
        if (selectedPeople.some(p => p.email === profile.email)) return;
        if (group?.members.some(m => m.email === profile.email)) {
            toast.info('Cette personne est déjà membre du groupe');
            return;
        }
        if (group?.invitations.some(i => i.email === profile.email && i.status === InvitationStatus.PENDING)) {
            toast.info('Une invitation est déjà en attente pour cette personne');
            return;
        }
        setSelectedPeople(prev => [...prev, {
            id: profile.id,
            name: profile.name,
            email: profile.email!,
            avatar: profile.avatar || undefined,
            type: 'profile',
        }]);
        setSearchValue('');
    };

    const removePerson = (email: string) => {
        setSelectedPeople(prev => prev.filter(p => p.email !== email));
    };

    const sendAllInvitations = () => {
        if (!group) return;
        selectedPeople.forEach(person => {
            onInvite(group.id, person.email, person.name);
        });
        setSelectedPeople([]);
        setSearchValue('');
        setShowInviteForm(false);
    };

    const handlePermissionChange = (categoryId: string, hasAccess: boolean) => {
        setPermissions(prev => ({ ...prev, [categoryId]: hasAccess }));
        setPermissionsSaved(false);
    };

    const handleSavePermissions = () => {
        if (group && onUpdatePermissions) {
            onUpdatePermissions(group.id, permissions);
            setPermissionsSaved(true);
        }
    };

    const handleSelectAllPermissions = () => {
        const allPermissions: { [categoryId: string]: boolean } = { ...permissions };
        categories.forEach(category => {
            if (category.id !== 'all') allPermissions[category.id] = true;
        });
        setPermissions(allPermissions);
        setPermissionsSaved(false);
    };

    const handleDeselectAllPermissions = () => {
        const noPermissions: { [categoryId: string]: boolean } = { ...permissions };
        categories.forEach(category => {
            if (category.id !== 'all') noPermissions[category.id] = false;
        });
        setPermissions(noPermissions);
        setPermissionsSaved(false);
    };

    const pendingInvitations = group.invitations?.filter(inv => inv.status === InvitationStatus.PENDING) || [];
    const enabledPermissionsCount = Object.values(permissions).filter(Boolean).length;
    const totalCategories = categories.filter(cat => cat.id !== 'all').length;

    const tabs = [
        { id: "members", label: `Membres (${group.members.length})`, content: "members" },
        { id: "invitations", label: `Invitations (${pendingInvitations.length})`, content: "invitations" },
        { id: "permissions", label: `Permissions (${enabledPermissionsCount}/${totalCategories})`, content: "permissions" },
    ];

    const handleRemoveMemberClick = (member: Member) => {
        setMemberToRemove(member);
        setShowRemoveConfirmation(true);
    };

    const handleCloseRemoveConfirmation = () => {
        setShowRemoveConfirmation(false);
        setMemberToRemove(null);
        setIsRemoving(false);
    };

    const handleConfirmRemoveMember = async () => {
        if (memberToRemove && onRemoveMember && group) {
            setIsRemoving(true);
            try {
                await onRemoveMember(group.id, memberToRemove.id);
                handleCloseRemoveConfirmation();
            } catch {
                setIsRemoving(false);
            }
        }
    };

    const handleCancelInvitationClick = (invitation: any) => {
        setInvitationToCancel(invitation);
        setShowCancelInvitationConfirmation(true);
    };

    const handleCloseCancelInvitationConfirmation = () => {
        setShowCancelInvitationConfirmation(false);
        setInvitationToCancel(null);
        setIsCancellingInvitation(false);
    };

    const handleConfirmCancelInvitation = async () => {
        if (invitationToCancel && onCancelInvitation && group) {
            setIsCancellingInvitation(true);
            try {
                await onCancelInvitation(group.id, invitationToCancel.id);
                handleCloseCancelInvitationConfirmation();
            } catch {
                setIsCancellingInvitation(false);
            }
        }
    };

    const filteredSearchResults = searchResults?.filter(profile => {
        if (!profile.email) return false;
        if (selectedPeople.some(p => p.email === profile.email)) return false;
        if (group?.members.some(m => m.email === profile.email)) return false;
        return true;
    }) || [];

    return (
        <>
        <AriaDialogTrigger isOpen={isOpen} onOpenChange={onClose}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog>
                        <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl transition-all sm:max-w-4xl max-h-[85vh] flex flex-col">
                            <CloseButton onClick={onClose} theme="light" size="lg" className="absolute top-3 right-3 z-20" />
                            <div className="flex flex-col gap-4 px-4 pt-5 sm:px-6 sm:pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-8 w-8 text-[#5E6AD2]" data-icon />
                                        <AriaHeading slot="title" className="text-md font-semibold text-primary">
                                            {group.name}
                                        </AriaHeading>
                                        <Badge type="pill-color" color="gray" size="sm">
                                            {group.members.length} membre{group.members.length > 1 ? 's' : ''}
                                        </Badge>
                                    </div>
                                    <Button
                                        onClick={() => setShowInviteForm(true)}
                                        color="primary"
                                        size="md"
                                        iconLeading={<UserPlus className="h-4 w-4" data-icon />}
                                    >
                                        Inviter
                                    </Button>
                                </div>
                            </div>

                            <div className="px-4 sm:px-6 pb-6 flex-1 overflow-y-auto">
                                {showInviteForm && (
                                    <div className="border rounded-lg p-4 bg-gray-50 mb-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium">Inviter des personnes</h3>
                                            <Button
                                                color="secondary"
                                                size="sm"
                                                onClick={() => { setShowInviteForm(false); setSelectedPeople([]); setSearchValue(''); }}
                                                iconLeading={<X className="h-4 w-4" data-icon />}
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" data-icon />
                                                <Input
                                                    placeholder="Rechercher un nom ou saisir un email..."
                                                    value={searchValue}
                                                    onChange={setSearchValue}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && isEmailFormat) addByEmail();
                                                    }}
                                                    className="pl-10"
                                                />
                                            </div>

                                            {searchValue && searchValue.trim().length >= 2 && !isEmailFormat && (
                                                <div className="border rounded-lg bg-white max-h-48 overflow-y-auto">
                                                    {isSearching && (
                                                        <div className="p-3 text-sm text-gray-500 text-center">Recherche...</div>
                                                    )}
                                                    {!isSearching && filteredSearchResults.length > 0 && (
                                                        filteredSearchResults.map((profile) => (
                                                            <button
                                                                key={profile.id}
                                                                onClick={() => addProfile(profile)}
                                                                className="flex items-center gap-3 w-full p-3 hover:bg-gray-50 transition-colors text-left"
                                                            >
                                                                <AvatarLabelGroup
                                                                    size="sm"
                                                                    src={profile.avatar || undefined}
                                                                    alt={profile.name}
                                                                    title={profile.name}
                                                                    subtitle={profile.email || ''}
                                                                />
                                                            </button>
                                                        ))
                                                    )}
                                                    {!isSearching && filteredSearchResults.length === 0 && (
                                                        <div className="p-3 text-sm text-gray-500">
                                                            Aucun profil trouvé. Tapez un email complet pour envoyer une invitation.
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {searchValue && isEmailFormat && (
                                                <div className="space-y-2">
                                                    {(() => {
                                                        const isExistingMember = group?.members.some(member => 
                                                            member.email.toLowerCase() === searchValue.toLowerCase()
                                                        );
                                                        const hasPendingInvitation = group?.invitations.some(invitation => 
                                                            invitation.email.toLowerCase() === searchValue.toLowerCase() && 
                                                            invitation.status === InvitationStatus.PENDING
                                                        );
                                                        
                                                        if (isExistingMember) {
                                                            return (
                                                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                                    <div className="flex items-start gap-2">
                                                                        <Users className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" data-icon />
                                                                        <div className="text-sm">
                                                                            <p className="font-medium text-blue-800">Déjà membre</p>
                                                                            <p className="text-blue-700 mt-1">Cette personne fait déjà partie du groupe.</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        
                                                        if (hasPendingInvitation) {
                                                            return (
                                                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                                    <div className="flex items-start gap-2">
                                                                        <Clock className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" data-icon />
                                                                        <div className="text-sm">
                                                                            <p className="font-medium text-yellow-800">Invitation en attente</p>
                                                                            <p className="text-yellow-700 mt-1">Une invitation a déjà été envoyée à cette personne.</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        
                                                        return (
                                                            <Button
                                                                color="secondary"
                                                                onClick={addByEmail}
                                                                isDisabled={!canAddAsEmail}
                                                                className="w-full justify-start"
                                                                iconLeading={<Mail className="h-4 w-4" data-icon />}
                                                            >
                                                                Inviter {searchValue}
                                                            </Button>
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                        </div>

                                        {selectedPeople.length > 0 && (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium">
                                                        {selectedPeople.length} personne{selectedPeople.length > 1 ? 's' : ''} sélectionnée{selectedPeople.length > 1 ? 's' : ''}
                                                    </p>
                                                    <Button
                                                        onClick={sendAllInvitations}
                                                        color="primary"
                                                        size="sm"
                                                        iconLeading={<Send className="h-4 w-4" data-icon />}
                                                    >
                                                        Envoyer {selectedPeople.length} invitation{selectedPeople.length > 1 ? 's' : ''}
                                                    </Button>
                                                </div>
                                                
                                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                                    {selectedPeople.map((person) => (
                                                        <div key={person.email} className="flex items-center gap-3 p-2 bg-white rounded-lg border">
                                                            <AvatarLabelGroup
                                                                size="sm"
                                                                src={person.avatar}
                                                                alt={person.name}
                                                                title={person.name}
                                                                subtitle={person.email}
                                                            />
                                                            <Badge type="pill-color" color={person.type === 'profile' ? "brand" : "gray"} size="sm">
                                                                {person.type === 'profile' ? 'Profil' : 'Email'}
                                                            </Badge>
                                                            <Button
                                                                color="secondary"
                                                                size="sm"
                                                                onClick={() => removePerson(person.email)}
                                                                className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                                                                iconLeading={<X className="h-3 w-3" data-icon />}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <Tabs selectedKey={selectedTab} onSelectionChange={(key) => setSelectedTab(String(key))} className="w-full">
                                    <Tabs.List type="underline" items={tabs}>
                                        {(tab) => <Tabs.Item {...tab} />}
                                    </Tabs.List>

                                    {selectedTab === 'members' && (
                                        <div className="space-y-3 mt-4">
                                            {group.members.map((member) => (
                                                <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group">
                                                    <AvatarLabelGroup
                                                        size="md"
                                                        src={member.avatar}
                                                        alt={member.name}
                                                        title={member.name}
                                                        subtitle={member.email}
                                                    />
                                                    <Badge type="pill-color" color="gray" size="sm">
                                                        Membre
                                                    </Badge>
                                                    {onRemoveMember && (
                                                        <Button
                                                            color="secondary"
                                                            size="sm"
                                                            onClick={() => handleRemoveMemberClick(member)}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                            iconLeading={<Trash2 className="h-4 w-4" data-icon />}
                                                        >
                                                            Retirer
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            {group.members.length === 0 && (
                                                <div className="text-center py-8 text-gray-500">
                                                    <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" data-icon />
                                                    <p>Aucun membre dans ce groupe</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {selectedTab === 'invitations' && (
                                        <div className="space-y-3 mt-4">
                                            {pendingInvitations.map((invitation) => (
                                                <div key={invitation.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group">
                                                    <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <Mail className="h-4 w-4 text-gray-600" data-icon />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm">
                                                            {invitation.name || invitation.email}
                                                        </p>
                                                        {invitation.name && (
                                                            <p className="text-xs text-gray-500">{invitation.email}</p>
                                                        )}
                                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Clock className="h-3 w-3" data-icon />
                                                            Invité le {new Date(invitation.invitedAt).toLocaleDateString('fr-FR')}
                                                        </p>
                                                    </div>
                                                    <Badge type="pill-color" color="gray" size="sm">
                                                        En attente
                                                    </Badge>
                                                    {onCancelInvitation && (
                                                        <Button
                                                            color="secondary"
                                                            size="sm"
                                                            onClick={() => handleCancelInvitationClick(invitation)}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                            iconLeading={<X className="h-4 w-4" data-icon />}
                                                        >
                                                            Annuler
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            {pendingInvitations.length === 0 && (
                                                <div className="text-center py-8 text-gray-500">
                                                    <Mail className="h-12 w-12 mx-auto mb-2 text-gray-300" data-icon />
                                                    <p>Aucune invitation en attente</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {selectedTab === 'permissions' && (
                                        <div className="flex flex-col mt-4">
                                            <div className="flex items-center gap-3 p-3 bg-[#5E6AD2]/5 rounded-lg border border-[#5E6AD2]/20">
                                                <Shield className="h-5 w-5 text-[#5E6AD2]" data-icon />
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-sm">Permissions par catégorie</h3>
                                                    <p className="text-xs text-gray-600">
                                                        Définir les catégories de documents accessibles à ce groupe
                                                    </p>
                                                </div>
                                                <Badge type="pill-color" color="gray" size="sm">
                                                    {enabledPermissionsCount}/{totalCategories} catégories
                                                </Badge>
                                            </div>

                                            <div className="flex gap-2 mt-4">
                                                <Button color="secondary" size="sm" onClick={handleSelectAllPermissions} className="flex-1">
                                                    Tout sélectionner
                                                </Button>
                                                <Button color="secondary" size="sm" onClick={handleDeselectAllPermissions} className="flex-1">
                                                    Tout désélectionner
                                                </Button>
                                            </div>

                                            <div className="space-y-2 max-h-64 overflow-y-auto mt-4">
                                                {categories
                                                    .filter(category => category.id !== 'all')
                                                    .map((category) => (
                                                    <div
                                                        key={category.id}
                                                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Folder className="h-4 w-4 text-gray-400" data-icon />
                                                            <div>
                                                                <p className="font-medium text-sm">{category.name}</p>
                                                                <p className="text-xs text-gray-500">
                                                                    {category.count} document{(category.count || 0) > 1 ? 's' : ''}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Checkbox 
                                                            isSelected={permissions[category.id] || false}
                                                            onChange={(checked) => 
                                                                handlePermissionChange(category.id, checked)
                                                            }
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </Tabs>
                            </div>

                            {selectedTab === 'permissions' && (
                                <div className="sticky bottom-0 bg-white border-t px-4 sm:px-6 py-4 flex justify-end">
                                    <Button 
                                        onClick={handleSavePermissions}
                                        color="primary"
                                    >
                                        {permissionsSaved ? 'Permissions enregistrées' : 'Enregistrer les permissions'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </AriaDialogTrigger>

        {/* Simple confirmation for member removal */}
        <AriaDialogTrigger isOpen={showRemoveConfirmation} onOpenChange={(isOpen) => {
            if (!isOpen) handleCloseRemoveConfirmation();
        }}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog>
                        <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl transition-all sm:max-w-md">
                            <CloseButton onClick={handleCloseRemoveConfirmation} theme="light" size="lg" className="absolute top-3 right-3" />
                            <div className="flex flex-col gap-4 px-4 pt-5 sm:px-6 sm:pt-6">
                                <div className="relative w-max">
                                    <Trash2 className="h-8 w-8 text-red-600" data-icon />
                                </div>
                                <div className="z-10 flex flex-col gap-0.5">
                                    <AriaHeading slot="title" className="text-md font-semibold text-primary">
                                        Retirer du groupe
                                    </AriaHeading>
                                    <p className="text-sm text-tertiary">
                                        <strong>{memberToRemove?.name}</strong> perdra immédiatement l'accès à tous les documents partagés avec ce groupe. Cette action est irréversible.
                                    </p>
                                </div>
                            </div>
                            <div className="z-10 flex flex-1 flex-col-reverse gap-3 p-4 pt-6 *:grow sm:grid sm:grid-cols-2 sm:px-6 sm:pt-8 sm:pb-6">
                                <Button
                                    type="button"
                                    color="secondary"
                                    onClick={handleCloseRemoveConfirmation}
                                    isDisabled={isRemoving}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    type="button"
                                    color="primary-destructive"
                                    onClick={handleConfirmRemoveMember}
                                    isDisabled={isRemoving}
                                >
                                    {isRemoving ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                            Suppression...
                                        </div>
                                    ) : (
                                        "Retirer du groupe"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </AriaDialogTrigger>

        {/* Simple confirmation for invitation cancellation */}
        <AriaDialogTrigger isOpen={showCancelInvitationConfirmation} onOpenChange={(isOpen) => {
            if (!isOpen) handleCloseCancelInvitationConfirmation();
        }}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog>
                        <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl transition-all sm:max-w-md">
                            <CloseButton onClick={handleCloseCancelInvitationConfirmation} theme="light" size="lg" className="absolute top-3 right-3" />
                            <div className="flex flex-col gap-4 px-4 pt-5 sm:px-6 sm:pt-6">
                                <div className="relative w-max">
                                    <X className="h-8 w-8 text-red-600" data-icon />
                                </div>
                                <div className="z-10 flex flex-col gap-0.5">
                                    <AriaHeading slot="title" className="text-md font-semibold text-primary">
                                        Annuler l'invitation
                                    </AriaHeading>
                                    <p className="text-sm text-tertiary">
                                        L'invitation de <strong>{invitationToCancel?.name || invitationToCancel?.email}</strong> sera définitivement annulée.
                                    </p>
                                </div>
                            </div>
                            <div className="z-10 flex flex-1 flex-col-reverse gap-3 p-4 pt-6 *:grow sm:grid sm:grid-cols-2 sm:px-6 sm:pt-8 sm:pb-6">
                                <Button
                                    type="button"
                                    color="secondary"
                                    onClick={handleCloseCancelInvitationConfirmation}
                                    isDisabled={isCancellingInvitation}
                                >
                                    Non, garder
                                </Button>
                                <Button
                                    type="button"
                                    color="primary-destructive"
                                    onClick={handleConfirmCancelInvitation}
                                    isDisabled={isCancellingInvitation}
                                >
                                    {isCancellingInvitation ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                            Annulation...
                                        </div>
                                    ) : (
                                        "Oui, annuler"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </AriaDialogTrigger>
        </>
    );
};
