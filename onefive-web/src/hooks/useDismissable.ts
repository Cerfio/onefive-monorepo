import { useEffect, RefObject } from 'react';

/**
 * Ferme un élément (popover/menu) au clic extérieur ou sur la touche Échap.
 * `open` conditionne l'attachement des listeners.
 */
export const useDismissable = (
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
) => {
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [ref, open, onClose]);
};
