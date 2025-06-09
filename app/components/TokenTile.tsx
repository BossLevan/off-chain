import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import UpArrow from "@/app/components/UpArrow";
import { convertIpfsToPinataUrl } from "@/lib/utils/ipfs";
import { ContractUser, Token } from "@/lib/utils/types";
import { convertStatToUsd } from "@/lib/utils/convertStatsToUsd";
import { getRaveSummary } from "../api/firebase";

type TokenTileProps = {
  token: Token;
  contract: string;
};

type RaveSummary = {
  totalRavers: number;
  recentRavers: ContractUser[];
};

export function TokenTile({ token, contract }: TokenTileProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [marketCapUsd, setMarketCapUsd] = useState<string | null>(null);
  const [raveSummary, setRaveSummary] = useState<RaveSummary>();
  const [volumeUsd, setVolumeUsd] = useState<string | null>(null);

  const participantImages = [
    { url: "https://i.pravatar.cc/150?img=1", border: "border-[#141619]" },
    { url: "https://i.pravatar.cc/150?img=2", border: "border-[#141619]" },
    { url: "https://i.pravatar.cc/150?img=3", border: "border-[#141619]" },
  ];

  useEffect(() => {
    let cancelled = false;
    async function fetchImage() {
      setLoading(true);
      try {
        const url = await convertIpfsToPinataUrl(token.baseURI);
        if (!cancelled) {
          setImageUrl(url);
          //get the rave joiners
          const summary = await getRaveSummary(contract);
          setRaveSummary(summary);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch image:", err);
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    fetchImage();
    return () => {
      cancelled = true;
    };
  }, [token.baseURI]);

  useEffect(() => {
    async function convertStats() {
      if (token.marketCapETH) {
        const usd = await convertStatToUsd(token.marketCapETH.toString());
        setMarketCapUsd(usd);
      }
      if (token.volumeETH) {
        const volume = await convertStatToUsd(token.volumeETH.toString());
        setVolumeUsd(volume);
      }
    }
    convertStats();
  }, [token.marketCapETH, token.volumeETH]);
  //bg-blue-500/5
  return (
    <div className="flex items-center justify-between bg-white/5 backdrop-blur-md backdrop-saturate-150 border border-white/5 rounded-[24px] p-3 sm:p-5">
      <div className="flex space-x-3 sm:space-x-4 min-w-0 flex-1">
        <div className="relative w-[64px] h-[64px] sm:w-[80px] sm:h-[80px] flex-shrink-0">
          {loading ? (
            <div className="w-full h-full rounded-2xl bg-zinc-800 animate-pulse" />
          ) : (
            imageUrl && (
              <Image
                src={imageUrl}
                alt={token.metadata.name}
                fill
                className="rounded-2xl object-cover"
              />
            )
          )}
          {/* <div className="absolute -bottom-1.5 -right-1.5 sm:-bottom-2.5 sm:-right-2.5 bg-[#2BBE30] rounded-full w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center shadow-lg border-2 sm:border-4 border-[#161616]">
            <UpArrow />
          </div> */}
        </div>
        <div className="flex flex-col justify-between py-[2px] min-w-0 flex-1">
          <div className="text-[12px] sm:text-[14px]  text-blue-400">
            {marketCapUsd ?? "..."} MARKET CAP
          </div>
          <div className="font-medium text-[16px] sm:text-[19px]  truncate">
            {token.metadata.name}
          </div>
          <div className="flex items-center gap-1">
            <div className="flex -space-x-2">
              {raveSummary?.recentRavers
                .slice(0, 3)
                .map((participant, index) => (
                  <img
                    key={index}
                    src={participant.pfpUrl}
                    alt={`Participant ${index + 1}`}
                    className={`sm:w-6 sm:h-6 w-4 h-4 rounded-full mb-0.5 object-cover`}
                  />
                ))}
            </div>

            {typeof raveSummary?.totalRavers === "number" &&
              raveSummary.totalRavers > 3 && (
                <div className="text-[15px] sm:text-[18px] font-normal text-gray-500 truncate">
                  +{raveSummary.totalRavers - 3} more
                </div>
              )}

            {typeof raveSummary?.totalRavers === "number" &&
              raveSummary.totalRavers > 0 &&
              raveSummary.totalRavers <= 3 && (
                <div className="text-[14px] sm:text-[18px] font-normal text-gray-500 ml-0.5 truncate">
                  {"   "}
                  {raveSummary.totalRavers} participants
                </div>
              )}

            {typeof raveSummary?.totalRavers === "number" &&
              raveSummary.totalRavers === 0 && (
                <div className="text-[14px] sm:text-[18px] font-normal text-gray-500 -ml-1 truncate">
                  No participants yet
                </div>
              )}

            {raveSummary?.totalRavers === undefined && (
              <div className="text-[14px] sm:text-[18px] font-normal text-gray-500 -ml-1 truncate">
                Loading...
              </div>
            )}
          </div>
        </div>
      </div>
      <Link
        href={`/cabin/${token.id}`}
        className="text-blue-500 font-semibold bg-white/0 hover:bg-white/10 backdrop-blur-sm border-white/5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-3xl flex-shrink-0 ml-2 sm:ml-4 text-sm sm:text-base transition"
      >
        Join
      </Link>
    </div>
  );
}
