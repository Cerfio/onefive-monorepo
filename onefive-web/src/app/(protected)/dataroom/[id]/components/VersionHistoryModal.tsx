"use client";

import React from "react";
import { Download, Clock, User, FileText, Eye } from "lucide-react";
import { FileIcon as FileTypeIcon } from "@untitledui/file-icons";
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Badge } from "@/components/base/badges/badges";
import { DisplayedDocument } from "../types";

interface VersionHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: DisplayedDocument | null;
    onDownloadVersion: (versionId: string, version: number) => void;
    onViewVersion: (versionId: string, version: number) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
    isOpen,
    onClose,
    document,
    onDownloadVersion,
    onViewVersion,
}) => {
    if (!isOpen || !document) return null;

    // Fonction utilitaire pour formater la taille des fichiers (cohérente avec UploadNewVersionModal)
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Créer la liste complète des versions (actuelle + historique)
    const allVersions = [
        // Version actuelle
        {
            version: typeof document.version === "number" ? document.version : 1,
            uploadedAt: document.uploaded,
            uploadedBy: "Vous", // Vous pouvez adapter selon vos données
            size: parseInt(document.size.replace(/[^\d]/g, '')) * (document.size.includes('MB') ? 1024 * 1024 : 1024),
            fileId: document.id,
            isCurrent: true
        },
        // Versions précédentes avec isCurrent: false
        ...(document.versionHistory || []).map(v => ({ ...v, isCurrent: false }))
    ].sort((a, b) => (b.version ?? 0) - (a.version ?? 0)); // Trier par version décroissante

    return (
        <AriaDialogTrigger isOpen={isOpen} onOpenChange={onClose}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog>
                        <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl transition-all sm:max-w-[800px]">
                            <CloseButton 
                                onClick={onClose} 
                                theme="light" 
                                size="lg" 
                                className="absolute top-3 right-3"
                            />
                            
                            {/* Header */}
                            <div className="flex flex-col gap-0.5 px-4 pt-5 sm:px-6 sm:pt-6">
                                <AriaHeading slot="title" className="text-md font-semibold text-primary">
                                    Historique des versions
                                </AriaHeading>
                                <p className="text-sm text-tertiary">
                                    Toutes les versions de "{document.name}"
                                </p>
                            </div>

                            {/* Document info */}
                            <div className="mx-4 mt-4 p-4 bg-secondary rounded-lg border sm:mx-6">
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
                                            {allVersions.length} version{allVersions.length > 1 ? 's' : ''} disponible{allVersions.length > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="h-5 w-full" />

                            {/* Versions list */}
                            <div className="px-4 sm:px-6 max-h-[400px] overflow-y-auto">
                                <div className="space-y-3">
                                    {allVersions.map((version, _index) => (
                                        <div
                                            key={`${version.fileId}-${version.version}`}
                                            className={`border rounded-lg p-4 transition-colors ${
                                                version.isCurrent 
                                                    ? 'border-brand bg-brand/5' 
                                                    : 'border-quaternary hover:border-tertiary bg-secondary'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    {/* Version number et badge */}
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                                                            version.isCurrent
                                                                ? 'bg-brand text-white'
                                                                : 'bg-tertiary text-secondary'
                                                        }`}>
                                                            v{version.version}
                                                        </div>
                                                        {version.isCurrent && (
                                                            <Badge type="pill-color" color="brand" size="sm">
                                                                Version actuelle
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {/* Informations */}
                                                    <div className="flex-1">
                                                        <div className="flex flex-col space-y-1">
                                                            <div className="flex items-center space-x-4 text-sm text-tertiary">
                                                                <div className="flex items-center space-x-1">
                                                                    <User className="h-4 w-4" />
                                                                    <span>{version.uploadedBy}</span>
                                                                </div>
                                                                <div className="flex items-center space-x-1">
                                                                    <Clock className="h-4 w-4" />
                                                                    <span>{formatDate(version.uploadedAt)}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-1 text-xs text-quaternary">
                                                                <FileTypeIcon 
                                                                    type={getFileType(document.name)}
                                                                    theme="light"
                                                                    variant="default"
                                                                    className="h-3 w-3" 
                                                                />
                                                                <span>{formatFileSize(version.size)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        color="secondary"
                                                        size="sm"
                                                        onClick={() => onViewVersion(version.fileId, version.version)}
                                                        iconLeading={<Eye className="h-4 w-4" />}
                                                    >
                                                        Voir
                                                    </Button>
                                                    <Button
                                                        color="secondary"
                                                        size="sm"
                                                        onClick={() => onDownloadVersion(version.fileId, version.version)}
                                                        iconLeading={<Download className="h-4 w-4" />}
                                                    >
                                                        Télécharger
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Informations supplémentaires */}
                                {allVersions.length > 1 && (
                                    <div className="mt-6 p-4 bg-info-25 border border-info-300 rounded-lg">
                                        <div className="flex items-start space-x-3">
                                            <FileText className="h-5 w-5 text-info-600 mt-0.5" />
                                            <div className="text-sm">
                                                <p className="font-medium text-info-800">À propos des versions</p>
                                                <p className="text-info-700 mt-1">
                                                    Chaque version de votre document est conservée automatiquement. 
                                                    Vous pouvez à tout moment consulter ou télécharger une version précédente.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="h-5 w-full" />

                            {/* Footer */}
                            <div className="z-10 flex justify-end p-4 pt-6 sm:px-6 sm:pt-8 sm:pb-6">
                                <Button 
                                    color="primary"
                                    size="lg"
                                    onClick={onClose}
                                >
                                    Fermer
                                </Button>
                            </div>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </AriaDialogTrigger>
    );
}; 