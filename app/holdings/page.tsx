import Link from "next/link";

export default function HoldingsPage() {
  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col items-center justify-center space-y-8">
      <h1 className="text-xl tracking-tight font-semibold leading-tight text-center max-w-[90vw]">
        Coming Soon
      </h1>
      <Link
        href="/"
        className="bg-blue-500 text-white rounded-full px-6 py-2 text-base tracking-wide hover:bg-blue-600 transition"
      >
        Back to Home
      </Link>
    </div>
  );
}
