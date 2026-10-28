import { encodeAbiParameters, encodePacked, keccak256, parseAbiParameters, zeroAddress } from "viem";

/** One trick landed on one rail. `clip` is an ipfs:// URI. */
export const TRICK_SCHEMA = "string rail,string trick,string clip,string note";
export const TRICK_SCHEMA_REVOCABLE = true;

/** EAS schema UID is deterministic: keccak256(abi.encodePacked(schema, resolver, revocable)). */
export const TRICK_SCHEMA_UID = keccak256(
  encodePacked(["string", "address", "bool"], [TRICK_SCHEMA, zeroAddress, TRICK_SCHEMA_REVOCABLE]),
);

export interface TrickData {
  rail: string;
  trick: string;
  clip: string;
  note: string;
}

export function encodeTrick(d: TrickData) {
  return encodeAbiParameters(parseAbiParameters(TRICK_SCHEMA), [d.rail, d.trick, d.clip, d.note]);
}

export const EAS_ABI = [
  {
    type: "function",
    name: "attest",
    stateMutability: "payable",
    inputs: [
      {
        name: "request",
        type: "tuple",
        components: [
          { name: "schema", type: "bytes32" },
          {
            name: "data",
            type: "tuple",
            components: [
              { name: "recipient", type: "address" },
              { name: "expirationTime", type: "uint64" },
              { name: "revocable", type: "bool" },
              { name: "refUID", type: "bytes32" },
              { name: "data", type: "bytes" },
              { name: "value", type: "uint256" },
            ],
          },
        ],
      },
    ],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    type: "event",
    name: "Attested",
    inputs: [
      { name: "recipient", type: "address", indexed: true },
      { name: "attester", type: "address", indexed: true },
      { name: "uid", type: "bytes32", indexed: false },
      { name: "schemaUID", type: "bytes32", indexed: true },
    ],
  },
] as const;

export const SCHEMA_REGISTRY_ABI = [
  {
    type: "function",
    name: "register",
    stateMutability: "nonpayable",
    inputs: [
      { name: "schema", type: "string" },
      { name: "resolver", type: "address" },
      { name: "revocable", type: "bool" },
    ],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    type: "function",
    name: "getSchema",
    stateMutability: "view",
    inputs: [{ name: "uid", type: "bytes32" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "uid", type: "bytes32" },
          { name: "resolver", type: "address" },
          { name: "revocable", type: "bool" },
          { name: "schema", type: "string" },
        ],
      },
    ],
  },
] as const;
