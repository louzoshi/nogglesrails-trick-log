"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useEffect, useState, type ReactNode } from "react";
import { useAccount, useConnect, WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    // Hides the Farcaster / Base App splash screen. Outside a mini app host this is a no-op.
    sdk.actions.ready().catch(() => {});
  }, []);

  return (
    // Same setup as gnars.com: light / dark / system, system by default.
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <MiniAppAutoConnect />
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}

/** Inside Farcaster / Base App the host wallet is already there: connect it without asking. */
function MiniAppAutoConnect() {
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  useEffect(() => {
    if (isConnected) return;
    const farcaster = connectors.find((c) => c.id === "farcaster");
    if (!farcaster) return;
    sdk
      .isInMiniApp()
      .then((inside) => inside && connect({ connector: farcaster }))
      .catch(() => {});
  }, [isConnected, connect, connectors]);

  return null;
}
