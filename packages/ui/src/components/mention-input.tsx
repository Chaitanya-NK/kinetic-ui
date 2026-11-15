"use client";

import * as React from "react";
import { cn } from "@kineticui/core";

export type MentionUser = { id: string; name: string; description?: string; color?: string };

export type MentionInputProps = {
  users: MentionUser[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  /** Character that opens the list. */
  trigger?: string;
  rows?: number;
  className?: string;
  "aria-label"?: string;
};

/** Textarea where typing @ opens a people picker. Mentions are inserted as "@Full Name". */
export function MentionInput({
  users,
  value,
  onValueChange,
  placeholder = "Write a comment… use @ to mention",
  trigger = "@",
  rows = 3,
  className,
  ...rest
}: MentionInputProps) {
  const [internal, setInternal] = React.useState("");
  const text = value ?? internal;
  const [query, setQuery] = React.useState<string | null>(null);
  const [anchor, setAnchor] = React.useState(0);
  const [active, setActive] = React.useState(0);
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const id = React.useId();

  const set = (v: string) => {
    if (value === undefined) setInternal(v);
    onValueChange?.(v);
  };

  const matches = query === null ? [] : users.filter((u) => u.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6);

  const detect = (v: string, caret: number) => {
    const before = v.slice(0, caret);
    const at = before.lastIndexOf(trigger);
    if (at >= 0 && (at === 0 || /\s/.test(before[at - 1]!)) && !/\s/.test(before.slice(at + 1))) {
      setQuery(before.slice(at + 1));
      setAnchor(at);
      setActive(0);
    } else setQuery(null);
  };

  const insert = (u: MentionUser) => {
    const caret = ref.current?.selectionStart ?? text.length;
    const next = `${text.slice(0, anchor)}${trigger}${u.name} ${text.slice(caret)}`;
    set(next);
    setQuery(null);
    requestAnimationFrame(() => {
      const pos = anchor + u.name.length + 2;
      ref.current?.setSelectionRange(pos, pos);
      ref.current?.focus();
    });
  };

  return (
    <div className={cn("relative w-full", className)}>
      <textarea
        ref={ref}
        rows={rows}
        value={text}
        placeholder={placeholder}
        aria-label={rest["aria-label"] ?? "Message"}
        aria-controls={query !== null ? `${id}-list` : undefined}
        onChange={(e) => {
          set(e.target.value);
          detect(e.target.value, e.target.selectionStart);
        }}
        onKeyDown={(e) => {
          if (query === null || !matches.length) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => (a + 1) % matches.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => (a - 1 + matches.length) % matches.length);
          } else if (e.key === "Enter" || e.key === "Tab") {
            e.preventDefault();
            insert(matches[active]!);
          } else if (e.key === "Escape") setQuery(null);
        }}
        onBlur={() => setTimeout(() => setQuery(null), 120)}
        className="w-full resize-none rounded-xl border border-border bg-background px-3.5 py-3 text-sm leading-relaxed text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-subtle focus:border-accent focus:shadow-[0_0_0_4px_var(--kn-ring)]"
      />
      {query !== null && matches.length ? (
        <ul id={`${id}-list`} role="listbox" className="absolute left-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-border-strong bg-surface-raised p-1.5 shadow-overlay animate-[kn-pop_0.14s_ease-out]">
          {matches.map((u, i) => (
            <li
              key={u.id}
              role="option"
              aria-selected={i === active}
              onPointerDown={(e) => {
                e.preventDefault();
                insert(u);
              }}
              onPointerEnter={() => setActive(i)}
              className={cn("flex cursor-default items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm", i === active && "bg-surface-overlay")}
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-background" style={{ background: u.color ?? "var(--kn-info)" }}>
                {u.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
              </span>
              <span className="flex-1 text-foreground">{u.name}</span>
              {u.description ? <span className="text-xs text-subtle">{u.description}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
