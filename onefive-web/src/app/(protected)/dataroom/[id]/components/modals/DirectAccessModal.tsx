"use client";
import React from "react";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Label } from "@/components/base/label/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/base/dialog/dialog";
import { Avatar } from "@/components/base/avatar/avatar";
import { Plus, X } from "lucide-react";
import { UserProfile } from "../../types";

interface DirectAccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentStep: number;
    setCurrentStep: (step: number) => void;
    slideDirection: 'left' | 'right';
    setSlideDirection: (direction: 'left' | 'right') => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    isSearching: boolean;
    searchResults: UserProfile[];
    selectedUser: UserProfile | null;
    setSelectedUser: (user: UserProfile | null) => void;
    setSearchResults: (results: UserProfile[]) => void;
    showEmailInput: boolean;
    setShowEmailInput: (show: boolean) => void;
    newDirectAccessData: {
        email: string;
        name: string;
        categories: string[];
        files: string[];
    };
    setNewDirectAccessData: (data: any) => void;
    onCreateDirectAccess: () => void;
    onSearchUsers?: (query: string) => void;
}

export const DirectAccessModal: React.FC<DirectAccessModalProps> = ({
    isOpen,
    onClose,
    currentStep,
    setCurrentStep,
    slideDirection: _slideDirection,
    setSlideDirection,
    searchQuery,
    setSearchQuery,
    isSearching,
    searchResults,
    selectedUser,
    setSelectedUser,
    setSearchResults,
    showEmailInput,
    setShowEmailInput,
    newDirectAccessData,
    setNewDirectAccessData,
    onCreateDirectAccess,
    onSearchUsers,
}) => {
    const handleClose = () => {
        setCurrentStep(1);
        setNewDirectAccessData({ email: '', name: '', categories: [], files: [] });
        setSelectedUser(null);
        setSearchQuery('');
        setSearchResults([]);
        setShowEmailInput(false);
        onClose();
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        if (value.length >= 2 && onSearchUsers) {
            onSearchUsers(value);
        } else {
            setSearchResults([]);
        }
    };

    const handleUserSelect = (user: UserProfile) => {
        setSelectedUser(user);
        setSearchQuery('');
        setSearchResults([]);
        setShowEmailInput(false);
        setNewDirectAccessData({
            ...newDirectAccessData,
            email: user.email
        });
    };

    const handleEmailInvite = () => {
        setNewDirectAccessData({
            ...newDirectAccessData,
            email: searchQuery
        });
        setShowEmailInput(false);
    };

    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
            setSlideDirection('left');
        } else {
            onCreateDirectAccess();
        }
    };

    const handleBack = () => {
        if (currentStep === 1) {
            handleClose();
        } else {
            setCurrentStep(currentStep - 1);
            setSlideDirection('right');
        }
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 1:
                return !!newDirectAccessData.email;
            case 2:
                return newDirectAccessData.categories.length > 0;
            case 3:
                return newDirectAccessData.files.length > 0;
            default:
                return false;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-md overflow-hidden">
                <DialogHeader>
                    <DialogTitle>
                        {currentStep === 1 ? "Ajouter un accès direct" :
                            currentStep === 2 ? "Configuration des accès" : "Sélection des fichiers"}
                    </DialogTitle>
                    <DialogDescription>
                        {currentStep === 1 ? "Informations de l'utilisateur" :
                            currentStep === 2 ? "Sélectionnez les catégories accessibles" :
                                "Sélectionnez les fichiers spécifiques"}
                    </DialogDescription>
                </DialogHeader>

                <div className="relative">
                    {/* Indicateur d'étapes */}
                    <div className="absolute top-0 left-0 right-0 flex justify-center gap-2 mb-4">
                        {[1, 2, 3].map((step) => (
                            <div
                                key={step}
                                className={`h-2 w-2 rounded-full transition-colors ${currentStep === step ? 'bg-[#5E6AD2]' : 'bg-gray-200'}`}
                            />
                        ))}
                    </div>

                    <div className="relative mt-6">
                        <div className={`flex transition-transform duration-300 ease-in-out ${currentStep === 1 ? 'translate-x-0' :
                            currentStep === 2 ? '-translate-x-full' : '-translate-x-[200%]'
                            }`}>
                            {/* Étape 1 : Informations de base */}
                            <div className="flex-shrink-0 w-full">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Rechercher un utilisateur</Label>
                                        <div className="relative">
                                            <Input
                                                type="text"
                                                placeholder="Rechercher par email ou nom..."
                                                value={searchQuery}
                                                onChange={handleSearchChange}
                                                className="pr-8"
                                            />
                                            {isSearching && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <div className="animate-spin h-4 w-4 border-2 border-[#5E6AD2] border-t-transparent rounded-full" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Résultats de la recherche */}
                                        {searchResults.length > 0 && !selectedUser && (
                                            <div className="mt-2 border rounded-lg divide-y max-h-[200px] overflow-y-auto">
                                                {searchResults.map((user) => (
                                                    <button
                                                        key={user.id}
                                                        className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                                                        onClick={() => handleUserSelect(user)}
                                                    >
                                                        <Avatar size="md" src={user.avatar} initials={user.email[0].toUpperCase()} />
                                                        <div className="text-left">
                                                            <p className="font-medium">
                                                                {user.name || user.email}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {user.email}
                                                            </p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Utilisateur sélectionné */}
                                        {selectedUser && (
                                            <div className="mt-2 p-3 border rounded-lg flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Avatar size="md" src={selectedUser.avatar} initials={selectedUser.email[0].toUpperCase()} />
                                                    <div>
                                                        <p className="font-medium">
                                                            {selectedUser.name || selectedUser.email}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {selectedUser.email}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    color="tertiary"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedUser(null);
                                                        setSearchQuery('');
                                                        setNewDirectAccessData({
                                                            ...newDirectAccessData,
                                                            email: ''
                                                        });
                                                    }}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}

                                        {/* Option pour saisir un email directement */}
                                        {!selectedUser && searchResults.length === 0 && searchQuery && !isSearching && (
                                            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                                                <p className="text-sm text-gray-600 mb-3">
                                                    Aucun utilisateur trouvé pour "{searchQuery}"
                                                </p>
                                                {!showEmailInput ? (
                                                    <Button
                                                        color="secondary"
                                                        className="w-full"
                                                        onClick={() => setShowEmailInput(true)}
                                                    >
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Inviter par email
                                                    </Button>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <Input
                                                            type="email"
                                                            placeholder="Adresse email"
                                                            value={searchQuery}
                                                            onChange={setSearchQuery}
                                                        />
                                                        <div className="flex gap-2">
                                                            <Button
                                                                color="secondary"
                                                                onClick={() => setShowEmailInput(false)}
                                                            >
                                                                Annuler
                                                            </Button>
                                                            <Button
                                                                onClick={handleEmailInvite}
                                                                isDisabled={!searchQuery.includes('@')}
                                                            >
                                                                Envoyer l'invitation
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Étapes 2 et 3 peuvent être ajoutées ici selon les besoins */}
                            <div className="flex-shrink-0 w-full">
                                <div className="space-y-4">
                                    <p>Configuration des accès - À implémenter</p>
                                </div>
                            </div>
                            <div className="flex-shrink-0 w-full">
                                <div className="space-y-4">
                                    <p>Sélection des fichiers - À implémenter</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex justify-between mt-6">
                    <Button color="secondary" onClick={handleBack}>
                        {currentStep === 1 ? 'Annuler' : 'Retour'}
                    </Button>
                    <Button
                        onClick={handleNext}
                        isDisabled={!isStepValid()}
                    >
                        {currentStep < 3 ? 'Suivant' : 'Ajouter l\'accès'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}; 