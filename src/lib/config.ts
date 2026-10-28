import { base } from "viem/chains";

export const CHAIN = base;

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const BASE_RPC_URL = process.env.NEXT_PUBLIC_BASE_RPC_URL || undefined;

/** Gnars bounty contract (PoidhSopa) on Base — the same one gnars.com/community/bounties reads. */
export const POIDH_SOPA_ADDRESS = "0x31d0A0D4EBE4173f18CBA521882B4C7Cf658F505" as const;

export const GNARS_BOUNTY_URL = (id: number) => `https://www.gnars.com/community/bounties/sopa/${id}`;

/** EAS predeploys on Base (OP Stack). */
export const EAS_ADDRESS = "0x4200000000000000000000000000000000000021" as const;
export const EAS_SCHEMA_REGISTRY_ADDRESS = "0x4200000000000000000000000000000000000020" as const;
export const EAS_GRAPHQL_URL = "https://base.easscan.org/graphql";
export const EAS_SCAN_URL = "https://base.easscan.org";

/**
 * Gateway used to build the clip URL sent as the bounty claim `uri`. It must be one of the
 * hosts gnars.com renders inline (src/lib/poidh/media-hosts.ts in gnars-website).
 */
export const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? "https://ipfs.skatehive.app/ipfs/";

export const MAX_CLIP_BYTES = 100 * 1024 * 1024;
export const CLIP_MIME_TYPES = ["video/mp4", "video/quicktime", "video/webm"] as const;
