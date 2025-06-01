// app/generated/[imageId]/page.tsx

import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getImageUrlFromId } from "@/app/api/firebase";

// You’ll fetch this from Firestore or wherever your image metadata is stored
async function getImageDetails(imageId: string, contractAddress: string) {
  const imageUrl = await getImageUrlFromId(imageId);
  return {
    imageUrl: imageUrl,
    cabinId: contractAddress, // used for redirect
    ogTitle: `Generate Yours`,
  };
}

export async function generateMetadata({
  params,
}: {
  params: { imageId: string; contractAddress: string };
}): Promise<Metadata> {
  const { imageUrl, ogTitle } = await getImageDetails(
    params.imageId,
    params.contractAddress,
  );

  return {
    title: ogTitle,
    openGraph: {
      title: ogTitle,
      images: [imageUrl],
    },
    other: {
      "fc:frame": "vNext",
      "fc:frame:image": imageUrl,
      "fc:frame:post_url": `https://yourdomain.com/api/frame-post?id=${params.imageId}`,
      "fc:frame:button:1": "Generate",
      "fc:frame:button:2": "Remix",
    },
  };
}

export default async function GeneratedSharePage({
  params,
}: {
  params: { imageId: string; contractAddress: string };
}) {
  const { cabinId } = await getImageDetails(
    params.imageId,
    params.contractAddress,
  );

  // ✅ Redirect to actual page so user still lands on correct detail
  redirect(`/cabin/${cabinId}`);
}
