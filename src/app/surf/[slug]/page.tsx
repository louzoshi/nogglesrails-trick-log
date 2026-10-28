import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PlaceDetail } from "@/components/PlaceDetail";
import { miniAppEmbed } from "@/lib/miniapp";
import { getPlace, getPlaces } from "@/lib/rails";

export function generateStaticParams() {
  return getPlaces("surf").map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/surf/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const spot = getPlace(slug);
  if (!spot || spot.sport !== "surf") return {};
  return {
    title: `${spot.title} · Surf · Trick Log`,
    description: `Waves ridden at ${spot.title}, ${spot.city}.`,
    other: { "fc:miniapp": JSON.stringify(miniAppEmbed(`/surf/${slug}`)) },
  };
}

export default function SpotPage({ params }: PageProps<"/surf/[slug]">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link href="/surf#spots" className="inline-flex items-center gap-2 text-sm font-medium hover:underline">
        <ArrowLeft className="size-4" /> All spots
      </Link>
      <Suspense fallback={<div className="mt-6 h-96 animate-pulse rounded-xl bg-muted" />}>
        <PlaceDetail params={params} sport="surf" />
      </Suspense>
    </div>
  );
}
