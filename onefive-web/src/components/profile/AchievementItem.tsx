"use client";

import { useState } from "react";
import { getLocalTimeZone, today } from "@internationalized/date";
import type { DateValue } from "react-aria-components";
import { DatePicker } from "@/components/application/date-picker/date-picker";
import { Input } from "@/components/base/input/input";

interface AchievementItemProps {
  index: number;
  title?: string;
  description?: string;
  date?: DateValue | null;
  onTitleChange?: (value: string) => void;
  onDescriptionChange?: (value: string) => void;
  onDateChange?: (value: DateValue | null) => void;
  onRemove?: () => void;
}

const now = today(getLocalTimeZone());

export const AchievementItem = ({
  index,
  title = "",
  description = "",
  date = null,
  onTitleChange,
  onDescriptionChange,
  onDateChange,
  onRemove,
}: AchievementItemProps) => {
  const [value, setValue] = useState<DateValue | null>(date || now);

  const handleDateChange = (newValue: DateValue | null) => {
    setValue(newValue);
    onDateChange?.(newValue);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="text-sm font-medium text-gray-700">
        Réalisation {index + 1}
      </div>
      <Input
        placeholder="Titre"
        defaultValue={title}
        onChange={onTitleChange}
      />
      <Input
        placeholder="Description"
        defaultValue={description}
        onChange={onDescriptionChange}
      />
      <DatePicker
        aria-label="Date picker"
        value={value}
        onChange={handleDateChange}
      />
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Supprimer
        </button>
      )}
    </div>
  );
};

