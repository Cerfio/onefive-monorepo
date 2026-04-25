"use client";

// Wrapper local Alert compatible API shadcn (`<Alert variant="destructive">
// <AlertTitle/><AlertDescription/></Alert>`).
// L'écosystème Untitled UI propose des composants d'alerte plus riches
// (`@onefive/ui/components/application/alerts/alerts`), mais ils ont une API
// très différente (props `title`, `description`, `color`, `actions`...). On
// garde le compound shadcn-like ici pour minimiser le refactor des 6
// consommateurs (mostly auth flows).

import type { ComponentPropsWithoutRef } from "react";
import { cx } from "@onefive/ui/utils/cx";

type AlertVariant = "default" | "destructive";

const variantClasses: Record<AlertVariant, string> = {
  default: "bg-primary text-primary border-secondary",
  destructive:
    "bg-error-primary text-error-primary border-error-secondary [&>svg]:text-fg-error-secondary [&_[data-slot=alert-description]]:text-error-primary",
};

export interface AlertProps extends ComponentPropsWithoutRef<"div"> {
  variant?: AlertVariant;
}

export function Alert({
  className,
  variant = "default",
  ...props
}: AlertProps) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cx(
        "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm",
        "has-[>svg]:grid-cols-[calc(var(--spacing,1rem))_1fr] has-[>svg]:gap-x-3",
        "[&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

export function AlertTitle({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cx(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

export function AlertDescription({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cx(
        "col-start-2 grid justify-items-start gap-1 text-sm text-tertiary [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}
