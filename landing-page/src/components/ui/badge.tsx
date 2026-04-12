import { clx } from "@/lib/utils/clx/clx-merge";
import type { ComponentProps, VariantProps } from "@/lib/utils/clx/types";
import { STYLES } from "@/components/ui/_shared";

export const Badge = clx.div(
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

export type BadgeVariants = VariantProps<typeof Badge>;
export type BadgeProps = ComponentProps<typeof Badge>;
