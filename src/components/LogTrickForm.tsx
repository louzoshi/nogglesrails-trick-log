"use client";

import { CircleCheck, ExternalLink, LoaderCircle, Upload } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { parseEventLogs, zeroAddress, zeroHash, type Hex } from "viem";
import { useAccount, useChainId, useConfig, useSignMessage, useSwitchChain, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { ConnectButton } from "@/components/ConnectButton";
import { NoggleDice } from "@/components/NoggleDice";
import { CHAIN, CLIP_MIME_TYPES, EAS_ADDRESS, EAS_SCAN_URL, GNARS_BOUNTY_URL, MAX_CLIP_BYTES, POIDH_SOPA_ADDRESS } from "@/lib/config";
import { EAS_ABI, encodeTrick, TRICK_SCHEMA_REVOCABLE, TRICK_SCHEMA_UID } from "@/lib/eas-schema";
import { ipfsUri, toGatewayUrl } from "@/lib/ipfs";
import { POIDH_SOPA_ABI } from "@/lib/sopa-abi";
import { SPORTS, type Sport } from "@/lib/sports";
import { claimDescription } from "@/lib/tags";
import { RAIL_TRICKS, SURF_MOVES } from "@/lib/tricks";
import { clipMimeType } from "@/lib/upload-auth";
import { uploadClip } from "@/lib/upload-client";

export interface FormRail {
  slug: string;
  title: string;
  city: string;
  country: string;
  cover: string;
}

export interface FormBounty {
  id: number;
  title: string;
  reward: string;
  rail: string;
}

type Step = "idle" | "signing" | "uploading" | "attesting" | "claiming" | "done";

const STEP_LABEL: Record<Step, string> = {
  idle: "",
  signing: "Sign the upload request in your wallet…",
  uploading: "Uploading clip",
  attesting: "Confirm the log onchain…",
  claiming: "Confirm the bounty claim…",
  done: "Landed!",
};

export function LogTrickForm(props: {
  sport: Sport;
  rails: FormRail[];
  bounties: FormBounty[];
  initialRail?: string;
  initialTrick?: string;
  initialBounty?: number;
  /** Demo mode: walk through the same steps without wallet, upload or transactions. */
  demo?: boolean;
}) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const config = useConfig();
  const { switchChainAsync } = useSwitchChain();
  const { signMessageAsync } = useSignMessage();
  const { writeContractAsync } = useWriteContract();

  const [rail, setRail] = useState(props.initialRail ?? props.rails[0]?.slug ?? "");
  const [trick, setTrick] = useState(props.initialTrick ?? "");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [bountyId, setBountyId] = useState<number | "">(props.initialBounty ?? "");
  const [step, setStep] = useState<Step>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ uid: Hex; clip: string; bountyId?: number } | null>(null);

  const s = SPORTS[props.sport];
  const Move = s.move[0].toUpperCase() + s.move.slice(1);
  const railBounties = props.bounties.filter((b) => b.rail === "any" || b.rail === rail);
  const selectedRail = props.rails.find((r) => r.slug === rail);
  const busy = step !== "idle" && step !== "done";

  function pickFile(f: File | null) {
    setError(null);
    if (f && !clipMimeType(f)) return setError("Use an MP4, MOV or WebM clip.");
    if (f && f.size > MAX_CLIP_BYTES) return setError("Clip is over 100 MB — trim it first.");
    setFile(f);
  }

  async function simulate() {
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    setStep("signing");
    await wait(700);
    setStep("uploading");
    for (let p = 0; p <= 100; p += 5) {
      setProgress(p);
      await wait(60);
    }
    setStep("attesting");
    await wait(1100);
    if (bountyId !== "") {
      setStep("claiming");
      await wait(1100);
    }
    setResult({ uid: zeroHash, clip: URL.createObjectURL(file!), bountyId: bountyId === "" ? undefined : bountyId });
    setStep("done");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (props.demo) {
      if (file && trick.trim()) await simulate();
      return;
    }
    if (!address || !file || !selectedRail || !trick.trim()) return;
    setError(null);
    try {
      if (chainId !== CHAIN.id) await switchChainAsync({ chainId: CHAIN.id });

      setStep("signing");
      const { cid } = await uploadClip(file, address, (message) => signMessageAsync({ message }), (p) => {
        setStep("uploading");
        setProgress(p);
      });
      const clip = ipfsUri(cid);

      setStep("attesting");
      const attestHash = await writeContractAsync({
        address: EAS_ADDRESS,
        abi: EAS_ABI,
        functionName: "attest",
        args: [
          {
            schema: TRICK_SCHEMA_UID,
            data: {
              recipient: zeroAddress,
              expirationTime: 0n,
              revocable: TRICK_SCHEMA_REVOCABLE,
              refUID: zeroHash,
              data: encodeTrick({ rail, trick: trick.trim(), clip, note: note.trim() }),
              value: 0n,
            },
          },
        ],
      });
      const receipt = await waitForTransactionReceipt(config, { hash: attestHash });
      const [attested] = parseEventLogs({ abi: EAS_ABI, eventName: "Attested", logs: receipt.logs });
      if (!attested) throw new Error("Attestation not found in the transaction.");
      const uid = attested.args.uid;

      if (bountyId !== "") {
        setStep("claiming");
        const claimHash = await writeContractAsync({
          address: POIDH_SOPA_ADDRESS,
          abi: POIDH_SOPA_ABI,
          functionName: "createClaim",
          args: [
            BigInt(bountyId),
            `${trick.trim()} @ ${selectedRail.title}`.slice(0, 120),
            claimDescription({ rail, trick, sport: props.sport, note: note.trim() || `${trick.trim()} on ${selectedRail.title}.`, attestationUid: uid }),
            toGatewayUrl(clip),
          ],
        });
        await waitForTransactionReceipt(config, { hash: claimHash });
      }

      setResult({ uid, clip, bountyId: bountyId === "" ? undefined : bountyId });
      setStep("done");
    } catch (err) {
      setStep("idle");
      setError(readableError(err));
    }
  }

  if (step === "done" && result) {
    return (
      <div className="card flex flex-col gap-5 p-6">
        <div className="flex items-center gap-3">
          <CircleCheck className="size-6 text-emerald-500" />
          <h2 className="text-2xl font-bold">{props.sport === "surf" ? "Scored!" : "Landed!"}</h2>
        </div>
        <video src={toGatewayUrl(result.clip)} controls playsInline className="max-h-[60vh] w-full rounded-lg bg-black" />
        <div className="flex flex-wrap gap-2">
          <Link className="btn btn-primary" href={`${s.placeBase}/${rail}`}>
            Back to the {s.place}
          </Link>
          {!props.demo && (
            <>
              <a className="btn btn-outline" href={`${EAS_SCAN_URL}/attestation/view/${result.uid}`} target="_blank" rel="noreferrer">
                View onchain <ExternalLink className="size-3.5" />
              </a>
              {result.bountyId !== undefined && (
                <a className="btn btn-outline" href={GNARS_BOUNTY_URL(result.bountyId)} target="_blank" rel="noreferrer">
                  Your claim on Gnars <ExternalLink className="size-3.5" />
                </a>
              )}
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {props.demo
            ? "Demo mode: this was a simulation — nothing was uploaded or sent onchain."
            : "New logs can take a minute to show up while the indexer catches up."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card flex flex-col gap-6 p-5 sm:p-6">
      <label className="field">
        <span className="capitalize">{s.place}</span>
        <select className="input" value={rail} onChange={(e) => setRail(e.target.value)} disabled={busy}>
          {props.rails.map((r) => (
            <option key={r.slug} value={r.slug}>
              {r.title === r.city ? r.title : `${r.title} — ${r.city}`}
            </option>
          ))}
        </select>
        {selectedRail && (
          <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedRail.cover} alt="" className="size-12 rounded-md object-cover" />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{selectedRail.title}</div>
              <div className="truncate text-xs text-muted-foreground">
                {selectedRail.city}, {selectedRail.country}
              </div>
            </div>
          </div>
        )}
      </label>

      <div className="field">
        <span>{Move}</span>
        <input
          className="input"
          list="move-suggestions"
          value={trick}
          onChange={(e) => setTrick(e.target.value)}
          placeholder={s.movePlaceholder}
          maxLength={80}
          required
          disabled={busy}
        />
        <datalist id="move-suggestions">
          {(props.sport === "surf" ? SURF_MOVES : RAIL_TRICKS).map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
        {props.sport === "skate" && <NoggleDice onRoll={setTrick} disabled={busy} />}
      </div>

      <div className="field">
        <span>Clip</span>
        <label
          className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center transition-colors hover:bg-muted/50 ${busy ? "pointer-events-none opacity-50" : ""}`}
        >
          <Upload className="size-5 text-muted-foreground" />
          {file ? (
            <span className="max-w-full truncate text-sm font-medium">{file.name}</span>
          ) : (
            <span className="text-sm font-medium">Choose or record a clip</span>
          )}
          <span className="text-xs text-muted-foreground">MP4, MOV or WebM · up to 100 MB</span>
          <input
            type="file"
            className="sr-only"
            accept={[...CLIP_MIME_TYPES, ".mov", ".mp4", ".m4v", ".webm"].join(",")}
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            disabled={busy}
          />
        </label>
      </div>

      <label className="field">
        <span>
          Note <span className="font-normal text-muted-foreground">(optional)</span>
        </span>
        <textarea
          className="input"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={280}
          placeholder={props.sport === "surf" ? "Dawn patrol, head-high sets…" : "First try, third session…"}
          disabled={busy}
        />
      </label>

      <label className="field">
        <span>Submit to a bounty</span>
        <select
          className="input"
          value={bountyId}
          onChange={(e) => setBountyId(e.target.value === "" ? "" : Number(e.target.value))}
          disabled={busy || railBounties.length === 0}
        >
          <option value="">{railBounties.length ? "No — just log it" : `No open bounties on this ${s.place}`}</option>
          {railBounties.map((b) => (
            <option key={b.id} value={b.id}>
              #{b.id} · {b.title} · {b.reward}
            </option>
          ))}
        </select>
        {bountyId !== "" && (
          <small className="text-xs text-muted-foreground">
            Your clip becomes a claim on the Gnars bounty — pool contributors vote on the winners.
          </small>
        )}
      </label>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>
      )}

      {busy && (
        <div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-4">
          <p className="flex items-center gap-2 text-sm font-medium">
            <LoaderCircle className="size-4 animate-spin" />
            {STEP_LABEL[step]}
            {step === "uploading" && ` ${progress}%`}
          </p>
          {step === "uploading" && (
            <div className="h-1.5 overflow-hidden rounded-full bg-border">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      )}

      {isConnected || props.demo ? (
        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={busy || !file || !trick.trim()}>
          {bountyId === "" ? `Log ${s.move} onchain` : `Log ${s.move} + claim bounty`}
        </button>
      ) : (
        <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
          <span className="text-sm text-muted-foreground">Connect a wallet on Base to log {s.moves}.</span>
          <ConnectButton />
        </div>
      )}
    </form>
  );
}

function readableError(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  if (/user (rejected|denied)/i.test(msg)) return "Cancelled in the wallet.";
  if (/IssuerCannotClaim/.test(msg)) return "The bounty issuer can't claim their own bounty.";
  return msg.split("\n")[0].slice(0, 240);
}
