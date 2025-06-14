import "./theme.css";
import "@coinbase/onchainkit/styles.css";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";
import { Suspense } from "react";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const URL = process.env.NEXT_PUBLIC_URL;
  return {
    title: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
    description:
      "Generated by `create-onchain --mini`, a Next.js template for MiniKit",
    other: {
      "fc:frame": JSON.stringify({
        version: process.env.NEXT_PUBLIC_VERSION,
        imageUrl: process.env.NEXT_PUBLIC_IMAGE_URL,
        button: {
          title: `Launch ${process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME}`,
          action: {
            type: "launch_frame",
            name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
            url: URL,
            splashImageUrl: process.env.NEXT_PUBLIC_SPLASH_IMAGE_URL,
            splashBackgroundColor: `#${process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR}`,
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background">
        <Toaster
          position="top-center"
          toastOptions={{
            // Apply to all toasts

            style: {
              background: "#1a1a1a", // Dark background
              color: "#fff",
              fontFamily: "font-sans, sans-serif", // Replace with your font
              fontSize: "14px",
            },
            success: {
              iconTheme: {
                primary: "#10b981", // Tailwind's green-500
                secondary: "#1a1a1a",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444", // Tailwind's red-500
                secondary: "#1a1a1a",
              },
            },
          }}
        />
        <Suspense>
          <Providers>{children}</Providers>
        </Suspense>
      </body>
    </html>
  );
}
