"use client";

import * as React from "react";
import { cn } from "@kineticui/core";
import { CopyButton } from "./copy-button";

export type CodeFile = { name: string; code: string; language?: "tsx" | "ts" | "js" | "jsx" | "css" | "bash" | "json" | "text" };

export type CodeBlockProps = {
  /** One file, or several shown as tabs. */
  files: CodeFile[] | CodeFile;
  /** 1-based line numbers to highlight in the active file. */
  highlight?: number[];
  showLineNumbers?: boolean;
  maxHeight?: number;
  className?: string;
};

type Tok = { t: string; c?: string };
const KW = /^(?:import|from|export|default|const|let|var|function|return|if|else|for|while|await|async|new|type|interface|extends|as|in|of|class|this|null|undefined|true|false|try|catch|throw|switch|case|break)$/;

/** Small built-in highlighter: no dependencies, good enough for docs snippets. */
export function tokenize(code: string, lang: CodeFile["language"] = "tsx"): Tok[] {
  if (lang === "text") return [{ t: code }];
  const rules: [RegExp, string | undefined][] =
    lang === "bash"
      ? [[/^#.*/, "text-subtle"], [/^"(?:[^"\\]|\\.)*"|^'[^']*'/, "text-code-string"], [/^(?:npm|npx|pnpm|yarn|bun|cd|git|curl)\b/, "text-accent"], [/^--?[\w-]+/, "text-code-function"], [/^\s+|^[^\s"'#-]+|^./, undefined]]
      : lang === "css"
        ? [[/^\/\*[\s\S]*?\*\//, "text-subtle"], [/^[.#]?[\w-]+(?=\s*\{)/, "text-accent"], [/^--[\w-]+|^[\w-]+(?=\s*:)/, "text-code-function"], [/^#[0-9a-fA-F]{3,8}\b|^\d+(?:\.\d+)?(?:px|rem|em|%|ms|s)?/, "text-code-number"], [/^\s+|^\w+|^./, undefined]]
        : [
            [/^\/\/.*|^\/\*[\s\S]*?\*\//, "text-subtle"],
            [/^`(?:[^`\\]|\\.)*`|^"(?:[^"\\]|\\.)*"|^'(?:[^'\\]|\\.)*'/, "text-code-string"],
            [/^<\/?[A-Za-z][\w.]*/, "text-code-tag"],
            [/^\d+(?:\.\d+)?/, "text-code-number"],
            [/^[A-Za-z_$][\w$]*(?=\s*\()/, "text-code-function"],
            [/^[A-Za-z_$][\w$]*/, "kw"],
            [/^\s+|^./, undefined],
          ];
  const out: Tok[] = [];
  let s = code;
  while (s.length) {
    for (const [re, cls] of rules) {
      const m = re.exec(s);
      if (!m) continue;
      const t = m[0];
      const c = cls === "kw" ? (KW.test(t) ? "text-accent" : /^[A-Z]/.test(t) ? "text-code-number" : undefined) : cls;
      const last = out.at(-1);
      if (last && last.c === c) last.t += t;
      else out.push({ t, c });
      s = s.slice(t.length);
      break;
    }
  }
  return out;
}

/** Code panel with file tabs, line numbers, highlighted lines and copy. */
export function CodeBlock({ files, highlight = [], showLineNumbers = true, maxHeight = 420, className }: CodeBlockProps) {
  const list = Array.isArray(files) ? files : [files];
  const [active, setActive] = React.useState(0);
  const file = list[Math.min(active, list.length - 1)]!;
  const lines = React.useMemo(() => {
    const toks = tokenize(file.code.replace(/\n$/, ""), file.language ?? (file.name.split(".").pop() as CodeFile["language"]));
    const rows: Tok[][] = [[]];
    for (const tk of toks) {
      const parts = tk.t.split("\n");
      parts.forEach((p, i) => {
        if (i) rows.push([]);
        if (p) rows.at(-1)!.push({ t: p, c: tk.c });
      });
    }
    return rows;
  }, [file]);

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-code text-code-foreground", className)}>
      <div className="flex items-center border-b border-code-border pr-2">
        <div role="tablist" className="flex flex-1 overflow-x-auto">
          {list.map((f, i) => (
            <button
              key={f.name}
              role="tab"
              type="button"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={cn("relative px-4 py-2.5 font-mono text-xs transition-colors", i === active ? "text-code-foreground" : "text-code-muted hover:text-code-foreground/70")}
            >
              {f.name}
              {i === active ? <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-accent" /> : null}
            </button>
          ))}
        </div>
        <CopyButton value={file.code} className="border-code-border bg-code-foreground/5 text-code-foreground/60 hover:text-code-foreground" />
      </div>
      <pre className="overflow-auto py-3 font-mono text-[12.5px] leading-[22px]" style={{ maxHeight }}>
        <code>
          {lines.map((row, i) => (
            <div key={i} className={cn("flex pr-4", highlight.includes(i + 1) ? "bg-accent/10 shadow-[inset_2px_0_0_var(--kn-accent)]" : "")}>
              {showLineNumbers ? <span className="w-10 shrink-0 select-none pr-3 text-right text-code-muted/70">{i + 1}</span> : <span className="w-4" />}
              <span className="whitespace-pre">
                {row.length
                  ? row.map((tk, j) => (
                      <span key={j} className={tk.c}>
                        {tk.t}
                      </span>
                    ))
                  : " "}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
