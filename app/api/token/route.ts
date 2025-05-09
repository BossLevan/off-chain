import { AllTokens, ErrorResponse, SingleTokenDetailed, Token } from "@/lib/utils/types";
import { NextResponse } from "next/server";
import { GraphQLClient } from "graphql-request";
import { SINGLE_COIN_QUERY } from "@/lib/utils/queries";

const ALLOWED_ORIGINS = ["http://localhost:3000"]; // add prod later

export async function GET(req: Request) {
  //******GET ID FROM QUERY PARAMETERS OR SOMEWHERE******
  const { searchParams } = new URL(req.url);
  const contractAddress = searchParams.get("contract");

  const origin = req.headers.get("referer") || req.headers.get("origin");
  if (!origin || !ALLOWED_ORIGINS.some(o => origin.includes(o))) {
      return NextResponse.json<ErrorResponse>({ error: "Unauthorized request" }, { status: 403 });
  }

  if (!contractAddress) {
      return NextResponse.json<ErrorResponse>({ error: "Missing contract address" }, { status: 400 });
  }
  const DATA_URL = process.env.FLAUNCH_URL_MAINNET;
  if (!DATA_URL) {
    throw new Error("Missing FLAUNCH_URL_MAINNET environment variable");
  }

  const client = new GraphQLClient(DATA_URL);

  try {
    const response = await client.request<{ collectionToken: SingleTokenDetailed }>(
      SINGLE_COIN_QUERY, { id: contractAddress }
    );

    console.log("GraphQL response:", JSON.stringify(response, null, 2));

    //this crashes if its null
    if (!response?.collectionToken) {
      throw new Error("Unexpected response structure");
    }

    const data = response.collectionToken;
    return NextResponse.json<SingleTokenDetailed>(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return NextResponse.json<ErrorResponse>(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
