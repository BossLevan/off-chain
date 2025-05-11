// lib/hooks/useTokens.ts

import { useEffect, useState } from "react";
import { Token } from "@/lib/utils/types";
import { fetchTokens } from "@/app/api/client"

export function useTokens() {
  const [tokens, setTokens] = useState<Token[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getTokens = async () => {
      try {
        const data = await fetchTokens();
        setTokens(data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    getTokens();
  }, []);

  return { tokens, loading, error };
}
