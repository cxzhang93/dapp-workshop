import { hardhat } from "viem/chains";

// Preserve Scaffold-ETH's local-chain ID (burner wallet, faucet and deployments),
// but replace its RPC defaults so fallback transports cannot reach Lock on 8545.
export const localChain = {
  ...hardhat,
  name: "Tokenization Local",
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8547"],
      webSocket: ["ws://127.0.0.1:8547"],
    },
  },
} as const;
