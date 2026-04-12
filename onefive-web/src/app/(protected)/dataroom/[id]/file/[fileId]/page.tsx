"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSignedUrl, getFile, getDataroom } from "@/queries/dataroom";
import { useQuery } from "@tanstack/react-query";
import type { FileDocument, FileMetadata } from "@/types/file-viewer";
import { 
    isPDFFile, 
    isDocxFile, 
    isImageFile, 
    isVideoFile 
} from "@/utils/file-utils";
import { useFileSecurity } from "@/hooks/useFileSecurity";
import { useKeyboardShortcuts, type KeyboardShortcut } from "@/hooks/useKeyboardShortcuts";
import PDFViewer from "@/viewers/PDFViewer";
import DocxViewer from "@/viewers/DocxViewer";
import ImageViewer from "@/viewers/ImageViewer";
import VideoViewer from "@/viewers/VideoViewer";
import SecurityAlert from "@/components/SecurityAlert";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Home, AlertCircle, Lock, FileX, Wifi, ChevronRight } from "lucide-react";

const UnauthorizedView = ({ onBack }: { onBack: () => void }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center">
            <Lock className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès non autorisé</h1>
            <p className="text-gray-600 mb-8 max-w-md">
                Vous n'avez pas les permissions nécessaires pour consulter ce fichier.
            </p>
            <button
                onClick={onBack}
                className="inline-flex items-center px-4 py-2 bg-[#5E6AD2] text-white rounded-lg hover:bg-[#5E6AD2]/90 transition-colors"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la dataroom
            </button>
        </div>
    </div>
);

const FileNotFoundView = ({ onBack }: { onBack: () => void }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center">
            <FileX className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Fichier introuvable</h1>
            <p className="text-gray-600 mb-8 max-w-md">
                Le fichier que vous recherchez n'existe plus ou a été déplacé.
            </p>
            <button
                onClick={onBack}
                className="inline-flex items-center px-4 py-2 bg-[#5E6AD2] text-white rounded-lg hover:bg-[#5E6AD2]/90 transition-colors"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la dataroom
            </button>
        </div>
    </div>
);

const NetworkErrorView = ({ onRetry, onBack }: { onRetry: () => void; onBack: () => void }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center">
            <Wifi className="h-16 w-16 text-orange-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Problème de connexion</h1>
            <p className="text-gray-600 mb-8 max-w-md">
                Impossible de charger le fichier. Vérifiez votre connexion internet.
            </p>
            <div className="flex gap-3">
                <button
                    onClick={onRetry}
                    className="inline-flex items-center px-4 py-2 bg-[#5E6AD2] text-white rounded-lg hover:bg-[#5E6AD2]/90 transition-colors"
                >
                    Réessayer
                </button>
                <button
                    onClick={onBack}
                    className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour
                </button>
            </div>
        </div>
    </div>
);

const GenericErrorView = ({ onRetry, onBack }: { onRetry: () => void; onBack: () => void }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h1>
            <p className="text-gray-600 mb-8 max-w-md">
                Une erreur s'est produite lors du chargement du fichier.
            </p>
            <div className="flex gap-3">
                <button
                    onClick={onRetry}
                    className="inline-flex items-center px-4 py-2 bg-[#5E6AD2] text-white rounded-lg hover:bg-[#5E6AD2]/90 transition-colors"
                >
                    Réessayer
                </button>
                <button
                    onClick={onBack}
                    className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour
                </button>
            </div>
        </div>
    </div>
);

const FileBreadcrumb = ({ 
    fileName,
    dataroomName,
    categoryName,
    onBackToDataroom 
}: { 
    fileName?: string;
    dataroomName?: string | null;
    categoryName?: string;
    onBackToDataroom: () => void;
}) => (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
        <nav className="flex items-center space-x-1.5 text-sm text-gray-600">
            <button
                onClick={onBackToDataroom}
                className="flex items-center hover:text-[#5E6AD2] transition-colors flex-shrink-0"
            >
                <Home className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">{dataroomName || "Dataroom"}</span>
            </button>
            {categoryName && (
                <>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-500 hidden sm:inline">{categoryName}</span>
                </>
            )}
            <ChevronRight className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
            <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-xs">
                {fileName || "Fichier"}
            </span>
        </nav>
    </div>
);

const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-32" />
            </div>
        </div>
        <div className="flex h-[calc(100vh-3rem)]">
            <div className="w-80 bg-white border-r border-gray-200 p-6 space-y-6 hidden md:block">
                <Skeleton className="h-5 w-28" />
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="w-8 h-8 rounded-lg" />
                        <div className="space-y-1.5">
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex-1 flex flex-col">
                <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-6 w-12 rounded-full" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded" />
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-[#5E6AD2] border-t-transparent rounded-full" />
                </div>
            </div>
        </div>
    </div>
);

const FileViewerPage = () => {
    const params = useParams();
    const router = useRouter();
    const dataroomId = params.id as string;
    const fileId = params.fileId as string;
    
    const [document, setDocument] = useState<FileDocument | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    useFileSecurity();

    const { data: file, error: fileError, refetch: refetchFile } = useQuery({
        queryKey: ["dataroom-file", dataroomId, fileId, retryCount] as const,
        queryFn: () => getFile({ dataroomId, fileId }),
        enabled: !!fileId && !!dataroomId,
        retry: (failureCount, error: any) => {
            if (error?.response?.status === 403 || error?.response?.status === 404) {
                return false;
            }
            return failureCount < 3;
        },
    });

    const { data: signedUrl, error: signedUrlError, refetch: refetchSignedUrl } = useQuery({
        queryKey: ["signed-url", dataroomId, fileId, retryCount] as const,
        queryFn: () => getSignedUrl(dataroomId, fileId, 'view'),
        enabled: !!fileId && !!dataroomId && !!file,
        retry: (failureCount, error: any) => {
            if (error?.response?.status === 403 || error?.response?.status === 404) {
                return false;
            }
            return failureCount < 3;
        },
    });

    const { data: dataroom } = useQuery({
        queryKey: ["dataroom", dataroomId] as const,
        queryFn: () => getDataroom({ dataroomId }),
        enabled: !!dataroomId,
        staleTime: 5 * 60 * 1000,
    });

    const fileMetadata: FileMetadata | undefined = file ? {
        id: file.id,
        name: file.name,
        size: file.size,
        mimetype: file.mimetype,
        storageId: file.storageId,
        category: file.category,
        uploadedBy: file.uploadedBy,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
    } : undefined;

    // Sibling file navigation
    const siblingFiles = useMemo(() => {
        if (!dataroom?.files || !file?.category?.name) return [];
        return dataroom.files
            .filter(f => f.category === file.category.name)
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [dataroom?.files, file?.category?.name]);

    const currentFileIndex = useMemo(() => {
        return siblingFiles.findIndex(f => f.id === fileId);
    }, [siblingFiles, fileId]);

    const prevFile = currentFileIndex > 0 ? siblingFiles[currentFileIndex - 1] : null;
    const nextFile = currentFileIndex < siblingFiles.length - 1 ? siblingFiles[currentFileIndex + 1] : null;

    const currentFileViewCount = useMemo(() => {
        const match = dataroom?.files?.find(f => f.id === fileId);
        return match?.viewCount;
    }, [dataroom?.files, fileId]);

    const handleBackToDataroom = () => {
        router.push(`/dataroom/${dataroomId}`);
    };

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
        refetchFile();
        refetchSignedUrl();
    };

    const handlePrevFile = useCallback(() => {
        if (prevFile) router.push(`/dataroom/${dataroomId}/file/${prevFile.id}`);
    }, [prevFile, dataroomId, router]);

    const handleNextFile = useCallback(() => {
        if (nextFile) router.push(`/dataroom/${dataroomId}/file/${nextFile.id}`);
    }, [nextFile, dataroomId, router]);

    const handleDownload = useCallback(async () => {
        try {
            const result = await getSignedUrl(dataroomId, fileId, 'download');
            const a = window.document.createElement('a');
            a.href = result.url;
            a.download = file?.name || 'download';
            a.style.display = 'none';
            window.document.body.appendChild(a);
            a.click();
            window.document.body.removeChild(a);
        } catch {
            // Download might not be available if user lacks canDownload permission
        }
    }, [dataroomId, fileId, file?.name]);

    // Keyboard shortcuts
    const shortcutsList: KeyboardShortcut[] = useMemo(() => [
        { key: 'j', label: 'J', description: 'Fichier précédent', handler: handlePrevFile, category: 'Navigation' },
        { key: 'k', label: 'K', description: 'Fichier suivant', handler: handleNextFile, category: 'Navigation' },
        { key: 'ArrowLeft', label: '\u2190', description: 'Fichier précédent', handler: handlePrevFile, category: 'Navigation' },
        { key: 'ArrowRight', label: '\u2192', description: 'Fichier suivant', handler: handleNextFile, category: 'Navigation' },
        { key: 'd', label: 'D', description: 'Télécharger', handler: handleDownload, category: 'Actions' },
        { key: 'Escape', label: 'Esc', description: 'Retour à la dataroom', handler: handleBackToDataroom, category: 'Navigation' },
    ], [handlePrevFile, handleNextFile, handleDownload, handleBackToDataroom]);

    const zoomShortcuts: KeyboardShortcut[] = useMemo(() => [
        { key: '+', label: '+', description: 'Zoom avant', handler: () => {}, category: 'Zoom' },
        { key: '-', label: '-', description: 'Zoom arrière', handler: () => {}, category: 'Zoom' },
        { key: '0', label: '0', description: 'Réinitialiser le zoom', handler: () => {}, category: 'Zoom' },
    ], []);

    const allShortcuts = useMemo(() => [...shortcutsList, ...zoomShortcuts], [shortcutsList, zoomShortcuts]);

    useKeyboardShortcuts({ shortcuts: shortcutsList });

    useEffect(() => {
        if (file && signedUrl?.url) {
            setDocument({
                uri: signedUrl.url,
                fileName: file.name,
                mimetype: file.mimetype
            });
        }
    }, [file, signedUrl]);

    const getErrorType = (error: any) => {
        if (!error) return null;
        const status = error?.response?.status;
        switch (status) {
            case 403: return 'unauthorized';
            case 404: return 'not-found';
            case 0:
            case 'Network Error': return 'network';
            default: return 'generic';
        }
    };

    const errorType = getErrorType(fileError || signedUrlError);

    if (errorType) {
        switch (errorType) {
            case 'unauthorized':
                return <UnauthorizedView onBack={handleBackToDataroom} />;
            case 'not-found':
                return <FileNotFoundView onBack={handleBackToDataroom} />;
            case 'network':
                return <NetworkErrorView onRetry={handleRetry} onBack={handleBackToDataroom} />;
            default:
                return <GenericErrorView onRetry={handleRetry} onBack={handleBackToDataroom} />;
        }
    }

    if (!document) {
        return <LoadingSkeleton />;
    }

    const sharedViewerProps = {
        document,
        fileName: file?.name,
        fileMetadata,
        dataroomId,
        fileId,
        onDownload: handleDownload,
        onPrevFile: prevFile ? handlePrevFile : undefined,
        onNextFile: nextFile ? handleNextFile : undefined,
        hasPrevFile: !!prevFile,
        hasNextFile: !!nextFile,
        viewCount: currentFileViewCount,
        shortcuts: allShortcuts,
    };

    return (
        <div className="ph-no-capture min-h-screen bg-white">
            <FileBreadcrumb
                fileName={file?.name}
                dataroomName={dataroom?.name}
                categoryName={file?.category?.name}
                onBackToDataroom={handleBackToDataroom}
            />
            {isPDFFile(document.mimetype) ? (
                <PDFViewer {...sharedViewerProps} />
            ) : isDocxFile(document.mimetype) ? (
                <DocxViewer {...sharedViewerProps} />
            ) : isImageFile(document.mimetype) ? (
                <ImageViewer {...sharedViewerProps} />
            ) : isVideoFile(document.mimetype) ? (
                <VideoViewer {...sharedViewerProps} />
            ) : (
                <div className="h-screen w-full flex items-center justify-center">
                    <div className="text-center">
                        <FileX className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Type de fichier non supporté</p>
                        <p className="text-sm text-gray-500">
                            Type MIME : {document.mimetype}
                        </p>
                        <button
                            onClick={handleBackToDataroom}
                            className="mt-4 inline-flex items-center px-4 py-2 bg-[#5E6AD2] text-white rounded-lg hover:bg-[#5E6AD2]/90 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour à la dataroom
                        </button>
                    </div>
                </div>
            )}
            <SecurityAlert />
        </div>
    );
};

export default FileViewerPage;
