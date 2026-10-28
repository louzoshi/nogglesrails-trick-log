"use client";

import { COLORWAYS, type Colorway } from "@/lib/colorways";

/** Noggles Rail colorway swatches (same set as gnars.com/nogglesrails). */
export function ColorwayPicker({ value, onChange }: { value: Colorway; onChange: (c: Colorway) => void }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-wrap justify-center gap-1.5">
        {COLORWAYS.map((c) => (
          <button
            key={c.value}
            type="button"
            title={c.name}
            aria-label={c.name}
            aria-pressed={c.value === value.value}
            onClick={() => onChange(c)}
            className={`size-5 cursor-pointer rounded-full border transition-transform hover:scale-110 ${
              c.value === value.value ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : ""
            }`}
            style={{ background: c.value }}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{value.name}</span>
    </div>
  );
}
