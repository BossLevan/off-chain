"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Share2,
  Calendar,
  DollarSign,
  User,
  Twitter,
  Upload,
  Star,
  X,
  ImageIcon,
  ChevronsUp,
  Heart,
  Lock,
} from "lucide-react";
import SwapModal from "@/app/components/SwapModal";
import AsyncTokenImage from "@/app/components/AsyncImage";
import { useTokenDetails } from "@/lib/hooks/useGetToken";
import { useTokenFirestoreDetails } from "@/lib/hooks/useGetFirestoreToken";
import GalleryImages from "@/app/components/GalleryImages";
import { formatDateFromTimestamp } from "@/lib/utils/formatDate";
import NetCostStatusTag from "@/app/components/NetCostStatusTag";
import { generateAiImage, notifyBusinessManagerClient } from "@/app/api/client";
import ImageModal from "@/app/components/ImageModal";
import { GenerationProgress } from "@/app/components/GenerationProgress";
import { convertStatToUsd } from "@/lib/utils/convertStatsToUsd";
import CircularProgress from "@/app/components/CircularProgress";
import { listenToNetCost } from "@/app/api/firebase";
import { NET_COST_UNLOCK_LIMIT } from "@/lib/constants";

export default function CabinDetail() {
  const params = useParams();
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageGenLoading, setImageGenLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = /iPhone|Android|iPad/i.test(navigator.userAgent);
  const [state, setState] = useState<"Warm" | "Cold">("Cold");
  const submitDataRef = useRef(new FormData());
  const [marketCapUsd, setMarketCapUsd] = useState<string | "0">("0");
  const [volumeUsd, setVolumeUsd] = useState<string | "0">("0");
  const [netCost, setNetCost] = useState<number | null>(0);

  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data: cabin, loading, error } = useTokenDetails(id);
  const { prompt, totalImagesGenerated } = useTokenFirestoreDetails(id);

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
        const response = await generateAiImage(submitDataRef.current);
        setImageUrl(response[0]);

        setIsModalOpen(true);

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
      console.log("An Error Occurred While Generating Images", err);
      throw Error(err);
    }
  };

  if (loading) {
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
      {/* Header */}
      <header className="sticky top-0 bg-black/50 backdrop-blur-lg z-10">
        <div className="safe-top" />
        <div className="max-w-[480px] mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-lg font-medium flex items-center space-x-2"
          >
            <ArrowLeft className="w-6 h-6" />
            <span>Back</span>
          </Link>
          <button className="p-2 rounded-full bg-zinc-800">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[480px] mx-auto px-4 pb-48">
          {/* Hero */}
          <div className="flex items-start space-x-4 mb-6 pt-4">
            <AsyncTokenImage
              imageIpfsUri={cabin.baseURI}
              alt={cabin.metadata.name}
              size={148}
            />
            <div className="flex flex-col justify-between flex-1 h-[148px]">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  {cabin.metadata.name}
                </h1>
                <p className="text-gray-400 mb-4">
                  {cabin.metadata.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsSwapModalOpen(true)}
                  className="bg-[#1a1f28] text-white py-3 rounded-full font-medium text-sm"
                >
                  Swap
                </button>
                <button
                  onClick={() => {
                    if (isMobile) {
                      window.location.href = `https://flaunch.gg/base/coin/${id}`; // opens in same tab (better UX for mobile)
                    } else {
                      window.open(
                        `https://flaunch.gg/base/coin/${id}`,
                        "_blank",
                      );
                    }
                  }}
                  className="bg-blue-500 text-white py-3 rounded-full font-medium text-sm"
                >
                  Buy
                </button>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[
              {
                label: "Volume (24h)",
                value: `${volumeUsd}`,
                icon: <ChevronsUp className="w-5 h-5 text-green-400" />,
              },
              {
                label: "Market Cap",
                value: `${marketCapUsd}`,
                icon: (
                  <Star className="w-5 h-5 stroke-yellow-500 fill-yellow-500" />
                ),
              },
              {
                label: "Patrons",
                value: cabin.totalHolders,
                icon: <Heart className="w-5 h-5 stroke-red-500 fill-red-500" />,
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-[#13161d] rounded-2xl p-4 border border-[#292f3f] text-center"
              >
                <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                <div className="flex items-center justify-center gap-2">
                  {stat.icon}
                  <p className="text-xl font-header font-semibold">
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Upload Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Upload Your Image</h2>
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
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-black/50 rounded-full"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={removeUploadedImage}
                    className="p-2 bg-black/50 rounded-full text-red-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={
                  state == "Cold"
                    ? () => {}
                    : () => fileInputRef.current?.click()
                }
                disabled={isUploading}
                className="relative w-full aspect-[4/3] rounded-[2rem] bg-gradient-to-br from-[#D500FF] via-[#04FF4F] to-[#F10509]"
              >
                <div className="absolute inset-[1px] rounded-[calc(2rem-1px)] bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 transition-all duration-300 ease-in-out">
                  {state === "Cold" ? (
                    <div className="relative w-16 h-16 flex items-center justify-center">
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
                      <div className="p-4 bg-[#1a1f28] rounded-full z-10">
                        <Lock className="w-8 h-8 text-blue-400" />
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-[#1a1f28] rounded-full">
                      <Upload className="w-8 h-8 text-blue-400" />
                    </div>
                  )}

                  <div className="text-center">
                    {state == "Cold" ? (
                      <p className="text-lg font-medium text-white mb-2">
                        Credits are Low
                      </p>
                    ) : (
                      <p className="text-lg font-medium text-white mb-2">
                        {isUploading ? "Uploading..." : "Upload your image"}
                      </p>
                    )}

                    {state == "Cold" ? (
                      <p className="text-sm text-zinc-400">
                        $
                        {NET_COST_UNLOCK_LIMIT * 1000 -
                          Number.parseFloat(netCost!.toFixed(1)) / 0.001}{" "}
                        in volume required to unlock
                      </p>
                    ) : (
                      <p className="text-sm text-zinc-400">
                        {isUploading
                          ? "Please wait..."
                          : "Click to browse or drag and drop"}
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
            <p className="mt-1 text-sm text-zinc-400 text-center">
              <span className="font-semibold text-green-500">
                🚀 {totalImagesGenerated.toString()}{" "}
              </span>{" "}
              images have been generated in this Aesthetic
            </p>
          </div>

          {/* Gallery */}
          <GalleryImages contract={id} />

          {/* Details */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Aesthetic Details</h2>
            <div className="bg-[#13161d] rounded-2xl p-4 space-y-4">
              {[
                {
                  icon: <Calendar className="w-5 h-5 text-green-500" />,
                  label: "Date Created",
                  value: formatDateFromTimestamp(cabin.createdAt),
                },
                {
                  icon: <DollarSign className="w-5 h-5 text-purple-500" />,
                  label: "Ticker",
                  value: cabin.metadata.symbol,
                },
                {
                  icon: <User className="w-5 h-5 text-orange-500" />,
                  label: "Creator",
                  value: "kosi.base.eth",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {item.icon}
                    <span className="text-gray-400">{item.label}</span>
                  </div>
                  <span className="font-header font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Social */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Socials</h2>
            <div className="bg-[#13161d] rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Twitter className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-400">Twitter</span>
                </div>
                <span className="font-header font-medium">
                  {cabin.metadata.twitter ?? ""}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Fixed Bottom */}
      <div className="sticky bottom-0 bg-black/50 backdrop-blur-lg z-10">
        <div className="max-w-[480px] mx-auto px-4 py-4 space-y-4">
          {/* <div className="flex flex-wrap items-center text-gray-400 text-sm">
            <span className="text-green-500 mr-2">✓</span>
            <span>Hold at least {cabin.requiredBalance}. </span>
            <button className="text-blue-500 underline hover:text-blue-400 mx-1">
              Buy here
            </button>
            <span>(Bal: 0.00 $POLAROID)</span>
          </div> */}
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <span
              className={uploadedImage ? "text-green-500" : "text-zinc-500"}
            >
              {uploadedImage ? "✓" : "○"}
            </span>
            <span>Upload Required Image to app to generate</span>
          </div>
          <button
            onClick={generateImage}
            className={`w-full py-3 rounded-full font-medium text-lg ${
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center">
          <div className="relative w-64 h-64">
            {/* Animated gradient circle */}
            <div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-spin"
              style={{ animationDuration: "3s" }}
            ></div>

            {/* Inner circle */}
            <div className="absolute inset-2 rounded-full bg-black flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 mb-4">
                  {/* Animated dots */}
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-4 h-4 bg-blue-500 rounded-full"
                      style={{
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        animation: `pulse 1.5s infinite ${i * 0.3}s`,
                      }}
                    ></div>
                  ))}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Creating Magic
                </h3>
                {/* <p className="text-gray-400 text-center max-w-xs">
                  Generating your stylized image...
                </p> */}
              </div>
            </div>
          </div>

          {/* Animated percentage counter */}
          <div className="mt-8">
            <GenerationProgress />
          </div>
        </div>
      )}

      {/* Modal */}
      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageUrl={imageUrl}
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
