import React, { useState, useRef, useEffect, useCallback } from "react";
import type { FileDocument, FileMetadata } from "@/types/file-viewer";
import FileInfoPanel from "@/components/FileInfoPanel";
import NavigationBar from "@/components/NavigationBar";
import { useAdvancedFileTracking } from "@/hooks/useAdvancedFileTracking";
import { useFileComments } from "@/hooks/useFileComments";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import type { KeyboardShortcut } from "@/hooks/useKeyboardShortcuts";

interface ImageViewerProps {
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
const ZOOM_MAX = 5;
const ZOOM_STEP = 0.25;

const ImageViewer: React.FC<ImageViewerProps> = ({ 
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
    const [zoom, setZoom] = useState(1);
    const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const { comments, addComment, editComment, removeComment, isCreating, currentProfileId } = useFileComments({
        dataroomId,
        fileId,
    });

    const { trackZoom, trackInteraction, sendEvent } = useAdvancedFileTracking({
        dataroomId,
        fileId,
        viewerType: 'image'
    });

    // Ctrl+wheel zoom
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const handleWheel = (e: WheelEvent) => {
            if (!e.ctrlKey && !e.metaKey) return;
            e.preventDefault();
            const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
            setZoom(prev => {
                const next = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, +(prev + delta).toFixed(2)));
                trackZoom(next);
                return next;
            });
        };

        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, [trackZoom]);

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

    const handleDoubleClick = useCallback(() => {
        const newZoom = zoom === 1 ? 2 : 1;
        setZoom(newZoom);
        trackZoom(newZoom);
        trackInteraction('image_double_click', { previousScale: zoom, newScale: newZoom });
    }, [zoom, trackZoom, trackInteraction]);

    const isZoomed = zoom !== 1;

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

                {/* Zoom toolbar */}
                <div className="bg-white border-b border-gray-200 px-4 py-1.5 flex items-center justify-center space-x-3">
                    <button
                        onClick={() => setZoom(prev => Math.max(ZOOM_MIN, +(prev - ZOOM_STEP).toFixed(2)))}
                        disabled={zoom <= ZOOM_MIN}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-30 transition-colors"
                    >
                        <ZoomOut className="h-4 w-4" />
                    </button>
                    <div className="w-24 sm:w-32">
                        <Slider
                            value={[zoom * 100]}
                            min={ZOOM_MIN * 100}
                            max={ZOOM_MAX * 100}
                            step={5}
                            onValueChange={([val]) => setZoom(+(val / 100).toFixed(2))}
                        />
                    </div>
                    <span className="text-xs font-medium text-gray-600 tabular-nums w-12 text-center">
                        {Math.round(zoom * 100)}%
                    </span>
                    <button
                        onClick={() => setZoom(prev => Math.min(ZOOM_MAX, +(prev + ZOOM_STEP).toFixed(2)))}
                        disabled={zoom >= ZOOM_MAX}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-30 transition-colors"
                    >
                        <ZoomIn className="h-4 w-4" />
                    </button>
                    {isZoomed && (
                        <>
                            <div className="h-4 w-px bg-gray-200" />
                            <button
                                onClick={() => setZoom(1)}
                                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                title="Réinitialiser le zoom (0)"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </button>
                        </>
                    )}
                </div>

                <div className="flex-1 overflow-auto p-4 sm:p-8" ref={containerRef}>
                    <div className={`mx-auto ${isZoomed ? '' : 'max-w-4xl'} bg-white rounded-lg shadow-lg p-4`}>
                        <div className="relative w-full flex items-center justify-center">
                            <img
                                src={document.uri}
                                alt={fileName}
                                className="cursor-pointer select-none"
                                draggable={false}
                                style={{
                                    maxWidth: isZoomed ? 'none' : '100%',
                                    maxHeight: isZoomed ? 'none' : 'calc(100vh - 240px)',
                                    width: isZoomed && naturalSize.w ? `${naturalSize.w * zoom}px` : undefined,
                                    height: isZoomed && naturalSize.h ? `${naturalSize.h * zoom}px` : undefined,
                                    objectFit: 'contain',
                                }}
                                onLoad={(e) => {
                                    const img = e.currentTarget;
                                    setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
                                    sendEvent('image_loaded', { fileName: fileName || document.fileName });
                                }}
                                onError={() => {
                                    sendEvent('image_load_error', { fileName: fileName || document.fileName });
                                }}
                                onDoubleClick={handleDoubleClick}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageViewer;
