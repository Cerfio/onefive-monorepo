"use client";

import { useState, useEffect } from "react";

interface WaitlistCountData {
  count: number;
  formattedCount: string;
  success: boolean;
}

// `count` is null until the real total arrives, and stays null if it never
// does. Callers keep showing the skeleton in that case: an unavailable count
// renders nothing rather than a stand-in number, because whatever appears here
// is read as a factual claim about how many people signed up.
export function useWaitlistCount() {
  const [data, setData] = useState<WaitlistCountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/waitlist-count");

        if (!response.ok) {
          throw new Error("Failed to fetch waitlist count");
        }

        const result = await response.json();
        setData(result.success ? result : null);
        setError(result.success ? null : "Count unavailable");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
  }, []);

  return {
    count: data?.count ?? null,
    formattedCount: data?.formattedCount ?? null,
    // True whenever there is no real number to show — still in flight, or failed.
    loading: loading || data === null,
    error,
  };
}
