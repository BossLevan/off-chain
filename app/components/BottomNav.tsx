"use client";

import Link from "next/link";
import { Settings, Home, PlusCircle, Flower } from "lucide-react";

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-zinc-900/80 backdrop-blur-lg safe-bottom">
      <div className="max-w-[480px] mx-auto flex justify-around pt-4 pb-8">
        <Link href="/" className="flex flex-col items-center text-white">
          <Home className="w-6 h-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link href="/create" className="flex flex-col items-center text-white">
          <PlusCircle className="w-6 h-6" />
          <span className="text-xs mt-1">Create</span>
        </Link>
        <button className="flex flex-col items-center text-white">
          <Settings className="w-6 h-6" />
          <span className="text-xs mt-1">Settings</span>
        </button>
      </div>
    </nav>
  );
}
