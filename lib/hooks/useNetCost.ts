import { listenToNetCost } from "@/app/api/firebase";
import { useEffect, useState } from "react";

export function useNetCost(contractAddress: string) {
  const [netCost, setNetCost] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribe = listenToNetCost(contractAddress, setNetCost);
    return () => unsubscribe(); // Cleanup on unmount
  }, [contractAddress]);

  return netCost;
}
