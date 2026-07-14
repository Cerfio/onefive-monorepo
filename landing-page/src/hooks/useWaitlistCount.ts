"use client";

import { useState, useEffect } from "react";

interface WaitlistCountData {
  count: number;
  formattedCount: string;
  success: boolean;
}

// Baseline shown before/without the live count. The real total sits on top of a
// +800 base, so we never render "0" — which non-JS crawlers would otherwise
// read (and quote) as a literal fact on the homepage.
const DEFAULT_COUNT = 800;

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
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        // Fallback to the base count, never 0.
        setData({
          count: DEFAULT_COUNT,
          formattedCount: String(DEFAULT_COUNT),
          success: false,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
  }, []);

  return {
    count: data?.count ?? DEFAULT_COUNT,
    formattedCount: data?.formattedCount ?? String(DEFAULT_COUNT),
    loading,
    error,
  };
}
