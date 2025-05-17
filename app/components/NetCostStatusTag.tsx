import React, { useEffect, useState } from "react";
import { listenToNetCost } from "../api/firebase";

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

    const currentState = netCost > 10 ? "Warm" : "Cold";
    console.log("status changed", currentState);
    setStatus(currentState);

    // Notify parent
    if (onStateChange) onStateChange(currentState);
  }, [netCost, onStateChange]);

  const dotColorClass = status === "Warm" ? "bg-green-500" : "bg-blue-500";

  return (
    <div className="inline-flex items-center px-3 py-1 mb-2 rounded-full bg-neutral-900 text-sm text-white border border-neutral-700">
      <span
        className={`h-2 w-2 rounded-full mr-2 animate-pulse ${dotColorClass}`}
      />
      {status}
    </div>
  );
};

export default NetCostStatusTag;

// import { useState } from "react";
// import NetCostStatusTag from "./NetCostStatusTag";

// export default function ParentComponent() {
//   const [state, setState] = useState<"Warm" | "Cold">("Cold");

//   return (
//     <div>
//       <NetCostStatusTag
//         contractAddress="0xabc..."
//         onStateChange={setState}
//       />
//       <p className="text-white mt-4">🔥 Current state is: {state}</p>
//     </div>
//   );
// }
