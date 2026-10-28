"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

/** Light / dark / system menu, like gnars.com. The icon follows the resolved theme via the `dark` class. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Toggle theme"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="btn relative size-9 px-0 hover:bg-muted"
      >
        <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </button>
      {open && (
        <div className="card absolute right-0 z-50 mt-2 flex w-36 flex-col p-1.5 shadow-lg">
          {OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                setTheme(o.value);
                setOpen(false);
              }}
              className={`flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-muted ${
                theme === o.value ? "font-semibold" : ""
              }`}
            >
              <o.icon className="size-4" />
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
