"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { ArrowLeftIcon, ArrowRightIcon, ExternalLinkIcon, GlobeIcon, MonitorIcon, RotateCwIcon, SmartphoneIcon, TabletIcon, TerminalIcon } from "@kineticui/icons";

export type WebPreviewLog = { level: "log" | "warn" | "error"; message: string; time?: string };

export type WebPreviewProps = {
  /** URL loaded in the iframe. Omit and pass children to render your own content. */
  url?: string;
  onUrlChange?: (url: string) => void;
  /** Lines shown in the console drawer, e.g. from a sandbox. */
  logs?: WebPreviewLog[];
  /** Show the loading shimmer, e.g. while an agent is building the page. */
  loading?: boolean;
  /** Allowed iframe capabilities. */
  sandbox?: string;
  height?: number | string;
  className?: string;
  children?: React.ReactNode;
};

const devices = [
  { id: "desktop", icon: MonitorIcon, width: "100%", label: "Desktop" },
  { id: "tablet", icon: TabletIcon, width: "768px", label: "Tablet" },
  { id: "mobile", icon: SmartphoneIcon, width: "390px", label: "Mobile" },
] as const;

/** Browser frame for previewing generated apps: address bar, history, device widths, reload and a console drawer. */
export function WebPreview({ url, onUrlChange, logs = [], loading = false, sandbox = "allow-scripts allow-same-origin allow-forms allow-popups", height = 520, className, children }: WebPreviewProps) {
  const [history, setHistory] = React.useState<string[]>(url ? [url] : []);
  const [pos, setPos] = React.useState(0);
  const [draft, setDraft] = React.useState(url ?? "");
  const [device, setDevice] = React.useState<(typeof devices)[number]["id"]>("desktop");
  const [nonce, setNonce] = React.useState(0);
  const [frameLoading, setFrameLoading] = React.useState(!!url);
  const [consoleOpen, setConsoleOpen] = React.useState(false);
  const current = history[pos] ?? url ?? "";

  // Custom children have no iframe load event, so finish the progress bar on a short timer.
  React.useEffect(() => {
    if (!children || !frameLoading) return;
    const t = setTimeout(() => setFrameLoading(false), 600);
    return () => clearTimeout(t);
  }, [children, frameLoading, nonce, pos]);

  React.useEffect(() => {
    if (!url || url === history[pos]) return;
    setHistory((h) => [...h.slice(0, pos + 1), url]);
    setPos((p) => p + 1);
    setDraft(url);
    setFrameLoading(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const navigate = (to: string) => {
    const next = /^https?:\/\//.test(to) || to.startsWith("/") ? to : `https://${to}`;
    setHistory((h) => [...h.slice(0, pos + 1), next]);
    setPos((p) => p + 1);
    setDraft(next);
    setFrameLoading(true);
    onUrlChange?.(next);
  };
  const step = (d: number) => {
    const n = pos + d;
    if (n < 0 || n >= history.length) return;
    setPos(n);
    setDraft(history[n]!);
    setFrameLoading(true);
    onUrlChange?.(history[n]!);
  };
  const errors = logs.filter((l) => l.level === "error").length;
  const busy = loading || frameLoading;
  const w = devices.find((d) => d.id === device)!.width;
  const btn = "flex size-8 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-surface-overlay hover:text-foreground disabled:opacity-30";

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-2xl border border-border bg-surface", className)}>
      <div className="flex items-center gap-1 border-b border-border px-2 py-2">
        <button type="button" className={btn} onClick={() => step(-1)} disabled={pos === 0} aria-label="Back"><ArrowLeftIcon size={15} /></button>
        <button type="button" className={btn} onClick={() => step(1)} disabled={pos >= history.length - 1} aria-label="Forward"><ArrowRightIcon size={15} /></button>
        <button type="button" className={btn} onClick={() => (setNonce((n) => n + 1), setFrameLoading(true))} aria-label="Reload">
          <motion.span animate={busy ? { rotate: 360 } : { rotate: 0 }} transition={busy ? { repeat: Infinity, duration: 0.9, ease: "linear" } : { duration: 0 }} className="flex"><RotateCwIcon size={15} /></motion.span>
        </button>
        <form
          className="relative mx-1 flex h-8 min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-lg border border-border bg-background px-3 focus-within:border-accent"
          onSubmit={(e) => {
            e.preventDefault();
            navigate(draft);
          }}
        >
          <GlobeIcon size={13} className="shrink-0 text-subtle" />
          <input value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="Address" spellCheck={false} className="min-w-0 flex-1 bg-transparent font-mono text-xs text-muted outline-none focus:text-foreground" />
          <AnimatePresence>
            {busy ? (
              <motion.span
                key="bar"
                initial={{ scaleX: 0, opacity: 1 }}
                animate={{ scaleX: 0.85 }}
                exit={{ scaleX: 1, opacity: 0 }}
                transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-accent"
              />
            ) : null}
          </AnimatePresence>
        </form>
        <div className="hidden items-center rounded-lg border border-border p-0.5 sm:flex" role="radiogroup" aria-label="Device width">
          {devices.map((d) => (
            <button
              key={d.id}
              type="button"
              role="radio"
              aria-checked={device === d.id}
              aria-label={d.label}
              onClick={() => setDevice(d.id)}
              className={cn("relative flex size-7 items-center justify-center rounded-md transition-colors", device === d.id ? "text-accent-foreground" : "text-subtle hover:text-foreground")}
            >
              {device === d.id ? <motion.span layoutId="kn-wp-device" className="absolute inset-0 rounded-md bg-accent" transition={{ type: "spring", stiffness: 500, damping: 36 }} /> : null}
              <d.icon size={14} className="relative" />
            </button>
          ))}
        </div>
        {current ? (
          <a href={current} target="_blank" rel="noreferrer" className={btn} aria-label="Open in new tab"><ExternalLinkIcon size={15} /></a>
        ) : null}
      </div>
      <div className="relative flex justify-center overflow-hidden bg-background/60 bg-[radial-gradient(var(--kn-border)_1px,transparent_1px)] [background-size:16px_16px]" style={{ height }}>
        <motion.div layout transition={{ type: "spring", stiffness: 260, damping: 32 }} style={{ width: w, maxWidth: "100%" }} className={cn("relative h-full bg-background", device !== "desktop" && "my-3 h-[calc(100%-24px)] overflow-hidden rounded-xl border border-border-strong shadow-overlay")}>
          {children ?? (current ? <iframe key={`${current}-${nonce}`} src={current} title="Preview" sandbox={sandbox} onLoad={() => setFrameLoading(false)} className="size-full bg-white" /> : null)}
          <AnimatePresence>
            {loading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col gap-3 bg-background p-6">
                {[40, 90, 70, 100, 55].map((wd, i) => (
                  <span key={i} style={{ width: `${wd}%`, animationDelay: `${i * 0.12}s` }} className={cn("rounded-lg bg-surface-raised", i === 0 ? "h-8" : i === 3 ? "h-32" : "h-4", "animate-pulse")} />
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>
      <div className="border-t border-border">
        <button type="button" onClick={() => setConsoleOpen((o) => !o)} aria-expanded={consoleOpen} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-subtle transition-colors hover:text-foreground">
          <TerminalIcon size={13} /> Console
          <span className="font-mono">{logs.length}</span>
          {errors ? <span className="rounded-full bg-danger-soft px-1.5 font-mono text-[10px] text-danger">{errors} error{errors > 1 ? "s" : ""}</span> : null}
        </button>
        <AnimatePresence initial={false}>
          {consoleOpen ? (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
              <div className="max-h-40 overflow-auto border-t border-border bg-background px-3 py-2 font-mono text-[11px] leading-5">
                {logs.length === 0 ? <span className="text-subtle">No output yet.</span> : null}
                {logs.map((l, i) => (
                  <div key={i} className={cn("flex gap-3", l.level === "error" ? "text-danger" : l.level === "warn" ? "text-warning" : "text-muted")}>
                    {l.time ? <span className="text-subtle">{l.time}</span> : null}
                    <span className="whitespace-pre-wrap break-all">{l.message}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
