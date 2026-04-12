import { STYLES } from "@/components/ui/_shared";
import { clx } from "@/lib/utils/clx/clx-merge";

export const TextArea = clx.textarea(
    STYLES.DISABLED_NOT_ALLOWED,
    STYLES.BORDER_INPUT,
    STYLES.OFFSET_BG,
    STYLES.RING_FOCUS_VISIBLE,
    "flex  w-full rounded-md bg-background px-3 py-2",
    "focus-visible:outline-none",
    "text-sm  placeholder:text-muted-foreground",
);
