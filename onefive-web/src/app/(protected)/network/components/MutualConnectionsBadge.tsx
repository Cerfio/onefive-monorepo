import React from 'react';
import { Users01 as MutualUsersIcon } from '@untitledui/icons';

interface MutualConnectionsBadgeProps {
    mutuals: {
        names: string[];
        count: number;
    };
}

const MutualConnectionsBadge = ({ mutuals }: MutualConnectionsBadgeProps) => {
    if (mutuals.count === 0) return null;
    const text = mutuals.count === 1
        ? `${mutuals.names[0]} en commun`
        : `${mutuals.names[0]} et ${mutuals.count - 1} autre${mutuals.count > 2 ? 's' : ''} en commun`;
    return (
        <div className="flex items-center gap-1.5">
            <MutualUsersIcon className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{text}</span>
        </div>
    );
};

export default MutualConnectionsBadge; 