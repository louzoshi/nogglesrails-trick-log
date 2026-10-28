import type { Clip } from "@/components/ClipCard";
import type { TrickLog } from "./eas";
import type { BountyClaim } from "./sopa";

const ATTESTATION_TAG = /attestation:(0x[0-9a-fA-F]{64})/;

/**
 * One feed from two sources: EAS trick logs and PoidhSopa bounty claims. A claim sent from
 * this app carries `attestation:<uid>`, so it merges into its log instead of showing twice.
 */
export function mergeClips(logs: TrickLog[], claims: BountyClaim[], railTitles: Map<string, string>): Clip[] {
  const clips = new Map<string, Clip>();
  for (const log of logs) {
    clips.set(log.uid.toLowerCase(), {
      key: log.uid,
      trick: log.trick,
      clip: log.clip,
      skater: log.attester,
      time: log.time,
      note: log.note || undefined,
      railTitle: railTitles.get(log.rail),
      attestationUid: log.uid,
    });
  }
  for (const claim of claims) {
    const uid = claim.description.match(ATTESTATION_TAG)?.[1]?.toLowerCase();
    const bounty = { id: claim.bountyId, accepted: claim.accepted };
    const existing = uid ? clips.get(uid) : undefined;
    if (existing) {
      existing.bounty = bounty;
      continue;
    }
    if (!claim.uri) continue;
    clips.set(`claim-${claim.id}`, {
      key: `claim-${claim.id}`,
      trick: claim.tags.trick ?? claim.name,
      clip: claim.uri,
      skater: claim.issuer,
      time: claim.createdAt,
      railTitle: claim.tags.rail ? railTitles.get(claim.tags.rail) : undefined,
      bounty,
    });
  }
  return [...clips.values()].sort((a, b) => b.time - a.time);
}
