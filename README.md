# ⌐◨-◨ Nogglesrails Trick Log

**Log tricks landed on Gnars Noggles Rails onchain — and turn the clip into a Gnars bounty claim in one tap.**

Gnars DAO funds [Noggles Rails](https://www.gnars.com/nogglesrails): Nouns-shaped skate obstacles installed by local collectives in Rio, Chicago, Nairobi, London, Rome and more. Once a rail is installed, nothing records what happens on it. Trick Log fills that gap:

1. Pick a rail on the map.
2. Film the trick (or roll the **Noggle Dice** for a challenge).
3. The clip goes to IPFS and the trick is logged as an **EAS attestation on Base** (rail, trick, clip, note).
4. If the rail has an open Gnars bounty, the same flow sends a **`createClaim` to the Gnars bounty contract** (PoidhSopa, the one behind gnars.com/community/bounties). Pool contributors vote and the winners get paid as usual.

Each rail page shows its clips, its open bounties and a **King of the rail** leaderboard.

The home globe (ported from gnars.com) pulses red rings over the rails with the most logged tricks: the busier the rail, the wider and faster the rings. The effect is tuned in one place, `src/lib/activity.ts`.

Built as a Farcaster / Base App mini app that also works in a regular browser.

The heroes show a 3D skateboard (which pops a kickflip every few seconds) and a 3D surfboard riding the illustrated wave. Both are built in code with three.js (`src/components/three/`), so they ship no model files and need no third-party licenses. Their graphics use the Noggles Rail colorways.

### Surf

Gnars is skate *and* surf, so Trick Log has a **Surf** tab (`/surf`). It works the same way, with surf spots in place of rails: log a wave at a spot, see who's in the water, climb the **Local legend** board and claim surf bounties. It uses the same EAS schema and the same bounty contract, so nothing new needs to be deployed. The schema's `rail` field holds the spot slug, and rail and spot slugs share one namespace; a test enforces that. The app starts with 14 well-known breaks (Saquarema, Arpoador, Pipeline, Nazaré…), which are *not* Gnars installations. Adding a spot means adding one entry to `src/lib/surf-spots.ts`. Spots have no photo library yet, so each one gets a generated poster at `/surf/<slug>/cover.png`. Another sport can be added later with one entry in `src/lib/sports.ts` plus its places.

## How it helps Gnars and Nouns

- **Proof for "cash for tricks"**: rail activations pay skaters for tricks. With Trick Log every paid trick has a clip, a wallet and an onchain record, and the payout runs through the bounty pool's vote.
- **Usage data for governance**: tricks, skaters and clips per rail give the DAO real evidence for propdates and for proposals to fund the *next* rail.
- **Bounties without new contracts**: any Gnars bounty becomes a rail challenge by adding a tag. Claims sent from here show up on gnars.com automatically.
- **Nouns on the street**: every log is a ⌐◨-◨ obstacle getting skated. It's CC0 culture showing up in real-world use, and the records are public goods on Base.

## Rail bounty convention

Put tags anywhere in a Gnars bounty's title or description:

| Tag | Meaning |
|---|---|
| `rail:<slug>` | Challenge on one rail (slug from gnars.com/nogglesrails/`<slug>`) |
| `rail:any` | Challenge valid on every Noggles Rail |
| `surf:<slug>` | Surf challenge at one spot (slug from `/surf/<slug>`) |
| `surf:any` | Surf challenge valid at every spot |
| `trick:<name>` | Optional, pins the trick or maneuver, with dashes for spaces: `trick:bs-feeble-grind` |

Example: *"Best feeble on the Rio rail wins — rail:rio-de-janeiro trick:feeble-grind"*.

Claims sent from Trick Log carry `rail:`, `trick:` and `attestation:<uid>` in their description. That links each claim back to its onchain log.

## Onchain pieces

| What | Where |
|---|---|
| Trick log | EAS on Base, schema `string rail,string trick,string clip,string note` (revocable, no resolver) → UID `0x0ca8430e94a76662381ecfbed8df1683c267a8ac709a6d7e029fff678b2d9436` |
| Bounties / claims | PoidhSopa `0x31d0A0D4EBE4173f18CBA521882B4C7Cf658F505` (Base) |
| Rails | Same dataset as gnars.com/nogglesrails (`src/lib/rails-data.ts`, from the Gnars website) |

The schema UID is deterministic. Register it once at [base.easscan.org/schema/create](https://base.easscan.org/schema/create) with the exact schema string above, **no resolver** and **revocable = yes**.

## Run it

```bash
pnpm install
cp .env.example .env.local   # add PINATA_JWT
pnpm dev
```

Clip uploads go browser → Pinata through a one-off signed URL. The wallet signs the upload request first, and smart wallets are supported through ERC-1271/6492 verification. Clip URLs use a gateway that gnars.com already renders inline (`ipfs.skatehive.app` by default).

```bash
pnpm test        # unit tests
pnpm typecheck
pnpm lint
```

Stack: Next.js 16 (App Router, Cache Components), wagmi + viem, Farcaster mini app SDK, react-globe.gl, Tailwind 4. The UI follows the Gnars website design tokens.

## Credits

- Noggle Dice mechanics adapted from [Skatehive](https://github.com/SkateHive/skatehive3.0)'s skate dice (MIT © sktbrd).
- Rails data, photos, the Noggles Rail colorways, the globe and UI patterns: [Gnars DAO website](https://www.gnars.com). Bounty contract: PoidhSopa.
- ⌐◨-◨ Noggles: [Nouns](https://nouns.wtf), CC0.

## License

MIT
