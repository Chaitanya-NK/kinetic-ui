"use client";

import * as React from "react";
import { cn, useControllableState } from "@kineticui/core";

/* Small, safe Markdown → React renderer (no HTML injection). Covers headings, emphasis, code,
   links, lists, task lists, quotes, rules and fenced code. */

function inline(text: string, key = 0): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|~~[^~]+~~|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    const k = `${key}-${i++}`;
    if (t.startsWith("`")) out.push(<code key={k} className="rounded bg-surface-overlay px-1.5 py-0.5 font-mono text-[0.85em]">{t.slice(1, -1)}</code>);
    else if (t.startsWith("**") || t.startsWith("__")) out.push(<strong key={k} className="font-semibold">{inline(t.slice(2, -2), i)}</strong>);
    else if (t.startsWith("~~")) out.push(<s key={k}>{t.slice(2, -2)}</s>);
    else if (t.startsWith("[")) {
      const [, label, href] = /\[([^\]]+)\]\(([^)]+)\)/.exec(t)!;
      const safe = /^(https?:|mailto:|\/|#)/.test(href!) ? href : "#";
      out.push(<a key={k} href={safe} className="text-accent underline underline-offset-2" target="_blank" rel="noreferrer">{label}</a>);
    } else out.push(<em key={k}>{inline(t.slice(1, -1), i)}</em>);
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ children, className }: { children: string; className?: string }) {
  const lines = children.replace(/\r/g, "").split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i]!;
    if (l.startsWith("```")) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i]!.startsWith("```")) body.push(lines[i++]!);
      i++;
      blocks.push(<pre key={i} className="overflow-x-auto rounded-xl bg-background p-3 font-mono text-[13px] leading-relaxed">{body.join("\n")}</pre>);
      continue;
    }
    const h = /^(#{1,4})\s+(.*)/.exec(l);
    if (h) {
      const lvl = h[1]!.length;
      const cls = ["", "text-2xl", "text-xl", "text-lg", "text-base"][lvl];
      blocks.push(React.createElement(`h${lvl}`, { key: i, className: cn("font-display font-semibold tracking-tight", cls) }, inline(h[2]!, i)));
      i++;
      continue;
    }
    if (/^(-{3,}|\*{3,})$/.test(l.trim())) {
      blocks.push(<hr key={i} className="border-border" />);
      i++;
      continue;
    }
    if (l.startsWith(">")) {
      const body: string[] = [];
      while (i < lines.length && lines[i]!.startsWith(">")) body.push(lines[i++]!.replace(/^>\s?/, ""));
      blocks.push(<blockquote key={i} className="border-l-2 border-accent pl-4 text-muted">{inline(body.join(" "), i)}</blockquote>);
      continue;
    }
    if (/^\s*([-*+]|\d+\.)\s/.test(l)) {
      const ordered = /^\s*\d+\./.test(l);
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*+]|\d+\.)\s/.test(lines[i]!)) items.push(lines[i++]!.replace(/^\s*([-*+]|\d+\.)\s/, ""));
      const Tag = ordered ? "ol" : "ul";
      blocks.push(
        <Tag key={i} className={cn("flex flex-col gap-1 pl-6", ordered ? "list-decimal" : "list-disc", "marker:text-subtle")}>
          {items.map((it, j) => {
            const task = /^\[( |x)\]\s(.*)/i.exec(it);
            return task ? (
              <li key={j} className="-ml-6 flex list-none items-center gap-2">
                <input type="checkbox" readOnly checked={task[1] !== " "} className="accent-[var(--kn-accent)]" />
                <span className={task[1] !== " " ? "text-muted line-through" : ""}>{inline(task[2]!, j)}</span>
              </li>
            ) : (
              <li key={j}>{inline(it, j)}</li>
            );
          })}
        </Tag>,
      );
      continue;
    }
    if (!l.trim()) {
      i++;
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i]!.trim() && !/^(#|>|```|\s*([-*+]|\d+\.)\s)/.test(lines[i]!)) para.push(lines[i++]!);
    blocks.push(<p key={i}>{inline(para.join(" "), i)}</p>);
  }
  return <div className={cn("flex flex-col gap-3 text-[15px] leading-relaxed", className)}>{blocks}</div>;
}

export type MarkdownEditorProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** split: side by side. tabs: Write / Preview. */
  layout?: "split" | "tabs";
  height?: number;
  placeholder?: string;
  className?: string;
};

const wrap = (el: HTMLTextAreaElement, before: string, after = before, fallback = "text") => {
  const { selectionStart: s, selectionEnd: e, value } = el;
  const sel = value.slice(s, e) || fallback;
  const next = value.slice(0, s) + before + sel + after + value.slice(e);
  return { next, start: s + before.length, end: s + before.length + sel.length };
};

/** Markdown editor with toolbar, shortcuts and a live, safe preview. */
export function MarkdownEditor({ value, defaultValue = "", onValueChange, layout = "split", height = 360, placeholder = "Write in Markdown…", className }: MarkdownEditorProps) {
  const [text, setText] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const [tab, setTab] = React.useState<"write" | "preview">("write");
  const ta = React.useRef<HTMLTextAreaElement>(null);

  const apply = (before: string, after?: string, fallback?: string) => {
    const el = ta.current;
    if (!el) return;
    const r = wrap(el, before, after, fallback);
    setText(r.next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(r.start, r.end);
    });
  };
  const linePrefix = (prefix: string) => {
    const el = ta.current;
    if (!el) return;
    const start = el.value.lastIndexOf("\n", el.selectionStart - 1) + 1;
    setText(el.value.slice(0, start) + prefix + el.value.slice(start));
    requestAnimationFrame(() => el.focus());
  };

  const toolbar = [
    { l: "B", t: "Bold", f: () => apply("**", "**", "bold") },
    { l: "I", t: "Italic", f: () => apply("_", "_", "italic") },
    { l: "H", t: "Heading", f: () => linePrefix("## ") },
    { l: "“", t: "Quote", f: () => linePrefix("> ") },
    { l: "•", t: "List", f: () => linePrefix("- ") },
    { l: "☐", t: "Task", f: () => linePrefix("- [ ] ") },
    { l: "</>", t: "Code", f: () => apply("`", "`", "code") },
    { l: "[]()", t: "Link", f: () => apply("[", "](https://)", "link") },
  ];

  const editor = (
    <textarea
      ref={ta}
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder={placeholder}
      spellCheck
      aria-label="Markdown"
      onKeyDown={(e) => {
        if (e.metaKey || e.ctrlKey) {
          if (e.key === "b") (e.preventDefault(), apply("**", "**", "bold"));
          if (e.key === "i") (e.preventDefault(), apply("_", "_", "italic"));
          if (e.key === "k") (e.preventDefault(), apply("[", "](https://)", "link"));
        }
        if (e.key === "Tab") {
          e.preventDefault();
          apply("  ", "", "");
        }
      }}
      className="h-full w-full resize-none bg-transparent p-4 font-mono text-[13.5px] leading-relaxed outline-none placeholder:text-subtle"
    />
  );
  const preview = <div className="h-full overflow-y-auto p-4">{text.trim() ? <Markdown>{text}</Markdown> : <p className="text-subtle">Nothing to preview yet.</p>}</div>;

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-2xl border border-border bg-surface", className)}>
      <div className="flex items-center gap-0.5 border-b border-border bg-surface-raised/50 p-1.5">
        {layout === "tabs"
          ? (["write", "preview"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)} className={cn("h-8 rounded-lg px-3 text-sm capitalize", tab === t ? "bg-surface-overlay text-foreground" : "text-subtle hover:text-foreground")}>
                {t}
              </button>
            ))
          : null}
        {layout === "tabs" ? <span className="mx-1 h-5 w-px bg-border" /> : null}
        {toolbar.map((b) => (
          <button key={b.t} type="button" title={b.t} aria-label={b.t} disabled={layout === "tabs" && tab === "preview"} onClick={b.f} className="flex h-8 min-w-8 items-center justify-center rounded-lg px-1.5 font-mono text-xs text-muted hover:bg-surface-overlay hover:text-foreground disabled:opacity-30">
            {b.l}
          </button>
        ))}
        <span className="ml-auto pr-2 font-mono text-[10px] text-subtle">Markdown</span>
      </div>
      <div style={{ height }} className={cn(layout === "split" && "grid grid-cols-1 divide-border md:grid-cols-2 md:divide-x")}>
        {layout === "split" ? (
          <>
            {editor}
            <div className="hidden md:block">{preview}</div>
          </>
        ) : tab === "write" ? (
          editor
        ) : (
          preview
        )}
      </div>
    </div>
  );
}
