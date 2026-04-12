import React from 'react';
import { Badge } from '@/components/base/badges/badges';
import { getSectorColor } from '@/shared/constants/sector-colors';

interface BadgeSelectorProps {
  selected: string[];
  onChange: (categories: string[]) => void;
  max?: number;
  options: string[];
}

export const BadgeSelector = ({ selected = [], onChange, max = 5, options }: BadgeSelectorProps) => {
  const toggleCategory = (category: string) => {
    if (selected.includes(category)) {
      onChange(selected.filter(c => c !== category));
    } else if (selected.length < max) {
      onChange([...selected, category]);
    }
  };

  const isDisabled = (option: string) => {
    return selected.length >= max && !selected.includes(option);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option);
        const disabled = isDisabled(option);
        const sectorColor = getSectorColor(option);
        
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggleCategory(option)}
            disabled={disabled}
            className={`transition-all ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
            }`}
          >
            <Badge
              type="pill-color"
              color={isSelected ? sectorColor : "gray"}
              size="md"
            >
              {option}
            </Badge>
          </button>
        );
      })}
    </div>
  );
};

export default BadgeSelector;
