import type { HTMLAttributes } from "react";
import { cx } from "@/utils/cx";

type ContentDividerProps = {
  type?: "single-line" | "double-line";
} & HTMLAttributes<HTMLDivElement>;

export const ContentDivider = ({
  type = "double-line",
  children,
  className,
  ...props
}: ContentDividerProps) => {
  return (
    <div
      className={cx(
        "flex w-full items-center gap-3 text-sm font-medium text-tertiary",
        className,
      )}
      {...props}
    >
      <div
        className={cx(
          "h-px w-full",
          type === "single-line" ? "bg-primary" : "border-b border-dashed border-primary",
        )}
      />
      {children && <div className="shrink-0">{children}</div>}
      <div
        className={cx(
          "h-px w-full",
          type === "single-line" ? "bg-primary" : "border-b border-dashed border-primary",
        )}
      />
    </div>
  );
}; 