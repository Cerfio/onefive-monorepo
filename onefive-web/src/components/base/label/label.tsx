"use client";

// Wrapper local Label compatible API shadcn (`htmlFor`, `className`, children).
// Untitled UI fournit Label intégré à <Input>; ici c'est pour les usages
// standalone (groupes de checkboxes, radios, etc.).

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Label as AriaLabel } from "react-aria-components";
import { cx } from "@onefive/ui/utils/cx";

export interface LabelProps extends ComponentPropsWithoutRef<"label"> {
  htmlFor?: string;
  className?: string;
  children?: ReactNode;
}

export function Label({ className, children, ...props }: LabelProps) {
  return (
    <AriaLabel
      {...props}
      className={cx(
        "flex items-center gap-2 text-sm leading-none font-medium text-secondary select-none",
        "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
    >
      {children}
    </AriaLabel>
  );
}
