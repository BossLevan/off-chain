import { AllTokens, ErrorResponse, SingleTokenDetailed, Token } from "@/lib/utils/types";
import { NextResponse } from "next/server";
import { GraphQLClient } from "graphql-request";
import { SINGLE_COIN_QUERY } from "@/lib/utils/queries";
import { notifyBusinessManager } from "../firebase";

const ALLOWED_ORIGINS = ["http://localhost:3000", "https://off-chain.vercel.app"]; // add prod later

export async function GET(req: Request) {
  //******GET ID FROM QUERY PARAMETERS OR SOMEWHERE******
  const { searchParams } = new URL(req.url);
  const contractAddress = searchParams.get("contract");
  const imageBoolean = searchParams.get("ib")
  const boolValue = imageBoolean === "true";

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

  try {
    const response = await notifyBusinessManager(contractAddress, boolValue)
    return NextResponse.json(response.success, { status: 200 });
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return NextResponse.json<ErrorResponse>(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
