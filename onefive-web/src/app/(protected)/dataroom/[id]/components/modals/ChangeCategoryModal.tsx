"use client";
import React from "react";
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components";
import type { Key } from "react-aria-components";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Select } from "@/components/base/select/select";
import { SwitchHorizontal01 } from "@untitledui/icons";
import { UseMutationResult } from "@tanstack/react-query";

interface ChangeCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileToChangeCategory: {
        id: string;
        name: string;
        category: string;
    } | null;
    newFileCategoryId: string;
    setNewFileCategoryId: (categoryId: string) => void;
    changeCategoryError: string;
    setChangeCategoryError: (error: string) => void;
    updateFileMutation: UseMutationResult<any, any, { fileId: string; categoryId: string }, unknown>;
    categories: Array<{
        id: string;
        name: string;
    }>;
}

export const ChangeCategoryModal: React.FC<ChangeCategoryModalProps> = ({
    isOpen,
    onClose,
    fileToChangeCategory,
    newFileCategoryId,
    setNewFileCategoryId,
    changeCategoryError,
    setChangeCategoryError,
    updateFileMutation,
    categories,
}) => {
    const handleClose = () => {
        setChangeCategoryError("");
        setNewFileCategoryId("");
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (fileToChangeCategory && newFileCategoryId && !updateFileMutation.isLoading) {
            updateFileMutation.mutate({ 
                fileId: fileToChangeCategory.id, 
                categoryId: newFileCategoryId 
            }, {
                onSuccess: () => {
                    handleClose();
                },
            });
        }
    };

    const handleCategoryChange = (categoryId: Key | null) => {
        setNewFileCategoryId(categoryId as string);
        setChangeCategoryError("");
    };

    const isFormValid = newFileCategoryId && 
                       newFileCategoryId !== fileToChangeCategory?.category && 
                       !updateFileMutation.isLoading && 
                       changeCategoryError === "";

    // Filtrer les catégories pour exclure "All Files"
    const availableCategories = categories.filter(category => 
        category.id !== 'all' && 
        category.name.toLowerCase() !== 'all files'
    );

    // Trouver le nom de la catégorie actuelle
    const currentCategoryName = categories.find(cat => cat.id === fileToChangeCategory?.category)?.name || fileToChangeCategory?.category;

    const selectItems = availableCategories.map(category => ({
        id: category.id,
        label: category.name,
        isDisabled: category.id === fileToChangeCategory?.category
    }));

    return (
        <AriaDialogTrigger isOpen={isOpen} onOpenChange={onClose}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog>
                        <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl transition-all sm:max-w-100">
                            <CloseButton onClick={handleClose} theme="light" size="lg" className="absolute top-3 right-3" />
                            <div className="flex flex-col gap-4 px-4 pt-5 sm:px-6 sm:pt-6">
                                <div className="relative w-max">
                                    <SwitchHorizontal01 className="h-8 w-8 text-[#5E6AD2]" data-icon />
                                </div>
                                <div className="z-10 flex flex-col gap-0.5">
                                    <AriaHeading slot="title" className="text-md font-semibold text-primary">
                                        Changer de catégorie
                                    </AriaHeading>
                                    <p className="text-sm text-tertiary">
                                        Sélectionnez une nouvelle catégorie pour le fichier <strong>{fileToChangeCategory?.name}</strong>.
                                        <br />
                                        <span className="text-sm text-tertiary">
                                            Catégorie actuelle : {currentCategoryName}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="h-5 w-full" />
                            <form onSubmit={handleSubmit} className="relative flex flex-col px-4 sm:px-6">
                                <Select
                                    label="Nouvelle catégorie"
                                    placeholder="Sélectionnez une catégorie"
                                    selectedKey={newFileCategoryId}
                                    onSelectionChange={handleCategoryChange}
                                    isDisabled={updateFileMutation.isLoading}
                                    isInvalid={!!changeCategoryError}
                                    hint={changeCategoryError}
                                    isRequired
                                    items={selectItems}
                                >
                                    {(item) => (
                                        <Select.Item id={item.id} isDisabled={item.isDisabled}>
                                            {item.label}
                                        </Select.Item>
                                    )}
                                </Select>
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
                                        Changer de catégorie
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