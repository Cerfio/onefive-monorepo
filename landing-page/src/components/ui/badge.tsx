import type { ComponentPropsWithoutRef, ForwardRefExoticComponent, ReactNode, RefAttributes } from "react";
import { clx } from "@/lib/utils/clx/clx-merge";
import type { VariantProps } from "@/lib/utils/clx/types";
import { STYLES } from "@/components/ui/_shared";

const BadgeBase = clx.div(
  STYLES.RING_FOCUS,
  STYLES.FLEX_CENTER,
  "rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors w-fit",
  "leading-none",
  "rounded-md",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        isNew: "bg-neutral-500  px-1.5 text-[#000000]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type BadgeVariants = VariantProps<typeof BadgeBase>;
export type BadgeProps = ComponentPropsWithoutRef<"div"> &
  BadgeVariants & { children?: ReactNode; className?: string };

export const Badge = BadgeBase as ForwardRefExoticComponent<
  BadgeProps & RefAttributes<HTMLDivElement>
>;
