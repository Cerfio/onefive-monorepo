import React, { useEffect, useState, useCallback, useRef } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import type { FileDocument, FileMetadata } from "@/types/file-viewer";
import FileInfoPanel from "@/components/FileInfoPanel";
import NavigationBar from "@/components/NavigationBar";
import { useAdvancedFileTracking } from "@/hooks/useAdvancedFileTracking";
import { useFileComments } from "@/hooks/useFileComments";
import { ZoomIn, ZoomOut, Maximize, PanelLeft } from "lucide-react";
import type { KeyboardShortcut } from "@/hooks/useKeyboardShortcuts";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
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

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.25;

const PDFViewer: React.FC<PDFViewerProps> = ({ 
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
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [isCommentsPanelOpen, setIsCommentsPanelOpen] = useState(false);
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [zoom, setZoom] = useState(1);
    const [showThumbnails, setShowThumbnails] = useState(false);
    const pdfContainerRef = useRef<HTMLDivElement>(null);

    const { comments, addComment, editComment, removeComment, isCreating, currentProfileId } = useFileComments({
        dataroomId,
        fileId,
    });

    const { trackPageChange, sendEvent } = useAdvancedFileTracking({
        dataroomId,
        fileId,
        viewerType: 'pdf',
        totalPages: numPages || undefined
    });

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        sendEvent('pdf_loaded', {
            totalPages: numPages,
            fileName: fileName || document.fileName
        });
    }

    const calculatePDFWidth = useCallback(() => {
        if (typeof window === 'undefined') return;
        const sidebarWidth = window.innerWidth >= 768 ? 320 : 0;
        const thumbnailWidth = showThumbnails ? 140 : 0;
        const padding = 64;
        const availableWidth = window.innerWidth - sidebarWidth - thumbnailWidth - padding;
        const maxWidth = Math.min(availableWidth, 1200);
        setContainerWidth(Math.max(400, maxWidth));
    }, [showThumbnails]);

    useEffect(() => {
        calculatePDFWidth();
        window.addEventListener('resize', calculatePDFWidth);
        return () => window.removeEventListener('resize', calculatePDFWidth);
    }, [calculatePDFWidth]);

    useEffect(() => {
        if (!numPages || typeof window === 'undefined') return;

        const timeoutId = setTimeout(() => {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            const pageNum = parseInt(entry.target.getAttribute('data-page-number') || '0');
                            if (pageNum > 0 && pageNum !== pageNumber) {
                                setPageNumber(pageNum);
                                trackPageChange(pageNum);
                            }
                        }
                    });
                },
                { threshold: 0.5, rootMargin: '-10% 0px -10% 0px' }
            );

            const pages = window.document.querySelectorAll<HTMLElement>('.react-pdf__Page');
            pages.forEach((page) => observer.observe(page));

            return () => observer.disconnect();
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [numPages, pageNumber, trackPageChange]);

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
        const newPageNumber = Math.min(numPages || pageNumber, pageNumber + 1);
        setPageNumber(newPageNumber);
        setTimeout(() => scrollToPage(newPageNumber), 100);
    };

    const zoomIn = () => setZoom(prev => Math.min(ZOOM_MAX, +(prev + ZOOM_STEP).toFixed(2)));
    const zoomOut = () => setZoom(prev => Math.max(ZOOM_MIN, +(prev - ZOOM_STEP).toFixed(2)));
    const zoomFitWidth = () => setZoom(1);

    const pageWidth = containerWidth > 0 ? (containerWidth - 40) * zoom : undefined;

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
                    totalPages={numPages || undefined}
                    onPreviousPage={handlePreviousPage}
                    onNextPage={handleNextPage}
                    onAddComment={addComment}
                    onDeleteComment={removeComment}
                    onEditComment={editComment}
                    onScrollToPage={scrollToPage}
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

                {/* Zoom toolbar */}
                <div className="bg-white border-b border-gray-200 px-4 py-1.5 flex items-center justify-center space-x-3">
                    <button
                        onClick={() => setShowThumbnails(prev => !prev)}
                        className={`p-1.5 rounded transition-colors ${showThumbnails ? 'text-[#5E6AD2] bg-[#5E6AD2]/10' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                        title="Miniatures"
                    >
                        <PanelLeft className="h-4 w-4" />
                    </button>
                    <div className="h-4 w-px bg-gray-200" />
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
                    {/* Thumbnails sidebar */}
                    {showThumbnails && numPages && (
                        <div className="w-[140px] border-r border-gray-200 overflow-y-auto bg-gray-100/50 p-2 space-y-2 flex-shrink-0">
                            <Document file={document.uri} loading={null}>
                                {Array.from(new Array(numPages), (_, index) => (
                                    <button
                                        key={`thumb_${index + 1}`}
                                        onClick={() => { setPageNumber(index + 1); scrollToPage(index + 1); }}
                                        className={`w-full rounded-md overflow-hidden border-2 transition-colors cursor-pointer ${
                                            pageNumber === index + 1
                                                ? 'border-[#5E6AD2] shadow-sm'
                                                : 'border-transparent hover:border-gray-300'
                                        }`}
                                    >
                                        <Page
                                            pageNumber={index + 1}
                                            width={116}
                                            renderTextLayer={false}
                                            renderAnnotationLayer={false}
                                        />
                                        <p className={`text-[10px] text-center py-0.5 ${
                                            pageNumber === index + 1 ? 'text-[#5E6AD2] font-medium' : 'text-gray-500'
                                        }`}>
                                            {index + 1}
                                        </p>
                                    </button>
                                ))}
                            </Document>
                        </div>
                    )}

                    {/* Main PDF area */}
                    <div className="flex-1 overflow-auto p-4 sm:p-8" id="pdf-container" ref={pdfContainerRef}>
                        <div className="mx-auto bg-white rounded-lg shadow-lg" style={{ maxWidth: zoom > 1 ? 'none' : `${containerWidth}px` }}>
                            <Document
                                file={document.uri}
                                onLoadSuccess={onDocumentLoadSuccess}
                                className="flex flex-col items-center gap-4 p-4"
                            >
                                {Array.from(new Array(numPages), (_, index) => (
                                    <Page
                                        key={`page_${index + 1}`}
                                        pageNumber={index + 1}
                                        renderTextLayer={true}
                                        renderAnnotationLayer={true}
                                        className="shadow-sm hover:shadow-md transition-shadow duration-200"
                                        data-page-number={index + 1}
                                        width={pageWidth}
                                    />
                                ))}
                            </Document>
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

export default PDFViewer;
