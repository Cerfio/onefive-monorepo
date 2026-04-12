'use client';

import React from 'react';
import { Input } from '@/components/base/input/input';
import { POSITION_SUGGESTIONS, POSITION_DATALIST_ID } from './constants/position-suggestions';
import type { InputProps } from '@/components/base/input/input';

interface PositionInputProps extends Omit<InputProps, 'list'> {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  isInvalid?: boolean;
  hint?: string;
}

export const PositionInput: React.FC<PositionInputProps> = ({
  label = 'Titre / Position',
  placeholder = 'Ex: CEO, CTO, Product Manager...',
  ...props
}) => {
  return (
    <div>
      <datalist id={POSITION_DATALIST_ID}>
        {POSITION_SUGGESTIONS.map((pos) => (
          <option key={pos} value={pos} />
        ))}
      </datalist>
      <Input
        label={label}
        placeholder={placeholder}
        list={POSITION_DATALIST_ID}
        {...props}
      />
    </div>
  );
};
