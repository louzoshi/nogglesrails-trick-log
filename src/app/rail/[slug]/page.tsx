import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PlaceDetail } from "@/components/PlaceDetail";
import { miniAppEmbed } from "@/lib/miniapp";
import { getRail, getRails } from "@/lib/rails";

export function generateStaticParams() {
  return getRails().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/rail/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const rail = getRail(slug);
  if (!rail) return {};
  return {
    title: `${rail.title} · Trick Log`,
    description: `Tricks landed on the ${rail.title} Noggles Rail in ${rail.city}.`,
    other: { "fc:miniapp": JSON.stringify(miniAppEmbed(`/rail/${slug}`)) },
  };
}

export default function RailPage({ params }: PageProps<"/rail/[slug]">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link href="/#rails" className="inline-flex items-center gap-2 text-sm font-medium hover:underline">
        <ArrowLeft className="size-4" /> All rails
      </Link>
      <Suspense fallback={<div className="mt-6 h-96 animate-pulse rounded-xl bg-muted" />}>
        <PlaceDetail params={params} sport="skate" />
      </Suspense>
    </div>
  );
}
