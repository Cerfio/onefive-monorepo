import { useState, useRef } from 'react';
import type { VideoEvent, VideoChapter, VideoReaction } from '@/types/file-viewer';

interface UseVideoPlayerProps {
    dataroomId: string;
    fileId: string;
}

export const useVideoPlayer = ({ dataroomId, fileId }: UseVideoPlayerProps) => {
    const [videoEvents, setVideoEvents] = useState<VideoEvent[]>([]);
    const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
    const [lastEventTime, setLastEventTime] = useState<number>(0);
    const [playbackRate, setPlaybackRate] = useState<number>(1);
    const [isPictureInPicture, _setIsPictureInPicture] = useState<boolean>(false);
    const [chapters] = useState<VideoChapter[]>([
        { id: '1', title: 'Introduction', startTime: 0, endTime: 120 },
        { id: '2', title: 'Partie principale', startTime: 120, endTime: 360 },
        { id: '3', title: 'Conclusion', startTime: 360, endTime: 480 }
    ]);
    const [reactions, setReactions] = useState<VideoReaction[]>([]);
    const videoRef = useRef<HTMLVideoElement>(null);
    const sessionIdRef = useRef(
        typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
    );

    // Fonction pour envoyer les événements vidéo via le batch endpoint
    const sendVideoEvent = (event: VideoEvent) => {
        setVideoEvents(prev => [...prev, event]);

        const trackingEvent = {
            eventType: `video_${event.type}`,
            dataroomId,
            fileId,
            sessionId: sessionIdRef.current,
            timestamp: event.timestamp.toISOString(),
            additionalData: {
                currentTime: event.currentTime,
                duration: event.duration,
                percentage: event.percentage,
            },
        };

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/dataroom/tracking/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ events: [trackingEvent] }),
        }).catch(() => {
            // Silently fail — tracking should not break the user experience
        });
    };

    // Fonction pour ajouter une réaction
    const addReaction = (type: 'like' | 'question' | 'important') => {
        if (!videoRef.current) return;
        
        const newReaction: VideoReaction = {
            id: Date.now().toString(),
            type,
            timestamp: videoRef.current.currentTime,
            author: "Vous"
        };
        
        setReactions(prev => [...prev, newReaction]);
    };

    // Fonction pour aller à un chapitre
    const goToChapter = (chapter: VideoChapter) => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = chapter.startTime;
    };

    // Gestionnaires d'événements vidéo
    const handlePlay = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = e.currentTarget;
        setIsVideoPlaying(true);
        sendVideoEvent({
            type: 'play',
            timestamp: new Date(),
            currentTime: video.currentTime,
            duration: video.duration,
            percentage: (video.currentTime / video.duration) * 100
        });
    };

    const handlePause = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = e.currentTarget;
        setIsVideoPlaying(false);
        sendVideoEvent({
            type: 'pause',
            timestamp: new Date(),
            currentTime: video.currentTime,
            duration: video.duration,
            percentage: (video.currentTime / video.duration) * 100
        });
    };

    const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = e.currentTarget;
        const currentTime = Math.floor(video.currentTime);
        
        if (currentTime - lastEventTime >= 5 || Math.abs(currentTime - lastEventTime) >= 10) {
            setLastEventTime(currentTime);
            sendVideoEvent({
                type: 'timeupdate',
                timestamp: new Date(),
                currentTime: video.currentTime,
                duration: video.duration,
                percentage: (video.currentTime / video.duration) * 100
            });
        }
    };

    const handleEnded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = e.currentTarget;
        setIsVideoPlaying(false);
        sendVideoEvent({
            type: 'ended',
            timestamp: new Date(),
            currentTime: video.currentTime,
            duration: video.duration,
            percentage: 100
        });
    };

    const handleSeeked = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = e.currentTarget;
        sendVideoEvent({
            type: 'seeked',
            timestamp: new Date(),
            currentTime: video.currentTime,
            duration: video.duration,
            percentage: (video.currentTime / video.duration) * 100
        });
    };

    const changePlaybackRate = (rate: number) => {
        setPlaybackRate(rate);
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
        }
    };

    return {
        videoRef,
        videoEvents,
        isVideoPlaying,
        playbackRate,
        isPictureInPicture,
        chapters,
        reactions,
        addReaction,
        goToChapter,
        changePlaybackRate,
        handlers: {
            handlePlay,
            handlePause,
            handleTimeUpdate,
            handleEnded,
            handleSeeked
        }
    };
}; 