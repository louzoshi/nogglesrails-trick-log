import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { createConfig, http } from "wagmi";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";
import { BASE_RPC_URL, CHAIN, SITE_URL } from "./config";

const WALLETCONNECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

export const wagmiConfig = createConfig({
  chains: [CHAIN],
  // Inside Farcaster/Base App the mini app connector is the one that is already connected.
  connectors: [
    farcasterMiniApp(),
    coinbaseWallet({ appName: "Nogglesrails Trick Log", preference: { options: "all", telemetry: false } }),
    injected(),
    // WalletConnect touches indexedDB on load, so it only exists in the browser.
    ...(WALLETCONNECT_ID && typeof window !== "undefined"
      ? [
          walletConnect({
            projectId: WALLETCONNECT_ID,
            metadata: {
              name: "Nogglesrails Trick Log",
              description: "Log tricks on Gnars Noggles Rails",
              url: SITE_URL,
              icons: [`${SITE_URL}/icon.png`],
            },
          }),
        ]
      : []),
  ],
  transports: { [CHAIN.id]: http(BASE_RPC_URL) },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
