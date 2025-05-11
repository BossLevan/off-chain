// lib/hooks/useLaunchToken.ts

import { useState } from "react";
import { launchToken } from "@/app/api/client";

export function useLaunchToken() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ state: string; address: string } | null>(null);

  const launch = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await launchToken(formData);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return { launch, result, loading, error };
}
