import React, { useEffect, useState } from "react";
import { listenToNetCost } from "../api/firebase";
import { NET_COST_UNLOCK_LIMIT } from "@/lib/constants";

type Props = {
  contractAddress: string;
  onStateChange?: (state: "Warm" | "Cold") => void;
};

const NetCostStatusTag: React.FC<Props> = ({
  contractAddress,
  onStateChange,
}) => {
  const [netCost, setNetCost] = useState<number | null>(null);
  const [status, setStatus] = useState<"Warm" | "Cold">("Cold");

  useEffect(() => {
    const unsubscribe = listenToNetCost(contractAddress, (cost) => {
      setNetCost(cost);
    });

    return () => unsubscribe();
  }, [contractAddress]);

  useEffect(() => {
    if (netCost === null) return;

    const currentState = netCost >= NET_COST_UNLOCK_LIMIT ? "Warm" : "Cold";
    setStatus(currentState);

    if (onStateChange) onStateChange(currentState);
  }, [netCost, onStateChange]);

  const dotColorClass = status === "Warm" ? "bg-green-400" : "bg-blue-400";

  const transformProgress = (value: number) => {
    const clamped = Math.max(0.001, Math.min(value, 5));
    const scaled = Math.log10(clamped + 1) / Math.log10(6); // Normalize log scale to 0-1
    return scaled * 100;
  };

  const progressPercent = transformProgress(netCost ?? 0);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress bar with stripes + stars */}
      {/* <div className="w-full h-2 rounded-full overflow-hidden mb-3 bg-[#1e1f28] relative">
        <div
          className="h-full rounded-full relative transition-all duration-500 ease-out progress-pattern"
          style={{ width: `${50}%` }}
        >
          <div className="absolute inset-0 sparkle-overlay pointer-events-none" />
        </div>
      </div> */}

      {/* Status Tag */}
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-neutral-900 text-sm text-white border border-neutral-700">
        <span
          className={`h-2 w-2 rounded-full mr-2 animate-pulse ${dotColorClass}`}
        />
        {status}
      </div>

      {/* Styling */}
      <style jsx>{`
        .progress-pattern {
          background-color: #22c55e; /* green-500 */
          background-image: repeating-linear-gradient(
            45deg,
            rgba(34, 197, 94, 0.3) 0,
            rgba(34, 197, 94, 0.3) 10px,
            rgba(34, 197, 94, 0.2) 10px,
            rgba(34, 197, 94, 0.2) 20px
          );
        }

        .sparkle-overlay {
          background-image:
            radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px),
            radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
          background-size:
            10px 10px,
            20px 20px;
          background-position:
            0 0,
            5px 5px;
          opacity: 0.3;
        }
      `}</style>
    </div>
  );
};

export default NetCostStatusTag;

const transformProgress = (value: number) => {
  const clamped = Math.max(0.001, Math.min(value, 5));
  const scaled = Math.log10(clamped + 1) / Math.log10(6); // log scale from 0.001 → 5
  return scaled * 100;
};
