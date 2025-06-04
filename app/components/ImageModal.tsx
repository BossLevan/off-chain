import { Dialog } from "@headlessui/react";
import { X, Download } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import CanvasAnnotation, { CanvasAnnotationHandle } from "./CanvasAnnotoation";

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

  // Send image once when modal opens
  useEffect(() => {
    if (isOpen && !hasSentImage) {
      const timer = setTimeout(() => {
        if (canvasRef.current) {
          const img = canvasRef.current.getImage();
          if (img) {
            onImageReady(img);
            setHasSentImage(true);
          }
        }
      }, 500); // Wait for canvas to be ready

      return () => clearTimeout(timer);
    } else if (!isOpen) {
      setHasSentImage(false); // Reset for next open
    }
  }, [isOpen, hasSentImage, onImageReady]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "ai-image.png";
    link.click();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm transition-opacity" />
      )}

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="relative z-50 rounded-2xl p-6 w-full max-w-md bg-gray-900 text-gray-100 border border-gray-700 shadow-xl">
          <div className="font-sans flex justify-between items-center mb-4">
            <h3 className="font-medium text-lg">Image Preview</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>

          <div className="font-sans flex flex-col items-center gap-4">
            <CanvasAnnotation
              ref={canvasRef}
              base64={imageUrl}
              vol={volume}
              mcap={mcap}
            />

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
                      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAZlBMVEV8ZcH///93Xr96YsB4YMCUg8ujldK3rNu0qNpyWL1/acN1XL7u7PZ7Y8BwVrzz8fnAt+CNesjb1e2DbcT6+f3Vz+ppTLqRf8rHv+O8st7MxeWjlNKaic7n4/P19PpsULuvotfj3/HBCoTvAAAD70lEQVR4nO2d63qiMBRFOwlVIRKFar3S2vd/yZHpzA9rPbmwMbGz1wts1ockJ1efngghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIyohib1IJPk7FJ7FdXv8amqmlIQxrSkIY0pCENaUjD/8ewvsE9DG8AFlTme/TohvpGsoIq6ufRRcJ51kDDuk6t8w3Y36ldpPa5YmGRgk9lm1roiraEGpplaqErlgZqWExSC10xwc7C1S+pha54AXeINrXQFdiG5tzUdKmNvtBhG5pzU7NPrfSFPbahOTc1s9RKX5ihp/uzq9ugNVtPdnUbemyRXd0Grtl6MqvbwDVbT2Z1G7hm68msbgPXbD2Z1W3omq2nTC11Af4zPH+I7bznLbHa25+naPGfYa9YnnlPXdvM3vvHGEXwEzVNbDhV48nR0MWqW29309lst113qx9nuNhPKlsao1ShlDGlrSb7uDIwS8PVsrGmuOzA6sLYZhvxKjM07A5WfT/S0coegqcOsjOcH61UXxX2OH9sw5N1DVS1PT2wYat9HkfVIQOzrAxP1q88rkNeY0aGq8a/tDKNd6uaj+GiChnBFZVv75iN4fxGD3ELrTzb1FwMFyZ0hFobv7eYieGqCp/N1JXXt5iJYRMzi1I0j2N4ihugGp9OIwvDNna21np0/VkY6th5sNpjd04Ohqf4Z1Du32kGhvMhKwrW2StmYHgcsuylj/kbdsMWhaxrSJzecOCCQnHI3XA1dF3POiqb5IbLoQ+gHKt4yQ2bocvr2lG7pTYELD47ltNTGwJ2uTh27qQ2BCzNOhabUxsCNtY7NscnNhzcV/TI/UViQ8h2OnmTYGLDNWJt1qwzNtxCDLcZG+4Q8WqXseEMYihGpDZE7FSSt7LScDA0BETQEBAhQUNABA0BERI0BETQEBAhQUNABA0BERI0BETQEBAhQUNABA0BERI0BETQEBAhQUNABA0BERI0BETQEBAhQUNABA0BERI0BETQEBAh8eMNtRXj3UdGfSLEDfszQIRAuVmKG5Y+lpty2M62+hzxIUV0y2aMWz/+pYu7lT5ZD1K8Q4SEz6GdAWeCAiJGeovObfR/OcR/KHr8CAnjeeR6wN0xd4iQKD3Psc7jf0N3iEgcT0MaDqJWr573kMxfIy8TP0d4GnaxEQJFMW097z1YradR/7QVEtHGRQgo57nAS47h9fEdIgRch5GuCT7/dIcIifBbhIPPJYRHfACbm5jrWQNPz8T8jQTwktaYK3Y3gTd/bMIjgBft0pCGD2AY2FXdyXDQyf9L6uo5mOC2dPQIOV8HE3zH0PgRhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIGZ/fAvZbw3/gJrkAAAAASUVORK5CYII="
                      alt="Farcaster"
                      className="w-6 h-6 shrink-0"
                    />
                    Cast
                  </>
                )}
              </button>

              <p className="flex items-center justify-center text-xs text-center mt-2">
                ⭐️ Earn coins when you share ⭐️
              </p>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
