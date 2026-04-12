"use client";

import { getLocalTimeZone } from "@internationalized/date";
import { useControlledState } from "@react-stately/utils";
import { Calendar as CalendarIcon } from "@untitledui/icons";
import { useDateFormatter } from "react-aria";
import type { DateValue } from "react-aria-components";
import {
  DatePicker as AriaDatePicker,
  Dialog as AriaDialog,
  Group as AriaGroup,
  Popover as AriaPopover,
} from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { cx } from "@/utils/cx";
import { Calendar } from "./calendar";

interface MonthYearPickerProps {
  value?: DateValue | null;
  defaultValue?: DateValue | null;
  onChange?: (value: DateValue | null) => void;
  onApply?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  label?: string;
  isDisabled?: boolean;
  minValue?: DateValue;
  maxValue?: DateValue;
  allowPresent?: boolean;
  onPresentChange?: (isPresent: boolean) => void;
  isPresent?: boolean;
}

export const MonthYearPicker = ({
  value: valueProp,
  defaultValue,
  onChange,
  onApply,
  onCancel,
  placeholder = "Sélectionner une date",
  label,
  isDisabled = false,
  minValue,
  maxValue,
  allowPresent = false,
  onPresentChange,
  isPresent = false,
}: MonthYearPickerProps) => {
  const formatter = useDateFormatter({
    month: "short",
    year: "numeric",
  });

  const [value, setValue] = useControlledState(valueProp, defaultValue || null, onChange);
  const [present, setPresent] = useControlledState(isPresent, false, onPresentChange);

  const handlePresentToggle = () => {
    const newPresent = !present;
    setPresent(newPresent);
    if (newPresent) {
      setValue(null);
    }
  };

  const formattedDate = value && !present
    ? formatter.format(value.toDate(getLocalTimeZone()))
    : present
      ? "Présent"
      : placeholder;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-gray-700 text-sm font-medium">
          {label}
        </label>
      )}
      <div className="flex gap-2 items-center">
        <AriaDatePicker
          shouldCloseOnSelect={false}
          value={value}
          onChange={setValue}
          granularity={"day"}
          isDisabled={isDisabled || present}
          minValue={minValue}
          maxValue={maxValue}
          className="flex-1"
        >
          <AriaGroup className="flex">
            <Button
              size="md"
              color="secondary"
              iconLeading={CalendarIcon}
              className="w-full justify-start"
              isDisabled={isDisabled || present}
            >
              {formattedDate}
            </Button>
          </AriaGroup>
          <AriaPopover
            offset={8}
            placement="bottom left"
            className={({ isEntering, isExiting }) =>
              cx(
                "will-change-transform z-50",
                isEntering &&
                  "duration-150 ease-out animate-in fade-in placement-right:origin-left placement-right:slide-in-from-left-0.5 placement-top:origin-bottom placement-top:slide-in-from-bottom-0.5 placement-bottom:origin-top placement-bottom:slide-in-from-top-0.5",
                isExiting &&
                  "duration-100 ease-in animate-out fade-out placement-right:origin-left placement-right:slide-out-to-left-0.5 placement-top:origin-bottom placement-top:slide-out-to-bottom-0.5 placement-bottom:origin-top placement-bottom:slide-out-to-top-0.5",
              )
            }
          >
            <AriaDialog className="rounded-2xl bg-primary shadow-xl ring ring-secondary_alt">
              {({ close }) => (
                <>
                  <div className="flex px-6 py-5">
                    <Calendar />
                  </div>
                  <div className="grid grid-cols-2 gap-3 border-t border-secondary p-4">
                    <Button
                      size="md"
                      color="secondary"
                      onClick={() => {
                        onCancel?.();
                        close();
                      }}
                    >
                      Annuler
                    </Button>
                    <Button
                      size="md"
                      color="primary"
                      onClick={() => {
                        onApply?.();
                        close();
                      }}
                    >
                      Appliquer
                    </Button>
                  </div>
                </>
              )}
            </AriaDialog>
          </AriaPopover>
        </AriaDatePicker>
        {allowPresent && (
          <Checkbox
            isSelected={present}
            onChange={handlePresentToggle}
            isDisabled={isDisabled}
            size="sm"
            label="En cours"
          />
        )}
      </div>
    </div>
  );
};

