import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import UpArrow from "@/app/components/UpArrow"; // Adjust path as needed
import { convertIpfsToPinataUrl } from "@/lib/utils/ipfs"; // Adjust path as needed
import { Token } from "@/lib/utils/types";

type TokenTileProps = {
  token: Token;
};

export function TokenTile({ token }: TokenTileProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchImage() {
      setLoading(true);
      try {
        const url = await convertIpfsToPinataUrl(token.baseURI);
        if (!cancelled) {
          setImageUrl(url);
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

  return (
    <div className="flex items-center justify-between bg-[#141619] rounded-[24px] p-5">
      <div className="flex space-x-4">
        <div className="relative w-[80px] aspect-square">
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
          <div className="absolute -bottom-2.5 -right-2.5 bg-[#2BBE30] rounded-full w-7 h-7 flex items-center justify-center shadow-lg border-4 border-[#161616]">
            <UpArrow />
          </div>
        </div>
        <div className="flex flex-col justify-between py-[2px] max-w-[240px]">
          <div className="text-[12px] font-header font-extralight text-blue-400">
            {token.marketCapETH} MARKET CAP
          </div>
          <div className="font-bold text-[20px] mt-0.5">
            {token.metadata.name}
          </div>
          <div className="text-[16px] font-medium text-[#AAAAAA] truncate">
            {token.metadata.description}
          </div>
        </div>
      </div>
      <Link
        href={`/cabin/${token.createdAt}`}
        className="text-blue-500 font-bold bg-[#1d2228] px-4 py-2.5 rounded-3xl"
      >
        Open
      </Link>
    </div>
  );
}
