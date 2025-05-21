import { formatEther } from "ethers";

let cachedPrice: number | null = null;
let lastFetched: number | null = null;
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes
const FALLBACK_PRICE = 2500;

async function getEthUsdPrice(): Promise<number> {
  const now = Date.now();

  if (cachedPrice !== null && lastFetched !== null && now - lastFetched < CACHE_DURATION_MS) {
    return cachedPrice;
  }

  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");

    if (!res.ok) {
      throw new Error(`Failed to fetch ETH price: ${res.statusText}`);
    }

    const data = await res.json();
    cachedPrice = data.ethereum.usd;
    lastFetched = now;
    return cachedPrice!;
  } catch (err) {
    console.warn("Using fallback ETH price due to fetch error:", err);
    cachedPrice = FALLBACK_PRICE;
    lastFetched = now;
    return FALLBACK_PRICE;
  }
}

function formatUsd(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(1);
}

export async function convertStatToUsd(weiValue: string): Promise<string> {
  const ethUsdPrice = await getEthUsdPrice();
  const ethValue = parseFloat(formatEther(weiValue));
  const usdValue = ethValue * ethUsdPrice;
  return `$${formatUsd(usdValue)}`;
}

export async function convertWeiToUsd(weiValue: string): Promise<string> {
    const ethUsdPrice = await getEthUsdPrice();
    const ethValue = parseFloat(formatEther(weiValue));
    const usdValue = ethValue * ethUsdPrice;
    return formatUsd(usdValue);
  }
