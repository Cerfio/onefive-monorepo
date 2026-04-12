'use client';

import { Lock, Sparkles } from 'lucide-react';
import { getCookie } from 'cookies-next';

interface AuthGateProps {
  children: React.ReactNode;
  onRequestAuth: () => void;
  label?: string;
  blurIntensity?: number;
}

export function AuthGate({
  children,
  onRequestAuth,
  label,
  blurIntensity = 8,
}: AuthGateProps) {
  const isAuth = !!getCookie('is_authenticated');
  if (isAuth) return <>{children}</>;

  return (
    <div className="relative">
      <div
        className="select-none pointer-events-none"
        aria-hidden="true"
        style={{ filter: `blur(${blurIntensity}px)` }}
      >
        {children}
      </div>
      <div
        className="absolute inset-0 flex items-center justify-center cursor-pointer rounded-xl"
        onClick={onRequestAuth}
      >
        <div className="flex flex-col items-center gap-3 p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100">
            <Lock className="h-5 w-5 text-violet-600" />
          </div>
          <p className="text-sm font-semibold text-[#101828]">
            {label || 'Connectez-vous pour voir les détails'}
          </p>
          <span className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-700">
            <Sparkles className="h-4 w-4" />
            Rejoindre Onefive
          </span>
        </div>
      </div>
    </div>
  );
}
