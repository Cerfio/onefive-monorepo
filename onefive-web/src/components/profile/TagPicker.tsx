'use client';

import { Badge } from '@/components/ui/badge';
import { tags } from '@/shared/constants/tags';
import { Plus, X } from 'lucide-react';

interface TagPickerProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  minTags?: number;
  maxTags?: number;
  className?: string;
}

export const TagPicker = ({
  selectedTags,
  onTagsChange,
  minTags = 1,
  maxTags = 8,
  className = '',
}: TagPickerProps) => {
  const handleTagClick = (tagName: string, isSelected: boolean) => {
    if (isSelected) {
      onTagsChange(selectedTags.filter((t) => t !== tagName));
    } else if (selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, tagName]);
    }
  };

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

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {tags.map((tag) => {
          const isSelect = selectedTags.includes(tag.title);
          const ringColor = getRingColorStyle(tag.topicColor);
          return (
            <Badge
              key={tag.title}
              className={`text-sm font-normal flex gap-2 items-center cursor-pointer whitespace-nowrap transition-all duration-200 border-0 ${
                isSelect ? 'ring-2 shadow-lg' : 'hover:shadow-md'
              } ${tag.bgColor} ${tag.textColor} ${tag.hoverBgColor}`}
              style={
                isSelect
                  ? ({ '--tw-ring-color': ringColor } as React.CSSProperties)
                  : undefined
              }
              onClick={() => handleTagClick(tag.title, isSelect)}
            >
              <span className="flex-shrink-0">{tag.icon}</span>
              <span className="font-medium truncate max-w-[120px]">
                {tag.title}
              </span>
              {isSelect ? (
                <X className={`w-3 h-3 stroke-[4] flex-shrink-0 ${tag.iconColor}`} />
              ) : (
                <Plus
                  className={`w-3 h-3 stroke-[4] flex-shrink-0 ${tag.iconColor}`}
                />
              )}
            </Badge>
          );
        })}
      </div>
      {selectedTags.length > 0 && (
        <div className="mt-3 text-xs text-gray-500">
          {selectedTags.length < minTags ? (
            <span className="text-orange-600">
              Sélectionnez au moins {minTags} tag
              {minTags > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="text-green-600">
              {selectedTags.length}/{maxTags} tag
              {selectedTags.length > 1 ? 's' : ''} sélectionné
              {selectedTags.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
