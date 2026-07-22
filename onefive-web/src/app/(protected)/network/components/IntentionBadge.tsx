import React from 'react';
import { Tooltip } from '@/components/base/tooltip/tooltip';
import { intentionConfig } from '../lib/constants';

interface IntentionBadgeProps {
    intentionCategory: 'hiring' | 'investing' | 'opportunities' | 'mentoring';
    onClick: (e: React.MouseEvent) => void;
}

const IntentionBadge = ({ intentionCategory, onClick }: IntentionBadgeProps) => {
    const config = intentionConfig[intentionCategory as keyof typeof intentionConfig];
    if (!config) return null;

    const Icon = config.icon;

    return (
        <Tooltip title="Cliquez pour voir tous les profils avec cette intention.">
            <button
                onClick={onClick}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors hover:scale-105 active:scale-95 ${config.color}`}
                type="button"
            >
                <Icon className="h-3.5 w-3.5" />
                <span>{config.text}</span>
            </button>
        </Tooltip>
    );
};

export default IntentionBadge; 