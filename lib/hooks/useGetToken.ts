// lib/hooks/useTokenDetails.ts

import { useEffect, useState } from "react";
import { getTokenDetails } from "@/app/api/client";
import type { SingleTokenDetailed } from "@/lib/utils/types";

export function useTokenDetails(contract: string | null) {
  const [data, setData] = useState<SingleTokenDetailed | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contract) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = await getTokenDetails(contract);
        //get firestore too
        setData(token);
      } catch (err: any) {
        setError(err.message || "Error fetching token");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [contract]);

  return { data, loading, error };
}
