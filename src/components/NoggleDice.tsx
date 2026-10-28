"use client";

import { Dices } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NOGGLE_DICE, rollDie, trickFromFaces, WILDCARD } from "@/lib/tricks";

const SPIN_MS = 700;
const TICK_MS = 80;

/** Rolls a rail trick. `onRoll` receives the final trick name. */
export function NoggleDice({ onRoll, disabled }: { onRoll: (trick: string) => void; disabled?: boolean }) {
  const [faces, setFaces] = useState<string[] | null>(null);
  const [rolling, setRolling] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => () => clearInterval(timer.current), []);

  function roll() {
    setRolling(true);
    const final = NOGGLE_DICE.map((d) => rollDie(d));
    const started = Date.now();
    timer.current = setInterval(() => {
      if (Date.now() - started >= SPIN_MS) {
        clearInterval(timer.current);
        setFaces(final);
        setRolling(false);
        onRoll(trickFromFaces(final));
        return;
      }
      setFaces(NOGGLE_DICE.map((d) => rollDie(d)));
    }, TICK_MS);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className="btn btn-outline" onClick={roll} disabled={rolling || disabled}>
        <Dices className={`size-4 ${rolling ? "animate-spin" : ""}`} />
        Noggle Dice
      </button>
      {faces?.map((f, i) => (
        <span
          key={NOGGLE_DICE[i].key}
          title={NOGGLE_DICE[i].key}
          className={`badge h-7 font-mono ${f === WILDCARD ? "border-noggle/40 bg-noggle/10 text-noggle" : ""} ${!f ? "text-muted-foreground" : ""}`}
        >
          {f || "—"}
        </span>
      ))}
    </div>
  );
}
