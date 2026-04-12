import React from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/base/avatar/avatar';
import type { Person, Startup } from '../types';

const MentionTag = ({ profile }: { profile?: Person | Startup | null }) => {
    if (!profile || typeof profile !== 'object') return null;
    const isPerson = 'avatar' in profile;
    const name = profile.name;
    const image = isPerson ? profile.avatar : profile.logo;
    const href = isPerson ? `/profile/${profile.id}` : `/startup/${profile.id}`;

    return (
        <Link href={href} className="inline-flex items-center gap-1 px-2 py-[3px] text-xs font-medium bg-primary text-secondary ring-1 ring-primary ring-inset rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5E6AD2] cursor-pointer align-baseline">
            <Avatar size="xxs" src={image} alt={name} />
            <span className="truncate">{name}</span>
        </Link>
    );
};

export default MentionTag; 