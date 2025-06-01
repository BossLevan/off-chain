import { Dialog } from "@headlessui/react";
import { X, Download, Share } from "lucide-react";
import React from "react";

type ImageModalProps = {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  shareToFarcaster: () => void;
};

export default function ImageModal({
  isOpen,
  onClose,
  imageUrl,
  shareToFarcaster,
}: ImageModalProps) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "ai-image.png";
    link.click();
  };

  const handleShareToTwitter = () => {
    const tweetText = encodeURIComponent(
      "Check out this image I just generated with AI!",
    );
    const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(
      imageUrl,
    )}`;
    window.open(tweetUrl, "_blank");
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Background overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm transition-opacity" />
      )}

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="relative z-50 rounded-2xl p-6 w-full max-w-md bg-gray-900 text-gray-100 border border-gray-700 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-lg">Image Preview</h3>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-col items-center gap-4">
            {/* Image preview */}
            <div className="w-full rounded-lg overflow-hidden shadow-lg shadow-blue-900/20">
              <img
                src={imageUrl}
                alt="Generated AI"
                className="w-full object-cover"
              />
            </div>

            {/* Attribution */}
            {/* <p className="text-sm text-blue-400 font-medium">
              Funded by $POLARIOD
            </p> */}

            {/* Actions */}
            <div className="flex gap-3 mt-4 w-full">
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors"
              >
                <Download size={16} />
                Download
              </button>

              <button
                onClick={shareToFarcaster}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-[#8247E5] hover:bg-[#6B34C9] text-white rounded-lg flex-1 transition-colors"
              >
                <img
                  src="https://uploads-ssl.webflow.com/6542f9a123db4e2224260db0/6542fbc8cf1b0b3e4ab5a8cb_farcaster-icon-white.svg"
                  alt="Farcaster"
                  className="w-4 h-4"
                />
                Share to Farcaster
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
