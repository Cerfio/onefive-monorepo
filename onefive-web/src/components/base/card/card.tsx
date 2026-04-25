import type { ComponentProps } from "react";
import { cx } from "@/utils/cx";

export const Card = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="card"
    className={cx(
      "flex flex-col gap-6 rounded-xl bg-primary py-6 text-primary shadow-xs ring-1 ring-secondary",
      className,
    )}
    {...props}
  />
);

export const CardHeader = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="card-header"
    className={cx(
      "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
      className,
    )}
    {...props}
  />
);

export const CardTitle = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="card-title"
    className={cx("leading-none font-semibold text-primary", className)}
    {...props}
  />
);

export const CardDescription = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="card-description"
    className={cx("text-sm text-tertiary", className)}
    {...props}
  />
);

export const CardAction = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="card-action"
    className={cx(
      "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
      className,
    )}
    {...props}
  />
);

export const CardContent = ({ className, ...props }: ComponentProps<"div">) => (
  <div data-slot="card-content" className={cx("px-6", className)} {...props} />
);

export const CardFooter = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="card-footer"
    className={cx("flex items-center px-6 [.border-t]:pt-6", className)}
    {...props}
  />
);
