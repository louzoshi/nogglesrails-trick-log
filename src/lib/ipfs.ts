import { IPFS_GATEWAY } from "./config";

export function ipfsUri(cid: string) {
  return `ipfs://${cid}`;
}

/** ipfs://cid, /ipfs/cid paths on any gateway, or a bare CID → URL on our gateway. Other URLs pass through. */
export function toGatewayUrl(uri: string): string {
  if (uri.startsWith("ipfs://")) return IPFS_GATEWAY + uri.slice("ipfs://".length);
  const match = uri.match(/\/ipfs\/(.+)$/);
  if (match) return IPFS_GATEWAY + match[1];
  if (/^(Qm[1-9A-Za-z]{44}|b[a-z2-7]{50,})$/.test(uri)) return IPFS_GATEWAY + uri;
  return uri;
}
