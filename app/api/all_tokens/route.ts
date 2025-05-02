import { AllTokens, ErrorResponse, Token } from "@/lib/utils/types";
import { NextResponse } from "next/server";
import { GraphQLClient } from "graphql-request";
import { ALL_COLLECTIONS_QUERY_BY_MARKETCAP } from "@/lib/utils/queries";

const ALLOWED_ORIGINS = ["http://localhost:3000"]; // add prod later

export async function GET(req: Request) {
  //implement getting data from body / Request = the filter (marketcap, vol etc)
  const origin = req.headers.get("referer") || req.headers.get("origin");
  if (!origin || !ALLOWED_ORIGINS.some(o => origin.includes(o))) {
    return NextResponse.json<ErrorResponse>({ error: "Unauthorized request" }, { status: 403 });
  }

  const DATA_URL = process.env.FLAUNCH_URL_SEPOLIA;
  if (!DATA_URL) {
    throw new Error("Missing FLAUNCH_URL_SEPOLIA environment variable");
  }

  const client = new GraphQLClient(DATA_URL);

  try {
    //IMPLEMENT PAGINATION LATER
    const response = await client.request<{ allTokens: AllTokens }>(
      ALL_COLLECTIONS_QUERY_BY_MARKETCAP
    );

    console.log("GraphQL response:", JSON.stringify(response, null, 2));

    if (!response?.allTokens?.collectionTokens) {
      throw new Error("Unexpected response structure");
    }

    const data = response.allTokens.collectionTokens;
    return NextResponse.json<Token[]>(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return NextResponse.json<ErrorResponse>(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
