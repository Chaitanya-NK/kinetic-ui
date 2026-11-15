"use client";

import * as React from "react";
import { cn } from "@kineticui/core";
import { BoldIcon, CodeIcon, HeadingIcon, ItalicIcon, LinkIcon, ListIcon, ListOrderedIcon, QuoteIcon, RedoIcon, StrikethroughIcon, UnderlineIcon, UndoIcon } from "@kineticui/icons";

export type RichTextEditorProps = {
  /** Initial HTML. */
  defaultValue?: string;
  /** Called with the editor's HTML on every change. */
  onChange?: (html: string, text: string) => void;
  placeholder?: string;
  /** Minimum editable height in px. */
  minHeight?: number;
  /** Show word / character count. */
  showCount?: boolean;
  className?: string;
};

type Cmd = { cmd: string; arg?: string; label: string; icon: React.ReactNode; key?: string; state?: string };

const tools: (Cmd | "sep")[] = [
  { cmd: "bold", label: "Bold", icon: <BoldIcon />, key: "B", state: "bold" },
  { cmd: "italic", label: "Italic", icon: <ItalicIcon />, key: "I", state: "italic" },
  { cmd: "underline", label: "Underline", icon: <UnderlineIcon />, key: "U", state: "underline" },
  { cmd: "strikeThrough", label: "Strikethrough", icon: <StrikethroughIcon />, state: "strikeThrough" },
  "sep",
  { cmd: "formatBlock", arg: "h2", label: "Heading", icon: <HeadingIcon /> },
  { cmd: "formatBlock", arg: "blockquote", label: "Quote", icon: <QuoteIcon /> },
  { cmd: "formatBlock", arg: "pre", label: "Code block", icon: <CodeIcon /> },
  "sep",
  { cmd: "insertUnorderedList", label: "Bulleted list", icon: <ListIcon />, state: "insertUnorderedList" },
  { cmd: "insertOrderedList", label: "Numbered list", icon: <ListOrderedIcon />, state: "insertOrderedList" },
  { cmd: "createLink", label: "Link", icon: <LinkIcon />, key: "K" },
  "sep",
  { cmd: "undo", label: "Undo", icon: <UndoIcon /> },
  { cmd: "redo", label: "Redo", icon: <RedoIcon /> },
];

/**
 * Lightweight WYSIWYG editor (contentEditable) with a formatting toolbar, shortcuts and HTML output.
 * Sanitise the HTML on your server before rendering it elsewhere.
 */
export function RichTextEditor({ defaultValue = "", onChange, placeholder = "Start writing…", minHeight = 180, showCount = true, className }: RichTextEditorProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState<Set<string>>(new Set());
  const [empty, setEmpty] = React.useState(!defaultValue);
  const [count, setCount] = React.useState({ words: 0, chars: 0 });

  React.useEffect(() => {
    if (ref.current && defaultValue) ref.current.innerHTML = defaultValue;
    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sync = () => {
    const el = ref.current;
    if (!el) return;
    const text = el.innerText.trim();
    setEmpty(!text && !el.querySelector("img,li"));
    setCount({ words: text ? text.split(/\s+/).length : 0, chars: text.length });
    onChange?.(el.innerHTML, el.innerText);
  };

  const refreshState = () => {
    const s = new Set<string>();
    for (const t of tools) if (t !== "sep" && t.state && document.queryCommandState(t.state)) s.add(t.state);
    const block = document.queryCommandValue("formatBlock").toLowerCase();
    if (block) s.add(`block:${block}`);
    setActive(s);
  };

  const exec = (t: Cmd) => {
    ref.current?.focus();
    if (t.cmd === "createLink") {
      const url = window.prompt("Link URL", "https://");
      if (!url) return;
      document.execCommand("createLink", false, url);
    } else if (t.cmd === "formatBlock") {
      const current = document.queryCommandValue("formatBlock").toLowerCase();
      document.execCommand("formatBlock", false, current === t.arg ? "p" : t.arg);
    } else document.execCommand(t.cmd, false, t.arg);
    refreshState();
    sync();
  };

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-2xl border border-border bg-surface focus-within:border-border-strong", className)}>
      <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-0.5 border-b border-border bg-surface-raised/50 p-1.5">
        {tools.map((t, i) =>
          t === "sep" ? (
            <span key={i} className="mx-1 h-5 w-px bg-border" />
          ) : (
            <button
              key={t.label}
              type="button"
              title={t.key ? `${t.label} (⌘${t.key})` : t.label}
              aria-label={t.label}
              aria-pressed={t.state ? active.has(t.state) : t.arg ? active.has(`block:${t.arg}`) : undefined}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => exec(t)}
              className="flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-overlay hover:text-foreground aria-pressed:bg-accent-soft aria-pressed:text-accent [&_svg]:size-4"
            >
              {t.icon}
            </button>
          ),
        )}
      </div>
      <div className="relative">
        {empty ? <span className="pointer-events-none absolute left-4 top-3.5 text-subtle">{placeholder}</span> : null}
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Editor"
          onInput={sync}
          onKeyUp={refreshState}
          onMouseUp={refreshState}
          onKeyDown={(e) => {
            if (!(e.metaKey || e.ctrlKey)) return;
            const t = tools.find((x) => x !== "sep" && x.key === e.key.toUpperCase()) as Cmd | undefined;
            if (t) {
              e.preventDefault();
              exec(t);
            }
          }}
          onPaste={(e) => {
            // Paste as plain text to avoid foreign styles.
            e.preventDefault();
            document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
          }}
          style={{ minHeight }}
          className={cn(
            "px-4 py-3 text-[15px] leading-relaxed outline-none",
            "[&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold",
            "[&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-3 [&_blockquote]:text-muted",
            "[&_pre]:my-2 [&_pre]:rounded-lg [&_pre]:bg-background [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-[13px]",
            "[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-accent [&_a]:underline",
          )}
        />
      </div>
      {showCount ? (
        <div className="flex justify-end gap-3 border-t border-border px-4 py-2 font-mono text-[11px] text-subtle">
          <span>{count.words} words</span>
          <span>{count.chars} chars</span>
        </div>
      ) : null}
    </div>
  );
}
