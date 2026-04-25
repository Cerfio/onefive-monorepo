import type { ComponentProps } from "react";
import { cx } from "@/utils/cx";

export const Skeleton = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div
      data-slot="skeleton"
      className={cx("animate-pulse rounded-md bg-tertiary", className)}
      {...props}
    />
  );
};
