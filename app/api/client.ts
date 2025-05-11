// lib/api/fetchTokens.ts

import { SingleTokenDetailed, Token } from "@/lib/utils/types";

export async function fetchTokens(): Promise<Token[]> {
  const res = await fetch("/api/all-tokens", {
    method: "GET",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to fetch tokens");
  }

  return res.json();
}

export async function launchToken(
  form: FormData
): Promise<{ state: string; address: string }> {
  const res = await fetch("/api/create-token", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Token creation failed");
  }

  return res.json();
}


export async function getTokenDetails(contract: string): Promise<SingleTokenDetailed> {
    const res = await fetch(`/api/token?contract=${contract}`, {
      method: "GET",
    });
  
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to fetch token details");
    }
  
    return res.json();
  }

  // lib/api/getTokenFirestoreDetails.ts

export async function getTokenFirestoreDetails(contract: string): Promise<{
    prompt: string;
    imageUrls: string[];
  }> {
    const res = await fetch(`/api/get-token-fs?contract=${contract}`, {
      method: "GET",
    });
  
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to fetch token Firestore data");
    }
  
    return res.json();
  }
  