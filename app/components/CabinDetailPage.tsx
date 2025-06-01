"use client";

import React, { useEffect, useRef, useState } from "react";
import SwapModal from "./SwapModal";
import ImageModal from "./ImageModal";
import {
  Lock,
  ArrowLeft,
  Calendar,
  ChevronsUp,
  DollarSign,
  Flame,
  ImageIcon,
  Share2,
  Star,
  Upload,
  User,
  UsersIcon,
  X,
} from "lucide-react";
import { NET_COST_UNLOCK_LIMIT } from "@/lib/constants";
import { useTokenFirestoreDetails } from "@/lib/hooks/useGetFirestoreToken";
import { useTokenDetails } from "@/lib/hooks/useGetToken";
import { convertStatToUsd } from "@/lib/utils/convertStatsToUsd";
import { formatDateFromTimestamp } from "@/lib/utils/formatDate";
import { convertIpfsToPinataUrl } from "@/lib/utils/ipfs";
import { useOpenUrl } from "@coinbase/onchainkit/minikit";
import { notifyBusinessManagerClient, generateAiImage } from "../api/client";
import {
  listenToNetCost,
  uploadImagesToStorageTemporary,
} from "../api/firebase";
import AsyncTokenImage from "./AsyncImage";
import CircularProgress from "./CircularProgress";
import GalleryImages from "./GalleryImages";
import NetCostStatusTag from "./NetCostStatusTag";
import { sdk } from "@farcaster/frame-sdk";
import Link from "next/link";
import { extractImageId } from "@/lib/utils/idFromUrl";

export default function CabinDetailPage({ id }: { id: string }) {
  // const params = useParams();
  const isMobile = useIsMobile();
  const openUrl = useOpenUrl();

  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageGenLoading, setImageGenLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageGenError, setImageGenError] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [userPFP, setUserPFP] = useState<string | null | undefined>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"Warm" | "Cold">("Cold");
  const submitDataRef = useRef(new FormData());
  const [marketCapUsd, setMarketCapUsd] = useState<string | "0">("0");
  const [volumeUsd, setVolumeUsd] = useState<string | "0">("0");
  const [netCost, setNetCost] = useState<number | null>(0);

  // const id = Array.isArray(params.id) ? params.id[0] : params.id;
  //   const id = params.id;
  const { data: cabin, loading, error } = useTokenDetails(id);
  const { prompt, totalImagesGenerated } = useTokenFirestoreDetails(id);
  const [ipfsImageUrl, setipfsImageUrl] = useState<string | null>(null);
  const [ipfsloading, setIpfsLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const url = await convertIpfsToPinataUrl(cabin?.baseURI!);
        setipfsImageUrl(url);
      } catch (error) {
        console.error("Failed to fetch image", error);
      } finally {
        setIpfsLoading(false);
      }
    };

    fetchImage();
  }, [cabin?.baseURI]);

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

  useEffect(() => {
    importFarcasterProfileImage();
  }, [sdk.context]);

  const importFarcasterProfileImage = async () => {
    const res = (await sdk.context).user.pfpUrl;
    if (res != null) {
      setUserPFP(res);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(file);
      submitDataRef.current.append("images", file);
      const previewUrl = URL.createObjectURL(file);
      setUploadedImage(previewUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const showFarcasterPFP = async () => {
    console.log("attempting to show");
    try {
      setIsUploading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (userPFP != null) {
        setUploadedImage(userPFP);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const sharePageWithGeneratedImage = async () => {
    try {
      console.log("image url", imageUrl);
      const imageLink = await uploadImagesToStorageTemporary([imageUrl]);
      console.log("generated image storage link", imageLink[0]);
      const imageId = extractImageId(imageLink[0]);
      //construct link
      const shareLink = `https://off-chain.vercel.app/${id}?img=${encodeURIComponent(imageId!)}`;
      const text = `Funded by $${cabin?.metadata.symbol}`;
      const res = await sdk.actions.composeCast({
        text,
        embeds: [shareLink],
      });
      //View cast?
    } catch {
      console.log("An error occured ");
    }
  };

  const sharePage = async () => {
    console.log("pressed share");
    try {
      const shareLink = `https://off-chain.vercel.app/${id}`;
      const res = await sdk.actions.composeCast({
        embeds: [shareLink],
      });
    } catch {
      console.log("An error occured ");
    }
  };

  useEffect(() => {
    async function convertStats() {
      if (cabin) {
        if (cabin.marketCapETH) {
          const usd = await convertStatToUsd(cabin.marketCapETH.toString());
          setMarketCapUsd(usd);
        }
        if (cabin.volumeETH) {
          const volume = await convertStatToUsd(cabin.volumeETH.toString());
          setVolumeUsd(volume);
        }
      }
    }

    convertStats();
  }, [cabin]);

  const removeUploadedImage = () => {
    if (uploadedImage) URL.revokeObjectURL(uploadedImage);
    submitDataRef.current.delete("images");
    setUploadedImage(null);
  };

  useEffect(() => {
    async function callBusinessManager() {
      const res = await notifyBusinessManagerClient(id, false);
    }

    callBusinessManager();
  }, [id]);

  useEffect(() => {
    const unsubscribe = listenToNetCost(id, (cost) => {
      console.log(cost);
      setNetCost(cost);
    });

    return () => unsubscribe();
  }, [id]);

  //generate function
  const generateImage = async () => {
    try {
      if (prompt) {
        setImageGenLoading(true);
        submitDataRef.current.append("prompt", prompt);
        const response = await generateAiImage(submitDataRef.current, userPFP!);
        setImageUrl(response[0]);

        setIsModalOpen(true);
        //remove the uploaded image
        setUploadedImage(null);

        //notify business manager to update costing
        const res = await notifyBusinessManagerClient(id, true);

        console.log(res);
        setImageGenLoading(false);
        return;
      } else {
        console.log("Could not get prompt");
      }
    } catch (err: any) {
      setImageGenLoading(false);
      setImageGenError(true);
      //remove the uploaded image
      setUploadedImage(null);
    }
  };

  if (loading || ipfsloading) {
    return (
      <div className="flex items-center bg-black/50 justify-center h-screen text-white">
        Loading...
      </div>
    );
  }

  if (error || !cabin) {
    return (
      <div className="flex items-center bg-black/50 justify-center h-screen text-white">
        {error || "Token not found"}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0E0E0E] text-white">
      {/* <Head>

        <meta
          name="fc:frame"
          content={JSON.stringify({
            version: "next",
            imageUrl: pageImageUrl,
            button: {
              title: "View Cabin",
              action: {
                type: "launch_frame",
                url: `https://off-chain.vercel.app/cabin/${pageId}`,
              },
            },
          })}
        />
        <meta property="og:image" content={pageImageUrl} />
        <meta property="og:title" content={`Cabin`} />
      </Head> */}

      {/* Header */}
      <header className="sticky top-0 bg-black/50 backdrop-blur-lg z-10">
        <div className="safe-top" />
        <div className="max-w-[480px] mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-base sm:text-lg font-medium flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Back</span>
          </Link>
          <button onClick={sharePage} className="p-2 rounded-full bg-zinc-800">
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[480px] mx-auto px-4 pb-0">
          {/* Hero */}
          <div className="pt-4 mb-0">
            <div className="flex items-start space-x-4 mb-0">
              <AsyncTokenImage
                imageIpfsUri={cabin.baseURI}
                alt={cabin.metadata.name}
                size={isMobile ? 112 : 150}
              />
              <div className="flex flex-col justify-between flex-1 h-[100px] sm:h-[120px]">
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">
                    {cabin.metadata.name}
                  </h1>
                  <p className="text-gray-400 text-xs sm:text-base leading-relaxed sm:leading-normal line-clamp-2 sm:line-clamp-3 mb-2 sm:mb-4">
                    {cabin.metadata.description}
                  </p>
                  {/* 
                  <p className="text-gray-400 text-xs sm:text-base line-clamp-2 sm:line-clamp-3 mb-2 sm:mb-4">
                    {cabin.metadata.description}
                  </p> */}
                </div>

                {/* Buttons - Same layout for mobile and desktop */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setIsSwapModalOpen(true)}
                    className="bg-[#1a1f28] text-white py-2 sm:py-3 px-3 rounded-full font-medium text-xs sm:text-sm"
                  >
                    Swap
                  </button>
                  <button
                    onClick={() => {
                      openUrl(`https://flaunch.gg/base/coin/${id}`);
                      // if (isMobile) {
                      //   window.location.href = `https://flaunch.gg/base/coin/${id}`;
                      // } else {
                      //   window.open(
                      //     `https://flaunch.gg/base/coin/${id}`,
                      //     "_blank",
                      //   );
                      // }
                    }}
                    className="bg-blue-500 text-white py-2 sm:py-3 px-3 rounded-full font-medium text-xs sm:text-sm"
                  >
                    Buy
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section - Horizontal layout for both mobile and desktop */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2 mt-0 mb-6 pt-4">
            {[
              {
                label: "Volume (24h)",
                value: `${volumeUsd}`,
                icon: (
                  <ChevronsUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                ),
              },
              {
                label: "Market Cap",
                value: `${marketCapUsd}`,
                icon: (
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 stroke-yellow-500 fill-yellow-500" />
                ),
              },
              {
                label: "Generated",
                value: totalImagesGenerated.toString(),
                icon: (
                  <Flame className="w-4 h-4 sm:w-5 sm:h-5 stroke-red-500 fill-red-500" />
                ),
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-[#13161d] rounded-2xl p-3 sm:p-4 border border-[#292f3f]"
              >
                <div className="flex flex-col text-center">
                  <p className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">
                    {stat.label}
                  </p>
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    {stat.icon}
                    <p className="text-sm sm:text-xl font-header font-semibold">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Upload Section */}
          <div className="mb-8">
            <h2 className="text-lg sm:text-xl font-bold mb-4">
              Upload Your Image
            </h2>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />

            {uploadedImage ? (
              <div className="relative rounded-2xl overflow-hidden bg-zinc-900 aspect-[4/3]">
                <img
                  src={uploadedImage || "/placeholder.svg"}
                  alt="Uploaded"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => showFarcasterPFP()}
                    className="p-2 bg-black/50 rounded-full"
                  >
                    <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={removeUploadedImage}
                    className="p-2 bg-black/50 rounded-full text-red-500"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={state == "Cold" ? () => {} : () => showFarcasterPFP()}
                disabled={isUploading}
                className="relative w-full aspect-[4/3] rounded-[2rem] bg-gradient-to-br from-[#D500FF] via-[#04FF4F] to-[#F10509]"
              >
                <div className="absolute inset-[1px] rounded-[calc(2rem-1px)] bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 transition-all duration-300 ease-in-out">
                  {state === "Cold" ? (
                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
                      {/* Circular progress ring */}
                      {state === "Cold" && netCost !== null && (
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                          <CircularProgress
                            value={netCost}
                            max={NET_COST_UNLOCK_LIMIT}
                          />
                        </div>
                      )}

                      {/* Lock icon */}
                      <div className="p-3 sm:p-4 bg-[#1a1f28] rounded-full z-10">
                        <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 sm:p-4 bg-[#1a1f28] rounded-full">
                      <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                    </div>
                  )}

                  <div className="text-center">
                    {state == "Cold" ? (
                      <p className="text-base sm:text-lg font-medium text-white mb-2">
                        Hold to unlock
                      </p>
                    ) : (
                      <p className="text-base sm:text-lg font-medium text-white mb-2">
                        {isUploading ? "Uploading..." : "Import From Farcaster"}
                      </p>
                    )}

                    {state == "Cold" ? (
                      <p className="text-xs sm:text-sm text-zinc-400">
                        ${NET_COST_UNLOCK_LIMIT * 100 - netCost! * 100} in
                        volume required to unlock this aesthetic
                      </p>
                    ) : (
                      <p className="text-xs sm:text-sm text-zinc-400">
                        {isUploading
                          ? "Please wait..."
                          : "Click to import your Farcaster PFP"}
                      </p>
                    )}
                  </div>
                  <div>
                    <NetCostStatusTag
                      contractAddress={id}
                      onStateChange={setState}
                    />
                  </div>
                </div>
              </button>
            )}
            {state == "Warm" ? (
              <p className="mt-1 text-xs sm:text-sm text-zinc-400 text-center">
                Or upload another{" "}
                <span
                  className="text-blue-500 cursor-pointer underline"
                  onClick={() => fileInputRef.current?.click()} // replace this with your actual upload function
                >
                  image
                </span>
              </p>
            ) : (
              ""
            )}
          </div>

          {/* Gallery */}
          <GalleryImages contract={id} />

          {/* Details */}
          <section className="mb-8">
            <h2 className="text-lg sm:text-xl font-bold mb-4">
              Aesthetic Details
            </h2>
            <div className="bg-[#13161d] rounded-2xl p-4 space-y-4">
              {[
                {
                  icon: (
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  ),
                  label: "Date Created",
                  value: formatDateFromTimestamp(cabin.createdAt),
                },
                {
                  icon: (
                    <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                  ),
                  label: "Holders",
                  value: cabin.totalHolders,
                },
                {
                  icon: (
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                  ),
                  label: "Ticker",
                  value: cabin.metadata.symbol,
                },
                {
                  icon: (
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  ),
                  label: "Creator",
                  value: "kosi.base.eth",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {item.icon}
                    <span className="text-gray-400 text-sm sm:text-base">
                      {item.label}
                    </span>
                  </div>
                  <span className="font-header font-medium text-sm sm:text-base">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Social */}
          <section className="mb-8">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Socials</h2>
            <p className="text-sm sm:text-base">No socials available</p>
          </section>
        </div>
      </div>

      {/* Fixed Bottom */}
      <div className="sticky bottom-0 bg-black/50 backdrop-blur-lg z-10">
        <div className="max-w-[480px] mx-auto px-4 py-4 space-y-4">
          <div className="flex items-center space-x-2 text-gray-400 text-xs sm:text-sm">
            <span
              className={uploadedImage ? "text-green-500" : "text-zinc-500"}
            >
              {uploadedImage ? "✓" : "○"}
            </span>
            <span>Upload Required Image to app to generate</span>
          </div>
          <button
            onClick={generateImage}
            className={`w-full py-3 rounded-full font-medium text-base sm:text-lg ${
              uploadedImage
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-zinc-800 cursor-not-allowed"
            } transition-colors`}
            disabled={!uploadedImage}
          >
            Generate
          </button>
        </div>
        <div className="safe-bottom" />
      </div>

      {imageGenLoading && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center">
          <div className="flex items-center space-x-3">
            {/* Spinner */}
            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />

            {/* Status text */}
            <span className="text-white text-sm font-medium">
              Generating Image...
            </span>
          </div>
        </div>
      )}

      {imageGenError && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center px-4 text-center">
          <div className="text-white space-y-4 relative max-w-sm w-full">
            {/* Small error icon */}
            <div className="w-8 h-8 border border-red-500 rounded-full flex items-center justify-center mx-auto">
              <span className="text-red-500 font-semibold text-lg">!</span>
            </div>

            {/* Message */}
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="text-sm text-gray-300">
              Please try again with another image.
            </p>

            {/* Okay button */}
            <button
              onClick={() => setImageGenError(false)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageUrl={imageUrl}
        shareToFarcaster={sharePageWithGeneratedImage}
      />

      <SwapModal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        token={{
          address: id as `0x${string}`,
          chainId: 8453,
          decimals: 18,
          name: cabin.metadata.name,
          symbol: cabin.metadata.symbol,
          image:
            "https://dynamic-assets.coinbase.com/dbb4b4983bde81309ddab83eb598358eb44375b930b94687ebe38bc22e52c3b2125258ffb8477a5ef22e33d6bd72e32a506c391caa13af64c00e46613c3e5806/asset_icons/4113b082d21cc5fab17fc8f2d19fb996165bcce635e6900f7fc2d57c4ef33ae9.png",
        }}
      />
    </div>
  );
}
