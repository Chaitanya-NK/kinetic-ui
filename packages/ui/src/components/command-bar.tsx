"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "radix-ui";
import { motion } from "motion/react";
import { cn, useControllableState } from "@kineticui/core";

export type CommandBarItem =
  | { type?: "tool"; id: string; label: string; icon: React.ReactNode; shortcut?: string; onSelect?: () => void; disabled?: boolean }
  | { type: "separator"; id: string };

export type CommandBarProps = {
  items: CommandBarItem[];
  /** Tools with a persistent selection (like Figma's toolbar). */
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  /** Pin to the bottom centre of the viewport. */
  fixed?: boolean;
  /** Bind single-key shortcuts (V, R, T…) to select tools. */
  hotkeys?: boolean;
  className?: string;
};

/** Floating tool dock: a sliding active indicator, tooltips with shortcuts and single-key tool switching. */
export function CommandBar({ items, value, defaultValue, onValueChange, fixed, hotkeys = true, className }: CommandBarProps) {
  const tools = items.filter((i): i is Extract<CommandBarItem, { id: string; label: string }> => i.type !== "separator");
  const [current, setCurrent] = useControllableState({ value, defaultValue: defaultValue ?? tools[0]?.id ?? "", onChange: onValueChange });
  const id = React.useId();

  React.useEffect(() => {
    if (!hotkeys) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement).tagName) || (e.target as HTMLElement).isContentEditable) return;
      const t = tools.find((x) => x.shortcut?.toLowerCase() === e.key.toLowerCase() && !x.disabled);
      if (t) {
        setCurrent(t.id);
        t.onSelect?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hotkeys, tools, setCurrent]);

  return (
    <TooltipPrimitive.Provider delayDuration={250}>
      <div role="toolbar" aria-label="Tools" className={cn("flex w-fit items-center gap-1 rounded-2xl border border-border-strong bg-surface-raised/95 p-1.5 shadow-overlay backdrop-blur-xl", fixed && "fixed bottom-6 left-1/2 z-40 -translate-x-1/2", className)}>
        {items.map((it) =>
          it.type === "separator" ? (
            <span key={it.id} className="mx-1 h-6 w-px bg-border" />
          ) : (
            <TooltipPrimitive.Root key={it.id}>
              <TooltipPrimitive.Trigger asChild>
                <button
                  type="button"
                  aria-label={it.label}
                  aria-pressed={current === it.id}
                  disabled={it.disabled}
                  onClick={() => {
                    setCurrent(it.id);
                    it.onSelect?.();
                  }}
                  className={cn("relative flex size-10 items-center justify-center rounded-xl transition-colors disabled:opacity-30 [&_svg]:size-[18px]", current === it.id ? "text-accent-foreground" : "text-muted hover:bg-surface-overlay hover:text-foreground")}
                >
                  {current === it.id ? <motion.span layoutId={`kn-cb-${id}`} className="absolute inset-0 rounded-xl bg-accent" transition={{ type: "spring", stiffness: 500, damping: 36 }} /> : null}
                  <span className="relative">{it.icon}</span>
                </button>
              </TooltipPrimitive.Trigger>
              <TooltipPrimitive.Portal>
                <TooltipPrimitive.Content side="top" sideOffset={10} className="z-50 flex items-center gap-2 rounded-lg bg-foreground px-2.5 py-1.5 text-xs font-medium text-background data-[state=delayed-open]:animate-[kn-fade_0.12s]">
                  {it.label}
                  {it.shortcut ? <kbd className="rounded bg-background/15 px-1.5 font-mono text-[10px]">{it.shortcut.toUpperCase()}</kbd> : null}
                </TooltipPrimitive.Content>
              </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
          ),
        )}
      </div>
    </TooltipPrimitive.Provider>
  );
}
