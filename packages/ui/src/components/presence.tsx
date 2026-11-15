"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Tooltip as TooltipPrimitive } from "radix-ui";
import { cn } from "@kineticui/core";

export type PresenceUser = {
  id: string;
  name: string;
  color?: string;
  avatar?: string;
  status?: "active" | "idle" | "away";
  /** Where they are, e.g. "Editing Pricing". */
  activity?: string;
};

const initials = (n: string) => n.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
const dot = { active: "bg-success", idle: "bg-warning", away: "bg-subtle" };

/** Who's here right now: overlapping avatars with status, tooltips and overflow count. */
export function Presence({ users, max = 4, size = 32, className }: { users: PresenceUser[]; max?: number; size?: number; className?: string }) {
  const shown = users.slice(0, max);
  const extra = users.length - shown.length;
  return (
    <TooltipPrimitive.Provider delayDuration={100}>
      <div className={cn("flex items-center", className)}>
        <AnimatePresence initial={false}>
          {shown.map((u, i) => (
            <TooltipPrimitive.Root key={u.id}>
              <TooltipPrimitive.Trigger asChild>
                <motion.span
                  layout
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="relative shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-foreground"
                  style={{ zIndex: shown.length - i, width: size, height: size, marginLeft: i ? -size * 0.28 : 0 }}
                  tabIndex={0}
                >
                  <span
                    className="flex size-full items-center justify-center overflow-hidden rounded-full font-semibold text-[#0b0c0e] ring-2 ring-background"
                    style={{ fontSize: size * 0.36, background: u.color ?? "var(--kn-surface-overlay)" }}
                  >
                    {u.avatar ? <img src={u.avatar} alt="" className="size-full object-cover" /> : initials(u.name)}
                  </span>
                  {u.status ? <span className={cn("absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-background", dot[u.status])} /> : null}
                </motion.span>
              </TooltipPrimitive.Trigger>
              <TooltipPrimitive.Portal>
                <TooltipPrimitive.Content sideOffset={6} className="z-50 rounded-lg bg-foreground px-2.5 py-1.5 text-xs text-background data-[state=delayed-open]:animate-[kn-fade_0.12s]">
                  <div className="font-semibold">{u.name}</div>
                  {u.activity ? <div className="opacity-70">{u.activity}</div> : null}
                </TooltipPrimitive.Content>
              </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
          ))}
        </AnimatePresence>
        {extra > 0 ? (
          <span className="relative ml-1 flex items-center justify-center rounded-full bg-surface-overlay font-mono text-[11px] font-semibold text-muted ring-2 ring-background" style={{ width: size, height: size }}>
            +{extra}
          </span>
        ) : null}
      </div>
    </TooltipPrimitive.Provider>
  );
}
