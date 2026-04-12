import React, { useState } from "react";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";
import type { FileDocument, FileMetadata } from "@/types/file-viewer";
import FileInfoPanel from "@/components/FileInfoPanel";
import NavigationBar from "@/components/NavigationBar";
import { useAdvancedFileTracking } from "@/hooks/useAdvancedFileTracking";
import { useFileComments } from "@/hooks/useFileComments";
import type { KeyboardShortcut } from "@/hooks/useKeyboardShortcuts";

interface DocxViewerProps {
    document: FileDocument;
    fileName?: string;
    fileMetadata?: FileMetadata;
    dataroomId: string;
    fileId: string;
    onDownload?: () => void;
    onPrevFile?: () => void;
    onNextFile?: () => void;
    hasPrevFile?: boolean;
    hasNextFile?: boolean;
    viewCount?: number;
    shortcuts?: KeyboardShortcut[];
}

const DocxViewer: React.FC<DocxViewerProps> = ({ 
    document, 
    fileName, 
    fileMetadata,
    dataroomId,
    fileId,
    onDownload,
    onPrevFile,
    onNextFile,
    hasPrevFile,
    hasNextFile,
    viewCount,
    shortcuts,
}) => {
    const [isCommentsPanelOpen, setIsCommentsPanelOpen] = useState(false);

    const { comments, addComment, editComment, removeComment, isCreating, currentProfileId } = useFileComments({
        dataroomId,
        fileId,
    });

    useAdvancedFileTracking({
        dataroomId,
        fileId,
        viewerType: 'docx'
    });

    return (
        <div className="h-screen w-full flex bg-gray-50">
            <FileInfoPanel fileMetadata={fileMetadata} viewCount={viewCount} />

            <div className="flex-1 flex flex-col min-w-0">
                <NavigationBar
                    fileName={fileName}
                    fileType={document.mimetype}
                    comments={comments}
                    isCommentsPanelOpen={isCommentsPanelOpen}
                    setIsCommentsPanelOpen={setIsCommentsPanelOpen}
                    onAddComment={addComment}
                    onDeleteComment={removeComment}
                    onEditComment={editComment}
                    isCreating={isCreating}
                    currentProfileId={currentProfileId}
                    onDownload={onDownload}
                    onPrevFile={onPrevFile}
                    onNextFile={onNextFile}
                    hasPrevFile={hasPrevFile}
                    hasNextFile={hasNextFile}
                    fileMetadata={fileMetadata}
                    viewCount={viewCount}
                    shortcuts={shortcuts}
                />

                <div className="flex-1 overflow-auto p-4 sm:p-8">
                    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
                        <div className="relative">
                            <DocViewer
                                documents={[document]}
                                pluginRenderers={DocViewerRenderers}
                                style={{ height: 'calc(100vh - 200px)' }}
                                config={{
                                    header: {
                                        disableHeader: true,
                                        disableFileName: true,
                                        retainURLParams: false
                                    },
                                    pdfZoom: {
                                        defaultZoom: 1.2,
                                        zoomJump: 0.1
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocxViewer;
