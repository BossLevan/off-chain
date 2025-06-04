import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";

type AboutModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="relative z-50 max-w-lg w-full bg-zinc-900 text-white rounded-2xl p-6 shadow-lg">
          <div className="font-sans flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold">About</Dialog.Title>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-zinc-800"
            >
              <X size={18} />
            </button>
          </div>

          {/* This is valid JSX */}
          <div className="font-sans text-[13px] sm:text-[16px] leading-relaxed space-y-4">
            <p>
              This project blends AI-generated art with web3-native identity,
              powered by $POLARIOD.
            </p>
            <p>
              It celebrates culture, remix, and internet-native creative
              experimentation.
            </p>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
