"use client";
import React from "react";
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Input } from "@/components/base/input/input";
import { Trash01 } from "@untitledui/icons";

interface DeleteFileModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileToDelete: {
        id: string;
        name: string;
    } | null;
    deleteFileConfirmation: string;
    setDeleteFileConfirmation: (confirmation: string) => void;
    onDeleteFile: () => void;
    isLoading?: boolean;
}

export const DeleteFileModal: React.FC<DeleteFileModalProps> = ({
    isOpen,
    onClose,
    fileToDelete,
    deleteFileConfirmation,
    setDeleteFileConfirmation,
    onDeleteFile,
    isLoading = false,
}) => {
    const handleClose = () => {
        setDeleteFileConfirmation("");
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (fileToDelete && deleteFileConfirmation === fileToDelete.name && !isLoading) {
            onDeleteFile();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading && deleteFileConfirmation === fileToDelete?.name) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    const isFormValid = deleteFileConfirmation === fileToDelete?.name && !isLoading;

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
                                        Supprimer le fichier
                                    </AriaHeading>
                                    <p className="text-sm text-tertiary">
                                        Cette action est irréversible. Pour confirmer la suppression, veuillez taper le nom exact du fichier :
                                        <br /><br />
                                        <strong className="text-red-600">{fileToDelete?.name}</strong>
                                    </p>
                                </div>
                            </div>
                            <div className="h-5 w-full" />
                            <form onSubmit={handleSubmit} className="relative flex flex-col px-4 sm:px-6">
                                <Input
                                    size="md"
                                    label="Confirmer le nom du fichier"
                                    placeholder={`Tapez "${fileToDelete?.name}"`}
                                    value={deleteFileConfirmation}
                                    onChange={setDeleteFileConfirmation}
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
                                        color="primary-destructive"
                                        isDisabled={!isFormValid}
                                        isLoading={isLoading}
                                    >
                                        Supprimer le fichier
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