"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, CodeIcon, CopyIcon, DownloadIcon, EyeIcon, MaximizeIcon, MinimizeIcon, XIcon } from "@kineticui/icons";

export type ArtifactVersion = {
  id: string;
  /** Shown in the version switcher, e.g. "Added dark mode". */
  label?: string;
  /** Rendered in the Preview tab. */
  preview?: React.ReactNode;
  /** Raw source shown in the Code tab and used by copy / download. */
  code?: string;
  /** Rendered in the Code tab instead of plain <pre>, e.g. <CodeBlock />. */
  codeView?: React.ReactNode;
};

export type ArtifactPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  /** e.g. "React component" or "Document". */
  kind?: React.ReactNode;
  icon?: React.ReactNode;
  versions: ArtifactVersion[];
  /** True while the latest version is still being generated. */
  generating?: boolean;
  /** File name for downloads. */
  filename?: string;
  /** Extra buttons in the header. */
  actions?: React.ReactNode;
  /** Slide in beside the chat (side) or float over it (overlay). */
  variant?: "side" | "overlay";
  className?: string;
};

/**
 * The side canvas next to a chat where generated documents, code and apps live (like Claude artifacts):
 * preview / code tabs, version history, copy, download and full screen.
 */
export function ArtifactPanel({ open, onOpenChange, title, kind, icon, versions, generating, filename = "artifact.txt", actions, variant = "side", className }: ArtifactPanelProps) {
  const [v, setV] = React.useState(versions.length - 1);
  const [tab, setTab] = React.useState<"preview" | "code">("preview");
  const [copied, setCopied] = React.useState(false);
  const [full, setFull] = React.useState(false);
  const prevLen = React.useRef(versions.length);
  React.useEffect(() => {
    if (versions.length !== prevLen.current) setV(versions.length - 1);
    prevLen.current = versions.length;
  }, [versions.length]);
  const cur = versions[Math.min(v, versions.length - 1)];

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") full ? setFull(false) : onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, full, onOpenChange]);

  const copy = async () => {
    if (!cur?.code) return;
    try {
      await navigator.clipboard.writeText(cur.code);
    } catch {
      /* clipboard blocked */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  const download = () => {
    if (!cur?.code) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([cur.code], { type: "text/plain" }));
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const btn = "flex size-8 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-surface-overlay hover:text-foreground disabled:opacity-30";

  return (
    <AnimatePresence>
      {open ? (
        <motion.aside
          key="artifact"
          aria-label="Artifact"
          initial={variant === "side" ? { opacity: 0, x: 40 } : { opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, x: 0, scale: 1, y: 0 }}
          exit={variant === "side" ? { opacity: 0, x: 40 } : { opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: "spring", stiffness: 340, damping: 34 }}
          className={cn(
            "flex min-h-0 flex-col overflow-hidden border border-border bg-surface",
            full ? "fixed inset-3 z-50 rounded-2xl shadow-overlay" : variant === "overlay" ? "absolute inset-3 z-20 rounded-2xl shadow-overlay" : "h-full rounded-2xl",
            className,
          )}
        >
          <header className="flex items-center gap-3 border-b border-border px-3 py-2.5">
            {icon ? <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-foreground [&_svg]:size-4">{icon}</span> : null}
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-semibold">{title}</span>
              <span className="flex items-center gap-2 text-xs text-subtle">
                {kind}
                {generating ? (
                  <span className="flex items-center gap-1.5 text-accent">
                    <span className="size-1.5 animate-pulse rounded-full bg-accent" /> Generating
                  </span>
                ) : null}
              </span>
            </div>
            <div className="flex items-center rounded-lg border border-border p-0.5" role="tablist" aria-label="View">
              {(["preview", "code"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={cn("relative flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium capitalize transition-colors", tab === t ? "text-accent-foreground" : "text-subtle hover:text-foreground")}
                >
                  {tab === t ? <motion.span layoutId="kn-artifact-tab" className="absolute inset-0 rounded-md bg-accent" transition={{ type: "spring", stiffness: 500, damping: 36 }} /> : null}
                  <span className="relative flex items-center gap-1.5">{t === "preview" ? <EyeIcon size={13} /> : <CodeIcon size={13} />}{t}</span>
                </button>
              ))}
            </div>
            <button type="button" className={btn} onClick={() => setFull((f) => !f)} aria-label={full ? "Exit full screen" : "Full screen"}>{full ? <MinimizeIcon size={15} /> : <MaximizeIcon size={15} />}</button>
            <button type="button" className={btn} onClick={() => onOpenChange(false)} aria-label="Close"><XIcon size={15} /></button>
          </header>

          <div className="relative min-h-0 flex-1 overflow-auto">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={`${tab}-${cur?.id}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.16 }} className="min-h-full">
                {tab === "preview" ? (
                  cur?.preview ?? <div className="p-6 text-sm text-subtle">No preview for this artifact.</div>
                ) : (
                  cur?.codeView ?? <pre className="min-h-full whitespace-pre-wrap p-4 font-mono text-[12px] leading-6 text-muted">{cur?.code}</pre>
                )}
              </motion.div>
            </AnimatePresence>
            {generating ? <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface to-transparent" /> : null}
          </div>

          <footer className="flex items-center gap-2 border-t border-border px-3 py-2">
            {versions.length > 1 ? (
              <div className="flex min-w-0 items-center gap-1 text-xs text-subtle">
                <button type="button" className={btn} onClick={() => setV((x) => Math.max(0, x - 1))} disabled={v === 0} aria-label="Previous version"><ChevronLeftIcon size={14} /></button>
                <span className="font-mono tabular-nums text-foreground">v{v + 1}</span>
                <span className="font-mono">/ {versions.length}</span>
                <button type="button" className={btn} onClick={() => setV((x) => Math.min(versions.length - 1, x + 1))} disabled={v === versions.length - 1} aria-label="Next version"><ChevronRightIcon size={14} /></button>
                {cur?.label ? <span className="truncate pl-1">{cur.label}</span> : null}
              </div>
            ) : (
              <span className="text-xs text-subtle">{cur?.label}</span>
            )}
            <div className="ml-auto flex items-center gap-1">
              {actions}
              <button type="button" onClick={copy} disabled={!cur?.code} className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted transition-colors hover:bg-surface-overlay hover:text-foreground disabled:opacity-30">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={copied ? "y" : "n"} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="flex">
                    {copied ? <CheckIcon size={14} className="text-success" /> : <CopyIcon size={14} />}
                  </motion.span>
                </AnimatePresence>
                {copied ? "Copied" : "Copy"}
              </button>
              <button type="button" onClick={download} disabled={!cur?.code} className="flex h-8 items-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-semibold text-accent-foreground transition-[filter] hover:brightness-105 disabled:opacity-40">
                <DownloadIcon size={14} /> Download
              </button>
            </div>
          </footer>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
