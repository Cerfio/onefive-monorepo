"use client";
import React from "react";
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Input } from "@/components/base/input/input";
import { Edit03 } from "@untitledui/icons";
import { UseMutationResult } from "@tanstack/react-query";

interface RenameFileModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileToRename: {
        id: string;
        name: string;
    } | null;
    newFileName: string;
    setNewFileName: (name: string) => void;
    renameFileError: string;
    setRenameFileError: (error: string) => void;
    updateFileMutation: UseMutationResult<any, any, { fileId: string; name: string }, unknown>;
    displayedDocuments: Array<{
        id: string;
        name: string;
    }>;
}

export const RenameFileModal: React.FC<RenameFileModalProps> = ({
    isOpen,
    onClose,
    fileToRename,
    newFileName,
    setNewFileName,
    renameFileError,
    setRenameFileError,
    updateFileMutation,
    displayedDocuments,
}) => {
    const handleClose = () => {
        setRenameFileError("");
        setNewFileName("");
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (fileToRename && newFileName.trim() && !updateFileMutation.isLoading) {
            updateFileMutation.mutate({ 
                fileId: fileToRename.id, 
                name: newFileName.trim() 
            }, {
                onSuccess: () => {
                    handleClose();
                },
            });
        }
    };

    const handleNameChange = (value: string) => {
        const trimmedName = value.trim();
        setNewFileName(value);

        if (trimmedName) {
            const fileExists = displayedDocuments.some(
                doc => doc.name.toLowerCase() === trimmedName.toLowerCase() && 
                      doc.id !== fileToRename?.id
            );
            setRenameFileError(fileExists ? "Un fichier avec ce nom existe déjà" : "");
        } else {
            setRenameFileError("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !updateFileMutation.isLoading && newFileName.trim()) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    const isFormValid = newFileName.trim() && 
                       newFileName !== fileToRename?.name && 
                       !updateFileMutation.isLoading && 
                       renameFileError === "";

    return (
        <AriaDialogTrigger isOpen={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog>
                        <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl transition-all sm:max-w-100">
                            <CloseButton onClick={handleClose} theme="light" size="lg" className="absolute top-3 right-3" />
                            <div className="flex flex-col gap-4 px-4 pt-5 sm:px-6 sm:pt-6">
                                <div className="relative w-max">
                                    <Edit03 className="h-8 w-8 text-[#5E6AD2]" data-icon />
                                </div>
                                <div className="z-10 flex flex-col gap-0.5">
                                    <AriaHeading slot="title" className="text-md font-semibold text-primary">
                                        Renommer le fichier
                                    </AriaHeading>
                                    <p className="text-sm text-tertiary">
                                        Entrez le nouveau nom pour le fichier <strong>{fileToRename?.name}</strong>.
                                    </p>
                                </div>
                            </div>
                            <div className="h-5 w-full" />
                            <form onSubmit={handleSubmit} className="relative flex flex-col px-4 sm:px-6">
                                <Input
                                    size="md"
                                    label="Nouveau nom"
                                    placeholder="Nom du fichier"
                                    value={newFileName}
                                    onChange={handleNameChange}
                                    onKeyDown={handleKeyDown}
                                    isDisabled={updateFileMutation.isLoading}
                                    isInvalid={!!renameFileError}
                                    hint={renameFileError}
                                    isRequired
                                />
                                <div className="z-10 flex flex-1 flex-col-reverse gap-3 p-4 pt-6 *:grow sm:grid sm:grid-cols-2 sm:px-0 sm:pt-8 sm:pb-6">
                                    <Button
                                        color="secondary"
                                        onClick={handleClose}
                                        isDisabled={updateFileMutation.isLoading}
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        type="submit"
                                        color="primary"
                                        isDisabled={!isFormValid}
                                        isLoading={updateFileMutation.isLoading}
                                    >
                                        Renommer
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