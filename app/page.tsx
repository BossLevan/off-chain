"use client";

import {
  useMiniKit,
  useAddFrame,
  useOpenUrl,
} from "@coinbase/onchainkit/minikit";
import { useCallback, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import Check from "./svg/Check";
import Link from "next/link";
import Image from "next/image";
import { Flower } from "lucide-react";
import BottomNav from "./components/BottomNav";
import UpArrow from "./components/UpArrow";

// Mock data for cabins
const cabins = [
  {
    id: 1,
    name: "Polaroid",
    description: "Relive your memories.",
    marketCap: "$600M",
    image:
      "https://images.unsplash.com/photo-1495121553079-4c61bcce1894?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: 2,
    name: "Disposables",
    description: "Nostalgia Again.",
    marketCap: "$349M",
    image:
      "https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: 3,
    name: "OOTD",
    description: "Your OOTD as stickers.",
    marketCap: "$123M",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: 4,
    name: "Louvre",
    description: "A work of Art.",
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

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);

  const [activeFilter, setActiveFilter] = useState("new");

  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();
  const { address } = useAccount();

  // useEffect(() => {
  //   if (!isFrameReady) {
  //     setFrameReady();
  //   }
  // }, [setFrameReady, isFrameReady]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame, setFrameAdded]);

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <button
          type="button"
          onClick={handleAddFrame}
          className="cursor-pointer bg-transparent font-semibold text-sm"
        >
          + SAVE FRAME
        </button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-sm font-semibold animate-fade-out">
          <Check />
          <span>SAVED</span>
        </div>
      );
    }

    return null;
  }, [context, handleAddFrame, frameAdded]);

  return (
    <div className="flex flex-col h-screen bg-[#0C0C0C] text-white">
      {/* Fixed Header */}
      <header className="sticky top-0 bg-black z-10">
        <div className="safe-top" />
        <div className="max-w-[480px] mx-auto px-4 py-5 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Flower className="w-8 h-8 text-orange-500" />
            <span className="text-xl font-medium">
              Off-Chain
              <span className="text-[1.0em] align-[0.4em] ml-0.5">™</span>
            </span>
          </div>
          <div className="flex space-x-4">
            <Link
              href="/about"
              className="text-blue-500 font-bold bg-zinc-900 px-4 py-2.5 rounded-full"
            >
              About
            </Link>
            <Link
              href="/login"
              className="bg-blue-500 font-bold px-4 py-2.5 rounded-full"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-[480px] mx-auto px-4 pb-28">
          <div className="flex items-center justify-between my-4">
            <h1 className="text-2xl font-bold">Coins</h1>
          </div>

          <div className="flex space-x-2 mb-6">
            {["new", "trending", "featured"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  activeFilter === filter
                    ? "bg-zinc-900 text-orange-500 border border-orange-500"
                    : "bg-zinc-900 text-gray-400 border border-transparent"
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {cabins.map((cabin) => (
              <div
                key={cabin.id}
                className="flex items-center justify-between bg-[#141619] rounded-[24px] p-5"
              >
                <div className="flex space-x-4">
                  <div className="relative w-[80px] h-[80px]">
                    <Image
                      src={cabin.image || "/placeholder.svg"}
                      alt={cabin.name}
                      fill
                      className="rounded-2xl object-cover"
                    />
                    <div className="absolute -bottom-2.5 -right-2.5 bg-[#2BBE30] rounded-full w-7 h-7 flex items-center justify-center shadow-lg border-4 border-[#161616]">
                      <UpArrow />
                    </div>
                  </div>
                  <div className="flex flex-col justify-between py-[2px]">
                    <div className="text-[13px] font-header font-bold text-[#6B6B6B]">
                      {cabin.marketCap} MARKET CAP
                    </div>
                    <div className="font-bold text-[20px] mt-0.3">
                      {cabin.name}
                    </div>
                    <div className="text-[16px] font-medium text-[#AAAAAA]">
                      {cabin.description}
                    </div>
                  </div>
                </div>
                <Link
                  href={`/cabin/${cabin.id}`}
                  className="text-blue-500 font-bold bg-[#242b33] px-4 py-2.5 rounded-3xl"
                >
                  Open
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <BottomNav />
    </div>
    // <div className="flex flex-col min-h-screen sm:min-h-[820px] font-sans bg-[#E5E5E5] text-black items-center snake-dark relative">
    //   <div className="w-screen max-w-[520px]">
    //     <header className="mr-2 mt-1 flex justify-between">
    //       <div className="justify-start pl-1">
    //         {address ? (
    //           <Identity
    //             address={address}
    //             schemaId={SCHEMA_UID}
    //             className="!bg-inherit p-0 [&>div]:space-x-2"
    //           >
    //             <Name className="text-inherit">
    //               <Badge
    //                 tooltip="High Scorer"
    //                 className="!bg-inherit high-score-badge"
    //               />
    //             </Name>
    //           </Identity>
    //         ) : (
    //           <div className="pl-2 pt-1 text-gray-500 text-sm font-semibold">
    //             NOT CONNECTED
    //           </div>
    //         )}
    //       </div>
    //       <div className="pr-1 justify-end">{saveFrameButton}</div>
    //     </header>

    //     <main className="font-serif">
    //       <Snake />
    //     </main>

    //     <footer className="absolute bottom-4 flex items-center w-screen max-w-[520px] justify-center">
    //       <button
    //         type="button"
    //         className="mt-4 ml-4 px-2 py-1 flex justify-start rounded-2xl font-semibold opacity-40 border border-black text-xs"
    //         onClick={() => openUrl("https://base.org/builders/minikit")}
    //       >
    //         BUILT ON BASE WITH MINIKIT
    //       </button>
    //     </footer>
    //   </div>
    // </div>
  );
}
