import { AllTokens, ErrorResponse, SingleTokenDetailed, Token } from "@/lib/utils/types";
import { NextResponse } from "next/server";
import { GraphQLClient } from "graphql-request";
import { SINGLE_COIN_QUERY } from "@/lib/utils/queries";
import { getTokenDetails } from "../firebase";

const ALLOWED_ORIGINS = ["http://localhost:3000"]; // add prod later

///api/get-token-fs?contract=0x123abc...
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const contractAddress = searchParams.get("contract");

    const origin = req.headers.get("referer") || req.headers.get("origin");
    if (!origin || !ALLOWED_ORIGINS.some(o => origin.includes(o))) {
        return NextResponse.json<ErrorResponse>({ error: "Unauthorized request" }, { status: 403 });
    }

    if (!contractAddress) {
        return NextResponse.json<ErrorResponse>({ error: "Missing contract address" }, { status: 400 });
    }
  try {
    const { success, prompt, imageUrls } = await getTokenDetails(contractAddress)
    if(!success){
        throw new Error('Could not get token details from firestore')
    }
    return NextResponse.json({prompt: prompt, imageUrls: imageUrls}, {status: 200 });
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return NextResponse.json<ErrorResponse>(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
