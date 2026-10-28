"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SPORTS, type Sport } from "@/lib/sports";
import { ConnectButton } from "./ConnectButton";
import { ThemeToggle } from "./ThemeToggle";

const cn = (...c: (string | false)[]) => c.filter(Boolean).join(" ");

/** Skate / Surf sections + the current sport's actions. */
export function HeaderNav() {
  const pathname = usePathname();
  const sport: Sport = pathname.startsWith("/surf") ? "surf" : "skate";
  const onLog = pathname.startsWith("/log");
  const s = SPORTS[sport];
  const tab = (to: Sport, label: string) => {
    const active = !onLog && to === sport;
    return (
      <Link
        href={SPORTS[to].home}
        aria-current={active ? "page" : undefined}
        className={cn(
          "rounded-full px-3 py-1 text-sm font-medium transition-colors",
          active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="flex items-center gap-2">
      <div className="flex items-center rounded-full border p-0.5">
        {tab("skate", "Skate")}
        {tab("surf", "Surf")}
      </div>
      <Link href={sport === "surf" ? "/surf#bounties" : "/#bounties"} className="btn hidden hover:bg-muted md:inline-flex">
        Bounties
      </Link>
      {/* The log page has its own Skate / Surf switch. */}
      {!onLog && (
        <Link href={`/log?sport=${sport}`} className="btn btn-outline hidden sm:inline-flex">
          Log a {s.move}
        </Link>
      )}
      <ThemeToggle />
      <ConnectButton />
    </nav>
  );
}
