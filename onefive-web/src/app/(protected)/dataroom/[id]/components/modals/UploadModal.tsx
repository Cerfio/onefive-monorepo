import React from 'react';
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components";
import { FileUpload as FileUploadComponent } from "@/components/application/file-upload/file-upload-base";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Select } from "@/components/base/select/select";
import { AlertTriangle } from "@untitledui/icons";

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: () => void;
    filesToUpload: { file: File; category: string; progress?: number; failed?: boolean; }[];
    setFilesToUpload: React.Dispatch<React.SetStateAction<{ file: File; category: string; progress?: number; failed?: boolean; }[]>>;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleFileDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    handleRemoveFile: (index: number) => void;
    handleCategoryChange: (index: number, category: string) => void;
    categories: { id: string; name: string; count?: number; }[];
    isUploading: boolean;
    uploadError: string;
    uploadLimit?: number; // Limite en bytes
}

// Fonction utilitaire pour formater la taille des fichiers
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = bytes / Math.pow(k, i);
    
    // Si c'est en MB et > 900 MB, afficher en GB pour plus de lisibilité
    if (i === 2 && value > 900) {
        const gbValue = bytes / (k * k * k);
        return parseFloat(gbValue.toFixed(2)) + ' GB';
    }
    
    return parseFloat(value.toFixed(2)) + ' ' + sizes[i];
};

export const UploadModal: React.FC<UploadModalProps> = ({
    isOpen,
    onClose,
    onUpload,
    filesToUpload,
    setFilesToUpload: _setFilesToUpload,
    handleFileChange: _handleFileChange,
    handleFileDrop,
    handleRemoveFile,
    handleCategoryChange,
    categories,
    isUploading,
    uploadError,
    uploadLimit = 100 * 1024 * 1024 * 100, // 100GB par défaut
}) => {
    // Calculer la taille totale des fichiers
    const totalSize = filesToUpload.reduce((sum, item) => sum + item.file.size, 0);
    const isOverLimit = totalSize > uploadLimit;

    // Transformer les catégories pour le nouveau composant Select
    const categoryItems = categories
        .filter(category => category.id !== 'all' && category.name.toLowerCase() !== 'all files')
        .map(category => ({
            label: category.name,
            id: category.id,
        }));

    // Adapter la fonction handleFileDrop pour FileUploadComponent
    const handleDropFiles = (files: FileList) => {
        // Créer un événement de drag & drop simulé pour maintenir la compatibilité
        const mockEvent = {
            preventDefault: () => {},
            stopPropagation: () => {},
            dataTransfer: { files }
        } as React.DragEvent<HTMLDivElement>;
        
        handleFileDrop(mockEvent);
    };

    return (
        <AriaDialogTrigger isOpen={isOpen} onOpenChange={onClose}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog>
                        <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl transition-all sm:max-w-[600px]">
                            <CloseButton onClick={onClose} theme="light" size="lg" className="absolute top-3 right-3" />
                            
                            <div className="flex flex-col gap-0.5 px-4 pt-5 sm:px-6 sm:pt-6">
                                <AriaHeading slot="title" className="text-md font-semibold text-primary">
                                    Importer des fichiers
                                </AriaHeading>
                                <p className="text-sm text-tertiary">
                                    Sélectionnez les fichiers à importer et leur catégorie.
                                    <br />
                                    <span className="text-xs text-gray-500">
                                        Espace disponible : {formatFileSize(uploadLimit)}
                                    </span>
                                </p>
                            </div>

                            <div className="h-5 w-full" />

                            <FileUploadComponent.Root className="flex flex-col gap-4 px-4 sm:px-6">
                                <FileUploadComponent.DropZone onDropFiles={handleDropFiles} />
                                
                                {/* Indicateur de taille totale */}
                                {filesToUpload.length > 0 && (
                                    <div className={`text-sm p-2 rounded ${isOverLimit ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                                        <div className="flex items-center space-x-2">
                                            {isOverLimit && <AlertTriangle className="w-4 h-4" data-icon />}
                                            <span>
                                                Taille sélectionnée : {formatFileSize(totalSize)} / {formatFileSize(uploadLimit)} disponibles
                                            </span>
                                        </div>
                                        {isOverLimit && (
                                            <p className="text-xs mt-1">
                                                La taille totale dépasse l'espace disponible. Veuillez retirer des fichiers.
                                            </p>
                                        )}
                                    </div>
                                )}

                                <FileUploadComponent.List className="flex flex-col gap-3">
                                    {filesToUpload.map((item, index) => (
                                        <FileUploadComponent.ListItemProgressBar
                                            key={index}
                                            name={item.file.name}
                                            size={item.file.size}
                                            progress={item.progress || 0}
                                            type={item.file.type}
                                            failed={item.failed}
                                            onDelete={() => handleRemoveFile(index)}
                                            actions={
                                                <Select
                                                    placeholder="Catégorie"
                                                    items={categoryItems}
                                                    defaultSelectedKey={item.category}
                                                    onSelectionChange={(value) => handleCategoryChange(index, value as string)}
                                                    className="text-xs"
                                                >
                                                    {(categoryItem) => (
                                                        <Select.Item id={categoryItem.id}>
                                                            {categoryItem.label}
                                                        </Select.Item>
                                                    )}
                                                </Select>
                                            }
                                        />
                                    ))}
                                </FileUploadComponent.List>

                                {uploadError && (
                                    <p className="text-sm text-red-500">{uploadError}</p>
                                )}
                            </FileUploadComponent.Root>

                            <div className="z-10 flex flex-1 flex-col-reverse gap-3 p-4 pt-6 sm:grid sm:grid-cols-2 sm:justify-end sm:px-6 sm:pt-8 sm:pb-6">
                                <Button color="secondary" onClick={onClose}>
                                    Annuler
                                </Button>
                                <Button
                                    color="primary"
                                    onClick={onUpload}
                                    isDisabled={filesToUpload.length === 0 || isUploading || isOverLimit}
                                >
                                    {isUploading ? "Téléchargement..." : "Télécharger"}
                                </Button>
                            </div>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </AriaDialogTrigger>
    );
}; 