/** Subset of the PoidhSopa ABI (Base, 0x31d0…F505) used by this app. */
export const POIDH_SOPA_ABI = [
  {
    type: "function",
    name: "bountyCounter",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "bounties",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "id", type: "uint256" },
      { name: "issuer", type: "address" },
      { name: "token", type: "address" },
      { name: "name", type: "string" },
      { name: "description", type: "string" },
      { name: "amount", type: "uint256" },
      { name: "claimer", type: "address" },
      { name: "createdAt", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "bountyClaims",
    stateMutability: "view",
    inputs: [
      { name: "bountyId", type: "uint256" },
      { name: "", type: "uint256" },
    ],
    outputs: [{ name: "claimIds", type: "uint256" }],
  },
  {
    type: "function",
    name: "claims",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "id", type: "uint256" },
      { name: "issuer", type: "address" },
      { name: "bountyId", type: "uint256" },
      { name: "bountyIssuer", type: "address" },
      { name: "name", type: "string" },
      { name: "description", type: "string" },
      { name: "createdAt", type: "uint256" },
      { name: "accepted", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "poidhNft",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "createClaim",
    stateMutability: "nonpayable",
    inputs: [
      { name: "bountyId", type: "uint256" },
      { name: "name", type: "string" },
      { name: "description", type: "string" },
      { name: "uri", type: "string" },
    ],
    outputs: [],
  },
] as const;

export const ERC721_TOKEN_URI_ABI = [
  {
    type: "function",
    name: "tokenURI",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
] as const;

export const ERC20_META_ABI = [
  { type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "string" }] },
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint8" }] },
] as const;
