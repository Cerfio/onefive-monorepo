'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Tags } from '@/enums';
import { tags as TAGS } from '@/constant';
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
    'bg-purple-500': 'var(--color-purple-500)',
  };
  return colorMap[topicColor] || 'var(--color-brand-500)';
};

interface TagSelectorProps {
  selectedTags: Tags[];
  onTagsChange: (tags: Tags[]) => void;
  maxTags?: number;
  showErrors?: boolean;
  excludeTags?: Tags[];
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onTagsChange,
  maxTags = 2,
  showErrors = false,
  excludeTags = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter available tags (exclude excluded tags and already selected tags)
  const availableTags = useMemo(() => {
    return TAGS.filter(
      (tag) => !excludeTags.includes(tag.enum) && !selectedTags.includes(tag.enum)
    );
  }, [excludeTags, selectedTags]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleTagClick = (tag: Tags) => {
    if (selectedTags.includes(tag)) {
      // Remove tag
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else if (selectedTags.length < maxTags) {
      // Add tag
      onTagsChange([...selectedTags, tag]);
    }
  };

  const isValid = selectedTags.length >= 1 && selectedTags.length <= maxTags;
  const showError = showErrors && !isValid;

  return (
    <div className="space-y-2">
      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tagEnum) => {
            const tagData = TAGS.find((t) => t.enum === tagEnum);
            if (!tagData) return null;

            return (
              <button
                key={tagEnum}
                type="button"
                onClick={() => handleTagClick(tagEnum)}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                  cursor-pointer transition-all duration-200 whitespace-nowrap
                  ${tagData.bgColor} ${tagData.textColor} ring-2 shadow-sm
                  hover:opacity-80
                `}
                style={{ '--tw-ring-color': getRingColorStyle(tagData.topicColor) } as React.CSSProperties}
              >
                <span>{tagData.icon}</span>
                <span>{tagData.title}</span>
                <X className={`h-3 w-3 ${tagData.iconColor}`} />
              </button>
            );
          })}
        </div>
      )}

      {/* Tag selector dropdown */}
      <div className="relative z-20" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm
            transition-colors
            ${showError 
              ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-500' 
              : 'border-gray-200 bg-white hover:border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500'
            }
          `}
        >
          <span className={selectedTags.length === 0 ? 'text-gray-500' : 'text-gray-900'}>
            {selectedTags.length === 0 
              ? 'Sélectionner des tags' 
              : `${selectedTags.length}/${maxTags} tag${selectedTags.length > 1 ? 's' : ''} sélectionné${selectedTags.length > 1 ? 's' : ''}`
            }
          </span>
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute left-0 right-0 z-[120] mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {availableTags.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                {selectedTags.length >= maxTags 
                  ? `Maximum ${maxTags} tag${maxTags > 1 ? 's' : ''} autorisé${maxTags > 1 ? 's' : ''}`
                  : 'Aucun tag disponible'
                }
              </div>
            ) : (
              <div className="p-2">
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag.enum}
                      type="button"
                      onClick={() => {
                        handleTagClick(tag.enum);
                        if (selectedTags.length + 1 >= maxTags) {
                          setIsOpen(false);
                        }
                      }}
                      className={`
                        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                        cursor-pointer transition-all duration-200 whitespace-nowrap
                        ${tag.bgColor} ${tag.textColor} ${tag.hoverBgColor}
                        hover:opacity-90 hover:scale-105
                      `}
                    >
                      <span>{tag.icon}</span>
                      <span>{tag.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {showError && (
        <p className="text-xs text-red-500">
          {selectedTags.length === 0 
            ? 'Au moins 1 tag est requis' 
            : `Maximum ${maxTags} tag${maxTags > 1 ? 's' : ''} autorisé${maxTags > 1 ? 's' : ''}`
          }
        </p>
      )}
    </div>
  );
};

