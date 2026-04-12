'use client';

import { useState } from 'react';

const BIO_TRUNCATE_LENGTH = 250;

export const BioWithExpand = ({
  bio,
  className = 'mt-4 text-sm text-[#475467] max-w-4xl',
}: {
  bio: string | null | undefined;
  className?: string;
}) => {
  const [expanded, setExpanded] = useState(false);

  if (!bio?.trim()) return null;

  const isLong = bio.length > BIO_TRUNCATE_LENGTH;
  const displayText = isLong && !expanded ? `${bio.slice(0, BIO_TRUNCATE_LENGTH)}…` : bio;

  return (
    <p className={className}>
      {displayText}
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="ml-1 text-sm text-[#5E6AD2] font-medium hover:underline focus:outline-none focus:underline"
        >
          {expanded ? 'Voir moins' : 'Voir plus'}
        </button>
      )}
    </p>
  );
};
