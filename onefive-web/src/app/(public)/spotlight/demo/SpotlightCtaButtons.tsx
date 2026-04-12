'use client';

import { getCookie } from 'cookies-next';
import { ExternalLink } from 'lucide-react';

interface SpotlightCtaButtonsProps {
  url?: string;
}

export function SpotlightCtaButtons({ url }: SpotlightCtaButtonsProps) {
  const isAuth = !!getCookie('is_authenticated');

  if (isAuth) {
    return (
      <div className="mt-4">
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#5E6AD2] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#4F5ABF] transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Accéder au programme officiel
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      <a
        href="/signup"
        className="block w-full rounded-xl bg-[#5E6AD2] px-4 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-[#4F5ABF] transition-colors"
      >
        Créer mon compte gratuitement
      </a>
      <a
        href="/signin"
        className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-sm font-medium text-[#344054] hover:bg-gray-50 transition-colors"
      >
        Se connecter
      </a>
      {url && (
        <div className="pt-2 border-t border-gray-100 mt-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full text-sm font-medium text-[#475467] hover:text-[#5E6AD2] transition-colors py-1"
          >
            <ExternalLink className="h-4 w-4" />
            Voir le site officiel
          </a>
        </div>
      )}
    </div>
  );
}
