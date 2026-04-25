"use client";

// Wrapper local qui réplique l'API shadcn (`<Tabs value onValueChange>...`)
// par-dessus Untitled UI / react-aria-components.
// Permet de migrer sans refactor lourd de tous les consommateurs.

import { createContext, useContext, useId, useMemo, type ReactNode } from "react";
import {
  Tab as AriaTab,
  TabList as AriaTabList,
  TabPanel as AriaTabPanel,
  Tabs as AriaTabs,
} from "react-aria-components";
import { cx } from "@onefive/ui/utils/cx";

interface TabsContextValue {
  selectedValue?: string;
}

const TabsCtx = createContext<TabsContextValue>({});

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children?: ReactNode;
}

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
}: TabsProps) {
  const ctx = useMemo<TabsContextValue>(() => ({ selectedValue: value }), [value]);
  return (
    <TabsCtx.Provider value={ctx}>
      <AriaTabs
        keyboardActivation="manual"
        selectedKey={value ?? undefined}
        defaultSelectedKey={defaultValue}
        onSelectionChange={(key) => onValueChange?.(String(key))}
        className={cx("flex w-full flex-col gap-2", className)}
      >
        {children}
      </AriaTabs>
    </TabsCtx.Provider>
  );
}

export interface TabsListProps {
  className?: string;
  children?: ReactNode;
  "aria-label"?: string;
}

export function TabsList({ className, children, ...rest }: TabsListProps) {
  return (
    <AriaTabList
      aria-label={rest["aria-label"] ?? "Tabs"}
      className={cx(
        "inline-flex h-9 w-fit items-center justify-center gap-1 rounded-lg bg-secondary_alt p-[3px] ring-1 ring-secondary ring-inset",
        className,
      )}
    >
      {children}
    </AriaTabList>
  );
}

export interface TabsTriggerProps {
  value: string;
  className?: string;
  children?: ReactNode;
  disabled?: boolean;
  "aria-label"?: string;
}

export function TabsTrigger({
  value,
  className,
  children,
  disabled,
  ...rest
}: TabsTriggerProps) {
  return (
    <AriaTab
      id={value}
      isDisabled={disabled}
      aria-label={rest["aria-label"]}
      className={({ isSelected, isFocusVisible, isHovered, isDisabled }) =>
        cx(
          "inline-flex h-[calc(100%-1px)] flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-transparent px-2 py-1 text-sm font-medium transition-[color,box-shadow] outline-focus-ring",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          isSelected
            ? "bg-primary_alt text-secondary shadow-sm"
            : "text-tertiary",
          isHovered && !isDisabled && !isSelected && "text-secondary",
          isFocusVisible && "outline-2 -outline-offset-2",
          isDisabled && "pointer-events-none opacity-50",
          className,
        )
      }
    >
      {children}
    </AriaTab>
  );
}

export interface TabsContentProps {
  value: string;
  className?: string;
  children?: ReactNode;
  forceMount?: boolean;
}

export function TabsContent({
  value,
  className,
  children,
}: TabsContentProps) {
  return (
    <AriaTabPanel
      id={value}
      className={cx("flex-1 outline-none", className)}
    >
      {children}
    </AriaTabPanel>
  );
}

// Compat alias (au cas où certains anciens fichiers feraient `import * as ...`)
export { Tabs as default };
