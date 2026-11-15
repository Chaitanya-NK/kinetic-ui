"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn, useMounted } from "@kineticui/core";
import { CheckIcon, CopyIcon, MapPinIcon } from "@kineticui/icons";
import { SocialIcon, type SocialNetwork } from "./social-icons";

export type ContactMethod = {
  kind: "email" | "phone" | "whatsapp" | "telegram" | "location" | "website" | "calendar";
  label?: string;
  /** Address, number, handle or URL. */
  value: string;
  /** Extra line, e.g. "Replies within a day". */
  hint?: string;
};

export type ContactMethodsProps = {
  methods: ContactMethod[];
  /** IANA time zone for the local-time badge, e.g. "Asia/Kolkata". */
  timeZone?: string;
  /** Working hours in that zone, used for the "online now" dot. */
  hours?: [number, number];
  className?: string;
};

const meta: Record<ContactMethod["kind"], { label: string; icon: React.ReactNode; href: (v: string) => string; tint: string }> = {
  email: { label: "Email", icon: <SocialIcon network="mail" size={18} />, href: (v) => `mailto:${v}`, tint: "#7C8CFF" },
  phone: {
    label: "Phone",
    icon: (
      <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L8 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.8.7a2 2 0 011.7 2z" />
      </svg>
    ),
    href: (v) => `tel:${v.replace(/[^\d+]/g, "")}`,
    tint: "#6EE7A0",
  },
  whatsapp: { label: "WhatsApp", icon: <SocialIcon network="whatsapp" size={18} />, href: (v) => `https://wa.me/${v.replace(/\D/g, "")}`, tint: "#25D366" },
  telegram: { label: "Telegram", icon: <SocialIcon network="telegram" size={18} />, href: (v) => `https://t.me/${v.replace(/^@/, "")}`, tint: "#2AABEE" },
  location: { label: "Location", icon: <MapPinIcon size={18} />, href: (v) => `https://maps.google.com/?q=${encodeURIComponent(v)}`, tint: "#F4A86A" },
  website: { label: "Website", icon: <SocialIcon network={"globe" as SocialNetwork} size={18} />, href: (v) => (v.startsWith("http") ? v : `https://${v}`), tint: "#F0A3D0" },
  calendar: {
    label: "Book a call",
    icon: (
      <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
    href: (v) => v,
    tint: "var(--kn-accent)",
  },
};

/** Grid of ways to reach you, each with open + copy actions, plus local time and an online indicator. */
export function ContactMethods({ methods, timeZone, hours = [9, 19], className }: ContactMethodsProps) {
  const mounted = useMounted();
  const [copied, setCopied] = React.useState<number | null>(null);
  const [now, setNow] = React.useState<Date | null>(null);
  React.useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const local = mounted && now && timeZone ? new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" }).format(now) : null;
  const hour = mounted && now && timeZone ? Number(new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", hourCycle: "h23" }).format(now)) : null;
  const online = hour !== null && hour >= hours[0] && hour < hours[1];

  return (
    <div className={cn("@container flex flex-col gap-3", className)}>
      {timeZone ? (
        <div className="flex items-center gap-2 text-sm text-muted">
          <span className={cn("size-2 rounded-full", online ? "bg-success" : "bg-subtle")} />
          {local ? <>It&apos;s {local} here · {online ? "usually replies fast" : "replies tomorrow"}</> : "Checking local time…"}
        </div>
      ) : null}
      <div className="grid gap-3 @lg:grid-cols-2">
        {methods.map((m, i) => {
          const d = meta[m.kind];
          return (
            <motion.div
              key={`${m.kind}-${m.value}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-border-strong"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl" style={{ background: `color-mix(in oklab, ${d.tint} 18%, transparent)`, color: d.tint }}>
                {d.icon}
              </span>
              <a href={d.href(m.value)} target={m.kind === "email" || m.kind === "phone" ? undefined : "_blank"} rel="noreferrer" className="flex min-w-0 flex-1 flex-col after:absolute after:inset-0 after:rounded-2xl">
                <span className="text-xs text-subtle">{m.label ?? d.label}</span>
                <span className="truncate font-medium">{m.value}</span>
                {m.hint ? <span className="truncate text-xs text-muted">{m.hint}</span> : null}
              </a>
              <button
                type="button"
                aria-label={`Copy ${m.label ?? d.label}`}
                onClick={async () => {
                  await navigator.clipboard?.writeText(m.value).catch(() => {});
                  setCopied(i);
                  setTimeout(() => setCopied(null), 1400);
                }}
                className="relative z-[1] flex size-9 shrink-0 items-center justify-center rounded-lg text-subtle opacity-0 transition-opacity hover:bg-surface-raised hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={copied === i ? "c" : "n"} initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                    {copied === i ? <CheckIcon size={15} className="text-success" /> : <CopyIcon size={15} />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
