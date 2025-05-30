import { Avatar, Name } from "@coinbase/onchainkit/identity";
import { Swap } from "@coinbase/onchainkit/swap";
import { Wallet, ConnectWallet } from "@coinbase/onchainkit/wallet";
import { useAccount } from "wagmi";
import type { Token } from "@coinbase/onchainkit/token";

interface SwapComponentsProps {
  token: Token; // The token to receive (e.g., KEYCAT, NOBI, etc.)
}

export default function SwapComponents({ token }: SwapComponentsProps) {
  const { address } = useAccount();

  const ETHToken: Token = {
    address: "",
    chainId: 8453,
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
    image:
      "https://dynamic-assets.coinbase.com/dbb4b4983bde81309ddab83eb598358eb44375b930b94687ebe38bc22e52c3b2125258ffb8477a5ef22e33d6bd72e32a506c391caa13af64c00e46613c3e5806/asset_icons/4113b082d21cc5fab17fc8f2d19fb996165bcce635e6900f7fc2d57c4ef33ae9.png",
  };

  return address ? (
    <Swap
      from={[ETHToken]}
      to={[token]}
      experimental={{ useAggregator: true }}
    />
  ) : (
    <Wallet>
      <ConnectWallet>
        <Avatar className="h-6 w-6" />
        <Name />
      </ConnectWallet>
    </Wallet>
  );
}
