import { Dialog } from "@headlessui/react";
import { X, Download } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import CanvasAnnotation, { CanvasAnnotationHandle } from "./CanvasAnnotoation";

type Raver = {
  id: string;
  username: string;
  avatarUrl: string;
  followers: number;
};

type ImageModalProps = {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  shareToFarcaster: () => void;
  loading: boolean;
  volume: string;
  mcap: string;
  onImageReady: (image: string) => void;
};

export default function ImageModal({
  isOpen,
  onClose,
  imageUrl,
  shareToFarcaster,
  loading,
  onImageReady,
  volume,
  mcap,
}: ImageModalProps) {
  const canvasRef = useRef<CanvasAnnotationHandle>(null);
  const [hasSentImage, setHasSentImage] = useState(false);

  function getRandomGradient() {
    const gradients = [
      "from-pink-500 via-yellow-400 to-purple-500",
      "from-green-400 via-blue-500 to-indigo-600",
      "from-red-400 via-orange-300 to-yellow-500",
      "from-teal-400 via-cyan-500 to-blue-500",
      "from-fuchsia-500 via-red-500 to-amber-400",
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  }

  const ravers: Raver[] = [
    {
      id: "1",
      username: "jessepollak",
      avatarUrl:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop",
      followers: 1233,
    },
    {
      id: "2",
      username: "dwr",
      followers: 45,
      avatarUrl:
        "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=80&h=80&fit=crop",
    },
    {
      id: "3",
      username: "jacob",
      followers: 90,
      avatarUrl:
        "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80&h=80&fit=crop",
    },
    {
      id: "4",
      username: "notthreadguy",
      followers: 303,
      avatarUrl:
        "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=80&h=80&fit=crop",
    },
    {
      id: "5",
      username: "crytopoet",
      followers: 490,
      avatarUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop",
    },
    {
      id: "6",
      username: "jake",
      followers: 303,
      avatarUrl:
        "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=80&h=80&fit=crop",
    },
    {
      id: "7",
      username: "alex",
      followers: 303,
      avatarUrl:
        "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=80&h=80&fit=crop",
    },
  ];

  useEffect(() => {
    if (isOpen && !hasSentImage) {
      const timer = setTimeout(() => {
        const img = canvasRef.current?.getImage();
        if (img) {
          onImageReady(img);
          setHasSentImage(true);
        }
      }, 500);

      return () => clearTimeout(timer);
    } else if (!isOpen) {
      setHasSentImage(false);
    }
  }, [isOpen, hasSentImage, onImageReady]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "ai-image.png";
    link.click();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed z-50 inset-0 overflow-y-auto"
    >
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm transition-opacity" />
      )}

      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Panel className="relative z-10 bg-black border border-gray-700 rounded-xl p-6 max-w-2xl w-full mx-auto font-sans text-white">
          <div className="relative flex justify-center items-center mb-4">
            <h3 className="font-medium text-lg">Share your Identity, Raver</h3>
            <button
              onClick={onClose}
              className="absolute top-0 right-0 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col items-center gap-4">
            <CanvasAnnotation
              ref={canvasRef}
              base64={imageUrl}
              vol={volume}
              mcap={mcap}
            />
            {/* Ravers */}
            <div className="w-full mt-2">
              <h4 className="text-sm font-medium text-white mb-1">
                Ravers (134)
              </h4>
              <h6 className="text-sm text-gray-500 mb-2">
                Join 134 Others in the $AMBUSH Rave
              </h6>

              <div className="border border-gray-800 rounded-2xl bg-gray-950 backdrop-blur-sm px-0">
                {ravers.length === 0 ? (
                  <div className="min-h-[80px] flex items-center justify-center">
                    <span className="text-sm text-gray-500 italic">
                      Share to start this Rave
                    </span>
                  </div>
                ) : (
                  <div className="flex overflow-x-auto gap-2 pt-3 pb-3 scrollbar-thin w-full no-scrollbar px-3">
                    {ravers.map((raver) => (
                      <div
                        key={raver.id}
                        className="flex flex-col items-center text-xs text-center shrink-0"
                      >
                        <div
                          className={`p-[0px] rounded-full bg-gradient-to-tr ${getRandomGradient()}`}
                        >
                          <img
                            src={raver.avatarUrl}
                            alt={raver.username}
                            className="w-14 h-14 rounded-full bg-slate-900"
                          />
                        </div>

                        <span className="mt-1 text-gray-300 truncate max-w-[56px]">
                          {raver.username}
                        </span>
                        {/* <span className="text-[10px] text-gray-500 mt-0">
                          {raver.followers.toLocaleString()} followers
                        </span> */}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors sm:basis-1/4 w-full"
              >
                <Download size={16} />
                Download
              </button>

              <button
                onClick={shareToFarcaster}
                disabled={loading}
                className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors sm:basis-3/4 w-full ${
                  loading
                    ? "bg-[#a27dea] cursor-not-allowed"
                    : "bg-[#8247E5] hover:bg-[#6B34C9]"
                }`}
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                ) : (
                  <>
                    <img
                      src="https://assets.deform.cc/production/c278ba11-ccfd-49dd-b4ed-5fbef8b56dc4.png"
                      alt="Farcaster"
                      className="w-6 h-6 rounded-full shrink-0"
                    />
                    Share to Join the $AMBUSH Rave
                  </>
                )}
              </button>
            </div>

            {/* <p className="flex items-center justify-center text-xs text-center mt-2">
              ⭐️ Earn coins when you share ⭐️
            </p> */}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
