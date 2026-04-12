"use client";
import React, { useState } from "react";
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Input } from "@/components/base/input/input";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Badge } from "@/components/base/badges/badges";
import { AvatarLabelGroup } from "@/components/base/avatar/avatar-label-group";
import { Users01, Folder, Loading01, User01, Settings01, UserPlus01, Mail01, SearchSm, X as XIcon, Send01 } from "@untitledui/icons";
import { Progress } from "@/components/application/progress-steps/progress-steps";
import type { ProgressFeaturedIconType } from "@/components/application/progress-steps/progress-types";
import { Group, InvitationStatus } from "../../types";
import { useSearchProfiles } from "@/hooks/useSearchProfiles";
import { toast } from "sonner";

interface CreateGroupWithStepsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentStep: number;
    setCurrentStep: (step: number) => void;
    slideDirection: 'left' | 'right';
    setSlideDirection: (direction: 'left' | 'right') => void;
    newGroupName: string;
    setNewGroupName: (name: string) => void;
    groupError: string;
    setGroupError: (error: string) => void;
    groups: Group[];
    categories: Array<{
        id: string;
        name: string;
        count: number | undefined;
    }>;
    selectedCategories: string[];
    setSelectedCategories: (categories: string[]) => void;
    onCreateGroup: () => void;
    onInviteToGroup?: (groupId: string, email: string, name: string) => void;
    lastCreatedGroupId?: string | null;
    isLoading?: boolean;
}

export const CreateGroupWithStepsModal: React.FC<CreateGroupWithStepsModalProps> = ({
    isOpen,
    onClose,
    currentStep,
    setCurrentStep,
    slideDirection: _slideDirection,
    setSlideDirection,
    newGroupName,
    setNewGroupName,
    groupError,
    setGroupError,
    groups,
    categories,
    selectedCategories,
    setSelectedCategories,
    onCreateGroup,
    onInviteToGroup,
    lastCreatedGroupId,
    isLoading = false,
}) => {
    const [inviteSearchValue, setInviteSearchValue] = useState('');
    const [selectedPeople, setSelectedPeople] = useState<Array<{
        id?: string;
        name: string;
        email: string;
        avatar?: string;
        type: 'profile' | 'email';
    }>>([]);

    const { data: searchResults, isLoading: isSearching } = useSearchProfiles(inviteSearchValue, 5);

    const handleClose = () => {
        setGroupError("");
        setNewGroupName("");
        setCurrentStep(1);
        setSelectedCategories([]);
        setInviteSearchValue('');
        setSelectedPeople([]);
        onClose();
    };

    const handleGroupNameChange = (value: string) => {
        const trimmedName = value.trim();
        setNewGroupName(value);

        if (trimmedName) {
            const groupExists = groups.some(
                group => group.name.toLowerCase() === trimmedName.toLowerCase()
            );
            setGroupError(groupExists ? "Un groupe avec ce nom existe déjà" : "");
        } else {
            setGroupError("");
        }
    };

    const handleCategoryChange = (categoryId: string, checked: boolean) => {
        const newCategories = checked
            ? [...selectedCategories, categoryId]
            : selectedCategories.filter(id => id !== categoryId);
        setSelectedCategories(newCategories);
    };

    const handleNext = () => {
        if (currentStep === 1) {
            const trimmedName = newGroupName.trim();
            if (!trimmedName) {
                setGroupError("Le nom du groupe est requis");
                return;
            }
            if (groupError) return;
            setCurrentStep(2);
            setSlideDirection('left');
        } else if (currentStep === 2) {
            onCreateGroup();
            setCurrentStep(3);
            setSlideDirection('left');
        }
    };

    const handleBack = () => {
        if (currentStep === 1) {
            handleClose();
        } else if (currentStep === 2) {
            setCurrentStep(1);
            setSlideDirection('right');
        } else if (currentStep === 3) {
            handleClose();
        }
    };

    const isEmailFormat = inviteSearchValue.includes('@') && inviteSearchValue.includes('.');
    const canAddAsEmail = inviteSearchValue.length > 0 && isEmailFormat &&
        !selectedPeople.some(p => p.email === inviteSearchValue);

    const addByEmail = () => {
        if (canAddAsEmail) {
            const name = inviteSearchValue.split('@')[0];
            setSelectedPeople(prev => [...prev, { name, email: inviteSearchValue, type: 'email' }]);
            setInviteSearchValue('');
        }
    };

    const addProfile = (profile: { id: string; name: string; email: string | null; avatar: string | null }) => {
        if (!profile.email) return;
        if (selectedPeople.some(p => p.email === profile.email)) return;
        setSelectedPeople(prev => [...prev, {
            id: profile.id,
            name: profile.name,
            email: profile.email!,
            avatar: profile.avatar || undefined,
            type: 'profile',
        }]);
        setInviteSearchValue('');
    };

    const removePerson = (email: string) => {
        setSelectedPeople(prev => prev.filter(p => p.email !== email));
    };

    const sendAllInvitations = () => {
        if (!onInviteToGroup || !lastCreatedGroupId) return;
        selectedPeople.forEach(person => {
            onInviteToGroup(lastCreatedGroupId, person.email, person.name);
        });
        setSelectedPeople([]);
        setInviteSearchValue('');
        handleClose();
    };

    const filteredSearchResults = searchResults?.filter(profile => {
        if (!profile.email) return false;
        if (selectedPeople.some(p => p.email === profile.email)) return false;
        return true;
    }) || [];

    const steps: ProgressFeaturedIconType[] = [
        { 
            title: "Informations", 
            description: "Nom du groupe", 
            status: currentStep === 1 ? "current" : (currentStep > 1 ? "complete" : "incomplete"), 
            icon: User01,
            connector: true
        },
        { 
            title: "Accès", 
            description: "Catégories", 
            status: currentStep === 2 ? "current" : (currentStep > 2 ? "complete" : "incomplete"), 
            icon: Settings01,
            connector: true
        },
        { 
            title: "Invitations", 
            description: "Membres", 
            status: currentStep === 3 ? "current" : "incomplete", 
            icon: UserPlus01,
            connector: false
        },
    ];

    return (
        <AriaDialogTrigger isOpen={isOpen} onOpenChange={onClose}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog>
                        <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl transition-all sm:max-w-120">
                            <CloseButton onClick={handleClose} theme="light" size="lg" className="absolute top-3 right-3" />
                            <div className="flex flex-col gap-4 px-4 pt-5 sm:px-6 sm:pt-6">
                                <div className="relative w-max">
                                    <Users01 className="h-8 w-8 text-[#5E6AD2]" data-icon />
                                </div>
                                <div className="z-10 flex flex-col gap-0.5">
                                    <AriaHeading slot="title" className="text-md font-semibold text-primary">
                                        {currentStep === 1 ? "Créer un nouveau groupe" : currentStep === 2 ? "Configuration des accès" : "Inviter des membres"}
                                    </AriaHeading>
                                    <p className="text-sm text-tertiary">
                                        {currentStep === 1
                                            ? "Étape 1/3 : Définissez le nom du groupe"
                                            : currentStep === 2
                                            ? "Étape 2/3 : Sélectionnez les catégories accessibles"
                                            : "Étape 3/3 : Invitez des personnes dans le groupe (optionnel)"}
                                    </p>
                                </div>
                            </div>

                            <div className="px-4 sm:px-6 mt-4">
                                <Progress.MinimalIconsConnected items={steps} orientation="horizontal" />
                            </div>

                            <div className="h-5 w-full" />

                            <div className="relative flex flex-col px-4 sm:px-6">
                                {currentStep === 1 && (
                                    <div className="space-y-4">
                                        <Input
                                            size="md"
                                            label="Nom du groupe"
                                            placeholder="ex: Investisseurs Series A"
                                            value={newGroupName}
                                            onChange={handleGroupNameChange}
                                            isDisabled={isLoading}
                                            isInvalid={!!groupError}
                                            hint={groupError}
                                            isRequired
                                        />
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-sm font-medium text-primary mb-1">Accès aux catégories</h3>
                                            <p className="text-sm text-tertiary mb-3">
                                                Sélectionnez les catégories auxquelles ce groupe aura accès
                                            </p>
                                        </div>
                                        <div className="border rounded-lg p-3 space-y-2 max-h-[300px] overflow-y-auto">
                                            {categories.filter(cat => cat.id !== 'all').map((category) => (
                                                <div key={category.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                                                    <Checkbox
                                                        isSelected={selectedCategories.includes(category.id)}
                                                        onChange={(checked) => handleCategoryChange(category.id, checked)}
                                                        isDisabled={isLoading}
                                                        size="sm"
                                                    />
                                                    <div className="flex items-center flex-1 min-w-0">
                                                        <Folder className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" data-icon />
                                                        <span className="font-medium text-sm truncate">{category.name}</span>
                                                        {category.count && category.count > 0 && (
                                                            <span className="ml-auto text-sm text-gray-500 flex-shrink-0">
                                                                {category.count} fichier{category.count > 1 ? 's' : ''}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {selectedCategories.length === 0 && (
                                            <p className="text-sm text-amber-600">
                                                Sélectionnez au moins une catégorie pour continuer
                                            </p>
                                        )}
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div className="space-y-4">
                                        <p className="text-sm text-tertiary">
                                            Le groupe <strong>{newGroupName}</strong> a été créé. Vous pouvez maintenant inviter des personnes ou passer cette étape.
                                        </p>

                                        <div className="relative">
                                            <SearchSm className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" data-icon />
                                            <Input
                                                placeholder="Rechercher un nom ou saisir un email..."
                                                value={inviteSearchValue}
                                                onChange={setInviteSearchValue}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && isEmailFormat) addByEmail();
                                                }}
                                                className="pl-10"
                                            />
                                        </div>

                                        {inviteSearchValue && inviteSearchValue.trim().length >= 2 && !isEmailFormat && (
                                            <div className="border rounded-lg bg-white max-h-40 overflow-y-auto">
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
                                                        Aucun profil trouvé. Tapez un email complet pour inviter.
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {inviteSearchValue && isEmailFormat && canAddAsEmail && (
                                            <Button
                                                color="secondary"
                                                onClick={addByEmail}
                                                className="w-full justify-start"
                                                iconLeading={<Mail01 className="h-4 w-4" data-icon />}
                                            >
                                                Inviter {inviteSearchValue}
                                            </Button>
                                        )}

                                        {selectedPeople.length > 0 && (
                                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                                {selectedPeople.map((person) => (
                                                    <div key={person.email} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border">
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
                                                            className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600 ml-auto"
                                                            iconLeading={<XIcon className="h-3 w-3" data-icon />}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="z-10 flex flex-1 flex-col-reverse gap-3 p-4 pt-6 *:grow sm:grid sm:grid-cols-2 sm:px-0 sm:pt-8 sm:pb-6">
                                    <Button
                                        color="secondary"
                                        onClick={handleBack}
                                        isDisabled={isLoading}
                                    >
                                        {currentStep === 1 ? 'Annuler' : currentStep === 3 ? 'Terminer' : 'Retour'}
                                    </Button>
                                    <Button
                                        color="primary"
                                        onClick={currentStep === 3 ? sendAllInvitations : handleNext}
                                        isDisabled={
                                            isLoading || (currentStep === 1 
                                                ? !newGroupName.trim() || groupError !== "" 
                                                : currentStep === 2
                                                ? selectedCategories.length === 0
                                                : selectedPeople.length === 0)
                                        }
                                        isLoading={isLoading}
                                        iconLeading={
                                            isLoading && currentStep === 2 
                                                ? <Loading01 className="h-4 w-4 animate-spin" data-icon /> 
                                                : currentStep === 3 
                                                ? <Send01 className="h-4 w-4" data-icon />
                                                : undefined
                                        }
                                    >
                                        {currentStep === 1 
                                            ? 'Suivant' 
                                            : currentStep === 2 
                                            ? 'Créer le groupe' 
                                            : `Envoyer ${selectedPeople.length} invitation${selectedPeople.length > 1 ? 's' : ''}`}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </AriaDialogTrigger>
    );
};
