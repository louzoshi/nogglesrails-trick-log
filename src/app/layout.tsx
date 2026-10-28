import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { HeaderNav } from "@/components/HeaderNav";
import { Providers } from "@/components/Providers";
import { SITE_URL } from "@/lib/config";
import { DEMO_MODE } from "@/lib/demo";
import { miniAppEmbed } from "@/lib/miniapp";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Trick Log · Noggles Rails",
  description: "Log skate tricks on Gnars Noggles Rails and waves at surf spots onchain, and claim Gnars bounties with the clip.",
  other: { "fc:miniapp": JSON.stringify(miniAppEmbed("/")) },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>
          {DEMO_MODE && (
            <div className="bg-foreground px-4 py-1.5 text-center text-xs font-medium text-background">
              Demo mode · sample skaters, surfers, clips and bounties — nothing here is onchain
            </div>
          )}
          <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
              <Link href="/" className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/gnars.webp" alt="" className="size-8 rounded-md" />
                <span className="flex flex-col leading-none max-[420px]:hidden">
                  <span className="text-sm font-semibold">Trick Log</span>
                  <span className="mt-1 w-fit rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">
                    Gnars × Nouns
                  </span>
                </span>
              </Link>
              <HeaderNav />
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
              <span>⌐◨-◨ Built for Gnars skaters and surfers · open source</span>
              <span className="flex gap-4">
                <a className="hover:text-foreground" href="https://www.gnars.com/nogglesrails" target="_blank" rel="noreferrer">
                  gnars.com
                </a>
                <a className="hover:text-foreground" href="https://base.easscan.org" target="_blank" rel="noreferrer">
                  EAS
                </a>
              </span>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
