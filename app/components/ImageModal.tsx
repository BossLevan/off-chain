import { Dialog } from "@headlessui/react";
import { X, Download, Share } from "lucide-react";
import React, { useEffect, useState } from "react";

type ImageModalProps = {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
};

export default function ImageModal({
  isOpen,
  onClose,
  imageUrl,
}: ImageModalProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check system preference for dark mode on component mount
  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    setIsDarkMode(prefersDark);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

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
    const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(imageUrl)}`;
    window.open(tweetUrl, "_blank");
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Background overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm transition-opacity" />
      )}

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel
          className={`relative z-50 rounded-2xl p-6 w-full max-w-md shadow-xl transition-colors duration-300 ${
            isDarkMode
              ? "bg-gray-900 text-gray-100 border border-gray-700"
              : "bg-white text-gray-800 border border-gray-200"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3
              className={`font-medium text-lg ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}
            >
              Image Preview
            </h3>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${
                  isDarkMode
                    ? "bg-gray-700 text-yellow-400 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>

              {/* Close button */}
              <button
                onClick={onClose}
                className={`p-2 rounded-full ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                    : "bg-gray-200 text-gray-500 hover:bg-gray-300 hover:text-black"
                }`}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            {/* Image with glow effect in dark mode */}
            <div
              className={`w-full rounded-lg overflow-hidden ${
                isDarkMode ? "shadow-lg shadow-blue-900/20" : "shadow"
              }`}
            >
              <img
                src={imageUrl}
                alt="Generated AI"
                className="w-full object-cover"
              />
            </div>

            {/* Funding attribution */}
            <p
              className={`text-sm ${isDarkMode ? "text-blue-400" : "text-blue-600"} font-medium`}
            >
              Funded by $POLARIOD
            </p>

            <div className="flex gap-3 mt-4 w-full">
              <button
                onClick={handleDownload}
                className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg flex-1 transition-colors ${
                  isDarkMode
                    ? "bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
                }`}
              >
                <Download size={16} />
                Download
              </button>

              <button
                onClick={handleShareToTwitter}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex-1 transition-colors"
              >
                <Share size={16} />
                Share
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
