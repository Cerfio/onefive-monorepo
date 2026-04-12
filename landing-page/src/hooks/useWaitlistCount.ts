"use client";

import { useState, useEffect } from "react";

interface WaitlistCountData {
  count: number;
  formattedCount: string;
  success: boolean;
}

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
        // En cas d'erreur, fallback à 0 (évite un chiffre trompeur)
        setData({
          count: 0,
          formattedCount: "0",
          success: false,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
  }, []);

  return {
    count: data?.count ?? 0,
    formattedCount: data?.formattedCount ?? "0",
    loading,
    error,
  };
}
