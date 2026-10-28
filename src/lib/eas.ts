import { cacheLife } from "next/cache";
import type { Address, Hex } from "viem";
import { EAS_GRAPHQL_URL } from "./config";
import { TRICK_SCHEMA_UID, type TrickData } from "./eas-schema";

export interface TrickLog extends TrickData {
  uid: Hex;
  attester: Address;
  time: number;
}

const QUERY = `query TrickLogs($schemaId: String!, $take: Int!) {
  attestations(
    where: { schemaId: { equals: $schemaId }, revoked: { equals: false } }
    orderBy: [{ time: desc }]
    take: $take
  ) { id attester time decodedDataJson }
}`;

interface DecodedField {
  name: string;
  value: { value: unknown };
}

export function decodeTrick(decodedDataJson: string): TrickData | null {
  try {
    const fields = JSON.parse(decodedDataJson) as DecodedField[];
    const get = (name: string) => {
      const v = fields.find((f) => f.name === name)?.value.value;
      return typeof v === "string" ? v : "";
    };
    const data = { rail: get("rail"), trick: get("trick"), clip: get("clip"), note: get("note") };
    return data.rail && data.trick && data.clip ? data : null;
  } catch {
    return null;
  }
}

/** Latest trick logs across every rail (EAS indexer on Base). */
export async function getTrickLogs(take = 500): Promise<TrickLog[]> {
  "use cache";
  cacheLife("minutes");
  const res = await fetch(EAS_GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: QUERY, variables: { schemaId: TRICK_SCHEMA_UID, take } }),
  });
  if (!res.ok) throw new Error(`EAS indexer error (${res.status})`);
  const json = (await res.json()) as {
    data?: { attestations: { id: Hex; attester: Address; time: number; decodedDataJson: string }[] };
  };
  return (json.data?.attestations ?? []).flatMap((a) => {
    const data = decodeTrick(a.decodedDataJson);
    return data ? [{ ...data, uid: a.id, attester: a.attester, time: a.time }] : [];
  });
}

/** "King of the rail": attesters ranked by landed tricks. */
export function leaderboard(logs: TrickLog[]) {
  const counts = new Map<Address, number>();
  for (const log of logs) counts.set(log.attester, (counts.get(log.attester) ?? 0) + 1);
  return [...counts.entries()].map(([address, tricks]) => ({ address, tricks })).sort((a, b) => b.tricks - a.tricks);
}
