"use client";

import type React from "react";

import { useState, useRef } from "react";
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
  Sparkle,
  X,
  ImageIcon,
  BarChart3,
  PieChart,
  Users,
  ChevronsUp,
  Heart,
} from "lucide-react";
import SwapModal from "@/app/components/SwapModal";

export default function CabinDetail() {
  const params = useParams();
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cabin = {
    id: params.id,
    name: "Ghibli",
    description: "Convert your Images to Ghibli Polaroids.",
    image:
      "https://images.unsplash.com/photo-1495121553079-4c61bcce1894?auto=format&fit=crop&q=80&w=100&h=100",
    volume: "$145K",
    marketCap: "$109M",
    holders: "5K",
    dateCreated: "4/1/25",
    ticker: "$POLAROID",
    creator: "jesse.base.eth",
    twitter: "@doginme",
    requiredBalance: "12K POLAROID",
    galleryImages: [
      "https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&q=80&w=200&h=200",
      "https://images.unsplash.com/photo-1542567455-cd733f23fbb1?auto=format&fit=crop&q=80&w=200&h=200",
      "https://images.unsplash.com/photo-1524856949007-80db29955b17?auto=format&fit=crop&q=80&w=200&h=200",
      "https://images.unsplash.com/photo-1554080353-321e452ccf19?auto=format&fit=crop&q=80&w=200&h=200",
    ],
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const previewUrl = URL.createObjectURL(file);
      setUploadedImage(previewUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeUploadedImage = () => {
    if (uploadedImage) URL.revokeObjectURL(uploadedImage);
    setUploadedImage(null);
  };

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
            <Image
              src={cabin.image || "/placeholder.svg"}
              alt={cabin.name}
              width={148}
              height={148}
              className="rounded-2xl object-cover"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{cabin.name}</h1>
              <p className="text-gray-400 mb-4">{cabin.description}</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsSwapModalOpen(true)}
                  className="bg-[#1a1f28] text-white py-3 rounded-full font-medium text-sm"
                >
                  Swap
                </button>
                <button className="bg-blue-500 text-white py-3 rounded-full font-medium text-sm">
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
                value: cabin.volume,
                icon: <ChevronsUp className="w-5 h-5 text-green-400" />,
              },
              {
                label: "Market Cap",
                value: cabin.marketCap,
                icon: (
                  <Sparkle className="w-5 h-5 stroke-yellow-500 fill-yellow-500" />
                ),
              },
              {
                label: "Patrons",
                value: cabin.holders,
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
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="relative w-full aspect-[4/3] rounded-[2rem] bg-gradient-to-br from-[#D500FF] via-[#04FF4F] to-[#F10509]"
              >
                <div className="absolute inset-[1px] rounded-[calc(2rem-1px)] bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 transition-all duration-300 ease-in-out">
                  <div className="p-4 bg-[#1a1f28] rounded-full">
                    <Upload className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium text-white mb-2">
                      {isUploading ? "Uploading..." : "Upload your image"}
                    </p>
                    <p className="text-sm text-zinc-400">
                      {isUploading
                        ? "Please wait..."
                        : "Click to browse or drag and drop"}
                    </p>
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Gallery */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Sample Images</h2>
            <div className="overflow-x-auto pb-4 -mx-4 px-4">
              <div className="flex space-x-3 min-w-max">
                {cabin.galleryImages.map((img, i) => (
                  <Image
                    key={i}
                    src={img || "/placeholder.svg"}
                    alt={`Gallery ${i}`}
                    width={160}
                    height={160}
                    className="rounded-2xl object-cover flex-shrink-0"
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Details */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Aesthetic Details</h2>
            <div className="bg-[#13161d] rounded-2xl p-4 space-y-4">
              {[
                {
                  icon: <Calendar className="w-5 h-5 text-green-500" />,
                  label: "Date Created",
                  value: cabin.dateCreated,
                },
                {
                  icon: <DollarSign className="w-5 h-5 text-purple-500" />,
                  label: "Ticker",
                  value: cabin.ticker,
                },
                {
                  icon: <User className="w-5 h-5 text-orange-500" />,
                  label: "Creator",
                  value: cabin.creator,
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
                <span className="font-header font-medium">{cabin.twitter}</span>
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

      <SwapModal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
      />
    </div>
  );
}
