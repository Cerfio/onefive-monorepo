"use client";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";

interface DocumentViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentDocument: {
        fileName: string;
        uri?: string;
        name?: string;
    } | null;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
    isOpen,
    onClose,
    currentDocument,
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-5xl h-[80vh]">
                <DialogHeader>
                    <DialogTitle>{currentDocument?.fileName}</DialogTitle>
                </DialogHeader>
                <div className="ph-no-capture flex-1 h-full">
                    {currentDocument && currentDocument.uri && (
                        <DocViewer
                            documents={[{
                                uri: currentDocument.uri,
                                fileName: currentDocument.fileName
                            }]}
                            pluginRenderers={DocViewerRenderers}
                            style={{ height: '100%' }}
                            config={{
                                header: {
                                    disableHeader: false,
                                    disableFileName: false,
                                    retainURLParams: false
                                }
                            }}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}; 