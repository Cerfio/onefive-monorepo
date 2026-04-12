'use client';

import { useRef, useState, useCallback, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import {
  VALIDATION_LIMITS,
  VALIDATION_MESSAGES,
} from '@/shared/constants/validation-limits';

const SKILLS_MAX = VALIDATION_LIMITS.PROFILE.SKILLS_MAX_COUNT;
const SKILL_ITEM_MAX = VALIDATION_LIMITS.PROFILE.SKILLS_ITEM_MAX;

interface SkillInputProps {
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const SkillInput = ({
  skills,
  onSkillsChange,
  placeholder = 'Ex: TypeScript, NestJS, Prisma... (Entrée pour ajouter)',
  disabled = false,
}: SkillInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addSkill = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;

      if (skills.includes(trimmed)) {
        setError('Cette compétence est déjà ajoutée');
        return;
      }
      if (skills.length >= SKILLS_MAX) {
        setError(VALIDATION_MESSAGES.SKILLS_TOO_MANY);
        return;
      }
      if (trimmed.length > SKILL_ITEM_MAX) {
        setError(`Maximum ${SKILL_ITEM_MAX} caractères par compétence`);
        return;
      }

      onSkillsChange([...skills, trimmed]);
      setInputValue('');
      setError(null);
    },
    [skills, onSkillsChange]
  );

  const removeSkill = useCallback(
    (index: number) => {
      onSkillsChange(skills.filter((_, i) => i !== index));
      setError(null);
    },
    [skills, onSkillsChange]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && skills.length > 0) {
      removeSkill(skills.length - 1);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addSkill(inputValue);
    }
  };

  const chipColors = [
    'bg-utility-brand-50 text-utility-brand-700 ring-utility-brand-200 hover:bg-utility-brand-100',
    'bg-utility-success-50 text-utility-success-700 ring-utility-success-200 hover:bg-utility-success-100',
    'bg-utility-warning-50 text-utility-warning-700 ring-utility-warning-200 hover:bg-utility-warning-100',
    'bg-utility-blue-light-50 text-utility-blue-light-700 ring-utility-blue-light-200 hover:bg-utility-blue-light-100',
    'bg-utility-indigo-50 text-utility-indigo-700 ring-utility-indigo-200 hover:bg-utility-indigo-100',
    'bg-utility-pink-50 text-utility-pink-700 ring-utility-pink-200 hover:bg-utility-pink-100',
  ];

  return (
    <div className="space-y-2">
      <div
        role="presentation"
        onClick={() => inputRef.current?.focus()}
        className={`flex flex-wrap gap-2 min-h-[42px] p-2 rounded-lg border transition-colors cursor-text ${
          error
            ? 'border-red-300 bg-red-50/50'
            : 'border-gray-200 bg-gray-50/50 hover:border-gray-300 focus-within:border-[#5E6AD2] focus-within:ring-2 focus-within:ring-[#5E6AD2]/20'
        }`}
      >
        {skills.map((skill, index) => (
          <span
            key={`${skill}-${index}`}
            className={`inline-flex items-center gap-1 py-1 px-2 rounded-full ring-1 text-sm font-medium ${chipColors[index % chipColors.length]}`}
          >
            {skill}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSkill(index);
                }}
                className="p-0.5 rounded-full hover:bg-utility-brand-100 text-utility-brand-500 hover:text-utility-brand-700 transition-colors"
                aria-label={`Retirer ${skill}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={skills.length === 0 ? placeholder : ''}
          disabled={disabled || skills.length >= SKILLS_MAX}
          className="flex-1 min-w-[120px] bg-transparent border-0 outline-none text-sm placeholder:text-gray-400 disabled:cursor-not-allowed py-1"
        />
      </div>
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
      <p className="text-xs text-gray-500">
        {skills.length}/{SKILLS_MAX} compétences
        {skills.length >= SKILLS_MAX && ' (maximum atteint)'}
      </p>
    </div>
  );
};
