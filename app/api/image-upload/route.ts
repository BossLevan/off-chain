import { AllTokens, ErrorResponse, Token } from "@/lib/utils/types";
import { NextResponse } from "next/server";
import { FlaunchClient } from "../api";

//To IPFS, not firebase
//send base64 string here.
const ALLOWED_ORIGINS = ["http://localhost:3000", "https://off-chain.vercel.app"]; // add prod later

export async function POST(req: Request) {
    const origin = req.headers.get("referer") || req.headers.get("origin");
    if (!origin || !ALLOWED_ORIGINS.some(o => origin.includes(o))) {
      return NextResponse.json<ErrorResponse>(
        { error: "Unauthorized request" },
        { status: 403 }
      );
    }

    const client = new FlaunchClient();
    try {
    const image: string = await req.json();
    const response = await client.uploadImage(image);

    if (response.success) {
      console.log("Image deployed to IPFS", response.ipfsHash);
      return NextResponse.json(
        { success: response.success, hash: response.ipfsHash },
        { status: 200 }
      );
    } else {
      console.error("Could not upload file", response);
      return NextResponse.json(
        { error: "The file could not be uploaded. Pls try again" },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("Error Uploading File", err);
    return NextResponse.json<ErrorResponse>(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}