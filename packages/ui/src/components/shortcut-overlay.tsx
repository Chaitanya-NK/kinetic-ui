"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "@kineticui/core";
import { SearchIcon, XIcon } from "@kineticui/icons";

export type Shortcut = {
  /** e.g. "mod+k", "g d", "shift+?". `mod` = ⌘ on Mac, Ctrl elsewhere. Space separates a sequence. */
  keys: string;
  label: string;
  group?: string;
  /** Run when pressed. Omit for display-only entries. */
  action?: () => void;
};

const isMac = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const pretty = (k: string) =>
  ({ mod: isMac() ? "⌘" : "Ctrl", shift: "⇧", alt: isMac() ? "⌥" : "Alt", enter: "↵", esc: "Esc", up: "↑", down: "↓", left: "←", right: "→", backspace: "⌫" })[k.toLowerCase()] ?? k.toUpperCase();

const matches = (combo: string, e: KeyboardEvent) => {
  const parts = combo.toLowerCase().split("+");
  const key = parts.pop()!;
  const want = { mod: parts.includes("mod"), shift: parts.includes("shift"), alt: parts.includes("alt") };
  const mod = isMac() ? e.metaKey : e.ctrlKey;
  return e.key.toLowerCase() === key && mod === want.mod && e.altKey === want.alt && (key === "?" || e.shiftKey === want.shift);
};

/** Registers shortcuts (combos and sequences like "g d"). Ignores typing in inputs unless the combo uses mod. */
export function useHotkeys(shortcuts: Shortcut[], enabled = true) {
  const seq = React.useRef<{ keys: string[]; t?: ReturnType<typeof setTimeout> }>({ keys: [] });
  React.useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement).tagName) || (e.target as HTMLElement).isContentEditable;
      for (const s of shortcuts) {
        if (!s.action) continue;
        const steps = s.keys.split(" ");
        if (steps.length === 1) {
          if ((!typing || steps[0]!.includes("mod")) && matches(steps[0]!, e)) {
            e.preventDefault();
            s.action();
            return;
          }
        }
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      const st = seq.current;
      st.keys = [...st.keys, e.key.toLowerCase()].slice(-3);
      clearTimeout(st.t);
      st.t = setTimeout(() => (st.keys = []), 900);
      for (const s of shortcuts) {
        const steps = s.keys.toLowerCase().split(" ");
        if (s.action && steps.length > 1 && st.keys.slice(-steps.length).join(" ") === steps.join(" ")) {
          st.keys = [];
          s.action();
          return;
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcuts, enabled]);
}

export function Keys({ combo }: { combo: string }) {
  return (
    <span className="inline-flex items-center gap-1 align-middle">
      {combo.split(" ").map((step, i) => (
        <React.Fragment key={i}>
          {i ? <span className="text-[10px] text-subtle">then</span> : null}
          {step.split("+").map((k) => (
            <kbd key={k} className="flex h-6 min-w-6 items-center justify-center rounded-md border border-border-strong bg-surface px-1.5 font-mono text-[11px] text-muted shadow-[0_1px_0_var(--kn-border-strong)]">
              {pretty(k)}
            </kbd>
          ))}
        </React.Fragment>
      ))}
    </span>
  );
}

export type ShortcutOverlayProps = {
  shortcuts: Shortcut[];
  /** Key that opens the overlay. Default "?". */
  openKey?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/** Press ? to see every keyboard shortcut, grouped and searchable. Also wires up the shortcuts' actions. */
export function ShortcutOverlay({ shortcuts, openKey = "?", open: controlled, onOpenChange }: ShortcutOverlayProps) {
  const [inner, setInner] = React.useState(false);
  const open = controlled ?? inner;
  const setOpen = (o: boolean) => (controlled === undefined ? setInner(o) : onOpenChange?.(o));
  const [q, setQ] = React.useState("");
  const all = React.useMemo(() => [...shortcuts, { keys: openKey, label: "Show keyboard shortcuts", group: "General", action: () => setOpen(true) }], [shortcuts, openKey]);
  useHotkeys(all, !open);
  const groups = all
    .filter((s) => !q || s.label.toLowerCase().includes(q.toLowerCase()))
    .reduce<Record<string, Shortcut[]>>((a, s) => ((a[s.group ?? "General"] ??= []).push(s), a), {});

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] data-[state=open]:animate-[kn-fade_0.15s]" />
        <DialogPrimitive.Content className="fixed left-1/2 top-[12%] z-50 flex max-h-[76vh] w-[min(640px,calc(100vw-2rem))] -translate-x-1/2 flex-col overflow-hidden rounded-2xl border border-border-strong bg-surface-raised shadow-overlay outline-none data-[state=open]:animate-[kn-pop_0.18s_var(--ease-kn-out)]">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <DialogPrimitive.Title className="font-semibold">Keyboard shortcuts</DialogPrimitive.Title>
            <label className="ml-auto flex h-9 items-center gap-2 rounded-lg bg-background px-3">
              <SearchIcon size={14} className="text-subtle" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter" aria-label="Filter shortcuts" className="w-32 bg-transparent text-sm outline-none" />
            </label>
            <DialogPrimitive.Close aria-label="Close" className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface-overlay">
              <XIcon size={15} />
            </DialogPrimitive.Close>
          </div>
          <div className="grid gap-x-8 gap-y-6 overflow-y-auto p-5 sm:grid-cols-2">
            {Object.entries(groups).map(([g, list]) => (
              <section key={g} className="flex flex-col gap-1">
                <h3 className="mb-1 font-mono text-[10px] uppercase tracking-wider text-subtle">{g}</h3>
                {list.map((s) => (
                  <div key={s.keys + s.label} className={cn("flex items-center justify-between gap-4 rounded-lg px-2 py-1.5 text-sm hover:bg-surface-overlay")}>
                    <span>{s.label}</span>
                    <Keys combo={s.keys} />
                  </div>
                ))}
              </section>
            ))}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
