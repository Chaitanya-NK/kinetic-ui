"use client";

import * as React from "react";
import { HoverCard as HoverPrimitive } from "radix-ui";
import { motion } from "motion/react";
import { cn } from "@kineticui/core";
import { MapPinIcon } from "@kineticui/icons";

export type Profile = {
  name: string;
  handle: string;
  bio?: string;
  avatar?: string;
  color?: string;
  cover?: string;
  location?: string;
  stats?: { label: string; value: number }[];
  /** Mutual connections shown as small avatars. */
  mutuals?: { name: string; color?: string }[];
  verified?: boolean;
  followsYou?: boolean;
};

export type ProfileHoverCardProps = {
  profile: Profile;
  children: React.ReactElement;
  following?: boolean;
  onFollowChange?: (following: boolean) => void;
};

const initials = (n: string) => n.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
const compact = (n: number) => new Intl.NumberFormat("en", { notation: "compact" }).format(n);

/** Hover a name to preview the profile: cover, avatar, bio, stats, mutuals and a Follow button that updates counts. */
export function ProfileHoverCard({ profile: p, children, following: controlled, onFollowChange }: ProfileHoverCardProps) {
  const [inner, setInner] = React.useState(false);
  const following = controlled ?? inner;
  const toggle = () => {
    const next = !following;
    if (controlled === undefined) setInner(next);
    onFollowChange?.(next);
  };
  const stats = (p.stats ?? []).map((s) => (s.label.toLowerCase() === "followers" ? { ...s, value: s.value + (following ? 1 : 0) } : s));

  return (
    <HoverPrimitive.Root openDelay={250} closeDelay={150}>
      <HoverPrimitive.Trigger asChild>{children}</HoverPrimitive.Trigger>
      <HoverPrimitive.Portal>
        <HoverPrimitive.Content sideOffset={8} className="z-50 w-80 overflow-hidden rounded-2xl border border-border-strong bg-surface-raised text-sm shadow-overlay data-[state=open]:animate-[kn-pop_0.18s_var(--ease-kn-out)]">
          <div className="h-16" style={{ background: p.cover ? `center/cover url(${p.cover})` : `linear-gradient(120deg, ${p.color ?? "var(--kn-accent)"}, var(--kn-surface))` }} />
          <div className="flex flex-col gap-3 px-4 pb-4">
            <div className="-mt-7 flex items-end justify-between">
              <span className="flex size-14 items-center justify-center overflow-hidden rounded-full font-semibold text-[#0b0c0e] ring-4 ring-surface-raised" style={{ background: p.color ?? "var(--kn-accent)" }}>
                {p.avatar ? <img src={p.avatar} alt="" className="size-full object-cover" /> : initials(p.name)}
              </span>
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={toggle}
                aria-pressed={following}
                className={cn("group h-8 rounded-full px-4 text-xs font-semibold transition-colors", following ? "border border-border-strong text-foreground hover:border-danger hover:text-danger" : "bg-foreground text-background")}
              >
                {following ? (
                  <>
                    <span className="group-hover:hidden">Following</span>
                    <span className="hidden group-hover:inline">Unfollow</span>
                  </>
                ) : p.followsYou ? "Follow back" : "Follow"}
              </motion.button>
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-semibold">
                {p.name}
                {p.verified ? (
                  <svg viewBox="0 0 24 24" className="size-4 text-info" fill="currentColor" aria-label="Verified">
                    <path d="M12 2l2.4 1.8 3-.2.9 2.8 2.5 1.7-1 2.8 1 2.9-2.5 1.6-.9 2.9-3-.2L12 22l-2.4-1.8-3 .2-.9-2.9-2.5-1.6 1-2.9-1-2.8 2.5-1.7.9-2.8 3 .2z" />
                    <path d="M8.5 12.5l2.3 2.2 4.7-5" stroke="var(--kn-background)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
              </div>
              <div className="flex items-center gap-2 text-xs text-subtle">
                @{p.handle}
                {p.followsYou ? <span className="rounded bg-surface-overlay px-1.5 py-px text-[10px]">Follows you</span> : null}
              </div>
            </div>
            {p.bio ? <p className="leading-relaxed text-muted">{p.bio}</p> : null}
            {p.location ? <span className="flex items-center gap-1 text-xs text-subtle"><MapPinIcon size={12} /> {p.location}</span> : null}
            {stats.length ? (
              <div className="flex gap-4 text-xs">
                {stats.map((s) => (
                  <span key={s.label}>
                    <motion.b key={s.value} initial={{ y: -4, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-block font-semibold text-foreground">{compact(s.value)}</motion.b>{" "}
                    <span className="text-subtle">{s.label}</span>
                  </span>
                ))}
              </div>
            ) : null}
            {p.mutuals?.length ? (
              <div className="flex items-center gap-2 text-xs text-subtle">
                <span className="flex -space-x-1.5">
                  {p.mutuals.slice(0, 3).map((m) => (
                    <span key={m.name} className="flex size-5 items-center justify-center rounded-full text-[8px] font-bold text-[#0b0c0e] ring-2 ring-surface-raised" style={{ background: m.color ?? "var(--kn-muted)" }}>{initials(m.name)}</span>
                  ))}
                </span>
                Followed by {p.mutuals[0]!.name.split(" ")[0]}{p.mutuals.length > 1 ? ` and ${p.mutuals.length - 1} other${p.mutuals.length > 2 ? "s" : ""} you know` : ""}
              </div>
            ) : null}
          </div>
        </HoverPrimitive.Content>
      </HoverPrimitive.Portal>
    </HoverPrimitive.Root>
  );
}
