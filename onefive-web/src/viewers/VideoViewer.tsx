import React, { useState } from "react";
import type { FileDocument, FileMetadata } from "@/types/file-viewer";
import { formatTime } from "@/utils/file-utils";
import { useVideoPlayer } from "@/hooks/useVideoPlayer";
import { useAdvancedFileTracking } from "@/hooks/useAdvancedFileTracking";
import { useFileComments } from "@/hooks/useFileComments";
import FileInfoPanel from "@/components/FileInfoPanel";
import NavigationBar from "@/components/NavigationBar";
import { Heart, HelpCircle, AlertCircle } from "lucide-react";
import type { KeyboardShortcut } from "@/hooks/useKeyboardShortcuts";

interface VideoViewerProps {
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

const VideoViewer: React.FC<VideoViewerProps> = ({ 
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

    const {
        videoRef,
        playbackRate,
        chapters,
        reactions,
        addReaction,
        goToChapter,
        changePlaybackRate,
        handlers
    } = useVideoPlayer({ dataroomId, fileId });

    const { trackVideoEvent, trackInteraction, sendEvent } = useAdvancedFileTracking({
        dataroomId,
        fileId,
        viewerType: 'video'
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
                    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-4">
                        <div className="relative w-full h-full flex flex-col items-center justify-center">
                            <video
                                ref={videoRef}
                                src={document.uri}
                                controls
                                className="max-w-full max-h-[calc(100vh-280px)] rounded"
                                style={{
                                    userSelect: 'none',
                                    WebkitUserSelect: 'none',
                                    MozUserSelect: 'none',
                                    msUserSelect: 'none'
                                } as React.CSSProperties}
                                controlsList="nodownload"
                                onContextMenu={(e) => e.preventDefault()}
                                onPlay={(e) => { handlers.handlePlay(e); trackVideoEvent('play', e.currentTarget); }}
                                onPause={(e) => { handlers.handlePause(e); trackVideoEvent('pause', e.currentTarget); }}
                                onTimeUpdate={(e) => { handlers.handleTimeUpdate(e); trackVideoEvent('timeupdate', e.currentTarget); }}
                                onEnded={(e) => { handlers.handleEnded(e); trackVideoEvent('ended', e.currentTarget); }}
                                onSeeked={(e) => { handlers.handleSeeked(e); trackVideoEvent('seeked', e.currentTarget); }}
                                onLoadedData={() => {
                                    sendEvent('video_loaded', { fileName: fileName || document.fileName, duration: videoRef.current?.duration });
                                }}
                                onError={() => {
                                    sendEvent('video_load_error', { fileName: fileName || document.fileName });
                                }}
                                onVolumeChange={(e) => {
                                    trackInteraction('volume_change', { volume: e.currentTarget.volume, muted: e.currentTarget.muted });
                                }}
                                onRateChange={(e) => {
                                    trackInteraction('playback_rate_change', { playbackRate: e.currentTarget.playbackRate });
                                }}
                            >
                                {"Votre navigateur ne supporte pas la lecture de vidéos."}
                            </video>

                            <div className="w-full mt-4 space-y-4">
                                {chapters.length > 0 && (
                                    <div className="flex space-x-2 overflow-x-auto pb-2">
                                        {chapters.map((chapter) => (
                                            <button
                                                key={chapter.id}
                                                onClick={() => goToChapter(chapter)}
                                                className="px-3 py-1.5 text-xs bg-[#5E6AD2]/10 text-[#5E6AD2] hover:bg-[#5E6AD2]/20 rounded-md font-medium transition-colors whitespace-nowrap"
                                            >
                                                {chapter.title} ({formatTime(chapter.startTime)})
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center justify-center space-x-4">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => {
                                                addReaction('like');
                                                trackInteraction('video_reaction', { reactionType: 'like', currentTime: videoRef.current?.currentTime });
                                            }}
                                            className="p-2 text-gray-500 hover:text-[#5E6AD2] transition-colors rounded-lg hover:bg-[#5E6AD2]/10"
                                            title="J'aime"
                                        >
                                            <Heart className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                addReaction('question');
                                                trackInteraction('video_reaction', { reactionType: 'question', currentTime: videoRef.current?.currentTime });
                                            }}
                                            className="p-2 text-gray-500 hover:text-[#5E6AD2] transition-colors rounded-lg hover:bg-[#5E6AD2]/10"
                                            title="Question"
                                        >
                                            <HelpCircle className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                addReaction('important');
                                                trackInteraction('video_reaction', { reactionType: 'important', currentTime: videoRef.current?.currentTime });
                                            }}
                                            className="p-2 text-gray-500 hover:text-[#5E6AD2] transition-colors rounded-lg hover:bg-[#5E6AD2]/10"
                                            title="Important"
                                        >
                                            <AlertCircle className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <div className="h-5 w-px bg-gray-200" />

                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-600">Vitesse :</span>
                                        <select
                                            value={playbackRate}
                                            onChange={(e) => {
                                                const newRate = parseFloat(e.target.value);
                                                changePlaybackRate(newRate);
                                                trackInteraction('playback_speed_change', {
                                                    previousRate: playbackRate,
                                                    newRate,
                                                    currentTime: videoRef.current?.currentTime
                                                });
                                            }}
                                            className="text-sm border border-gray-300 rounded-md px-2 py-1"
                                        >
                                            <option value="0.5">0.5x</option>
                                            <option value="1">1x</option>
                                            <option value="1.5">1.5x</option>
                                            <option value="2">2x</option>
                                        </select>
                                    </div>
                                </div>

                                {reactions.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-medium text-gray-900 mb-2">Réactions</h4>
                                        <div className="space-y-2 max-h-20 overflow-y-auto">
                                            {reactions.map((reaction) => (
                                                <div key={reaction.id} className="flex items-center space-x-2 text-xs text-gray-600">
                                                    <span className="font-medium">{reaction.author}</span>
                                                    <span>a réagi avec {reaction.type}</span>
                                                    <span>à {formatTime(reaction.timestamp)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoViewer;
