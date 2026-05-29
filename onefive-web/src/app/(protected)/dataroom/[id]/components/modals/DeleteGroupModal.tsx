"use client";
import React, { useState } from "react";
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Input } from "@/components/base/input/input";
import { Trash01 } from "@untitledui/icons";
import { Group } from "../../types";

interface DeleteGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    group: Group | null;
    onConfirm: () => Promise<void> | void;
}

export const DeleteGroupModal = ({
    isOpen,
    onClose,
    group,
    onConfirm
}: DeleteGroupModalProps) => {
    const [confirmationName, setConfirmationName] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    if (!group) return null;

    const handleClose = () => {
        setConfirmationName("");
        setIsDeleting(false);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (confirmationName === group.name && !isDeleting) {
            setIsDeleting(true);
            try {
                await onConfirm();
                handleClose();
            } catch {
                setIsDeleting(false);
            }
        }
    };

    const isFormValid = confirmationName === group.name && !isDeleting;

    return (
        <AriaDialogTrigger isOpen={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog>
                        <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl transition-all sm:max-w-100">
                            <CloseButton onClick={handleClose} theme="light" size="lg" className="absolute top-3 right-3" />
                            <div className="flex flex-col gap-4 px-4 pt-5 sm:px-6 sm:pt-6">
                                <div className="relative w-max">
                                    <Trash01 className="h-8 w-8 text-red-600" data-icon />
                                </div>
                                <div className="z-10 flex flex-col gap-0.5">
                                    <AriaHeading slot="title" className="text-md font-semibold text-primary">
                                        Supprimer le groupe
                                    </AriaHeading>
                                    <p className="text-sm text-tertiary">
                                        Cette action est irréversible. Le groupe <strong>{group.name}</strong> et tous ses membres seront définitivement supprimés.
                                        <br /><br />
                                        Pour confirmer, veuillez taper <strong className="text-red-600">{group.name}</strong> ci-dessous.
                                    </p>
                                </div>
                            </div>
                            <div className="h-5 w-full" />
                            <form onSubmit={handleSubmit} className="relative flex flex-col px-4 sm:px-6">
                                <Input
                                    size="md"
                                    label="Confirmer le nom du groupe"
                                    placeholder={`Tapez "${group.name}"`}
                                    value={confirmationName}
                                    onChange={setConfirmationName}
                                    isDisabled={isDeleting}
                                    isRequired
                                />
                                <div className="z-10 flex flex-1 flex-col-reverse gap-3 p-4 pt-6 *:grow sm:grid sm:grid-cols-2 sm:px-0 sm:pt-8 sm:pb-6">
                                    <Button
                                        color="secondary"
                                        onClick={handleClose}
                                        isDisabled={isDeleting}
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        type="submit"
                                        color="primary-destructive"
                                        isDisabled={!isFormValid}
                                        isLoading={isDeleting}
                                    >
                                        Supprimer le groupe
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