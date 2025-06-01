import { GraphQLClient } from "graphql-request";

import { Metadata } from "next";
import { SINGLE_COIN_QUERY } from "./queries";
import { SingleTokenDetailed } from "./types";
import { convertIpfsToPinataUrl } from "./ipfs";

// 1. Generate Metadata
export async function generateMetadata({ params, searchParams }: {
  params: { id: string },
  searchParams: { img?: string }
}): Promise<Metadata> {
  const id = params.id;
  const img = searchParams?.img;

  const client = new GraphQLClient(process.env.FLAUNCH_URL_MAINNET!);
  const response = await client.request<{
    collectionToken: SingleTokenDetailed;
  }>(SINGLE_COIN_QUERY, { id: id });

  const ipfsHash = response?.collectionToken?.baseURI;
  const cabinImageUrl = await convertIpfsToPinataUrl(ipfsHash);
  const imageUrl = img || cabinImageUrl;

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
}

