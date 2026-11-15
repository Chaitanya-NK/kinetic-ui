"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { MoreVerticalIcon } from "@kineticui/icons";
import { ReactionBar } from "./emoji-picker";

export type ThreadUser = { id: string; name: string; color?: string };
export type ThreadComment = {
  id: string;
  author: ThreadUser;
  body: string;
  time: string;
  reactions?: { emoji: string; count: number; mine?: boolean }[];
  replies?: ThreadComment[];
  edited?: boolean;
};

export type CommentThreadProps = {
  comments: ThreadComment[];
  onChange: (comments: ThreadComment[]) => void;
  me: ThreadUser;
  /** People who can be @mentioned. */
  people?: ThreadUser[];
  className?: string;
};

const initials = (n: string) => n.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
const uid = () => Math.random().toString(36).slice(2, 9);

function Body({ text }: { text: string }) {
  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed">
      {text.split(/(@[\w.-]+)/g).map((p, i) => (p.startsWith("@") ? <span key={i} className="rounded bg-accent-soft px-1 font-medium text-accent">{p}</span> : p))}
    </p>
  );
}

function Composer({ me, people, onSubmit, placeholder, autoFocus, onCancel }: { me: ThreadUser; people: ThreadUser[]; onSubmit: (t: string) => void; placeholder: string; autoFocus?: boolean; onCancel?: () => void }) {
  const [text, setText] = React.useState("");
  const [query, setQuery] = React.useState<string | null>(null);
  const [active, setActive] = React.useState(0);
  const ta = React.useRef<HTMLTextAreaElement>(null);
  const matches = query !== null ? people.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5) : [];

  const insert = (p: ThreadUser) => {
    const el = ta.current!;
    const before = el.value.slice(0, el.selectionStart).replace(/@[\w.-]*$/, `@${p.name.split(" ")[0]} `);
    setText(before + el.value.slice(el.selectionStart));
    setQuery(null);
    requestAnimationFrame(() => el.setSelectionRange(before.length, before.length));
  };
  const send = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText("");
  };

  return (
    <div className="relative flex gap-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-[#0b0c0e]" style={{ background: me.color ?? "var(--kn-accent)" }}>{initials(me.name)}</span>
      <div className="flex flex-1 flex-col gap-2 rounded-xl border border-border bg-background p-2 focus-within:border-accent">
        <textarea
          ref={ta}
          rows={2}
          autoFocus={autoFocus}
          value={text}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={(e) => {
            setText(e.target.value);
            const m = /@([\w.-]*)$/.exec(e.target.value.slice(0, e.target.selectionStart));
            setQuery(m ? m[1]! : null);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (matches.length) {
              if (e.key === "ArrowDown") return (e.preventDefault(), setActive((a) => (a + 1) % matches.length));
              if (e.key === "ArrowUp") return (e.preventDefault(), setActive((a) => (a - 1 + matches.length) % matches.length));
              if (e.key === "Enter" || e.key === "Tab") return (e.preventDefault(), insert(matches[active]!));
              if (e.key === "Escape") return setQuery(null);
            }
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
            if (e.key === "Escape") onCancel?.();
          }}
          className="resize-none bg-transparent px-1 text-sm outline-none placeholder:text-subtle"
        />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-subtle">@ to mention · ⌘↵ to send</span>
          <div className="flex gap-1">
            {onCancel ? <button type="button" onClick={onCancel} className="h-7 rounded-md px-2.5 text-xs text-muted hover:text-foreground">Cancel</button> : null}
            <button type="button" disabled={!text.trim()} onClick={send} className="h-7 rounded-md bg-accent px-3 text-xs font-semibold text-accent-foreground disabled:opacity-40">Send</button>
          </div>
        </div>
      </div>
      {matches.length ? (
        <ul role="listbox" className="absolute bottom-full left-10 z-20 mb-1 w-56 rounded-xl border border-border-strong bg-surface-raised p-1 shadow-overlay">
          {matches.map((p, i) => (
            <li key={p.id} role="option" aria-selected={i === active}>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); insert(p); }} className={cn("flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm", i === active && "bg-surface-overlay")}>
                <span className="flex size-6 items-center justify-center rounded-full text-[9px] font-bold text-[#0b0c0e]" style={{ background: p.color ?? "var(--kn-muted)" }}>{initials(p.name)}</span>
                {p.name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** Threaded comments: replies, @mentions with autocomplete, emoji reactions, edit/delete and collapsible threads. */
export function CommentThread({ comments, onChange, me, people = [], className }: CommentThreadProps) {
  const [replyTo, setReplyTo] = React.useState<string | null>(null);
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set());

  const mapTree = (list: ThreadComment[], fn: (c: ThreadComment) => ThreadComment | null): ThreadComment[] =>
    list.flatMap((c) => {
      const n = fn(c);
      return n ? [{ ...n, replies: n.replies ? mapTree(n.replies, fn) : n.replies }] : [];
    });

  const react = (id: string, emoji: string) =>
    onChange(
      mapTree(comments, (c) => {
        if (c.id !== id) return c;
        const rs = c.reactions ?? [];
        const r = rs.find((x) => x.emoji === emoji);
        const next = r ? rs.map((x) => (x.emoji === emoji ? { ...x, mine: !x.mine, count: x.count + (x.mine ? -1 : 1) } : x)).filter((x) => x.count > 0) : [...rs, { emoji, count: 1, mine: true }];
        return { ...c, reactions: next };
      }),
    );

  const render = (c: ThreadComment, depth: number): React.ReactNode => {
    const kids = c.replies ?? [];
    const isCollapsed = collapsed.has(c.id);
    return (
      <motion.li key={c.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5">
        <div className="flex flex-col items-center">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-[#0b0c0e]" style={{ background: c.author.color ?? "var(--kn-muted)" }}>{initials(c.author.name)}</span>
          {kids.length && !isCollapsed ? (
            <button type="button" aria-label="Collapse thread" onClick={() => setCollapsed((s) => new Set(s).add(c.id))} className="group mt-1 flex w-4 flex-1 justify-center">
              <span className="w-0.5 rounded-full bg-border transition-colors group-hover:bg-accent" />
            </button>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 pb-3">
          <div className="group flex items-center gap-2 text-sm">
            <span className="font-semibold">{c.author.name}</span>
            <span className="text-xs text-subtle">{c.time}{c.edited ? " · edited" : ""}</span>
            {c.author.id === me.id ? (
              <button type="button" aria-label="Delete comment" onClick={() => onChange(mapTree(comments, (x) => (x.id === c.id ? null : x)))} className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                <MoreVerticalIcon size={14} className="text-subtle" />
              </button>
            ) : null}
          </div>
          <Body text={c.body} />
          <div className="flex flex-wrap items-center gap-3">
            <ReactionBar reactions={c.reactions ?? []} onToggle={(e) => react(c.id, e)} />
            {depth < 3 ? <button type="button" onClick={() => setReplyTo(replyTo === c.id ? null : c.id)} className="text-xs font-medium text-muted hover:text-foreground">Reply</button> : null}
            {kids.length && isCollapsed ? (
              <button type="button" onClick={() => setCollapsed((s) => { const n = new Set(s); n.delete(c.id); return n; })} className="text-xs text-accent">
                Show {kids.length} {kids.length === 1 ? "reply" : "replies"}
              </button>
            ) : null}
          </div>
          <AnimatePresence>
            {replyTo === c.id ? (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-2 overflow-visible">
                <Composer
                  me={me}
                  people={people}
                  autoFocus
                  placeholder={`Reply to ${c.author.name.split(" ")[0]}…`}
                  onCancel={() => setReplyTo(null)}
                  onSubmit={(t) => {
                    onChange(mapTree(comments, (x) => (x.id === c.id ? { ...x, replies: [...(x.replies ?? []), { id: uid(), author: me, body: t, time: "now" }] } : x)));
                    setReplyTo(null);
                  }}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
          {kids.length && !isCollapsed ? <ul className="mt-3 flex flex-col">{kids.map((k) => render(k, depth + 1))}</ul> : null}
        </div>
      </motion.li>
    );
  };

  const count = (l: ThreadComment[]): number => l.reduce((a, c) => a + 1 + count(c.replies ?? []), 0);

  return (
    <div className={cn("flex w-full max-w-2xl flex-col gap-5", className)}>
      <div className="text-sm font-semibold">{count(comments)} comments</div>
      <Composer me={me} people={people} placeholder="Add a comment…" onSubmit={(t) => onChange([...comments, { id: uid(), author: me, body: t, time: "now" }])} />
      <ul className="flex flex-col">{comments.map((c) => render(c, 0))}</ul>
    </div>
  );
}
