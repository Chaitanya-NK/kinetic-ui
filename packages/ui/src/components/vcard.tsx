"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { CheckIcon, DownloadIcon, MapPinIcon, ShareIcon } from "@kineticui/icons";
import { QrCode } from "./qr-code";
import { SocialIcon, detectNetwork } from "./social-icons";

export type ContactInfo = {
  name: string;
  title?: string;
  org?: string;
  email?: string;
  phone?: string;
  website?: string;
  location?: string;
  note?: string;
  /** Photo URL (included in the .vcf as a link). */
  photo?: string;
  socials?: { url: string; label?: string }[];
};

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

/** Builds a vCard 3.0 string that Contacts apps on iOS, Android, macOS and Outlook can import. */
export function buildVCard(c: ContactInfo): string {
  const parts = c.name.trim().split(/\s+/);
  const last = parts.length > 1 ? parts.pop()! : "";
  const first = parts.join(" ");
  const lines = ["BEGIN:VCARD", "VERSION:3.0", `N:${esc(last)};${esc(first)};;;`, `FN:${esc(c.name)}`];
  if (c.org) lines.push(`ORG:${esc(c.org)}`);
  if (c.title) lines.push(`TITLE:${esc(c.title)}`);
  if (c.phone) lines.push(`TEL;TYPE=CELL,VOICE:${c.phone.replace(/[^\d+]/g, "")}`);
  if (c.email) lines.push(`EMAIL;TYPE=INTERNET,PREF:${c.email}`);
  if (c.website) lines.push(`URL:${c.website}`);
  if (c.location) lines.push(`ADR;TYPE=WORK:;;;${esc(c.location)};;;`);
  if (c.photo) lines.push(`PHOTO;VALUE=URI:${c.photo}`);
  for (const s of c.socials ?? []) lines.push(`X-SOCIALPROFILE;TYPE=${detectNetwork(s.url)}:${s.url}`);
  if (c.note) lines.push(`NOTE:${esc(c.note)}`);
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

/** Triggers a .vcf download in the browser. */
export function downloadVCard(c: ContactInfo, filename?: string) {
  const blob = new Blob([buildVCard(c)], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? `${c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.vcf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export type VCardButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  contact: ContactInfo;
  filename?: string;
  onDownloaded?: () => void;
};

/** "Save contact" button that downloads a .vcf and confirms with a check. */
export function VCardButton({ contact, filename, onDownloaded, className, children = "Save contact", ...props }: VCardButtonProps) {
  const [done, setDone] = React.useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        downloadVCard(contact, filename);
        setDone(true);
        onDownloaded?.();
        setTimeout(() => setDone(false), 1800);
      }}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-accent px-4 text-sm font-semibold text-accent-foreground transition-transform active:scale-[0.97]",
        className,
      )}
      {...props}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={done ? "d" : "i"} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
          {done ? <CheckIcon size={16} strokeWidth={2.6} /> : <DownloadIcon size={16} />}
        </motion.span>
      </AnimatePresence>
      {done ? "Saved" : children}
    </button>
  );
}

export type ContactCardProps = {
  contact: ContactInfo;
  /** Avatar node; initials are shown otherwise. */
  avatar?: React.ReactNode;
  className?: string;
};

/** Digital business card. Flip it to reveal a QR code that adds the contact when scanned. */
export function ContactCard({ contact, avatar, className }: ContactCardProps) {
  const [flipped, setFlipped] = React.useState(false);
  const vcf = React.useMemo(() => buildVCard({ ...contact, socials: contact.socials?.slice(0, 2) }), [contact]);
  const initials = contact.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const share = async () => {
    const data = { title: contact.name, text: [contact.title, contact.email, contact.phone].filter(Boolean).join(" · "), url: contact.website };
    if (navigator.share) await navigator.share(data).catch(() => {});
    else await navigator.clipboard?.writeText(`${data.title}\n${data.text}${data.url ? `\n${data.url}` : ""}`);
  };

  return (
    <div className={cn("w-full max-w-sm [perspective:1200px]", className)}>
      <motion.div className="relative aspect-[1.6/1] [transform-style:preserve-3d]" animate={{ rotateY: flipped ? 180 : 0 }} transition={{ type: "spring", stiffness: 160, damping: 20 }}>
        {/* front */}
        <div className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-3xl border border-border-strong bg-[linear-gradient(140deg,var(--kn-surface-raised),var(--kn-surface))] p-5 [backface-visibility:hidden]">
          <div className="absolute -right-12 -top-12 size-40 rounded-full bg-accent/20 blur-2xl" aria-hidden />
          <div className="relative flex items-start gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-accent font-display text-lg font-bold text-accent-foreground">{avatar ?? initials}</span>
            <div className="min-w-0">
              <div className="truncate font-display text-lg font-semibold">{contact.name}</div>
              <div className="truncate text-sm text-muted">{[contact.title, contact.org].filter(Boolean).join(" · ")}</div>
            </div>
          </div>
          <div className="relative flex flex-col gap-1 font-mono text-xs text-muted">
            {contact.email ? <a href={`mailto:${contact.email}`} className="truncate hover:text-foreground">{contact.email}</a> : null}
            {contact.phone ? <a href={`tel:${contact.phone}`} className="hover:text-foreground">{contact.phone}</a> : null}
            {contact.location ? <span className="flex items-center gap-1"><MapPinIcon size={11} />{contact.location}</span> : null}
          </div>
          <div className="relative flex items-center gap-2">
            {contact.socials?.slice(0, 4).map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noreferrer" aria-label={s.label ?? detectNetwork(s.url)} className="flex size-8 items-center justify-center rounded-lg bg-surface-overlay text-muted hover:text-foreground">
                <SocialIcon network={detectNetwork(s.url)} size={14} />
              </a>
            ))}
            <button type="button" onClick={() => setFlipped(true)} className="ml-auto rounded-lg px-2 py-1 font-mono text-[11px] text-accent hover:bg-accent-soft">
              QR ↻
            </button>
          </div>
        </div>
        {/* back */}
        <div className="absolute inset-0 flex items-center gap-5 rounded-3xl border border-border-strong bg-surface p-5 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="shrink-0 rounded-xl bg-white p-2 text-[#0b0c0e]">
            <QrCode value={vcf} size={128} level="L" margin={1} />
          </div>
          <div className="flex min-w-0 flex-col gap-2 text-sm">
            <span className="font-medium">Scan to save</span>
            <span className="text-xs text-subtle">Point your phone camera at the code to add {contact.name.split(" ")[0]} to Contacts.</span>
            <button type="button" onClick={() => setFlipped(false)} className="mt-1 w-fit font-mono text-[11px] text-accent">↺ flip back</button>
          </div>
        </div>
      </motion.div>
      <div className="mt-3 flex gap-2">
        <VCardButton contact={contact} className="flex-1" />
        <button type="button" onClick={() => void share()} aria-label="Share" className="flex size-10 items-center justify-center rounded-[10px] border border-border-strong text-muted hover:text-foreground">
          <ShareIcon size={16} />
        </button>
      </div>
    </div>
  );
}
