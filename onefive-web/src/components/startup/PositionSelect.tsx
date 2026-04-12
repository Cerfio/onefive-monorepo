'use client';

import { useState } from 'react';
import type { Key } from 'react-aria-components';
import { ChevronLeft } from 'lucide-react';
import { Select } from '@/components/base/select/select';
import { Input } from '@/components/base/input/input';
import { Label } from '@/components/base/input/label';
import { HintText } from '@/components/base/input/hint-text';

const POSITION_OPTIONS = [
  { id: 'CEO', label: 'CEO' },
  { id: 'CTO', label: 'CTO' },
  { id: 'CMO', label: 'CMO' },
  { id: 'CFO', label: 'CFO' },
  { id: 'COO', label: 'COO' },
  { id: 'Designer', label: 'Designer' },
  { id: 'Software Engineer', label: 'Software Engineer' },
  { id: 'Product Manager', label: 'Product Manager' },
  { id: 'Marketing Manager', label: 'Marketing Manager' },
  { id: 'Sales Representative', label: 'Sales Representative' },
  { id: 'Operations Manager', label: 'Operations Manager' },
  { id: 'Data Analyst', label: 'Data Analyst' },
  { id: 'Customer Success', label: 'Customer Success' },
  { id: 'HR Manager', label: 'HR Manager' },
  { id: 'Finance Manager', label: 'Finance Manager' },
  { id: '__OTHER__', label: 'Autre (saisir librement)…' },
];

const PRESET_IDS = new Set(POSITION_OPTIONS.filter(o => o.id !== '__OTHER__').map(o => o.id));

interface PositionSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  hint?: string;
  isInvalid?: boolean;
  placeholder?: string;
  isRequired?: boolean;
}

export const PositionSelect = ({
  value = '',
  onChange,
  label = 'Titre / Position',
  hint,
  isInvalid,
  placeholder = 'Sélectionner ou saisir…',
  isRequired,
}: PositionSelectProps) => {
  const isCustom = value !== '' && !PRESET_IDS.has(value);
  const [mode, setMode] = useState<'select' | 'custom'>(isCustom ? 'custom' : 'select');

  const handleSelectChange = (key: Key | null) => {
    if (key == null) {
      onChange?.('');
      return;
    }
    if (key === '__OTHER__') {
      setMode('custom');
      onChange?.('');
    } else {
      onChange?.(String(key));
    }
  };

  const handleBackToList = () => {
    setMode('select');
    onChange?.('');
  };

  const selectedKey = mode === 'select' && PRESET_IDS.has(value) ? value : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label isRequired={isRequired}>{label}</Label>}

      {mode === 'select' ? (
        <Select
          selectedKey={selectedKey ?? null}
          onSelectionChange={handleSelectChange}
          items={POSITION_OPTIONS}
          placeholder={placeholder}
          isInvalid={isInvalid}
        >
          {(item) => (
            <Select.Item id={item.id} label={item.label} />
          )}
        </Select>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Ex: Head of Growth, Lead Developer…"
            value={value}
            onChange={(v) => onChange?.(v)}
            isInvalid={isInvalid}
            className="flex-1"
          />
          <button
            type="button"
            onClick={handleBackToList}
            className="flex items-center gap-1 whitespace-nowrap text-sm text-tertiary hover:text-secondary transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Liste
          </button>
        </div>
      )}

      {hint && <HintText isInvalid={isInvalid}>{hint}</HintText>}
    </div>
  );
};
