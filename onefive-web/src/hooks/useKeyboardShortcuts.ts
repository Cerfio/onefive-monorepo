import { useEffect, useRef, useCallback } from 'react';

export interface KeyboardShortcut {
    key: string;
    label: string;
    description: string;
    handler: () => void;
    ctrl?: boolean;
    meta?: boolean;
    shift?: boolean;
    category?: string;
}

interface UseKeyboardShortcutsProps {
    shortcuts: KeyboardShortcut[];
    enabled?: boolean;
}

export const useKeyboardShortcuts = ({ shortcuts, enabled = true }: UseKeyboardShortcutsProps) => {
    const shortcutsRef = useRef(shortcuts);
    shortcutsRef.current = shortcuts;

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!enabled) return;

        const target = e.target as HTMLElement;
        const isInputFocused = target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT' ||
            target.isContentEditable;

        for (const shortcut of shortcutsRef.current) {
            const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
            const needsCtrl = shortcut.ctrl || shortcut.meta;
            const ctrlMatch = needsCtrl ? (e.ctrlKey || e.metaKey) : (!e.ctrlKey && !e.metaKey);
            const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;

            if (keyMatch && ctrlMatch && shiftMatch) {
                if (isInputFocused && !needsCtrl) return;

                e.preventDefault();
                shortcut.handler();
                return;
            }
        }
    }, [enabled]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [handleKeyDown]);

    return { shortcuts: shortcutsRef.current };
};
