import { useEffect, useState, useRef } from 'react';
import type { SessionData } from '@/types/file-viewer';

interface UseFileTrackingProps {
    dataroomId: string;
    fileId: string;
    pageNumber?: number;
}

export const useFileTracking = ({ dataroomId, fileId, pageNumber }: UseFileTrackingProps) => {
    const [sessionStartTime] = useState(new Date());
    const sessionIdRef = useRef(
        typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
    );

    // Fonction pour envoyer les données de session via le batch endpoint
    const sendSessionData = (eventType: string, additionalData?: Partial<SessionData>) => {
        const event = {
            eventType,
            dataroomId,
            fileId,
            sessionId: sessionIdRef.current,
            timestamp: new Date().toISOString(),
            sessionDuration: Math.round((new Date().getTime() - sessionStartTime.getTime()) / 1000),
            additionalData: {
                currentPage: pageNumber,
                ...additionalData,
            },
        };

        // Envoyer via le batch endpoint backend (fire-and-forget)
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/dataroom/tracking/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ events: [event] }),
        }).catch(() => {
            // Silently fail — tracking should not break the user experience
        });
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Événement quand l'utilisateur quitte la page
        const handleBeforeUnload = () => {
            sendSessionData('page_exit');
        };

        // Événement quand l'utilisateur change d'onglet
        const handleVisibilityChange = () => {
            if (window.document.visibilityState === 'hidden') {
                sendSessionData('tab_hidden');
            } else {
                sendSessionData('tab_visible');
            }
        };

        // Enregistrer l'accès initial
        sendSessionData('page_access');

        // Ajouter les écouteurs d'événements
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.document.addEventListener('visibilitychange', handleVisibilityChange);

        // Nettoyer les écouteurs lors du démontage du composant
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.document.removeEventListener('visibilitychange', handleVisibilityChange);
            sendSessionData('component_unmount');
        };
    }, [dataroomId, fileId, pageNumber, sessionStartTime]);

    return {
        sendSessionData,
        sessionStartTime
    };
}; 