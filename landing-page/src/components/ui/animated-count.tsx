"use client";

import NumberFlow from "@number-flow/react";
import { useWaitlistCount } from "@/hooks/useWaitlistCount";

export function AnimatedWaitlistCount() {
  const { count, loading } = useWaitlistCount();

  return (
    <span className="relative inline-block min-w-[3ch]">
      {loading && (
        <span
          className="absolute inset-0 animate-pulse bg-[#667085]/20 rounded"
          aria-hidden
        />
      )}
      <span className={loading ? "invisible" : ""}>
        <NumberFlow
          value={count ?? 0}
          format={{ useGrouping: true }}
          transformTiming={{ duration: 750, easing: "ease-out" }}
          willChange
        />
      </span>
    </span>
  );
}
