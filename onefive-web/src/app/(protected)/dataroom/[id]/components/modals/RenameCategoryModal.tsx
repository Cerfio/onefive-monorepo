"use client";
import React from "react";
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Input } from "@/components/base/input/input";
import { Edit03 } from "@untitledui/icons";
import { UseMutationResult } from "@tanstack/react-query";

interface RenameCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    categoryToEdit: {
        id: string;
        name: string;
        count: number | undefined;
    } | null;
    renameCategoryName: string;
    setRenameCategoryName: (name: string) => void;
    renameCategoryError: string;
    setRenameCategoryError: (error: string) => void;
    updateCategoryMutation: UseMutationResult<any, any, { categoryId: string; name: string }, unknown>;
    dataroom: any;
}

export const RenameCategoryModal: React.FC<RenameCategoryModalProps> = ({
    isOpen,
    onClose,
    categoryToEdit,
    renameCategoryName,
    setRenameCategoryName,
    renameCategoryError,
    setRenameCategoryError,
    updateCategoryMutation,
    dataroom,
}) => {
    const handleClose = () => {
        setRenameCategoryError("");
        setRenameCategoryName("");
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (categoryToEdit && renameCategoryName.trim() && !updateCategoryMutation.isLoading) {
            updateCategoryMutation.mutate({ 
                categoryId: categoryToEdit.id, 
                name: renameCategoryName.trim() 
            }, {
                onSuccess: () => {
                    handleClose();
                },
            });
        }
    };

    const handleNameChange = (value: string) => {
        const trimmedName = value.trim();
        setRenameCategoryName(value);

        if (trimmedName) {
            const categoryExists = dataroom?.categories.some(
                (category: any) => 
                    category.name.toLowerCase() === trimmedName.toLowerCase() && 
                    category.id !== categoryToEdit?.id
            );
            setRenameCategoryError(categoryExists ? "Une catégorie avec ce nom existe déjà" : "");
        } else {
            setRenameCategoryError("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !updateCategoryMutation.isLoading && renameCategoryName.trim()) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    const isFormValid = renameCategoryName.trim() && 
                       renameCategoryName !== categoryToEdit?.name && 
                       !updateCategoryMutation.isLoading && 
                       renameCategoryError === "";

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
                                        Renommer la catégorie
                                    </AriaHeading>
                                    <p className="text-sm text-tertiary">
                                        Entrez le nouveau nom pour la catégorie <strong>{categoryToEdit?.name}</strong>.
                                    </p>
                                </div>
                            </div>
                            <div className="h-5 w-full" />
                            <form onSubmit={handleSubmit} className="relative flex flex-col px-4 sm:px-6">
                                <Input
                                    size="md"
                                    label="Nouveau nom"
                                    placeholder="Nom de la catégorie"
                                    value={renameCategoryName}
                                    onChange={handleNameChange}
                                    onKeyDown={handleKeyDown}
                                    isDisabled={updateCategoryMutation.isLoading}
                                    isInvalid={!!renameCategoryError}
                                    hint={renameCategoryError}
                                    isRequired
                                />
                                <div className="z-10 flex flex-1 flex-col-reverse gap-3 p-4 pt-6 *:grow sm:grid sm:grid-cols-2 sm:px-0 sm:pt-8 sm:pb-6">
                                    <Button
                                        color="secondary"
                                        onClick={handleClose}
                                        isDisabled={updateCategoryMutation.isLoading}
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        type="submit"
                                        color="primary"
                                        isDisabled={!isFormValid}
                                        isLoading={updateCategoryMutation.isLoading}
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