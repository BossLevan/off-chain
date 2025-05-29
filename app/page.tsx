"use client";

import {
  useMiniKit,
  useAddFrame,
  useOpenUrl,
} from "@coinbase/onchainkit/minikit";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import Check from "./svg/Check";
import Link from "next/link";
import Image from "next/image";
import { ArrowUp, ArrowUpCircle, Flower } from "lucide-react";
import BottomNav from "./components/BottomNav";
import UpArrow from "./components/UpArrow";

// Mock data for cabins
const cabins = [
  {
    id: 1,
    name: "Ghibli Frames",
    description: "A New Ghbili Experience",
    marketCap: "$600M",
    image:
      "https://images.unsplash.com/photo-1495121553079-4c61bcce1894?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: 2,
    name: "Tyla's Hearts",
    description: "Videos With Tyla's Hearts",
    marketCap: "$349M",
    image:
      "https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: 3,
    name: "Vogue Runway",
    description: "Your OOTD as stickers.",
    marketCap: "$123M",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: 4,
    name: "YOU",
    description: "A day as Joe Goldberg",
    marketCap: "$20M",
    image:
      "https://images.unsplash.com/photo-1544413660-299165566b1d?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: 5,
    name: "Monalisa",
    description: "A painting of you.",
    marketCap: "$5M",
    image:
      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: 7,
    name: "Monalisa",
    description: "A painting of you.",
    marketCap: "$5M",
    image:
      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: 6,
    name: "Monalisa",
    description: "A painting of you.",
    marketCap: "$5M",
    image:
      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=100&h=100",
  },
];

const SCHEMA_UID =
  "0x7889a09fb295b0a0c63a3d7903c4f00f7896cca4fa64d2c1313f8547390b7d39";

import { useTokens } from "@/lib/hooks/useGetTokens";
import { Loader2 } from "lucide-react";
import { convertIpfsToPinataUrl } from "@/lib/utils/ipfs";
import { TokenTile } from "./components/TokenTile";
import { useSearchParams } from "next/navigation";
import React from "react";

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const [activeFilter, setActiveFilter] = useState("new");

  const addFrame = useAddFrame();
  const isMobile = useIsMobile();
  const { address } = useAccount();
  const searchParams = useSearchParams();

  const { tokens: cabins, loading, error } = useTokens();
  const toastShownRef = useRef(false);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame, setFrameAdded]);

  function useIsMobile(breakpoint = 640) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const check = () => setIsMobile(window.innerWidth < breakpoint);
      check();

      window.addEventListener("resize", check);
      return () => window.removeEventListener("resize", check);
    }, [breakpoint]);

    return isMobile;
  }

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <button
          type="button"
          onClick={handleAddFrame}
          className="cursor-pointer bg-transparent font-semibold text-[12px] md:text-sm"
        >
          + SAVE FRAME
        </button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-[12px] md:text-sm font-semibold animate-fade-out">
          <Check />
          <span>SAVED</span>
        </div>
      );
    }

    return null;
  }, [context, handleAddFrame, frameAdded]);

  // The setFrameReady() function is called when your mini-app is ready to be shown
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  useEffect(() => {
    // Only show toast if it hasn't been shown yet and the param exists
    if (searchParams.get("toast") === "created" && !toastShownRef.current) {
      toast.success("Aesthetic Created");
      toastShownRef.current = true; // Mark toast as shown
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col h-screen bg-[#0C0C0C] text-white">
      {/* Header */}
      <header className="sticky top-0 bg-black z-10">
        <div className="safe-top" />
        <div className="max-w-[480px] mx-auto px-4 py-5 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ArrowUpCircle className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
            <span className="text-[16px] md:text-xl font-medium">
              Off-Chain
              <span className="text-[0.8em] md:text-[1.0em] align-[0.25em] ml-0.5">
                ™
              </span>
            </span>
          </div>
          <div className="flex space-x-3 md:space-x-4">
            <Link
              href="/about"
              className="text-blue-500 font-bold bg-zinc-900 px-3 py-2 md:px-4 md:py-2.5 rounded-full text-sm md:text-base"
            >
              About
            </Link>
            {/* <Link
              href="/login"
              className="bg-blue-500 font-bold px-3 py-2 md:px-4 md:py-2.5 rounded-full text-sm md:text-base"
            >
              Login
            </Link> */}
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-[480px] mx-auto px-4 pb-28">
          <div className="flex items-center justify-between my-4">
            <h1 className="text-[20px] md:text-2xl font-bold">Aesthetics</h1>
          </div>

          <div className="flex space-x-2 mb-6">
            {["new", "upcoming", "trending"].map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <div
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-xl p-[1px] cursor-pointer transition-all ${
                    isActive
                      ? "bg-gradient-to-br from-[#D500FF] via-[#04FF4F] to-[#F10509]"
                      : "bg-transparent"
                  }`}
                >
                  <button
                    className={`px-3 py-2 md:px-4 w-full rounded-[calc(0.75rem-1px)] font-medium bg-zinc-900 transition-colors text-[13px] md:text-base ${
                      isActive ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20 text-gray-400">
              <Loader2 className="animate-spin w-5 h-5 md:w-6 md:h-6 mr-2" />
              <span className="text-[13px] md:text-base">
                Loading tokens...
              </span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-red-500 text-center py-20 text-[13px] md:text-base">
              Error loading tokens: {error}
            </div>
          )}

          {/* Token List */}
          {!loading && !error && (
            <div className={isMobile ? "space-y-3" : "space-y-2"}>
              {cabins?.map(
                (cabin) =>
                  cabin.metadata != null && (
                    <TokenTile key={cabin.id} token={cabin} />
                  ),
              )}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

// export default function App() {
//   const { setFrameReady, isFrameReady, context } = useMiniKit();
//   const [frameAdded, setFrameAdded] = useState(false);

//   const [activeFilter, setActiveFilter] = useState("new");

//   const addFrame = useAddFrame();
//   const openUrl = useOpenUrl();
//   const { address } = useAccount();

//   // useEffect(() => {
//   //   if (!isFrameReady) {
//   //     setFrameReady();
//   //   }
//   // }, [setFrameReady, isFrameReady]);

//   const handleAddFrame = useCallback(async () => {
//     const frameAdded = await addFrame();
//     setFrameAdded(Boolean(frameAdded));
//   }, [addFrame, setFrameAdded]);

//   const saveFrameButton = useMemo(() => {
//     if (context && !context.client.added) {
//       return (
//         <button
//           type="button"
//           onClick={handleAddFrame}
//           className="cursor-pointer bg-transparent font-semibold text-sm"
//         >
//           + SAVE FRAME
//         </button>
//       );
//     }

//     if (frameAdded) {
//       return (
//         <div className="flex items-center space-x-1 text-sm font-semibold animate-fade-out">
//           <Check />
//           <span>SAVED</span>
//         </div>
//       );
//     }

//     return null;
//   }, [context, handleAddFrame, frameAdded]);

//   return (
//     <div className="flex flex-col h-screen bg-[#0C0C0C] text-white">
//       {/* Fixed Header */}
//       <header className="sticky top-0 bg-black z-10">
//         <div className="safe-top" />
//         <div className="max-w-[480px] mx-auto px-4 py-5 flex justify-between items-center">
//           <div className="flex items-center space-x-2">
//             <ArrowUpCircle className="w-6 h-6 text-orange-500" />
//             <span className="text-xl font-medium">
//               Off-Chain
//               <span className="text-[1.0em] align-[0.25em] ml-0.5">™</span>
//             </span>
//           </div>
//           <div className="flex space-x-4">
//             <Link
//               href="/about"
//               className="text-blue-500 font-bold bg-zinc-900 px-4 py-2.5 rounded-full"
//             >
//               About
//             </Link>
//             <Link
//               href="/login"
//               className="bg-blue-500 font-bold px-4 py-2.5 rounded-full"
//             >
//               Login
//             </Link>
//           </div>
//         </div>
//       </header>

//       {/* Main scrollable content */}
//       <div className="flex-1 overflow-y-auto">
//         <div className="w-full max-w-[480px] mx-auto px-4 pb-28">
//           <div className="flex items-center justify-between my-4">
//             <h1 className="text-2xl font-bold">Aesthetics</h1>
//           </div>

//           <div className="flex space-x-2 mb-6">
//             {["new", "upcoming", "trending"].map((filter) => {
//               const isActive = activeFilter === filter;
//               return (
//                 <div
//                   key={filter}
//                   onClick={() => setActiveFilter(filter)}
//                   className={`rounded-xl p-[1px] cursor-pointer transition-all ${
//                     isActive
//                       ? "bg-gradient-to-br from-[#D500FF] via-[#04FF4F] to-[#F10509]"
//                       : "bg-transparent"
//                   }`}
//                 >
//                   <button
//                     className={`px-4 py-2 w-full rounded-[calc(0.75rem-1px)] font-medium bg-zinc-900 transition-colors ${
//                       isActive ? "text-white" : "text-gray-400"
//                     }`}
//                   >
//                     {filter.charAt(0).toUpperCase() + filter.slice(1)}
//                   </button>
//                 </div>
//               );
//             })}
//           </div>

//           <div className="space-y-4">
//             {cabins.map((cabin) => (
//               <div
//                 key={cabin.id}
//                 className="flex items-center justify-between bg-[#141619] rounded-[24px] p-5"
//               >
//                 <div className="flex space-x-4">
//                   <div className="relative w-[80px] h-[80px]">
//                     <Image
//                       src={cabin.image || "/placeholder.svg"}
//                       alt={cabin.name}
//                       fill
//                       className="rounded-2xl object-cover"
//                     />
//                     <div className="absolute -bottom-2.5 -right-2.5 bg-[#2BBE30] rounded-full w-7 h-7 flex items-center justify-center shadow-lg border-4 border-[#161616]">
//                       <UpArrow />
//                     </div>
//                   </div>
//                   <div className="flex flex-col justify-between py-[2px]">
//                     <div className="text-[12px] font-header font-extralight text-blue-400">
//                       {cabin.marketCap} MARKET CAP
//                     </div>
//                     <div className="font-bold text-[20px] mt-0.3">
//                       {cabin.name}
//                     </div>
//                     <div className="text-[16px] font-medium text-[#AAAAAA]">
//                       {cabin.description}
//                     </div>
//                   </div>
//                 </div>
//                 <Link
//                   href={`/cabin/${cabin.id}`}
//                   className="text-blue-500 font-bold bg-[#1d2228] px-4 py-2.5 rounded-3xl"
//                 >
//                   Open
//                 </Link>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Fixed Bottom Navigation */}
//       <BottomNav />
//     </div>
//     // <div className="flex flex-col min-h-screen sm:min-h-[820px] font-sans bg-[#E5E5E5] text-black items-center snake-dark relative">
//     //   <div className="w-screen max-w-[520px]">
//     //     <header className="mr-2 mt-1 flex justify-between">
//     //       <div className="justify-start pl-1">
//     //         {address ? (
//     //           <Identity
//     //             address={address}
//     //             schemaId={SCHEMA_UID}
//     //             className="!bg-inherit p-0 [&>div]:space-x-2"
//     //           >
//     //             <Name className="text-inherit">
//     //               <Badge
//     //                 tooltip="High Scorer"
//     //                 className="!bg-inherit high-score-badge"
//     //               />
//     //             </Name>
//     //           </Identity>
//     //         ) : (
//     //           <div className="pl-2 pt-1 text-gray-500 text-sm font-semibold">
//     //             NOT CONNECTED
//     //           </div>
//     //         )}
//     //       </div>
//     //       <div className="pr-1 justify-end">{saveFrameButton}</div>
//     //     </header>

//     //     <main className="font-serif">
//     //       <Snake />
//     //     </main>

//     //     <footer className="absolute bottom-4 flex items-center w-screen max-w-[520px] justify-center">
//     //       <button
//     //         type="button"
//     //         className="mt-4 ml-4 px-2 py-1 flex justify-start rounded-2xl font-semibold opacity-40 border border-black text-xs"
//     //         onClick={() => openUrl("https://base.org/builders/minikit")}
//     //       >
//     //         BUILT ON BASE WITH MINIKIT
//     //       </button>
//     //     </footer>
//     //   </div>
//     // </div>
//   );
// }
