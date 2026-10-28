import { createPublicClient, http } from "viem";
import { BASE_RPC_URL, CHAIN } from "./config";

/** Server reads: Alchemy when a key is set (server-only), else the configured / public RPC. */
const SERVER_RPC = process.env.ALCHEMY_API_KEY
  ? `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
  : BASE_RPC_URL;

export const publicClient = createPublicClient({ chain: CHAIN, transport: http(SERVER_RPC), batch: { multicall: true } });
