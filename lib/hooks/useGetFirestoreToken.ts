// lib/hooks/useTokenFirestoreDetails.ts

import { useEffect, useState } from "react";
import { getTokenFirestoreDetails } from "@/app/api/client"

export function useTokenFirestoreDetails(contract: string | null) {
  const [prompt, setPrompt] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contract) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getTokenFirestoreDetails(contract);
        setPrompt(data.prompt);
        setImageUrls(data.imageUrls);
      } catch (err: any) {
        setError(err.message || "Error fetching token Firestore data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [contract]);

  return { prompt, imageUrls, loading, error };
}
