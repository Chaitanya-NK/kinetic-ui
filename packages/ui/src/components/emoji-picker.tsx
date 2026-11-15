"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { cn } from "@kineticui/core";
import { SearchIcon } from "@kineticui/icons";

/* Compact built-in set: [emoji, keywords]. Pass your own `emojis` for a full set. */
const DATA: Record<string, [string, string][]> = {
  Smileys: [["😀", "grin happy"], ["😄", "smile happy"], ["😂", "joy laugh tears"], ["🙂", "slight smile"], ["😉", "wink"], ["😍", "love heart eyes"], ["🥰", "love hearts"], ["😎", "cool sunglasses"], ["🤔", "thinking hmm"], ["😅", "sweat relief"], ["😭", "cry sob"], ["😡", "angry mad"], ["🥳", "party celebrate"], ["😴", "sleep tired"], ["🤯", "mind blown"], ["😬", "grimace awkward"], ["🙃", "upside down"], ["🤗", "hug"], ["😇", "angel innocent"], ["🫠", "melt"]],
  Gestures: [["👍", "thumbs up yes like"], ["👎", "thumbs down no"], ["👏", "clap applause"], ["🙌", "raise hands hooray"], ["🙏", "pray thanks please"], ["👋", "wave hi bye"], ["🤝", "handshake deal"], ["💪", "strong flex"], ["✌️", "peace victory"], ["🤞", "fingers crossed luck"], ["👀", "eyes look"], ["🫡", "salute"]],
  Hearts: [["❤️", "red heart love"], ["🧡", "orange heart"], ["💛", "yellow heart"], ["💚", "green heart"], ["💙", "blue heart"], ["💜", "purple heart"], ["🖤", "black heart"], ["🤍", "white heart"], ["💔", "broken heart"], ["💯", "hundred perfect"]],
  Objects: [["🔥", "fire lit hot"], ["✨", "sparkles magic"], ["🎉", "party tada"], ["🚀", "rocket launch ship"], ["💡", "idea bulb"], ["✅", "check done"], ["❌", "cross no"], ["⚠️", "warning"], ["📌", "pin"], ["📎", "paperclip"], ["🗓️", "calendar"], ["⏰", "alarm time"], ["💻", "laptop computer"], ["📱", "phone mobile"], ["☕", "coffee"], ["🎯", "target goal"], ["🏆", "trophy win"], ["🐛", "bug"], ["🔒", "lock secure"], ["📈", "chart up growth"]],
  Nature: [["🌱", "seedling grow"], ["🌸", "blossom flower"], ["🌈", "rainbow"], ["⭐", "star"], ["🌙", "moon night"], ["☀️", "sun"], ["⚡", "zap lightning"], ["🌊", "wave ocean"], ["🍀", "clover luck"], ["🐶", "dog"], ["🐱", "cat"], ["🦄", "unicorn"]],
};

const RECENT_KEY = "kn-emoji-recent";

export type EmojiPickerProps = {
  onSelect: (emoji: string) => void;
  /** Custom data: { Category: [[emoji, "keywords"], …] }. */
  emojis?: Record<string, [string, string][]>;
  /** Pop over a trigger element instead of rendering inline. */
  trigger?: React.ReactElement;
  className?: string;
};

function Panel({ onSelect, emojis, className, close }: { onSelect: (e: string) => void; emojis: Record<string, [string, string][]>; className?: string; close?: () => void }) {
  const [q, setQ] = React.useState("");
  const [recent, setRecent] = React.useState<string[]>([]);
  const [cat, setCat] = React.useState(Object.keys(emojis)[0]!);
  const [hover, setHover] = React.useState<[string, string] | null>(null);
  const scroller = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    try {
      setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  const pick = (e: string) => {
    onSelect(e);
    const next = [e, ...recent.filter((x) => x !== e)].slice(0, 16);
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    close?.();
  };

  const filtered: Record<string, [string, string][]> = q
    ? { Results: Object.values(emojis).flat().filter(([, k]) => k.includes(q.toLowerCase())) }
    : { ...(recent.length ? { Recent: recent.map((r) => [r, "recent"] as [string, string]) } : {}), ...emojis };

  return (
    <div className={cn("flex w-80 flex-col overflow-hidden rounded-2xl border border-border-strong bg-surface-raised", className)}>
      <div className="flex items-center gap-2 border-b border-border px-3">
        <SearchIcon size={15} className="text-subtle" />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search emoji" aria-label="Search emoji" className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-subtle" />
      </div>
      {!q ? (
        <div className="flex gap-1 border-b border-border px-2 py-1.5">
          {Object.keys(emojis).map((c) => (
            <button
              key={c}
              type="button"
              title={c}
              onClick={() => {
                setCat(c);
                scroller.current?.querySelector(`[data-cat="${c}"]`)?.scrollIntoView({ block: "start", behavior: "smooth" });
              }}
              className={cn("flex size-8 items-center justify-center rounded-lg text-lg transition-colors", cat === c ? "bg-surface-overlay" : "opacity-60 hover:opacity-100")}
            >
              {emojis[c]![0]![0]}
            </button>
          ))}
        </div>
      ) : null}
      <div ref={scroller} className="h-64 overflow-y-auto p-2">
        {Object.entries(filtered).map(([c, list]) => (
          <div key={c} data-cat={c}>
            <div className="sticky top-0 bg-surface-raised px-1 py-1.5 font-mono text-[10px] uppercase tracking-wider text-subtle">{c}</div>
            <div className="grid grid-cols-8 gap-0.5">
              {list.map(([e, k]) => (
                <button key={c + e} type="button" aria-label={k.split(" ")[0]} onMouseEnter={() => setHover([e, k])} onClick={() => pick(e)} className="flex aspect-square items-center justify-center rounded-lg text-[22px] transition-transform hover:scale-125 hover:bg-surface-overlay">
                  {e}
                </button>
              ))}
            </div>
          </div>
        ))}
        {q && !filtered.Results?.length ? <p className="py-10 text-center text-sm text-subtle">No emoji found</p> : null}
      </div>
      <div className="flex h-11 items-center gap-2 border-t border-border px-3 text-sm">
        {hover ? (
          <>
            <span className="text-2xl">{hover[0]}</span>
            <span className="text-muted">:{hover[1].split(" ")[0]}:</span>
          </>
        ) : (
          <span className="text-subtle">Pick an emoji</span>
        )}
      </div>
    </div>
  );
}

/** Searchable emoji picker with categories and remembered recents. Inline or in a popover. */
export function EmojiPicker({ onSelect, emojis = DATA, trigger, className }: EmojiPickerProps) {
  const [open, setOpen] = React.useState(false);
  if (!trigger) return <Panel onSelect={onSelect} emojis={emojis} className={className} />;
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content sideOffset={8} className="z-50 shadow-overlay outline-none data-[state=open]:animate-[kn-pop_0.15s_var(--ease-kn-out)]">
          <Panel onSelect={onSelect} emojis={emojis} className={className} close={() => setOpen(false)} />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export type ReactionBarProps = {
  reactions: { emoji: string; count: number; mine?: boolean }[];
  onToggle: (emoji: string) => void;
  className?: string;
};

/** Slack-style reaction chips with an add-reaction picker. */
export function ReactionBar({ reactions, onToggle, className }: ReactionBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {reactions.map((r) => (
        <button
          key={r.emoji}
          type="button"
          aria-pressed={!!r.mine}
          onClick={() => onToggle(r.emoji)}
          className={cn("flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-sm transition-colors", r.mine ? "border-accent/60 bg-accent-soft" : "border-border hover:border-border-strong")}
        >
          <span>{r.emoji}</span>
          <span className="font-mono text-xs">{r.count}</span>
        </button>
      ))}
      <EmojiPicker
        onSelect={onToggle}
        trigger={
          <button type="button" aria-label="Add reaction" className="flex h-7 items-center rounded-full border border-dashed border-border-strong px-2.5 text-sm text-subtle hover:text-foreground">
            +
            <svg viewBox="0 0 24 24" className="ml-1 size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
            </svg>
          </button>
        }
      />
    </div>
  );
}
