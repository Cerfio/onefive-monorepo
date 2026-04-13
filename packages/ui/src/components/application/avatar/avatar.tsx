'use client';

import Image from 'next/image';

const PALETTE = [
  '#F04438', '#F97066', '#FB6514', '#FDB022', '#EAAA08',
  '#17B26A', '#15B79E', '#0BA5EC', '#2E90FA', '#6172F3',
  '#7A5AF8', '#BA24D5', '#EE46BC', '#475467', '#667085',
  '#9E77ED', '#53B1FD',
];

function colorFromText(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function getInitials(firstName?: string | null, lastName?: string | null): string {
  const f = (firstName ?? '').trim();
  const l = (lastName ?? '').trim();
  if (f && l) return `${f[0]}${l[0]}`.toUpperCase();
  if (f) return f.slice(0, 2).toUpperCase();
  return '?';
}

const SIZE_MAP = {
  xs: { px: 24, text: 'text-[9px]' },
  sm: { px: 32, text: 'text-xs' },
  md: { px: 40, text: 'text-sm' },
  lg: { px: 48, text: 'text-base' },
  xl: { px: 64, text: 'text-lg' },
};

type AvatarSize = keyof typeof SIZE_MAP;

interface AvatarProps {
  src?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  alt?: string;
  size?: AvatarSize;
  square?: boolean;
  className?: string;
}

export function Avatar({
  src,
  firstName,
  lastName,
  size = 'md',
  square = false,
  className = '',
}: AvatarProps) {
  const { px, text } = SIZE_MAP[size];
  const initials = getInitials(firstName, lastName);
  const bg = colorFromText(initials);
  const shape = square ? 'rounded-lg' : 'rounded-full';

  if (src) {
    return (
      <div
        className={`shrink-0 overflow-hidden ${shape} ${className}`}
        style={{ width: px, height: px }}
      >
        <Image
          src={src}
          alt={`${firstName ?? ''} ${lastName ?? ''}`.trim() || 'avatar'}
          width={px}
          height={px}
          className="h-full w-full object-cover"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 select-none items-center justify-center font-semibold text-white ${shape} ${text} ${className}`}
      style={{ width: px, height: px, backgroundColor: bg }}
      aria-label={initials}
    >
      {initials}
    </div>
  );
}

/* ─── Startup Logo ──────────────────────────────────────────── */

interface StartupLogoProps {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  className?: string;
}

export function StartupLogo({ src, name, size = 'md', className = '' }: StartupLogoProps) {
  const { px, text } = SIZE_MAP[size];
  const initials = name.slice(0, 2).toUpperCase();
  const bg = colorFromText(name);

  if (src) {
    return (
      <div
        className={`shrink-0 overflow-hidden rounded-lg ${className}`}
        style={{ width: px, height: px }}
      >
        <Image
          src={src}
          alt={`${name} logo`}
          width={px}
          height={px}
          className="h-full w-full object-cover"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 select-none items-center justify-center rounded-lg font-bold text-white ${text} ${className}`}
      style={{ width: px, height: px, backgroundColor: bg }}
      aria-label={initials}
    >
      {initials}
    </div>
  );
}

/* ─── URL helper ────────────────────────────────────────────── */

export function resolveAvatarUrl(avatarId?: string | null): string | null {
  if (!avatarId) return null;
  if (avatarId.startsWith('http')) return avatarId;
  const storageBase = process.env.NEXT_PUBLIC_STORAGE_BASE_URL?.replace(/\/+$/, '') ?? 'http://localhost:4566';
  const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET ?? 'onefive-storage';
  return `${storageBase}/${bucket}/${avatarId}`;
}
