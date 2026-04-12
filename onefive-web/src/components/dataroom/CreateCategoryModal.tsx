import React from "react";
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Input } from "@/components/base/input/input";
import { FolderPlus } from "@untitledui/icons";
import { Dataroom } from "@/types/dataroom";

interface CreateCategoryModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    newCategoryName: string;
    setNewCategoryName: (name: string) => void;
    categoryError: string;
    setCategoryError: (error: string) => void;
    handleCreateCategory: () => void;
    createCategoryMutation: {
        isLoading: boolean;
    };
    dataroom?: Dataroom;
}

export const CreateCategoryModal = ({
    isOpen,
    onOpenChange,
    newCategoryName,
    setNewCategoryName,
    categoryError,
    setCategoryError,
    handleCreateCategory,
    createCategoryMutation,
    dataroom,
}: CreateCategoryModalProps) => {
    const handleClose = () => {
        setCategoryError("");
        setNewCategoryName("");
        onOpenChange(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleCreateCategory();
    };

    const handleNameChange = (value: string) => {
        const trimmedName = value.trim();
        setNewCategoryName(value);

        if (trimmedName) {
            const categoryExists = dataroom?.categories.some(
                category => category.name.toLowerCase() === trimmedName.toLowerCase()
            );
            setCategoryError(categoryExists ? "Une catégorie avec ce nom existe déjà" : "");
        } else {
            setCategoryError("");
        }
    };

    const isFormValid = newCategoryName.trim() && !createCategoryMutation.isLoading && categoryError === "";

    return (
        <AriaDialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog>
                        <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl transition-all sm:max-w-100">
                            <CloseButton onClick={handleClose} theme="light" size="lg" className="absolute top-3 right-3" />
                            <div className="flex flex-col gap-4 px-4 pt-5 sm:px-6 sm:pt-6">
                                <div className="relative w-max">
                                    <FolderPlus className="h-8 w-8 text-[#5E6AD2]" data-icon />
                                </div>
                                <div className="z-10 flex flex-col gap-0.5">
                                    <AriaHeading slot="title" className="text-md font-semibold text-primary">
                                        Créer une nouvelle catégorie
                                    </AriaHeading>
                                    <p className="text-sm text-tertiary">
                                        Ajoutez une nouvelle catégorie pour organiser vos documents
                                    </p>
                                </div>
                            </div>
                            <div className="h-5 w-full" />
                            <form onSubmit={handleSubmit} className="relative flex flex-col px-4 sm:px-6">
                                <Input
                                    size="md"
                                    label="Nom de la catégorie"
                                    placeholder="ex: Documents Juridiques"
                                    value={newCategoryName}
                                    onChange={handleNameChange}
                                    isDisabled={createCategoryMutation.isLoading}
                                    isInvalid={!!categoryError}
                                    hint={categoryError}
                                    isRequired
                                />
                                <div className="z-10 flex flex-1 flex-col-reverse gap-3 p-4 pt-6 *:grow sm:grid sm:grid-cols-2 sm:px-0 sm:pt-8 sm:pb-6">
                                    <Button
                                        color="secondary"
                                        onClick={handleClose}
                                        isDisabled={createCategoryMutation.isLoading}
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        type="submit"
                                        color="primary"
                                        isDisabled={!isFormValid}
                                        isLoading={createCategoryMutation.isLoading}
                                    >
                                        Créer la catégorie
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