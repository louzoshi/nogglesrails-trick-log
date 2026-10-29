"use client";

import { QrCode, Wallet } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { useAccount, useConnect, useDisconnect, type Connector } from "wagmi";
import { shortAddress } from "@/lib/format";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);
  // Wallet state only exists in the browser: render a placeholder on the server.
  const mounted = useSyncExternalStore(noop, () => true, () => false);

  if (!mounted) return <span className="btn btn-primary w-[110px] opacity-0" />;

  if (isConnected && address) {
    return (
      <button className="btn btn-outline font-mono" onClick={() => disconnect()} title="Disconnect">
        {shortAddress(address)}
      </button>
    );
  }

  const options = walletOptions(connectors);

  return (
    <div className="relative">
      <button className="btn btn-primary" onClick={() => setOpen((o) => !o)} disabled={isPending}>
        <Wallet className="size-4" />
        {isPending ? "Connecting…" : "Connect"}
      </button>
      {open && (
        <div className="card absolute right-0 z-50 mt-2 flex w-60 flex-col p-1.5 shadow-lg">
          {options.map((c) => (
            <button
              key={c.uid}
              className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
              onClick={() => {
                connect({ connector: c });
                setOpen(false);
              }}
            >
              <ConnectorIcon connector={c} />
              {label(c)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * What a browser visitor can actually use. The Farcaster connector only works inside a mini app host
 * (where MiniAppAutoConnect picks it), and the generic injected one is a duplicate once a wallet
 * extension has announced itself by name (EIP-6963), or useless when there is no extension at all.
 */
function walletOptions(connectors: readonly Connector[]) {
  const announced = connectors.some((c) => c.type === "injected" && c.id !== "injected");
  const hasExtension = typeof window !== "undefined" && "ethereum" in window;
  return connectors
    .filter((c) => {
      if (c.id === "farcaster") return false;
      if (c.id === "injected") return !announced && hasExtension;
      return true;
    })
    .sort((a, b) => Number(b.type === "injected") - Number(a.type === "injected")); // installed wallets first
}

function label(c: Connector) {
  if (c.id === "injected") return "Browser wallet";
  if (c.id === "walletConnect") return "WalletConnect · QR code";
  return c.name;
}

function ConnectorIcon({ connector }: { connector: Connector }) {
  // eslint-disable-next-line @next/next/no-img-element
  if (connector.icon) return <img src={connector.icon} alt="" className="size-5 rounded" />;
  if (connector.id === "walletConnect") return <QrCode className="size-5 text-muted-foreground" />;
  return <Wallet className="size-5 text-muted-foreground" />;
}

const noop = () => () => {};
