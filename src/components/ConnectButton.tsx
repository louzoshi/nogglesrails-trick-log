"use client";

import { Wallet } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
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

  return (
    <div className="relative">
      <button className="btn btn-primary" onClick={() => setOpen((o) => !o)} disabled={isPending}>
        <Wallet className="size-4" />
        {isPending ? "Connecting…" : "Connect"}
      </button>
      {open && (
        <div className="card absolute right-0 z-50 mt-2 flex w-56 flex-col p-1.5 shadow-lg">
          {connectors.map((c) => (
            <button
              key={c.uid}
              className="cursor-pointer rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
              onClick={() => {
                connect({ connector: c });
                setOpen(false);
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const noop = () => () => {};
