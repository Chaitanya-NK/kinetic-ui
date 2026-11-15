"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { ArrowRightIcon, ChatIcon, ChevronLeftIcon, XIcon } from "@kineticui/icons";

export type ContactWidgetProps = {
  host: { name: string; avatar?: React.ReactNode; role?: string };
  greeting?: string;
  /** Quick links shown on the home panel, e.g. email, book a call. */
  links?: { label: string; href: string; icon?: React.ReactNode; description?: string }[];
  onSubmit: (data: { email: string; message: string }) => Promise<void> | void;
  /** Pin to the viewport corner. Turn off to render inline (docs, previews). */
  fixed?: boolean;
  defaultOpen?: boolean;
  className?: string;
};

/** Floating "Message me" launcher that opens a compact panel: greeting, quick links and a two-field form. */
export function ContactWidget({ host, greeting = "Hi there! How can I help?", links = [], onSubmit, fixed = true, defaultOpen = false, className }: ContactWidgetProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [view, setView] = React.useState<"home" | "form" | "done">("home");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && message.trim().length > 3;

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className={cn("flex flex-col items-end gap-3", fixed && "fixed bottom-5 right-5 z-50", className)}>
      <AnimatePresence>
        {open ? (
          <motion.div
            role="dialog"
            aria-label={`Message ${host.name}`}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            style={{ transformOrigin: "bottom right" }}
            className="flex w-[min(360px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border border-border-strong bg-surface-raised shadow-overlay"
          >
            <div className="relative flex flex-col gap-3 bg-[linear-gradient(150deg,var(--kn-accent-soft),transparent)] p-5">
              {view !== "home" ? (
                <button type="button" aria-label="Back" onClick={() => setView("home")} className="absolute left-3 top-3 flex size-8 items-center justify-center rounded-full text-muted hover:bg-surface-overlay">
                  <ChevronLeftIcon size={16} />
                </button>
              ) : null}
              <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full text-muted hover:bg-surface-overlay">
                <XIcon size={16} />
              </button>
              <span className={cn("flex size-12 items-center justify-center overflow-hidden rounded-full bg-accent text-lg font-semibold text-accent-foreground", view !== "home" && "ml-8 size-9 text-sm")}>
                {host.avatar ?? host.name[0]}
              </span>
              {view === "home" ? (
                <div>
                  <div className="font-display text-xl font-semibold">{greeting}</div>
                  <div className="text-sm text-muted">{host.name}{host.role ? ` · ${host.role}` : ""}</div>
                </div>
              ) : null}
            </div>
            <AnimatePresence mode="wait" initial={false}>
              {view === "home" ? (
                <motion.div key="home" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="flex flex-col gap-2 p-3">
                  <button type="button" onClick={() => setView("form")} className="group flex items-center gap-3 rounded-2xl bg-accent p-4 text-left text-accent-foreground">
                    <ChatIcon size={18} />
                    <span className="flex-1 font-semibold">Send a message</span>
                    <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </button>
                  {links.map((l) => (
                    <a key={l.href} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="group flex items-center gap-3 rounded-2xl border border-border p-3.5 hover:bg-surface-overlay">
                      <span className="flex size-9 items-center justify-center rounded-xl bg-surface-overlay text-muted [&_svg]:size-4">{l.icon}</span>
                      <span className="flex flex-1 flex-col">
                        <span className="text-sm font-medium">{l.label}</span>
                        {l.description ? <span className="text-xs text-subtle">{l.description}</span> : null}
                      </span>
                      <ArrowRightIcon size={14} className="text-subtle transition-transform group-hover:translate-x-0.5" />
                    </a>
                  ))}
                </motion.div>
              ) : view === "form" ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  className="flex flex-col gap-2 p-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!valid) return;
                    setBusy(true);
                    try {
                      await onSubmit({ email, message });
                      setView("done");
                      setMessage("");
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" aria-label="Your email" autoFocus className="h-11 rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-accent" />
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="How can I help?" aria-label="Message" className="resize-none rounded-xl border border-border bg-background p-3.5 text-sm outline-none focus:border-accent" />
                  <button type="submit" disabled={!valid || busy} className="h-11 rounded-xl bg-accent text-sm font-semibold text-accent-foreground transition-opacity disabled:opacity-40">
                    {busy ? "Sending…" : "Send message"}
                  </button>
                </motion.form>
              ) : (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-2 p-8 text-center">
                  <span className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
                    </svg>
                  </span>
                  <span className="font-semibold">Message sent</span>
                  <span className="text-sm text-muted">{host.name.split(" ")[0]} will reply to {email}.</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <motion.button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close contact panel" : `Message ${host.name}`}
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.92 }}
        className="relative flex h-14 items-center gap-2 rounded-full bg-accent pl-4 pr-5 font-semibold text-accent-foreground shadow-[0_12px_32px_-8px_var(--kn-ring)]"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={open ? "x" : "c"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
            {open ? <XIcon size={20} /> : <ChatIcon size={20} />}
          </motion.span>
        </AnimatePresence>
        {open ? "Close" : "Message me"}
        {!open ? <span className="absolute -right-0.5 -top-0.5 size-3.5 rounded-full bg-success ring-2 ring-background" /> : null}
      </motion.button>
    </div>
  );
}
