import { memo } from 'react';
import { tags as tagList } from '@/constant';
import { Tags } from '@/enums';

interface Props {
  tags?: string[] | null;
  className?: string;
  onTagClick?: (tag: Tags) => void;
}

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

const PostTags: React.FC<Props> = ({ tags, className, onTagClick }) => {
  const safeTags = Array.isArray(tags) ? tags : [];

  if (safeTags.length === 0) return null;

  const handleTagClick = (tag: string) => {
    if (onTagClick && Object.values(Tags).includes(tag as Tags)) {
      onTagClick(tag as Tags);
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className || 'px-4 pb-2'}`}>
      {safeTags.map((tag, tagIndex) => {
        const tagData = tagList.find((t) => t.enum === tag);
        
        // Si le tag est reconnu
        if (tagData) {
          const ringColor = getRingColorStyle(tagData.topicColor);
          return (
            <button
              key={`tag-${tag}-${tagIndex}`}
              className={`
                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                cursor-pointer transition-all duration-200 whitespace-nowrap
                ${tagData.bgColor} ${tagData.textColor} ${tagData.hoverBgColor}
                hover:opacity-90 hover:scale-105 ring-1 shadow-sm
              `}
              style={{ '--tw-ring-color': ringColor } as React.CSSProperties}
              onClick={() => handleTagClick(tag)}
            >
              <span>{tagData.icon}</span>
              <span>{tagData.title}</span>
            </button>
          );
        }
        
        // Fallback pour les tags inconnus
        return (
          <span
            key={`tag-${tag}-${tagIndex}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer transition-all duration-200"
            onClick={() => handleTagClick(tag)}
          >
            #{tag}
          </span>
        );
      })}
    </div>
  );
};

export default memo(PostTags);

