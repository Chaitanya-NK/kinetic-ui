"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { CheckIcon } from "@kineticui/icons";

export type PinComment = { id: string; author: string; color?: string; text: string; time?: string };
export type PinThread = { id: string; x: number; y: number; comments: PinComment[]; resolved?: boolean };

export type CommentLayerProps = {
  threads: PinThread[];
  onThreadsChange: (threads: PinThread[]) => void;
  /** The current user, used for new comments. */
  me: { name: string; color?: string };
  /** When true, clicking empty space drops a new pin. */
  commenting?: boolean;
  children: React.ReactNode;
  className?: string;
};

const initials = (n: string) => n.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();

function Pin({ thread, active, onClick }: { thread: PinThread; active: boolean; onClick: () => void }) {
  const first = thread.comments[0];
  return (
    <button
      type="button"
      aria-label={`Comment by ${first?.author ?? "you"}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "flex size-8 -translate-y-full items-center justify-center rounded-full rounded-bl-none text-[11px] font-bold text-[#0b0c0e] shadow-lg ring-2 ring-background transition-transform hover:scale-110",
        active && "scale-110 ring-foreground",
        thread.resolved && "opacity-50",
      )}
      style={{ background: first?.color ?? "var(--kn-accent)" }}
    >
      {thread.resolved ? <CheckIcon size={14} strokeWidth={3} /> : first ? initials(first.author) : "+"}
      {thread.comments.length > 1 ? <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-foreground font-mono text-[9px] text-background">{thread.comments.length}</span> : null}
    </button>
  );
}

/** Figma-style comment pins: click to drop a pin, reply in a thread, resolve. Positions are 0–1 fractions. */
export function CommentLayer({ threads, onThreadsChange, me, commenting = true, children, className }: CommentLayerProps) {
  const [active, setActive] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");
  const thread = threads.find((t) => t.id === active);

  const post = () => {
    if (!draft.trim() || !thread) return;
    onThreadsChange(threads.map((t) => (t.id === thread.id ? { ...t, comments: [...t.comments, { id: `${Date.now()}`, author: me.name, color: me.color, text: draft.trim(), time: "now" }] } : t)));
    setDraft("");
  };

  return (
    <div
      className={cn("relative", commenting && "cursor-crosshair", className)}
      onClick={(e) => {
        if (active) {
          const t = threads.find((x) => x.id === active);
          if (t && !t.comments.length) onThreadsChange(threads.filter((x) => x.id !== active));
          setActive(null);
          return;
        }
        if (!commenting) return;
        const r = e.currentTarget.getBoundingClientRect();
        const id = `t${Date.now()}`;
        onThreadsChange([...threads, { id, x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, comments: [] }]);
        setActive(id);
        setDraft("");
      }}
    >
      {children}
      {threads.map((t) => (
        <div key={t.id} className="absolute z-10" style={{ left: `${t.x * 100}%`, top: `${t.y * 100}%` }}>
          <Pin thread={t} active={active === t.id} onClick={() => setActive(active === t.id ? null : t.id)} />
        </div>
      ))}
      <AnimatePresence>
        {thread ? (
          <motion.div
            key={thread.id}
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute z-20 w-72 cursor-default rounded-2xl border border-border-strong bg-surface-raised text-sm shadow-overlay"
            style={{
              left: thread.x > 0.6 ? undefined : `calc(${thread.x * 100}% + 40px)`,
              right: thread.x > 0.6 ? `calc(${(1 - thread.x) * 100}% + 12px)` : undefined,
              top: `calc(${thread.y * 100}% - 36px)`,
            }}
          >
            {thread.comments.length ? (
              <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                <span className="text-xs font-medium">Thread</span>
                <button
                  type="button"
                  onClick={() => onThreadsChange(threads.map((t) => (t.id === thread.id ? { ...t, resolved: !t.resolved } : t)))}
                  className="ml-auto flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted hover:bg-surface-overlay hover:text-foreground"
                >
                  <CheckIcon size={12} /> {thread.resolved ? "Reopen" : "Resolve"}
                </button>
              </div>
            ) : null}
            <div className="flex max-h-56 flex-col gap-3 overflow-y-auto p-3">
              {thread.comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-[#0b0c0e]" style={{ background: c.color ?? "var(--kn-accent)" }}>
                    {initials(c.author)}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs">
                      <span className="font-semibold">{c.author}</span> <span className="text-subtle">{c.time}</span>
                    </span>
                    <span className="text-muted">{c.text}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-border p-2">
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && post()}
                placeholder={thread.comments.length ? "Reply…" : "Add a comment…"}
                aria-label="Comment"
                className="h-8 flex-1 rounded-lg bg-background px-2.5 text-sm outline-none placeholder:text-subtle focus:ring-1 focus:ring-accent"
              />
              <button type="button" disabled={!draft.trim()} onClick={post} className="h-8 rounded-lg bg-accent px-3 text-xs font-semibold text-accent-foreground disabled:opacity-40">
                Post
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
