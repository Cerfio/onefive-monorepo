import { useEffect, useRef, useCallback } from 'react';
import { trackingService } from '@/services/trackingService';

export interface TrackingEvent {
    eventType: string;
    dataroomId: string;
    fileId: string;
    timestamp: string;
    sessionId: string;
    sessionDuration?: number;
    additionalData?: Record<string, any>;
}

/**
 * Types d'événements trackés :
 * - Session: session_start, session_end, heartbeat
 * - Navigation: page_change (PDF uniquement)
 * - Vidéo: video_play, video_pause, video_end, video_timeupdate, video_seeked
 * - Visibilité: page_visible, page_hidden, window_focus, window_blur
 * - Interactions: user_interaction, zoom_change, video_reaction
 * - Chargement: pdf_loaded, image_loaded, video_loaded, video_load_error
 */

interface UseAdvancedFileTrackingProps {
    dataroomId: string;
    fileId: string;
    viewerType: 'pdf' | 'image' | 'video' | 'docx';
    totalPages?: number;
    duration?: number;
    enabled?: boolean; // Pour désactiver le tracking si nécessaire
}

export const useAdvancedFileTracking = ({
    dataroomId,
    fileId,
    viewerType,
    totalPages,
    duration: _duration,
    enabled = true
}: UseAdvancedFileTrackingProps) => {
    // Vérifier si le tracking est possible et autorisé
    const isTrackingEnabled = enabled && 
        dataroomId && dataroomId !== 'temp' && 
        fileId && fileId !== 'temp';
    
    // Tracking initialization - no debug logging in production

    // Refs pour éviter les re-rendus
    const sessionIdRef = useRef(crypto.randomUUID());
    const sessionStartTimeRef = useRef(Date.now());
    const eventQueueRef = useRef<TrackingEvent[]>([]);
    const flushTimeoutRef = useRef<NodeJS.Timeout>(undefined);
    const currentPageRef = useRef(1);
    
    // Nouveau système de tracking temps réel
    const lastActivityTimeRef = useRef(Date.now());
    const totalActiveTimeRef = useRef(0);
    const isCurrentlyActiveRef = useRef(true);
    
    // Fonction pour mettre à jour le temps d'activité
    const updateActiveTime = useCallback(() => {
        if (isCurrentlyActiveRef.current) {
            const now = Date.now();
            const timeSinceLastActivity = now - lastActivityTimeRef.current;
            totalActiveTimeRef.current += timeSinceLastActivity;
            lastActivityTimeRef.current = now;
        }
    }, []);
    
    // Fonction pour marquer l'activité
    const markActivity = useCallback((isActive: boolean) => {
        updateActiveTime(); // Mettre à jour avant de changer l'état
        isCurrentlyActiveRef.current = isActive;
        lastActivityTimeRef.current = Date.now();
    }, [updateActiveTime]);
    
    // Fonction stable pour créer des événements
    const createEvent = useCallback((eventType: string, additionalData?: Record<string, any>): TrackingEvent | null => {
        // Vérifier si le tracking est activé
        if (!isTrackingEnabled) {
            return null;
        }

        // Mettre à jour le temps d'activité avant de créer l'événement
        updateActiveTime();
        
        // Calculer la durée réelle d'activité (plus précise)
        const realActiveTime = totalActiveTimeRef.current;
        const totalSessionTime = Date.now() - sessionStartTimeRef.current;

        return {
            eventType,
            dataroomId,
            fileId,
            timestamp: new Date().toISOString(),
            sessionId: sessionIdRef.current,
            sessionDuration: realActiveTime, // Utiliser le temps d'activité réel
            additionalData: {
                ...additionalData,
                totalSessionTime, // Temps total de session (pour comparaison)
                activeTimeRatio: realActiveTime / totalSessionTime, // Ratio d'activité
            }
        };
    }, [dataroomId, fileId, isTrackingEnabled, enabled, updateActiveTime]); // Dépendances stables uniquement
    
    // Fonction pour vider la queue d'événements
    const flushEvents = useCallback(async () => {
        if (eventQueueRef.current.length === 0) return;
        
        const eventsToSend = [...eventQueueRef.current];
        eventQueueRef.current = [];
        
        // Envoyer via le service de tracking (avec batching et retry automatique)
        trackingService.addEvents(eventsToSend);
        
        // Tracking silencieux - pas de notification à l'utilisateur
    }, []);
    
    // Fonction stable pour envoyer des événements
    const sendEvent = useCallback((eventType: string, additionalData?: Record<string, any>) => {
        const event = createEvent(eventType, additionalData);
        
        // Ignorer si l'événement est null (IDs temporaires)
        if (!event) {
            return;
        }
        
        // Événements critiques : envoi immédiat sans queue
        const criticalEvents = ['session_start', 'session_end', 'page_hidden', 'file_loaded'];
        if (criticalEvents.includes(eventType)) {
            trackingService.addEvent(event);
            trackingService.flush(); // Force l'envoi immédiat
            return;
        }
        
        // Autres événements : ajout à la queue avec batching
        eventQueueRef.current.push(event);
        
        // Débounce flush pour les événements non critiques
        if (flushTimeoutRef.current) {
            clearTimeout(flushTimeoutRef.current);
        }
        
        flushTimeoutRef.current = setTimeout(() => {
            flushEvents();
        }, 1000); // Retour à 1 seconde pour les événements non critiques
    }, [createEvent, flushEvents]);
    
    // Fonctions de tracking spécialisées
    const trackPageChange = useCallback((newPage: number) => {
        if (viewerType !== 'pdf') return;
        
        sendEvent('page_change', {
            previousPage: currentPageRef.current,
            newPage,
            totalPages
        });
        
        currentPageRef.current = newPage;
    }, [viewerType, totalPages, sendEvent]);
    
    const trackVideoEvent = useCallback((type: string, videoElement?: HTMLVideoElement) => {
        if (viewerType !== 'video' || !videoElement) return;
        
        sendEvent(`video_${type}`, {
            currentTime: videoElement.currentTime,
            duration: videoElement.duration,
            percentage: (videoElement.currentTime / videoElement.duration) * 100
        });
    }, [viewerType, sendEvent]);
    
    // Fonction de tracking de scroll supprimée - trop verbeux pour peu de valeur
    // const trackScroll = useCallback((scrollTop: number, scrollHeight: number, clientHeight: number) => {
    //     const depth = Math.round(((scrollTop + clientHeight) / scrollHeight) * 100);
    //     sendEvent('scroll_depth', { depth, scrollTop, scrollHeight, clientHeight });
    // }, [sendEvent]);
    
    const trackZoom = useCallback((zoomLevel: number) => {
        sendEvent('zoom_change', { zoomLevel });
    }, [sendEvent]);
    
    const trackInteraction = useCallback((interactionType: string, details?: Record<string, any>) => {
        sendEvent('user_interaction', { interactionType, ...details });
    }, [sendEvent]);
    
    const trackFileLoaded = useCallback((loadTime?: number) => {
        // Événement critique pour compter les vues - envoi immédiat
        const event = createEvent('file_loaded', { 
            viewerType, 
            loadTime,
            timestamp: new Date().toISOString()
        });
        
        if (event) {
            eventQueueRef.current.push(event);
            flushEvents(); // Envoi immédiat
        }
    }, [createEvent, viewerType]);
    
    // Setup des event listeners (une seule fois)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        let isVisible = true;
        let isFocused = true;
        
        sendEvent('session_start', { viewerType });
        
        const handleVisibilityChange = () => {
            const wasVisible = isVisible;
            isVisible = !document.hidden;
            
            if (wasVisible && !isVisible) {
                // Page devient cachée - marquer comme inactif
                markActivity(false);
                sendEvent('page_hidden');
            } else if (!wasVisible && isVisible) {
                // Page redevient visible - marquer comme actif
                markActivity(true);
                sendEvent('page_visible');
            }
        };
        
        const handleFocus = () => {
            isFocused = true;
            markActivity(true); // Marquer comme actif
            sendEvent('window_focus');
        };
        
        const handleBlur = () => {
            isFocused = false;
            markActivity(false); // Marquer comme inactif
            sendEvent('window_blur');
            // Force l'envoi des événements en attente
            flushEvents();
        };
        
        const handleBeforeUnload = (_e: BeforeUnloadEvent) => {
            // Envoi synchrone et immédiat
            const event = createEvent('session_end', { reason: 'beforeunload' });
            if (event) {
                trackingService.addEvent(event);
                trackingService.sendBeforeUnload();
            }
        };

        const handlePageHide = () => {
            // Envoi immédiat pour mobile
            sendEvent('session_end', { reason: 'pagehide' });
        };
        
        // Ajouter les listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('pagehide', handlePageHide);
        
        // Heartbeat plus fréquent pour plus de précision
        const heartbeatInterval = setInterval(() => {
            const isActive = isVisible && isFocused;
            
            // Mettre à jour l'état d'activité
            markActivity(isActive);
            
            if (isActive) {
                // Envoyer heartbeat avec temps d'activité précis
                sendEvent('heartbeat', {
                    activeTime: totalActiveTimeRef.current,
                    isActive: true
                });
            }
        }, 10000); // Réduit de 30s à 10s pour plus de précision
        
        // Cleanup
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('pagehide', handlePageHide);
            clearInterval(heartbeatInterval);
            
            // Tentative d'envoi session_end lors du cleanup
            sendEvent('session_end', { reason: 'component_unmount' });
            
            if (flushTimeoutRef.current) {
                clearTimeout(flushTimeoutRef.current);
            }
            flushEvents();
        };
    }, []); // Pas de dépendances pour éviter les re-rendus
    
    // Fonction pour obtenir le temps d'activité en temps réel
    const getCurrentActiveTime = useCallback(() => {
        updateActiveTime();
        return {
            activeTime: totalActiveTimeRef.current,
            totalTime: Date.now() - sessionStartTimeRef.current,
            ratio: totalActiveTimeRef.current / (Date.now() - sessionStartTimeRef.current)
        };
    }, [updateActiveTime]);

    return {
        sendEvent,
        trackPageChange,
        trackVideoEvent,
        // trackScroll supprimé
        trackZoom,
        trackInteraction,
        trackFileLoaded,
        flushEvents,
        getCurrentActiveTime, // Nouvelle fonction pour debug
        sessionId: sessionIdRef.current,
        currentPage: currentPageRef.current
    };
}; 