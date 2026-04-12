'use client';

import { getCookie } from 'cookies-next';
import { ExternalLink } from 'lucide-react';

interface SpotlightMobileBarProps {
  url?: string;
}

export function SpotlightMobileBar({ url }: SpotlightMobileBarProps) {
  const isAuth = !!getCookie('is_authenticated');

  if (isAuth) {
    if (!url) return null;
    return (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 z-50 shadow-lg">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#5E6AD2] px-4 py-3 text-sm font-semibold text-white hover:bg-[#4F5ABF] transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Accéder au programme officiel
        </a>
      </div>
    );
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 z-50 shadow-lg">
      <a
        href="/signup"
        className="flex-1 rounded-xl bg-[#5E6AD2] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#4F5ABF] transition-colors"
      >
        Postuler via Onefive
      </a>
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="h-12 w-12 flex items-center justify-center rounded-xl border border-gray-200 text-[#475467] hover:bg-gray-50 transition-colors flex-shrink-0"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}
