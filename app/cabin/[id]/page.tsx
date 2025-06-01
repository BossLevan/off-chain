// "use client";

import type React from "react";
import { Metadata } from "next";
import { GraphQLClient } from "graphql-request";
import { convertIpfsToPinataUrl } from "@/lib/utils/ipfs";
import { SingleTokenDetailed } from "@/lib/utils/types";
import { SINGLE_COIN_QUERY } from "@/lib/utils/queries";
import CabinDetailPage from "@/app/components/CabinDetailPage";

// 1. Generate Metadata
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { img?: string };
}): Promise<Metadata> {
  try {
    const id = params.id;
    const img = searchParams?.img;

    const client = new GraphQLClient(process.env.FLAUNCH_URL_MAINNET!);
    const response = await client.request<{
      collectionToken: SingleTokenDetailed;
    }>(SINGLE_COIN_QUERY, { id: id });

    const ipfsHash = response?.collectionToken?.baseURI;
    const cabinImageUrl = await convertIpfsToPinataUrl(ipfsHash);
    const imageUrl =
      "https://firebasestorage.googleapis.com/v0/b/off-chain-c1547.firebasestorage.app/o/contract-images%2F0x651d8fe5e89b38e94a09bf29c194e1726b676408%2Fimage-1-1747796245671?alt=media&token=7bf185f3-83b6-47f4-80e4-c0f3f9277bf9";
    return {
      openGraph: {
        images: [imageUrl],
      },
      other: {
        "fc:frame": JSON.stringify({
          version: "next",
          image: imageUrl,
          button: {
            title: "View Cabin",
            action: {
              type: "launch_frame",
              name: "Cabin",
              url: `https://off-chain.vercel.app/cabin/${id}`,
            },
          },
        }),
      },
    };
  } catch {
    console.log("AN error occured");
    return {
      openGraph: {},
      other: {},
    };
  }
}

export default function CabinDetailCabinPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { img?: string };
}) {
  return <CabinDetailPage id={params.id} />;
}

// // Server-side rendering for meta tags
// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const { id } = context.params as { id: string };

//   const img = context.query.img as string | undefined;
//   //direct call
//   const client = new GraphQLClient(process.env.FLAUNCH_URL_MAINNET!);

//   const response = await client.request<{
//     collectionToken: SingleTokenDetailed;
//   }>(SINGLE_COIN_QUERY, { id: id });

//   console.log("GraphQL response:", JSON.stringify(response, null, 2));

//   //this crashes if its null
//   if (!response?.collectionToken) {
//     throw new Error("Unexpected response structure");
//   }

//   const ipfsHash = response.collectionToken.baseURI;
//   //gotten the cabin image Url
//   const cabinImageUrl = await convertIpfsToPinataUrl(ipfsHash);

//   // Prefer the ?img param if it exists
//   const pageImageUrl = img || cabinImageUrl;

//   // Optional: validate the image URL length
//   if (pageImageUrl.length > 1024) {
//     return {
//       notFound: true,
//     };
//   }

//   return {
//     props: {
//       pageImageUrl,
//     },
//   };

//   // return a;
//   //https://off-chain.vercel.app/cabin/${id}?img=firefara
//   //get the generated image url
//   //id to get the cabin image url
// };
