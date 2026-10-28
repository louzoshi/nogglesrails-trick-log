import { cacheLife } from "next/cache";
import { formatUnits, zeroAddress, type Address } from "viem";
import { POIDH_SOPA_ADDRESS } from "./config";
import { publicClient } from "./rpc";
import { ERC20_META_ABI, ERC721_TOKEN_URI_ABI, POIDH_SOPA_ABI } from "./sopa-abi";
import { parseTags, type RailTags } from "./tags";

export interface RailBounty {
  id: number;
  issuer: Address;
  title: string;
  description: string;
  /** Formatted reward, e.g. "30 USDC". */
  reward: string;
  createdAt: number;
  /** `claimer` is still zero: claims can be submitted (it may already be in a vote). */
  open: boolean;
  tags: RailTags;
  /** Known only when claims were read (demo data, detail pages). */
  claimCount?: number;
  /** A winners proposal is being voted on. */
  voting?: boolean;
}

export interface BountyClaim {
  id: number;
  bountyId: number;
  issuer: Address;
  name: string;
  description: string;
  createdAt: number;
  accepted: boolean;
  uri: string | null;
  tags: RailTags;
}

const address = POIDH_SOPA_ADDRESS;
const CLAIM_PAGE = 20;
const MAX_CLAIMS = 200;

async function tokenMeta(tokens: Address[]) {
  const unique = [...new Set(tokens.filter((t) => t !== zeroAddress))];
  const meta = new Map<string, { symbol: string; decimals: number }>([
    [zeroAddress, { symbol: "ETH", decimals: 18 }],
  ]);
  if (unique.length === 0) return meta;
  const results = await publicClient.multicall({
    allowFailure: true,
    contracts: unique.flatMap((token) => [
      { address: token, abi: ERC20_META_ABI, functionName: "symbol" as const },
      { address: token, abi: ERC20_META_ABI, functionName: "decimals" as const },
    ]),
  });
  unique.forEach((token, i) => {
    const symbol = results[i * 2];
    const decimals = results[i * 2 + 1];
    meta.set(token, {
      symbol: symbol.status === "success" ? String(symbol.result) : "TOKEN",
      decimals: decimals.status === "success" ? Number(decimals.result) : 18,
    });
  });
  return meta;
}

/** Every PoidhSopa bounty carrying a `rail:` tag, newest first. */
export async function getRailBounties(): Promise<RailBounty[]> {
  "use cache";
  cacheLife("minutes");
  const count = await publicClient.readContract({ address, abi: POIDH_SOPA_ABI, functionName: "bountyCounter" });
  if (count === 0n) return [];
  const rows = await publicClient.multicall({
    allowFailure: false,
    contracts: Array.from({ length: Number(count) }, (_, i) => ({
      address,
      abi: POIDH_SOPA_ABI,
      functionName: "bounties" as const,
      args: [BigInt(i)] as const,
    })),
  });
  const tagged = rows
    .map(([id, issuer, token, name, description, amount, claimer, createdAt]) => ({
      id: Number(id),
      issuer,
      token,
      title: name,
      description,
      amount,
      claimer,
      createdAt: Number(createdAt),
      tags: parseTags(`${name}\n${description}`),
    }))
    .filter((b) => b.issuer !== zeroAddress && b.tags.rail);
  const meta = await tokenMeta(tagged.map((b) => b.token));
  return tagged
    .map(({ token, amount, claimer, ...b }) => {
      const m = meta.get(token) ?? { symbol: "TOKEN", decimals: 18 };
      return {
        ...b,
        reward: `${Number(formatUnits(amount, m.decimals)).toLocaleString("en-US", { maximumFractionDigits: 4 })} ${m.symbol}`,
        open: claimer === zeroAddress,
      };
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}

async function readClaimIds(bountyId: bigint) {
  const ids: bigint[] = [];
  for (let offset = 0; offset < MAX_CLAIMS; offset += CLAIM_PAGE) {
    const page = await publicClient.multicall({
      allowFailure: true,
      contracts: Array.from({ length: CLAIM_PAGE }, (_, i) => ({
        address,
        abi: POIDH_SOPA_ABI,
        functionName: "bountyClaims" as const,
        args: [bountyId, BigInt(offset + i)] as const,
      })),
    });
    for (const r of page) {
      // An out-of-range index reverts: the array has ended.
      if (r.status !== "success") return ids;
      ids.push(r.result);
    }
  }
  return ids;
}

export async function getBountyClaims(bountyId: number): Promise<BountyClaim[]> {
  "use cache";
  cacheLife("minutes");
  const ids = await readClaimIds(BigInt(bountyId));
  if (ids.length === 0) return [];
  const nft = await publicClient.readContract({ address, abi: POIDH_SOPA_ABI, functionName: "poidhNft" });
  const [structs, uris] = await Promise.all([
    publicClient.multicall({
      allowFailure: false,
      contracts: ids.map((id) => ({ address, abi: POIDH_SOPA_ABI, functionName: "claims" as const, args: [id] as const })),
    }),
    publicClient.multicall({
      allowFailure: true,
      contracts: ids.map((id) => ({
        address: nft,
        abi: ERC721_TOKEN_URI_ABI,
        functionName: "tokenURI" as const,
        args: [id] as const,
      })),
    }),
  ]);
  return structs.map(([id, issuer, bId, , name, description, createdAt, accepted], i) => {
    const uri = uris[i];
    return {
      id: Number(id),
      bountyId: Number(bId),
      issuer,
      name,
      description,
      createdAt: Number(createdAt),
      accepted,
      uri: uri.status === "success" && uri.result ? uri.result : null,
      tags: parseTags(description),
    };
  });
}
