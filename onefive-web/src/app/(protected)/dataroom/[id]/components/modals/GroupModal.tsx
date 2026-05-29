import React from "react";
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Input } from "@/components/base/input/input";
import { Users01, Loading01 } from "@untitledui/icons";
import { Group } from "../../types";

interface GroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    groupName: string;
    setGroupName: (value: string) => void;
    onSubmit: () => void;
    error?: string;
    isLoading?: boolean;
    selectedGroup?: Group | null;
}

export const GroupModal = ({
    isOpen,
    onClose,
    title,
    groupName,
    setGroupName,
    onSubmit,
    error,
    isLoading = false,
    selectedGroup
}: GroupModalProps) => {
    const isRename = title.toLowerCase().includes("renommer") || title.toLowerCase().includes("modifier");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoading && groupName.trim()) {
            onSubmit();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading && groupName.trim()) {
            e.preventDefault();
            onSubmit();
        }
    };

    return (
        <AriaDialogTrigger isOpen={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog>
                        <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl transition-all sm:max-w-100">
                            <CloseButton onClick={onClose} theme="light" size="lg" className="absolute top-3 right-3" />
                            <div className="flex flex-col gap-4 px-4 pt-5 sm:px-6 sm:pt-6">
                                <div className="relative w-max">
                                    <Users01 className="h-8 w-8 text-[#5E6AD2]" data-icon />
                                </div>
                                <div className="z-10 flex flex-col gap-0.5">
                                    <AriaHeading slot="title" className="text-md font-semibold text-primary">
                                        {title}
                                    </AriaHeading>
                                    {isRename && selectedGroup ? (
                                        <p className="text-sm text-tertiary">
                                            Modifiez le nom du groupe <strong>{selectedGroup.name}</strong>.
                                            Les membres et permissions du groupe seront conservés.
                                        </p>
                                    ) : (
                                        <p className="text-sm text-tertiary">
                                            Entrez un nom pour ce nouveau groupe.
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="h-5 w-full" />
                            <form onSubmit={handleSubmit} className="relative flex flex-col px-4 sm:px-6">
                                <Input
                                    size="md"
                                    label="Nom du groupe"
                                    placeholder="e.g. Équipe Marketing"
                                    value={groupName}
                                    onChange={setGroupName}
                                    onKeyDown={handleKeyDown}
                                    isDisabled={isLoading}
                                    isInvalid={!!error}
                                    hint={error}
                                    isRequired
                                />
                                <div className="z-10 flex flex-1 flex-col-reverse gap-3 p-4 pt-6 *:grow sm:grid sm:grid-cols-2 sm:px-0 sm:pt-8 sm:pb-6">
                                    <Button
                                        color="secondary"
                                        onClick={onClose}
                                        isDisabled={isLoading}
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        type="submit"
                                        color="primary"
                                        isDisabled={!groupName.trim() || isLoading}
                                        iconLeading={isLoading ? <Loading01 className="h-4 w-4 animate-spin" data-icon /> : undefined}
                                        isLoading={isLoading}
                                    >
                                        {isRename ? "Modifier" : "Créer"}
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