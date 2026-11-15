"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { CheckIcon, CopyIcon, MailIcon, XIcon } from "@kineticui/icons";
import { QrCode } from "./qr-code";
import { SocialIcon } from "./social-icons";

export type ShareSheetProps = {
  url: string;
  title: string;
  text?: string;
  /** The element that opens the sheet. */
  trigger: React.ReactElement;
  /** Who can open the link, shown with a selector. */
  access?: { value: string; options: { value: string; label: string; description?: string }[]; onChange: (v: string) => void };
};

const targets = (url: string, title: string, text = "") => {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  return [
    { id: "x", label: "X", href: `https://x.com/intent/tweet?url=${u}&text=${t}`, icon: <SocialIcon network="x" size={18} /> },
    { id: "linkedin", label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, icon: <SocialIcon network="linkedin" size={18} /> },
    { id: "whatsapp", label: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}`, icon: <SocialIcon network="whatsapp" size={18} /> },
    { id: "telegram", label: "Telegram", href: `https://t.me/share/url?url=${u}&text=${t}`, icon: <SocialIcon network="telegram" size={18} /> },
    { id: "email", label: "Email", href: `mailto:?subject=${t}&body=${encodeURIComponent(text ? `${text}\n\n` : "")}${u}`, icon: <MailIcon size={18} /> },
  ];
};

/** Share dialog: copy link, QR code, social targets, native share and link access settings. */
export function ShareSheet({ url, title, text, trigger, access }: ShareSheetProps) {
  const [copied, setCopied] = React.useState(false);
  const [qr, setQr] = React.useState(false);
  const canNative = typeof navigator !== "undefined" && "share" in navigator;

  return (
    <DialogPrimitive.Root onOpenChange={(o) => !o && setQr(false)}>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] data-[state=open]:animate-[kn-fade_0.15s]" />
        <DialogPrimitive.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md rounded-t-3xl border border-border-strong bg-surface-raised p-5 shadow-overlay outline-none data-[state=open]:animate-[kn-slide-up_0.25s_var(--ease-kn-out)] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:data-[state=open]:animate-[kn-pop_0.2s_var(--ease-kn-out)]">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex-1">
              <DialogPrimitive.Title className="font-semibold">Share</DialogPrimitive.Title>
              <DialogPrimitive.Description className="truncate text-sm text-subtle">{title}</DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close aria-label="Close" className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface-overlay"><XIcon size={15} /></DialogPrimitive.Close>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-1.5 pl-3">
            <span className="flex-1 truncate font-mono text-xs text-muted">{url}</span>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard?.writeText(url).catch(() => {});
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className={cn("flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-colors", copied ? "bg-success text-background" : "bg-accent text-accent-foreground")}
            >
              {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />} {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {targets(url, title, text).map((t) => (
              <a key={t.id} href={t.href} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1.5 rounded-xl p-2 text-[11px] text-muted hover:bg-surface-overlay hover:text-foreground">
                <span className="flex size-11 items-center justify-center rounded-full bg-surface-overlay">{t.icon}</span>
                {t.label}
              </a>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button type="button" aria-expanded={qr} onClick={() => setQr(!qr)} className="h-9 flex-1 rounded-lg border border-border-strong text-sm hover:bg-surface-overlay">{qr ? "Hide QR code" : "Show QR code"}</button>
            {canNative ? (
              <button type="button" onClick={() => void navigator.share({ url, title, text }).catch(() => {})} className="h-9 flex-1 rounded-lg border border-border-strong text-sm hover:bg-surface-overlay">More options…</button>
            ) : null}
          </div>
          <AnimatePresence initial={false}>
            {qr ? (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="mt-3 flex items-center justify-center rounded-xl bg-white p-4 text-[#0b0c0e]">
                  <QrCode value={url} size={168} variant="dots" />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
          {access ? (
            <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
              <span className="text-xs font-medium text-subtle">General access</span>
              {access.options.map((o) => (
                <label key={o.value} className={cn("flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-colors", access.value === o.value ? "border-accent bg-accent-soft/40" : "border-border hover:border-border-strong")}>
                  <input type="radio" name="kn-share-access" checked={access.value === o.value} onChange={() => access.onChange(o.value)} className="accent-[var(--kn-accent)]" />
                  <span className="flex flex-col">
                    <span className="font-medium">{o.label}</span>
                    {o.description ? <span className="text-xs text-subtle">{o.description}</span> : null}
                  </span>
                </label>
              ))}
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
