"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/base/input/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Group } from "../../types";

interface FileSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    displayedDocuments: Array<{
        id: string;
        name: string;
        icon: React.ReactNode;
        category: string;
        uploaded: string;
        views: number;
        size: string;
    }>;
    selectedFiles: string[];
    onFileSelection: (fileId: string) => void;
    groups: Group[];
    activeGroupId: string;
    setGroups: (updater: (prev: Group[]) => Group[]) => void;
    onConfirmSelection: () => void;
}

export const FileSelectionModal: React.FC<FileSelectionModalProps> = ({
    isOpen,
    onClose,
    displayedDocuments,
    selectedFiles,
    onFileSelection,
    groups: _groups,
    activeGroupId,
    setGroups,
    onConfirmSelection,
}) => {
    const handleConfirm = () => {
        // Mettre à jour les accès directs du groupe actif
        setGroups(prevGroups =>
            prevGroups.map(g =>
                g.id === activeGroupId
                    ? {
                        ...g,
                        files: [
                            ...g.files.filter(f => selectedFiles.includes(f.id)),
                            ...displayedDocuments
                                .filter(doc => selectedFiles.includes(doc.id) && !g.files.some(f => f.id === doc.id))
                                .map(doc => ({
                                    id: doc.id,
                                    name: doc.name,
                                    mimetype: 'mimetype' in doc ? (doc as any).mimetype : undefined,
                                    size: 'size' in doc ? Number((doc as any).size) : 0,
                                    category: doc.category,
                                    uploaded: doc.uploaded,
                                    views: 'views' in doc ? (doc as any).views : 0,
                                    version: 'version' in doc ? (doc as any).version : undefined,
                                    originalFileId: 'originalFileId' in doc ? (doc as any).originalFileId : undefined,
                                    previousVersionId: 'previousVersionId' in doc ? (doc as any).previousVersionId : undefined,
                                    hasNewVersion: 'hasNewVersion' in doc ? (doc as any).hasNewVersion : undefined,
                                    lastVersionUpdate: 'lastVersionUpdate' in doc ? (doc as any).lastVersionUpdate : undefined,
                                    versionHistory: 'versionHistory' in doc ? (doc as any).versionHistory : undefined,
                                }))
                        ]
                    }
                    : g
            )
        );
        onConfirmSelection();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Sélectionner des fichiers</DialogTitle>
                    <DialogDescription>
                        Choisissez les fichiers auxquels le groupe aura accès
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="mb-4">
                        <Input
                            type="text"
                            placeholder="Rechercher des fichiers..."
                            className="w-full"
                        />
                    </div>

                    <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
                        {displayedDocuments.map((doc) => (
                            <div
                                key={doc.id}
                                className="p-3 flex items-center justify-between hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-3">
                                    {doc.icon}
                                    <div>
                                        <p className="font-medium text-sm">{doc.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {doc.category} • {doc.size}
                                        </p>
                                    </div>
                                </div>
                                <Checkbox
                                    checked={selectedFiles.includes(doc.id)}
                                    onCheckedChange={() => onFileSelection(doc.id)}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        className="bg-[#5E6AD2] hover:bg-[#4F58B8]"
                    >
                        Confirmer la sélection
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}; 