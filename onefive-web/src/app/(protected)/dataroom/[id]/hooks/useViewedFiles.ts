"use client";
import { useCallback, useEffect, useState } from "react";

/**
 * Soft "viewed by current user" tracking for dataroom files.
 *
 * Uses localStorage as a non-invasive backend. Limitations:
 *  - Not synchronised across devices/browsers.
 *  - Anonymous users (no userId) fall back to a per-dataroom shared bucket.
 *
 * Storage key: `dataroom:<dataroomId>:viewed:<userId>` → JSON string array of file IDs.
 */
export function useViewedFiles(dataroomId: string, userId: string) {
    const storageKey = `dataroom:${dataroomId}:viewed:${userId || "anon"}`;
    const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());

    // Hydrate from localStorage once dataroomId / userId are known.
    useEffect(() => {
        if (typeof window === "undefined" || !dataroomId) return;
        try {
            const raw = window.localStorage.getItem(storageKey);
            if (!raw) {
                setViewedIds(new Set());
                return;
            }
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                setViewedIds(new Set(parsed.filter((x): x is string => typeof x === "string")));
            }
        } catch {
            // Corrupted entry — reset silently.
            setViewedIds(new Set());
        }
    }, [storageKey, dataroomId]);

    const persist = useCallback((next: Set<string>) => {
        if (typeof window === "undefined") return;
        try {
            window.localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
        } catch {
            // Storage may be full or disabled — ignore.
        }
    }, [storageKey]);

    const markAsViewed = useCallback((fileId: string) => {
        if (!fileId) return;
        setViewedIds(prev => {
            if (prev.has(fileId)) return prev;
            const next = new Set(prev);
            next.add(fileId);
            persist(next);
            return next;
        });
    }, [persist]);

    const isViewed = useCallback((fileId: string) => viewedIds.has(fileId), [viewedIds]);

    return { viewedIds, isViewed, markAsViewed };
}
