import Link from "next/link";
import type { Sport } from "@/lib/sports";

const TABS: { sport: Sport; label: string; emoji: string }[] = [
  { sport: "skate", label: "Skate", emoji: "🛹" },
  { sport: "surf", label: "Surf", emoji: "🌊" },
];

/** Skate / Surf tabs. `href` builds each tab's link (home pages, log form…). */
export function SportSwitch({
  sport,
  href = (s) => `/log?sport=${s}`,
  className = "",
}: {
  sport: Sport;
  href?: (sport: Sport) => string;
  className?: string;
}) {
  return (
    <div role="tablist" className={`inline-flex w-fit rounded-full border bg-muted/50 p-1 ${className}`}>
      {TABS.map((t) => (
        <Link
          key={t.sport}
          role="tab"
          aria-selected={t.sport === sport}
          href={href(t.sport)}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            t.sport === sport ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span aria-hidden className="mr-1.5">
            {t.emoji}
          </span>
          {t.label}
        </Link>
      ))}
    </div>
  );
}
