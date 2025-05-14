"use client";

import React, { useState } from "react";
import { X, ChevronDown, ArrowDown } from "lucide-react";
import SwapComponents from "./SwapComponent";
import { Token } from "@coinbase/onchainkit/token";

interface SwapModalProps {
  isOpen: boolean;
  token: Token;
  onClose: () => void;
}

const SwapModal: React.FC<SwapModalProps> = ({ isOpen, onClose, token }) => {
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState<string>("");

  if (!isOpen) return null;

  const presetAmounts = ["0.01 ETH", "0.1 ETH", "1 ETH"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <SwapComponents token={token} />
    </div>
  );
};

export default SwapModal;

//Previous Swap Component
{
  /* <div className="relative w-full max-w-[480px] bg-[#161616] rounded-3xl overflow-hidden">
{/* Header */
}
// {/* <div className="flex items-center justify-between p-4 border-b border-zinc-800">
//   <div className="flex-1" />
//   <div className="flex rounded-full bg-zinc-900 p-1">
//     <button
//       onClick={() => setActiveTab("buy")}
//       className={`px-8 py-2 rounded-full text-sm font-medium transition-colors ${
//         activeTab === "buy" ? "bg-blue-500 text-white" : "text-zinc-400"
//       }`}
//     >
//       Buy
//     </button>
//     <button
//       onClick={() => setActiveTab("sell")}
//       className={`px-8 py-2 rounded-full text-sm font-medium transition-colors ${
//         activeTab === "sell" ? "bg-red-500 text-white" : "text-zinc-400"
//       }`}
//     >
//       Sell
//     </button>
//   </div>
//   <div className="flex-1 flex justify-end">
//     <button
//       onClick={onClose}
//       className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
//     >
//       <X className="w-5 h-5 text-zinc-400" />
//     </button>
//   </div>
// </div>

//  {/* Content */}
// <div className="p-4 space-y-4">
//   {/* Amount Input */}
//   <div className="bg-zinc-900 rounded-2xl p-4">
//     <div className="flex items-center justify-between mb-2">
//       <span className="text-sm text-zinc-400">Enter the amount</span>
//       <button className="flex items-center space-x-2 bg-black rounded-xl px-3 py-2">
//         <img
//           src="https://cryptologos.cc/logos/ethereum-eth-logo.svg"
//           alt="ETH"
//           className="w-5 h-5"
//         />
//         <span className="text-sm font-medium">ETH</span>
//         <ChevronDown className="w-4 h-4 text-zinc-400" />
//       </button>
//     </div>
//     <input
//       type="text"
//       value={amount}
//       onChange={(e) => setAmount(e.target.value)}
//       placeholder="0.0"
//       className="w-full bg-transparent text-2xl font-medium focus:outline-none"
//     />
//     <div className="flex justify-between items-center mt-2">
//       <span className="text-sm text-zinc-500">≈ $0.00</span>
//       <span className="text-sm text-zinc-500">Balance: 0 ETH</span>
//     </div>
//   </div>

//   {/* Arrow */}
//   <div className="flex justify-center">
//     <div className="bg-zinc-900 p-2 rounded-xl">
//       <ArrowDown className="w-5 h-5 text-zinc-400" />
//     </div>
//   </div>

//   {/* Token Output */}
//   <div className="bg-zinc-900 rounded-2xl p-4">
//     <div className="flex items-center justify-between mb-2">
//       <span className="text-sm text-zinc-400">You will receive</span>
//       <button className="flex items-center space-x-2 bg-black rounded-xl px-3 py-2">
//         <span className="text-sm font-medium">$POLAROID</span>
//         <ChevronDown className="w-4 h-4 text-zinc-400" />
//       </button>
//     </div>
//     <div className="text-2xl font-medium">0.0</div>
//     <div className="flex justify-between items-center mt-2">
//       <span className="text-sm text-zinc-500">≈ $0.00</span>
//       <span className="text-sm text-zinc-500">
//         Balance: 0 $POLAROID
//       </span>
//     </div>
//   </div>

//   {/* Preset Amounts */}
//   <div className="grid grid-cols-3 gap-2">
//     {presetAmounts.map((preset) => (
//       <button
//         key={preset}
//         onClick={() => setAmount(preset.split(" ")[0])}
//         className="bg-zinc-900 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:bg-zinc-800 transition-colors"
//       >
//         {preset}
//       </button>
//     ))}
//   </div>

//   {/* Swap Button */}
//   <button
//     className={`w-full ${activeTab === "buy" ? "bg-blue-500" : "bg-red-500"} text-white py-4 rounded-full font-medium`}
//   >
//     {activeTab === "buy" ? "Buy $POLAROID" : "Sell $POLAROID"}
//   </button>
// </div>
// </div> */} */}
