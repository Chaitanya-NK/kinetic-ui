"use client";

import * as React from "react";
import { cn, useControllableState } from "@kineticui/core";
import { tokenize, type CodeFile } from "./code-block";

export type CodeEditorProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  language?: CodeFile["language"];
  /** Spaces per indent. */
  tabSize?: number;
  height?: number;
  readOnly?: boolean;
  /** Filename shown in the header. */
  filename?: string;
  className?: string;
};

const PAIRS: Record<string, string> = { "(": ")", "[": "]", "{": "}", '"': '"', "'": "'", "`": "`" };

/**
 * Small code editor: syntax highlighting, line numbers, active line, Tab/Shift+Tab indent,
 * auto-closing brackets and quotes, and Enter keeps indentation. No dependencies.
 */
export function CodeEditor({ value, defaultValue = "", onValueChange, language = "tsx", tabSize = 2, height = 320, readOnly, filename, className }: CodeEditorProps) {
  const [code, setCode] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const ta = React.useRef<HTMLTextAreaElement>(null);
  const pre = React.useRef<HTMLPreElement>(null);
  const gutter = React.useRef<HTMLDivElement>(null);
  const [line, setLine] = React.useState(0);
  const indent = " ".repeat(tabSize);
  const lines = code.split("\n");

  const tokens = React.useMemo(() => tokenize(code, language), [code, language]);

  const pendingSel = React.useRef<[number, number] | null>(null);
  // Restore the caret synchronously after React commits, before the next keystroke.
  React.useLayoutEffect(() => {
    if (pendingSel.current && ta.current) {
      ta.current.setSelectionRange(...pendingSel.current);
      pendingSel.current = null;
      updateLine();
    }
  });
  const edit = (next: string, start: number, end = start) => {
    pendingSel.current = [start, end];
    if (next === code && ta.current) {
      ta.current.setSelectionRange(start, end);
      pendingSel.current = null;
    } else setCode(next);
  };
  const updateLine = () => {
    const el = ta.current;
    if (el) setLine(el.value.slice(0, el.selectionStart).split("\n").length - 1);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const { selectionStart: s, selectionEnd: en, value: v } = el;
    if (e.key === "Tab") {
      e.preventDefault();
      const ls = v.lastIndexOf("\n", s - 1) + 1;
      if (e.shiftKey) {
        if (v.slice(ls, ls + tabSize) === indent) edit(v.slice(0, ls) + v.slice(ls + tabSize), Math.max(ls, s - tabSize));
      } else if (s !== en) {
        const block = v.slice(ls, en).split("\n").map((l) => indent + l).join("\n");
        edit(v.slice(0, ls) + block + v.slice(en), s + tabSize, ls + block.length);
      } else edit(v.slice(0, s) + indent + v.slice(en), s + tabSize);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const ls = v.lastIndexOf("\n", s - 1) + 1;
      const cur = /^\s*/.exec(v.slice(ls, s))![0];
      const opener = /[{[(]$/.test(v.slice(0, s).trimEnd());
      const closer = /^[}\])]/.test(v.slice(en));
      if (opener && closer) {
        const ins = `\n${cur}${indent}\n${cur}`;
        edit(v.slice(0, s) + ins + v.slice(en), s + cur.length + tabSize + 1);
      } else {
        const ins = `\n${cur}${opener ? indent : ""}`;
        edit(v.slice(0, s) + ins + v.slice(en), s + ins.length);
      }
    } else if (PAIRS[e.key] && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      const close = PAIRS[e.key]!;
      if ((e.key === close) && v[s] === close) return edit(v, s + 1);
      edit(v.slice(0, s) + e.key + v.slice(s, en) + close + v.slice(en), s + 1, en + 1);
    } else if (/^[)\]}]$/.test(e.key) && v[s] === e.key) {
      e.preventDefault();
      edit(v, s + 1);
    } else if (e.key === "Backspace" && s === en && PAIRS[v[s - 1]!] === v[s]) {
      e.preventDefault();
      edit(v.slice(0, s - 1) + v.slice(s + 1), s - 1);
    }
  };

  const sync = () => {
    if (!ta.current) return;
    if (pre.current) {
      pre.current.scrollTop = ta.current.scrollTop;
      pre.current.scrollLeft = ta.current.scrollLeft;
    }
    if (gutter.current) gutter.current.scrollTop = ta.current.scrollTop;
  };

  const shared = "m-0 whitespace-pre p-3 font-mono text-[13px] leading-[22px] [tab-size:2]";

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-2xl border border-border bg-code text-code-foreground", className)}>
      {filename ? (
        <div className="flex items-center gap-2 border-b border-code-border px-4 py-2 font-mono text-xs text-code-foreground/60">
          <span className="size-2 rounded-full bg-accent" />
          {filename}
          <span className="ml-auto text-code-muted/80">
            Ln {line + 1}, {language}
          </span>
        </div>
      ) : null}
      <div className="relative flex" style={{ height }}>
        <div ref={gutter} aria-hidden className="w-11 shrink-0 select-none overflow-hidden border-r border-code-border py-3 text-right font-mono text-[12px] leading-[22px] text-code-muted/70">
          {lines.map((_, i) => (
            <div key={i} className={cn("pr-3", i === line && "text-code-foreground/70")}>{i + 1}</div>
          ))}
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bg-code-foreground/[0.05]" style={{ top: 12 + line * 22 - (ta.current?.scrollTop ?? 0), height: 22 }} />
          <pre ref={pre} aria-hidden className={cn(shared, "pointer-events-none absolute inset-0 overflow-hidden")}>
            {tokens.map((t, i) => (
              <span key={i} className={t.c}>{t.t}</span>
            ))}
            {"\n"}
          </pre>
          <textarea
            ref={ta}
            value={code}
            readOnly={readOnly}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            aria-label={filename ? `Edit ${filename}` : "Code editor"}
            onChange={(e) => {
              setCode(e.target.value);
              updateLine();
            }}
            onKeyDown={readOnly ? undefined : onKeyDown}
            onKeyUp={updateLine}
            onClick={updateLine}
            onScroll={sync}
            className={cn(shared, "absolute inset-0 h-full w-full resize-none overflow-auto bg-transparent text-transparent caret-accent outline-none selection:bg-accent/30")}
          />
        </div>
      </div>
    </div>
  );
}
