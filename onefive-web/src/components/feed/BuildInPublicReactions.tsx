'use client';

import { Flame, Hand, Lightbulb, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export type BuildInPublicReactionType = 'flame' | 'clap' | 'lightbulb' | 'heart';

export interface BuildInPublicReactions {
  flame?: number;
  clap?: number;
  lightbulb?: number;
  heart?: number;
}

interface BuildInPublicReactionsProps {
  reactions: BuildInPublicReactions;
  userReactions?: BuildInPublicReactionType[];
  onReaction?: (type: BuildInPublicReactionType) => void;
  className?: string;
  compact?: boolean;
}

const REACTION_CONFIG: Record<
  BuildInPublicReactionType,
  { icon: React.ComponentType<{ className?: string }>; label: string; color: string; hoverColor: string }
> = {
  flame: {
    icon: Flame,
    label: '🔥',
    color: 'text-orange-600',
    hoverColor: 'hover:text-orange-700 hover:bg-orange-50'
  },
  clap: {
    icon: Hand,
    label: '👏',
    color: 'text-blue-600',
    hoverColor: 'hover:text-blue-700 hover:bg-blue-50'
  },
  lightbulb: {
    icon: Lightbulb,
    label: '💡',
    color: 'text-yellow-600',
    hoverColor: 'hover:text-yellow-700 hover:bg-yellow-50'
  },
  heart: {
    icon: Heart,
    label: '❤️',
    color: 'text-red-600',
    hoverColor: 'hover:text-red-700 hover:bg-red-50'
  }
};

export const BuildInPublicReactions: React.FC<BuildInPublicReactionsProps> = ({
  reactions,
  userReactions = [],
  onReaction,
  className,
  compact = false
}) => {
  const [isHovered, setIsHovered] = useState<BuildInPublicReactionType | null>(null);

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {Object.entries(reactions).map(([type, count]) => {
          const config = REACTION_CONFIG[type as BuildInPublicReactionType];
          const Icon = config.icon;
          const isActive = userReactions.includes(type as BuildInPublicReactionType);
          
          return (
            <button
              key={type}
              onClick={() => onReaction?.(type as BuildInPublicReactionType)}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-md transition-colors',
                isActive ? config.color + ' bg-opacity-10' : 'text-gray-600',
                config.hoverColor
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{count || 0}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {Object.entries(REACTION_CONFIG).map(([type, config]) => {
        const Icon = config.icon;
        const count = reactions[type as BuildInPublicReactionType] || 0;
        const isActive = userReactions.includes(type as BuildInPublicReactionType);

        return (
          <button
            key={type}
            onClick={() => onReaction?.(type as BuildInPublicReactionType)}
            onMouseEnter={() => setIsHovered(type as BuildInPublicReactionType)}
            onMouseLeave={() => setIsHovered(null)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg transition-all',
              isActive
                ? `${config.color} bg-opacity-10 border-2 border-current`
                : 'text-gray-600 border-2 border-transparent',
              config.hoverColor,
              isHovered === type && 'scale-105'
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-sm font-semibold">{count}</span>
            <span className="text-lg">{config.label}</span>
          </button>
        );
      })}
    </div>
  );
};

