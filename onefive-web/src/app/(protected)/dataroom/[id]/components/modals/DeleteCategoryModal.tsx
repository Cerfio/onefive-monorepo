"use client";
import React from "react";
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Input } from "@/components/base/input/input";
import { Trash01 } from "@untitledui/icons";
import { UseMutationResult } from "@tanstack/react-query";

interface DeleteCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    categoryToEdit: {
        id: string;
        name: string;
        count: number | undefined;
    } | null;
    deleteConfirmationName: string;
    setDeleteConfirmationName: (name: string) => void;
    deleteCategoryMutation: UseMutationResult<any, any, { categoryId: string }, unknown>;
}

export const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({
    isOpen,
    onClose,
    categoryToEdit,
    deleteConfirmationName,
    setDeleteConfirmationName,
    deleteCategoryMutation,
}) => {
    const handleClose = () => {
        setDeleteConfirmationName("");
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (categoryToEdit && deleteConfirmationName === categoryToEdit.name && !deleteCategoryMutation.isLoading) {
            deleteCategoryMutation.mutate({ categoryId: categoryToEdit.id }, {
                onSuccess: () => {
                    handleClose();
                },
            });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !deleteCategoryMutation.isLoading && deleteConfirmationName === categoryToEdit?.name) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    const isFormValid = deleteConfirmationName === categoryToEdit?.name && 
                       !deleteCategoryMutation.isLoading;

    return (
        <AriaDialogTrigger isOpen={isOpen} onOpenChange={onClose}>
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
                                        Supprimer la catégorie
                                    </AriaHeading>
                                    <p className="text-sm text-tertiary">
                                        Cette action est irréversible. Tous les documents associés devront
                                        être réassignés ou seront déplacés vers "Autres".
                                        <br /><br />
                                        Pour confirmer, veuillez taper <strong className="text-red-600">{categoryToEdit?.name}</strong> ci-dessous.
                                    </p>
                                </div>
                            </div>
                            <div className="h-5 w-full" />
                            <form onSubmit={handleSubmit} className="relative flex flex-col px-4 sm:px-6">
                                <Input
                                    size="md"
                                    label="Confirmer le nom"
                                    placeholder={`Tapez "${categoryToEdit?.name}"`}
                                    value={deleteConfirmationName}
                                    onChange={setDeleteConfirmationName}
                                    onKeyDown={handleKeyDown}
                                    isDisabled={deleteCategoryMutation.isLoading}
                                    isRequired
                                />
                                <div className="z-10 flex flex-1 flex-col-reverse gap-3 p-4 pt-6 *:grow sm:grid sm:grid-cols-2 sm:px-0 sm:pt-8 sm:pb-6">
                                    <Button
                                        color="secondary"
                                        onClick={handleClose}
                                        isDisabled={deleteCategoryMutation.isLoading}
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        type="submit"
                                        color="primary-destructive"
                                        isDisabled={!isFormValid}
                                        isLoading={deleteCategoryMutation.isLoading}
                                    >
                                        Supprimer la catégorie
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