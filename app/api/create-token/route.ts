import { NextResponse } from "next/server";
import { FlaunchClient } from "../api";
import type { ErrorResponse, ExtendedFlaunchConfig, FlaunchTokenConfig } from "@/lib/utils/types";
import { uploadToFirestore } from "../firebase";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { nanoid } from "nanoid";

const ALLOWED_ORIGINS = ["http://localhost:3000", "https://off-chain.vercel.app"]; // add prod later

export async function POST(req: Request) {
  const origin = req.headers.get("referer") || req.headers.get("origin");
  if (!origin || !ALLOWED_ORIGINS.some((o) => origin.includes(o))) {
    return NextResponse.json<ErrorResponse>({ error: "Unauthorized request" }, { status: 403 });
  }

  try {
    // For multipart/form-data in App Router, we need to handle the form data manually
    const formData = await req.formData();
    
    // Extract form fields
    const prompt = formData.get("prompt") as string;
    
    // Create token config object from all other fields
    const tokenConfigFields: Record<string, any> = {};
    formData.forEach((value, key) => {
      if (key !== "prompt" && key !== "sampleImages") {
        tokenConfigFields[key] = value;
      }
    });
    
    // Handle image files
    const sampleImages = formData.getAll("sampleImages");
    const imageFiles: File[] = [];
    
    for (const item of sampleImages) {
      if (item instanceof File) {
        imageFiles.push(item);
      }
    }

    const cfg: FlaunchTokenConfig = tokenConfigFields as FlaunchTokenConfig;
    console.log("Token config:", cfg);
    console.log("image files:",imageFiles )

    const config: FlaunchTokenConfig = {
      name: cfg.name,
      symbol: cfg.symbol, // or `symbol`, depending on your input field name
      description: cfg.description,
      imageIpfs: cfg.imageIpfs,
      // creatorFeeSplit: Number(fields.creatorFeeSplit),
      creatorAddress: process.env.CREATOR_ADDRESS,
      revenueManagerAddress: process.env.FLAUNCH_REVENUE_MANAGER,
      // marketCap: fields.marketCap || undefined,
      // fairLaunchDuration: fields.fairLaunchDuration ? Number(fields.fairLaunchDuration) : undefined,
      // fairLaunchSupply: fields.fairLaunchSupply ? Number(fields.fairLaunchSupply) : undefined,
      // websiteUrl: fields.websiteUrl || undefined,
      // telegramUrl: fields.telegramUrl,
      // discordUrl: fields.discordUrl || undefined,
      // twitterUrl: fields.twitterUrl || undefined,
    };
    
    const client = new FlaunchClient();
    const job = await client.flaunchToken(config);
    console.log(job)
    const status = await client.pollLaunchStatus(job.jobId);
    console.log(status)


    if (status.state === "completed" && status.tokenAddress) {
      const { success } = await uploadToFirestore(status.tokenAddress, prompt, imageFiles);
      if (!success) {
        throw new Error("Upload to Firestore failed");
      }

      return NextResponse.json({ state: status.state, address: status.tokenAddress }, { status: 200 });
    } else {
      return NextResponse.json({ error: status.error! }, { status: 400 });
    }
  } catch (err) {
    console.error("Error in POST handler:", err);
    return NextResponse.json<ErrorResponse>(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}