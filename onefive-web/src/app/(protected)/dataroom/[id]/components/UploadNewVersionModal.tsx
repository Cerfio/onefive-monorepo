"use client";

import React, { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { AlertTriangle } from "@untitledui/icons";
import { FileIcon as FileTypeIcon } from "@untitledui/file-icons";
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components";
import { FileUpload as FileUploadComponent } from "@/components/application/file-upload/file-upload-base";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Badge } from "@/components/base/badges/badges";
import { toast } from "sonner";
import { DisplayedDocument } from "../types";

interface UploadNewVersionModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: DisplayedDocument | null;
    onUploadNewVersion: (file: File, documentId: string) => Promise<void>;
}

export const UploadNewVersionModal: React.FC<UploadNewVersionModalProps> = ({
    isOpen,
    onClose,
    document,
    onUploadNewVersion,
}) => {
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const _fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen || !document) return null;

    // Fonction utilitaire pour formater la taille des fichiers (améliorée d'UploadModal)
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

    // Fonction pour obtenir l'extension d'un fichier
    const getFileExtension = (filename: string): string => {
        return filename.split('.').pop()?.toLowerCase() || '';
    };

    // Fonction pour convertir l'extension en type pour FileTypeIcon
    const getFileType = (filename: string): string => {
        const extension = getFileExtension(filename);
        
        // Mapper les extensions aux types supportés par FileTypeIcon
        switch (extension) {
            case 'pdf': return 'pdf';
            case 'doc': case 'docx': return 'doc';
            case 'xls': case 'xlsx': return 'xls';
            case 'ppt': case 'pptx': return 'ppt';
            case 'jpg': case 'jpeg': case 'png': case 'gif': case 'svg': return 'jpg';
            case 'mp4': case 'avi': case 'mov': case 'mkv': return 'mp4';
            case 'zip': case 'rar': return 'zip';
            case 'txt': return 'txt';
            case 'csv': return 'csv';
            default: return 'empty'; // Fallback pour types non reconnus
        }
    };

    // Adapter la fonction de drop pour FileUploadComponent
    const handleDropFiles = (files: FileList) => {
        if (files && files[0]) {
            setSelectedFile(files[0]);
        }
    };

    const _handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !document) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            // Simuler le progrès d'upload
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90; // Rester à 90% jusqu'à la fin de l'upload réel
                    }
                    return prev + 10;
                });
            }, 200);

            await onUploadNewVersion(selectedFile, document.id);
            
            clearInterval(progressInterval);
            setUploadProgress(100);
            
            // Calculer le numéro de la nouvelle version
            const currentVersion = typeof document.version === 'number' ? document.version : parseInt(document.version) || 1;
            const newVersion = currentVersion + 1;
            
            toast.success(`Nouvelle version (v${newVersion}) uploadée avec succès !`);
            
            // Reset et fermer
            setTimeout(() => {
                setSelectedFile(null);
                setUploadProgress(0);
                setIsUploading(false);
                onClose();
            }, 1000);

        } catch (error) {
            setIsUploading(false);
            setUploadProgress(0);
            toast.error("Erreur lors de l'upload de la nouvelle version");
            console.error("Upload error:", error);
        }
    };

    const resetModal = () => {
        setSelectedFile(null);
        setUploadProgress(0);
        setIsUploading(false);
        onClose();
    };

    return (
        <AriaDialogTrigger isOpen={isOpen} onOpenChange={onClose}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog>
                        <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl transition-all sm:max-w-[600px]">
                            <CloseButton 
                                onClick={resetModal} 
                                theme="light" 
                                size="lg" 
                                className="absolute top-3 right-3"
                                isDisabled={isUploading}
                            />
                            
                            {/* Header */}
                            <div className="flex flex-col gap-0.5 px-4 pt-5 sm:px-6 sm:pt-6">
                                <AriaHeading slot="title" className="text-md font-semibold text-primary">
                                    Nouvelle version du document
                                </AriaHeading>
                                <p className="text-sm text-tertiary">
                                    Uploadez une nouvelle version de "{document.name}"
                                </p>
                            </div>

                            {/* Version actuelle */}
                            <div className="mx-4 mt-4 p-4 bg-secondary rounded-lg border sm:mx-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <FileTypeIcon 
                                            type={getFileType(document.name)}
                                            theme="light"
                                            variant="default"
                                            className="h-5 w-5" 
                                        />
                                        <div>
                                            <p className="font-medium text-primary">{document.name}</p>
                                            <p className="text-sm text-tertiary">
                                                Version actuelle : v{document.version} • {formatFileSize(parseInt(document.size.replace(/[^\d]/g, '')) * 1024)}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge type="pill-color" color="brand" size="sm">
                                        Version actuelle
                                    </Badge>
                                </div>
                            </div>

                            <div className="h-5 w-full" />

                            {/* Upload zone */}
                            <FileUploadComponent.Root className="flex flex-col gap-4 px-4 sm:px-6">
                                {!selectedFile ? (
                                    <FileUploadComponent.DropZone onDropFiles={handleDropFiles} />
                                ) : (
                                    <div className="space-y-4">
                                        {/* Fichier sélectionné */}
                                        <FileUploadComponent.List className="flex flex-col gap-3">
                                            <FileUploadComponent.ListItemProgressBar
                                                name={selectedFile.name}
                                                size={selectedFile.size}
                                                progress={uploadProgress}
                                                type={selectedFile.type}
                                                failed={false}
                                                onDelete={!isUploading ? () => setSelectedFile(null) : undefined}
                                            />
                                        </FileUploadComponent.List>

                                        {/* Avertissement */}
                                        <div className="flex items-start space-x-3 p-4 bg-warning-25 border border-warning-300 rounded-lg">
                                            <AlertTriangle className="h-5 w-5 text-warning-600 mt-0.5" data-icon />
                                            <div className="text-sm">
                                                <p className="font-medium text-warning-800">Important</p>
                                                <p className="text-warning-700 mt-1">
                                                    Cette nouvelle version remplacera la version actuelle. 
                                                    L'ancienne version restera accessible dans l'historique des versions.
                                                    <br />
                                                    <span className="font-medium">
                                                        Sera la version v{typeof document.version === 'number' ? document.version + 1 : (parseInt(document.version) || 1) + 1}
                                                    </span>
                                                    <br />
                                                    <span className="text-xs text-warning-600">
                                                        Le nom du fichier "{document.name}" sera conservé pour cette nouvelle version.
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </FileUploadComponent.Root>

                            <div className="h-5 w-full" />

                            {/* Footer */}
                            <div className="z-10 flex flex-1 flex-col-reverse gap-3 p-4 pt-6 sm:grid sm:grid-cols-2 sm:justify-end sm:px-6 sm:pt-8 sm:pb-6">
                                <Button
                                    color="secondary"
                                    onClick={resetModal}
                                    isDisabled={isUploading}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    color="primary"
                                    onClick={handleUpload}
                                    isDisabled={!selectedFile || isUploading}
                                    iconLeading={isUploading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        <Upload data-icon />
                                    )}
                                >
                                    {isUploading ? "Upload en cours..." : "Uploader nouvelle version"}
                                </Button>
                            </div>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </AriaDialogTrigger>
    );
}; 