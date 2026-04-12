'use client';

import { tags as TAGS } from '@/constant';
import { useFeedFilter } from '@/contexts/FeedFilterContext';
import { Button } from '@/components/base/buttons/button';
import { X } from 'lucide-react';


// Helper function to get ring color style from topicColor
const getRingColorStyle = (topicColor: string) => {
  const colorMap: Record<string, string> = {
    'bg-error-500': 'var(--color-error-500)',
    'bg-primary-500': 'var(--color-brand-500)',
    'bg-warning-500': 'var(--color-warning-500)',
    'bg-success-500': 'var(--color-success-500)',
    'bg-blue-light-500': 'var(--color-blue-light-500)',
    'bg-indigo-500': 'var(--color-indigo-500)',
    'bg-pink-500': 'var(--color-pink-500)',
    'bg-gray-blue-500': 'var(--color-gray-blue-500)',
  };
  return colorMap[topicColor] || 'var(--color-brand-500)';
};

export function TagFilter() {
  const { selectedTags, toggleTag, clearTags, hasTag } = useFeedFilter();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      {/* Header with clear button */}
      {selectedTags.length > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <Button 
            color="tertiary" 
            size="sm" 
            onClick={clearTags} 
            aria-label="Effacer tous les filtres"
          >
            Effacer ({selectedTags.length})
          </Button>
        </div>
      )}

      {/* Tags displayed directly in a single list */}
      <div className="flex flex-wrap gap-2">
        {TAGS.map((tag) => {
            const isSelected = hasTag(tag.enum);
            const ringColor = getRingColorStyle(tag.topicColor);
            
            return (
              <button
                key={tag.enum}
                onClick={() => toggleTag(tag.enum)}
                role="option"
                aria-selected={isSelected}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                  cursor-pointer transition-all duration-200 whitespace-nowrap
                  ${tag.bgColor} ${tag.textColor} ${tag.hoverBgColor}
                  ${isSelected 
                    ? 'ring-2 shadow-sm' 
                    : 'hover:opacity-90 hover:scale-105'
                  }
                `}
                style={isSelected ? { '--tw-ring-color': ringColor } as React.CSSProperties : undefined}
              >
                <span>{tag.icon}</span>
                <span>{tag.title}</span>
              </button>
            );
        })}
      </div>

      {/* Selected tags summary */}
      {selectedTags.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs font-semibold text-gray-500 mb-2">Tags sélectionnés</div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((t) => {
              const found = TAGS.find((x) => x.enum === t);
              if (!found) return null;
              const ringColor = getRingColorStyle(found.topicColor);
              
              return (
                <button
                  key={t}
                  onClick={() => toggleTag(t)}
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                    cursor-pointer transition-opacity hover:opacity-80 whitespace-nowrap
                    ${found.bgColor} ${found.textColor} ring-2 shadow-sm
                  `}
                  style={{ '--tw-ring-color': ringColor } as React.CSSProperties}
                >
                  <span>{found.icon}</span>
                  <span>{found.title}</span>
                  <X className={`h-3 w-3 ${found.iconColor}`} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
