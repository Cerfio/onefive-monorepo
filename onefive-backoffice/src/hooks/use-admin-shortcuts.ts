'use client';

import { useHotkeys } from 'react-hotkeys-hook';
import { useCallback } from 'react';

export function useAdminShortcuts() {
  const focusSearch = useCallback(() => {
    const input = document.querySelector<HTMLInputElement>(
      'input[type="text"], input[type="search"]'
    );
    if (input) {
      input.focus();
      input.select();
    }
  }, []);

  useHotkeys('/', (e) => {
    e.preventDefault();
    focusSearch();
  });

  useHotkeys('mod+k', (e) => {
    e.preventDefault();
    focusSearch();
  });

  useHotkeys('escape', () => {
    const active = document.activeElement;
    if (active instanceof HTMLElement) {
      active.blur();
    }
  });
}
