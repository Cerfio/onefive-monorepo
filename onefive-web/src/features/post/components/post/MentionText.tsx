'use client';

import React from 'react';
import Link from 'next/link';

// Tokens de mention insérés par le composer : @[Nom Prénom](profileId)
const MENTION_RE = /@\[([^\]]+)\]\(([a-zA-Z0-9_-]+)\)/g;

/**
 * Rend un texte de post en remplaçant les tokens de mention par des liens
 * cliquables vers le profil (affichés « @Nom »). Le reste du texte est
 * préservé tel quel (whitespace-pre-line géré par le parent via className).
 */
export const MentionText = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  let match: RegExpExecArray | null;
  MENTION_RE.lastIndex = 0;
  while ((match = MENTION_RE.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push(
      <Link
        key={`m${key++}`}
        href={`/profile/${match[2]}`}
        className="font-medium text-[#5E6AD2] hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        @{match[1]}
      </Link>,
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <p className={className}>{parts}</p>;
};
