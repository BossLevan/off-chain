import { NextResponse } from "next/server";
import Replicate from "replicate";
import { Buffer } from "buffer";
import { ErrorResponse } from "@/lib/utils/types";
import { uploadImagesToStorageTemporary } from "../firebase";
import { streamToBase64 } from "@/lib/utils/base64";

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

// Optional: restrict which frontend domains can send requests
const ALLOWED_ORIGINS = ["http://localhost:3000", "https://off-chain.vercel.app"]; // add prod later

async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin") || req.headers.get("referer");
  if (!origin || !ALLOWED_ORIGINS.some((o) => origin.includes(o))) {
    return NextResponse.json<ErrorResponse>({ error: "Unauthorized request" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const prompt = formData.get("prompt") as string;
    const files = formData.getAll("images");

    console.log(prompt, files)

    const imageFiles: File[] = files.filter((f): f is File => f instanceof File);

    if (!prompt || imageFiles.length === 0) {
      return NextResponse.json<ErrorResponse>({ error: "Missing prompt or images" }, { status: 400 });
    }

    const imageLinks = uploadImagesToStorageTemporary(imageFiles)

    // Run the model with uploaded image URLs
    console.log("starting generation ⭐️")
    const output = await replicate.run("openai/gpt-image-1", {
      input: {
        prompt,
        input_images: imageLinks,
        openai_api_key: process.env.OPENAI_API_KEY,
      },
    });
    const imageStreams = output as ReadableStream[]; // assuming this format
    const images: string[] = [];

    for (const stream of imageStreams) {
      const base64 = await streamToBase64(stream);
      images.push(base64);
    }
    console.log("output", images)
    return NextResponse.json({ images });

  } catch (error) {
    console.error("Replicate error:", error);
    return NextResponse.json<ErrorResponse>(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

