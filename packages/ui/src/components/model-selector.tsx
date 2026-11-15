"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { cn, useControllableState } from "@kineticui/core";
import { CheckIcon, ChevronDownIcon } from "@kineticui/icons";

export type ModelOption = {
  id: string;
  name: string;
  description?: string;
  /** e.g. "New", "Pro". */
  badge?: string;
  /** 1–5 meters. */
  speed?: number;
  intelligence?: number;
  icon?: React.ReactNode;
  disabled?: boolean;
};

export type ModelSelectorProps = {
  models: ModelOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  className?: string;
};

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <span className="flex items-center gap-1.5" title={`${label}: ${value}/5`}>
      <span className="text-[10px] text-subtle">{label}</span>
      <span className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={cn("h-1.5 w-2.5 rounded-full", i < value ? "bg-accent" : "bg-border-strong")} />
        ))}
      </span>
    </span>
  );
}

/** Compact model picker for chat toolbars, with speed/intelligence meters. */
export function ModelSelector({ models, value, defaultValue, onValueChange, className }: ModelSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [current, setCurrent] = useControllableState({ value, defaultValue: defaultValue ?? models[0]?.id ?? "", onChange: onValueChange });
  const sel = models.find((m) => m.id === current);
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger
        className={cn("flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted outline-none hover:bg-surface-raised hover:text-foreground focus-visible:ring-2 focus-visible:ring-foreground data-[state=open]:bg-surface-raised", className)}
      >
        {sel?.icon}
        {sel?.name ?? "Model"}
        <ChevronDownIcon size={14} className="opacity-60" />
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="top"
          align="start"
          sideOffset={8}
          className="z-50 w-80 rounded-2xl border border-border-strong bg-surface-raised p-1.5 shadow-overlay data-[state=open]:animate-[kn-pop_0.15s_var(--ease-kn-out)]"
        >
          <div role="listbox" aria-label="Model">
            {models.map((m) => (
              <button
                key={m.id}
                role="option"
                type="button"
                aria-selected={m.id === current}
                disabled={m.disabled}
                onClick={() => {
                  setCurrent(m.id);
                  setOpen(false);
                }}
                className="flex w-full items-start gap-3 rounded-xl p-2.5 text-left outline-none hover:bg-surface-overlay focus-visible:bg-surface-overlay disabled:opacity-40"
              >
                {m.icon ? <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface-overlay [&_svg]:size-4">{m.icon}</span> : null}
                <span className="flex flex-1 flex-col gap-1">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    {m.name}
                    {m.badge ? <span className="rounded-full bg-accent-soft px-1.5 py-px font-mono text-[9px] uppercase text-accent">{m.badge}</span> : null}
                  </span>
                  {m.description ? <span className="text-xs text-subtle">{m.description}</span> : null}
                  {m.speed || m.intelligence ? (
                    <span className="mt-0.5 flex gap-3">
                      {m.intelligence ? <Meter label="Smarts" value={m.intelligence} /> : null}
                      {m.speed ? <Meter label="Speed" value={m.speed} /> : null}
                    </span>
                  ) : null}
                </span>
                {m.id === current ? <CheckIcon size={16} className="mt-1 text-accent" /> : null}
              </button>
            ))}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
