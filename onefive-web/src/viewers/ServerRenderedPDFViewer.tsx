import React, { useEffect, useState, useCallback, useRef } from "react";
import type { FileDocument, FileMetadata } from "@/types/file-viewer";
import { api } from "@/utils/kyInstance";
import FileInfoPanel from "@/components/FileInfoPanel";
import NavigationBar from "@/components/NavigationBar";
import { useAdvancedFileTracking } from "@/hooks/useAdvancedFileTracking";
import { useFileComments } from "@/hooks/useFileComments";
import { ZoomIn, ZoomOut, Maximize, ShieldCheck } from "lucide-react";
import type { KeyboardShortcut } from "@/hooks/useKeyboardShortcuts";

interface ServerRenderedPDFViewerProps {
    document: FileDocument;
    fileName?: string;
    fileMetadata?: FileMetadata;
    dataroomId: string;
    fileId: string;
    numPages: number;
    onPrevFile?: () => void;
    onNextFile?: () => void;
    hasPrevFile?: boolean;
    hasNextFile?: boolean;
    viewCount?: number;
    shortcuts?: KeyboardShortcut[];
}

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.25;
// Ratio A4 portrait pour dimensionner les placeholders avant chargement.
const DEFAULT_ASPECT = 1.414;

/**
 * Viewer « view-only réel » : les pages sont rasterisées côté serveur en PNG
 * avec filigrane baké (identité du lecteur), récupérées en authentifié. Le PDF
 * brut n'est jamais exposé — pas de couche texte copiable, filigrane inarrachable.
 */
const ServerRenderedPDFViewer: React.FC<ServerRenderedPDFViewerProps> = ({
    document,
    fileName,
    fileMetadata,
    dataroomId,
    fileId,
    numPages,
    onPrevFile,
    onNextFile,
    hasPrevFile,
    hasNextFile,
    viewCount,
    shortcuts,
}) => {
    const [pageNumber, setPageNumber] = useState(1);
    const [isCommentsPanelOpen, setIsCommentsPanelOpen] = useState(false);
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [zoom, setZoom] = useState(1);
    // objectURL par page (index 0 = page 1), '' = à charger, 'error' = échec.
    const [pageUrls, setPageUrls] = useState<Record<number, string>>({});
    const pdfContainerRef = useRef<HTMLDivElement>(null);
    const loadingRef = useRef<Set<number>>(new Set());
    const urlsRef = useRef<Record<number, string>>({});

    const { comments, addComment, editComment, removeComment, isCreating, currentProfileId } = useFileComments({
        dataroomId,
        fileId,
    });

    const { trackPageChange, sendEvent } = useAdvancedFileTracking({
        dataroomId,
        fileId,
        viewerType: 'pdf',
        totalPages: numPages,
    });

    useEffect(() => {
        sendEvent('pdf_loaded', {
            totalPages: numPages,
            fileName: fileName || document.fileName,
            rendering: 'server',
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadPage = useCallback(async (page: number) => {
        if (page < 1 || page > numPages) return;
        if (urlsRef.current[page] || loadingRef.current.has(page)) return;
        loadingRef.current.add(page);
        try {
            const blob = await api
                .get(`dataroom/${dataroomId}/file/${fileId}/render/page/${page}`)
                .blob();
            const url = URL.createObjectURL(blob);
            urlsRef.current[page] = url;
            setPageUrls((prev) => ({ ...prev, [page]: url }));
        } catch {
            setPageUrls((prev) => ({ ...prev, [page]: 'error' }));
        } finally {
            loadingRef.current.delete(page);
        }
    }, [dataroomId, fileId, numPages]);

    // Charge la première page tôt.
    useEffect(() => {
        loadPage(1);
        if (numPages > 1) loadPage(2);
    }, [loadPage, numPages]);

    // Révoque tous les object URLs au démontage.
    useEffect(() => {
        return () => {
            Object.values(urlsRef.current).forEach((u) => {
                if (u && u !== 'error') URL.revokeObjectURL(u);
            });
        };
    }, []);

    const calculateWidth = useCallback(() => {
        if (typeof window === 'undefined') return;
        const sidebarWidth = window.innerWidth >= 768 ? 320 : 0;
        const padding = 64;
        const availableWidth = window.innerWidth - sidebarWidth - padding;
        setContainerWidth(Math.max(400, Math.min(availableWidth, 1200)));
    }, []);

    useEffect(() => {
        calculateWidth();
        window.addEventListener('resize', calculateWidth);
        return () => window.removeEventListener('resize', calculateWidth);
    }, [calculateWidth]);

    // Observe les pages : suit la page courante (tracking) + charge à la volée.
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const timeoutId = setTimeout(() => {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        const pageNum = parseInt(entry.target.getAttribute('data-page-number') || '0');
                        if (!pageNum) return;
                        if (entry.isIntersecting) {
                            loadPage(pageNum);
                            loadPage(pageNum + 1); // préchargement suivant
                            if (entry.intersectionRatio >= 0.5 && pageNum !== pageNumber) {
                                setPageNumber(pageNum);
                                trackPageChange(pageNum);
                            }
                        }
                    });
                },
                { threshold: [0.01, 0.5], rootMargin: '200px 0px 200px 0px' }
            );
            const pages = window.document.querySelectorAll<HTMLElement>('[data-page-number]');
            pages.forEach((page) => observer.observe(page));
            return () => observer.disconnect();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [numPages, pageNumber, loadPage, trackPageChange]);

    // Ctrl+wheel zoom
    useEffect(() => {
        const el = pdfContainerRef.current;
        if (!el) return;
        const handleWheel = (e: WheelEvent) => {
            if (!e.ctrlKey && !e.metaKey) return;
            e.preventDefault();
            const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
            setZoom(prev => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, +(prev + delta).toFixed(2))));
        };
        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, []);

    // Keyboard zoom
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
            if (e.key === '+' || e.key === '=') {
                e.preventDefault();
                setZoom(prev => Math.min(ZOOM_MAX, +(prev + ZOOM_STEP).toFixed(2)));
            } else if (e.key === '-') {
                e.preventDefault();
                setZoom(prev => Math.max(ZOOM_MIN, +(prev - ZOOM_STEP).toFixed(2)));
            } else if (e.key === '0') {
                e.preventDefault();
                setZoom(1);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const scrollToPage = useCallback((targetPage: number) => {
        const pageElement = window.document.querySelector(`[data-page-number="${targetPage}"]`);
        const container = pdfContainerRef.current;
        if (pageElement && container) {
            const containerRect = container.getBoundingClientRect();
            const pageRect = pageElement.getBoundingClientRect();
            const scrollTop = container.scrollTop + (pageRect.top - containerRect.top) - 20;
            container.scrollTo({ top: scrollTop, behavior: 'smooth' });
        }
    }, []);

    const handlePreviousPage = () => {
        const newPageNumber = Math.max(1, pageNumber - 1);
        setPageNumber(newPageNumber);
        setTimeout(() => scrollToPage(newPageNumber), 100);
    };

    const handleNextPage = () => {
        const newPageNumber = Math.min(numPages, pageNumber + 1);
        setPageNumber(newPageNumber);
        setTimeout(() => scrollToPage(newPageNumber), 100);
    };

    const zoomIn = () => setZoom(prev => Math.min(ZOOM_MAX, +(prev + ZOOM_STEP).toFixed(2)));
    const zoomOut = () => setZoom(prev => Math.max(ZOOM_MIN, +(prev - ZOOM_STEP).toFixed(2)));
    const zoomFitWidth = () => setZoom(1);

    const pageWidth = containerWidth > 0 ? (containerWidth - 40) * zoom : 800;

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
                    pageNumber={pageNumber}
                    totalPages={numPages}
                    onPreviousPage={handlePreviousPage}
                    onNextPage={handleNextPage}
                    onAddComment={addComment}
                    onDeleteComment={removeComment}
                    onEditComment={editComment}
                    onScrollToPage={scrollToPage}
                    isCreating={isCreating}
                    currentProfileId={currentProfileId}
                    onPrevFile={onPrevFile}
                    onNextFile={onNextFile}
                    hasPrevFile={hasPrevFile}
                    hasNextFile={hasNextFile}
                    fileMetadata={fileMetadata}
                    viewCount={viewCount}
                    shortcuts={shortcuts}
                />

                {/* Bandeau view-only */}
                <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 flex items-center justify-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                    <span className="text-xs font-medium text-amber-700">
                        Lecture seule — document filigrané, téléchargement désactivé
                    </span>
                </div>

                {/* Zoom toolbar */}
                <div className="bg-white border-b border-gray-200 px-4 py-1.5 flex items-center justify-center space-x-3">
                    <button
                        onClick={zoomOut}
                        disabled={zoom <= ZOOM_MIN}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-30 transition-colors"
                        title="Zoom arrière (-)"
                    >
                        <ZoomOut className="h-4 w-4" />
                    </button>
                    <span className="text-xs font-medium text-gray-600 tabular-nums w-12 text-center">
                        {Math.round(zoom * 100)}%
                    </span>
                    <button
                        onClick={zoomIn}
                        disabled={zoom >= ZOOM_MAX}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-30 transition-colors"
                        title="Zoom avant (+)"
                    >
                        <ZoomIn className="h-4 w-4" />
                    </button>
                    <div className="h-4 w-px bg-gray-200" />
                    <button
                        onClick={zoomFitWidth}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                        title="Ajuster à la largeur (0)"
                    >
                        <Maximize className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 overflow-auto p-4 sm:p-8 select-none" ref={pdfContainerRef}>
                        <div className="mx-auto flex flex-col items-center gap-4" style={{ maxWidth: zoom > 1 ? 'none' : `${containerWidth}px` }}>
                            {Array.from(new Array(numPages), (_, index) => {
                                const page = index + 1;
                                const url = pageUrls[page];
                                return (
                                    <div
                                        key={`spage_${page}`}
                                        data-page-number={page}
                                        className="bg-white rounded-lg shadow-sm flex items-center justify-center overflow-hidden"
                                        style={{
                                            width: pageWidth,
                                            minHeight: url && url !== 'error' ? undefined : pageWidth * DEFAULT_ASPECT,
                                        }}
                                    >
                                        {url && url !== 'error' ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={url}
                                                alt={`Page ${page}`}
                                                width={pageWidth}
                                                className="block w-full h-auto pointer-events-none"
                                                draggable={false}
                                            />
                                        ) : url === 'error' ? (
                                            <div className="text-sm text-gray-400 p-8">Impossible de charger la page {page}</div>
                                        ) : (
                                            <div className="animate-spin h-6 w-6 border-2 border-[#5E6AD2] border-t-transparent rounded-full" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="bg-white border-t border-gray-200 px-6 py-2">
                    <div className="mx-auto" style={{ maxWidth: `${containerWidth}px` }}>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                                className="bg-[#5E6AD2] h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${(pageNumber / (numPages || 1)) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServerRenderedPDFViewer;
