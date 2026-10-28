import { demoName } from "@/lib/demo";
import { memberUrl, shortAddress } from "@/lib/format";

/** Deterministic two-tone avatar from the wallet address. */
export function Avatar({ address, size = 28 }: { address: string; size?: number }) {
  const n = parseInt(address.slice(2, 10), 16);
  const h1 = n % 360;
  const h2 = (h1 + 40 + ((n >> 9) % 140)) % 360;
  return (
    <span
      aria-hidden
      className="inline-block shrink-0 rounded-full ring-1 ring-border"
      style={{ width: size, height: size, background: `linear-gradient(135deg, hsl(${h1} 85% 60%), hsl(${h2} 80% 45%))` }}
    />
  );
}

export function skaterLabel(address: string) {
  const name = demoName(address);
  return name ? `@${name}` : shortAddress(address);
}

export function SkaterLink({ address, className = "" }: { address: string; className?: string }) {
  const name = demoName(address);
  return (
    <a
      href={memberUrl(address)}
      target="_blank"
      rel="noreferrer"
      className={`truncate hover:underline ${name ? "" : "font-mono"} ${className}`}
    >
      {skaterLabel(address)}
    </a>
  );
}
