"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { ArrowDownIcon } from "@kineticui/icons";

type Ctx = { atBottom: boolean; scrollToBottom: (smooth?: boolean) => void; unread: number };
const ConversationCtx = React.createContext<Ctx | null>(null);
/** Read the conversation's scroll state from any child, e.g. to build your own jump button. */
export const useConversation = () => React.useContext(ConversationCtx);

export type ConversationProps = {
  /** Stick to the bottom while content grows (streaming). Scrolling up releases it. */
  stickToBottom?: boolean;
  /** Show the floating "jump to latest" button when scrolled up. */
  showScrollButton?: boolean;
  /** Distance in px from the bottom that still counts as "at the bottom". */
  threshold?: number;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
  "aria-label"?: string;
};

/**
 * Scroll container for chat. Follows the stream while you're at the bottom, lets go the moment you scroll up,
 * and shows a "jump to latest" pill with a count of new messages.
 */
export function Conversation({ stickToBottom = true, showScrollButton = true, threshold = 72, className, contentClassName, children, "aria-label": label = "Conversation" }: ConversationProps) {
  const scroller = React.useRef<HTMLDivElement>(null);
  const content = React.useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = React.useState(true);
  const pinned = React.useRef(true);
  const [unread, setUnread] = React.useState(0);
  const lastCount = React.useRef(0);

  const scrollToBottom = React.useCallback((smooth = true) => {
    const el = scroller.current;
    if (!el) return;
    pinned.current = true;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    setUnread(0);
  }, []);

  // Track the user's position. Only a scroll *up* releases the pin, so programmatic scrolls don't fight the stream.
  React.useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let lastTop = el.scrollTop;
    const onScroll = () => {
      const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
      const bottom = dist <= threshold;
      if (el.scrollTop < lastTop - 2 && !bottom) pinned.current = false;
      if (bottom) {
        pinned.current = true;
        setUnread(0);
      }
      lastTop = el.scrollTop;
      setAtBottom(bottom);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [threshold]);

  // Follow growth (new messages and streamed tokens).
  React.useEffect(() => {
    const el = scroller.current, c = content.current;
    if (!el || !c) return;
    const ro = new ResizeObserver(() => {
      if (stickToBottom && pinned.current) el.scrollTop = el.scrollHeight;
      const count = c.childElementCount;
      if (count > lastCount.current && !pinned.current) setUnread((u) => u + (count - lastCount.current));
      lastCount.current = count;
    });
    ro.observe(c);
    lastCount.current = c.childElementCount;
    el.scrollTop = el.scrollHeight;
    return () => ro.disconnect();
  }, [stickToBottom]);

  return (
    <ConversationCtx.Provider value={{ atBottom, scrollToBottom, unread }}>
      <div className={cn("relative min-h-0 flex-1", className)}>
        <div
          ref={scroller}
          role="log"
          aria-label={label}
          aria-live="polite"
          tabIndex={0}
          className="size-full overflow-y-auto overscroll-contain outline-none [scrollbar-color:var(--kn-border-strong)_transparent] [scrollbar-width:thin]"
        >
          <div ref={content} className={cn("flex flex-col gap-6 p-4", contentClassName)}>
            {children}
          </div>
        </div>
        {showScrollButton ? <ConversationScrollButton /> : null}
      </div>
    </ConversationCtx.Provider>
  );
}

export function ConversationScrollButton({ className }: { className?: string }) {
  const ctx = useConversation();
  if (!ctx) return null;
  return (
    <AnimatePresence>
      {!ctx.atBottom ? (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          onClick={() => ctx.scrollToBottom()}
          aria-label="Jump to latest message"
          className={cn(
            "absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border-strong bg-surface-raised/95 py-1.5 pl-2 pr-3.5 text-xs font-medium shadow-overlay backdrop-blur transition-colors hover:border-accent",
            className,
          )}
        >
          <span className="flex size-6 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <ArrowDownIcon size={13} strokeWidth={2.5} />
          </span>
          {ctx.unread > 0 ? `${ctx.unread} new` : "Latest"}
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}

export type ConversationEmptyProps = {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Starter prompts shown as cards. */
  suggestions?: { title: string; prompt: string }[];
  onSuggestion?: (prompt: string) => void;
  className?: string;
};

/** Empty state for a new chat, with animated starter prompts. */
export function ConversationEmpty({ icon, title = "How can I help?", description, suggestions = [], onSuggestion, className }: ConversationEmptyProps) {
  return (
    <div className={cn("flex flex-1 flex-col items-center justify-center gap-6 py-10 text-center", className)}>
      {icon ? (
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground [&_svg]:size-6">
          {icon}
        </motion.div>
      ) : null}
      <div className="flex flex-col gap-1.5">
        <motion.h3 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="font-display text-2xl font-semibold tracking-tight">{title}</motion.h3>
        {description ? <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-sm text-muted">{description}</motion.p> : null}
      </div>
      {suggestions.length ? (
        <div className="grid w-full max-w-lg gap-2 sm:grid-cols-2">
          {suggestions.map((s, i) => (
            <motion.button
              key={s.title}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              whileHover={{ y: -2 }}
              onClick={() => onSuggestion?.(s.prompt)}
              className="flex flex-col gap-0.5 rounded-xl border border-border bg-surface p-3 text-left text-sm transition-colors hover:border-accent/60"
            >
              <span className="font-medium">{s.title}</span>
              <span className="truncate text-xs text-subtle">{s.prompt}</span>
            </motion.button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
