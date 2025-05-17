import { formatEther } from "ethers";

/**
 * Fetches current ETH to USD price from CoinGecko.
 */
async function getEthUsdPrice(): Promise<number> {
  const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
  const data = await res.json();
  return data.ethereum.usd;
}

/**
 * Formats a number into K/M units (e.g. 1.2K, 5.3M).
 */
function formatUsd(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(2);
}

/**
 * Converts a raw wei string to a formatted USD string.
 */
export async function convertStatToUsd(weiValue: string): Promise<string> {
  const ethUsdPrice = await getEthUsdPrice();
  const ethValue = parseFloat(formatEther(weiValue));
  const usdValue = ethValue * ethUsdPrice;
  return `$${formatUsd(usdValue)}`;
}
