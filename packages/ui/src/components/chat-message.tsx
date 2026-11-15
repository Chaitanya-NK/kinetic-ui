"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@kineticui/core";
import { CheckIcon, CopyIcon, RefreshIcon } from "@kineticui/icons";

/** Reveals `text` progressively, like a streamed model response. */
export function useStreamedText(text: string, { speed = 40, enabled = true }: { speed?: number; enabled?: boolean } = {}) {
  const [n, setN] = React.useState(enabled ? 0 : text.length);
  React.useEffect(() => {
    if (!enabled) {
      setN(text.length);
      return;
    }
    setN(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += Math.max(1, Math.round(Math.random() * 4));
      setN(Math.min(i, text.length));
      if (i >= text.length) window.clearInterval(id);
    }, 1000 / speed);
    return () => window.clearInterval(id);
  }, [text, speed, enabled]);
  return { text: text.slice(0, n), done: n >= text.length };
}

/** Minimal markdown: paragraphs, **bold**, `code`, lists and fenced code. */
export function SimpleMarkdown({ children }: { children: string }) {
  const inline = (s: string) =>
    s.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, i) =>
      p.startsWith("**") && p.endsWith("**") && p.length > 4 ? (
        <strong key={i} className="font-semibold text-foreground">{p.slice(2, -2)}</strong>
      ) : p.startsWith("`") && p.endsWith("`") && p.length > 2 ? (
        <code key={i} className="rounded-md bg-surface-overlay px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">{p.slice(1, -1)}</code>
      ) : (
        p
      ),
    );
  const blocks = children.split(/\n{2,}/);
  return (
    <div className="flex flex-col gap-3">
      {blocks.map((b, i) => {
        if (b.startsWith("```")) {
          const body = b.replace(/^```\w*\n?/, "").replace(/```$/, "");
          return (
            <pre key={i} className="overflow-x-auto rounded-xl border border-border bg-[#0b0c0e] p-3 font-mono text-[12.5px] leading-relaxed text-[#E8E8E3]">
              {body}
            </pre>
          );
        }
        const lines = b.split("\n");
        if (lines.every((l) => /^\s*([-*]|\d+\.)\s/.test(l))) {
          const ordered = /^\s*\d+\./.test(lines[0]!);
          const Tag = ordered ? "ol" : "ul";
          return (
            <Tag key={i} className={cn("flex flex-col gap-1 pl-5", ordered ? "list-decimal" : "list-disc", "marker:text-subtle")}>
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*([-*]|\d+\.)\s/, ""))}</li>
              ))}
            </Tag>
          );
        }
        return <p key={i}>{inline(b)}</p>;
      })}
    </div>
  );
}

export type ChatMessageProps = {
  role: "user" | "assistant";
  /** Plain text / simple markdown, or any ReactNode. */
  content: React.ReactNode;
  avatar?: React.ReactNode;
  name?: string;
  /** Shows a blinking caret after the content. */
  streaming?: boolean;
  /** Blocks shown before the answer, e.g. <ThinkingBlock /> or <ToolCall />. */
  before?: React.ReactNode;
  /** Blocks after the answer, e.g. <Sources />. */
  after?: React.ReactNode;
  onRetry?: () => void;
  onFeedback?: (good: boolean) => void;
  className?: string;
};

/** One turn in a conversation: user bubble or assistant answer with actions. */
export function ChatMessage({ role, content, avatar, name, streaming, before, after, onRetry, onFeedback, className }: ChatMessageProps) {
  const [copied, setCopied] = React.useState(false);
  const [vote, setVote] = React.useState<boolean | null>(null);
  const body = typeof content === "string" ? <SimpleMarkdown>{content}</SimpleMarkdown> : content;

  if (role === "user")
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn("flex justify-end", className)}>
        <div className="max-w-[80%] rounded-[20px] rounded-br-md bg-surface-overlay px-4 py-2.5 text-[15px] leading-relaxed text-foreground">{body}</div>
      </motion.div>
    );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn("group flex gap-3", className)}>
      <div className="shrink-0">
        {avatar ?? (
          <span className="flex size-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
              <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" />
            </svg>
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3 pt-1">
        {name ? <span className="text-xs font-medium text-subtle">{name}</span> : null}
        {before}
        <div className="text-[15px] leading-relaxed text-muted [&_p]:text-foreground/90">
          {body}
          {streaming ? <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 rounded-[2px] bg-accent animate-kn-caret" aria-hidden /> : null}
        </div>
        {after}
        {!streaming ? (
          <div className="flex items-center gap-0.5 text-subtle opacity-60 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              aria-label="Copy"
              onClick={() => {
                if (typeof content === "string") void navigator.clipboard?.writeText(content);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
              }}
              className="flex size-7 items-center justify-center rounded-md hover:bg-surface-raised hover:text-foreground"
            >
              {copied ? <CheckIcon size={14} className="text-success" /> : <CopyIcon size={14} />}
            </button>
            {onFeedback
              ? ([true, false] as const).map((good) => (
                  <button
                    key={String(good)}
                    type="button"
                    aria-label={good ? "Good response" : "Bad response"}
                    aria-pressed={vote === good}
                    onClick={() => {
                      setVote(good);
                      onFeedback(good);
                    }}
                    className={cn("flex size-7 items-center justify-center rounded-md hover:bg-surface-raised hover:text-foreground", vote === good && "text-accent")}
                  >
                    <svg viewBox="0 0 24 24" className={cn("size-3.5", !good && "rotate-180")} fill={vote === good ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden>
                      <path d="M7 10v11H3V10h4zm0 0l4-8a3 3 0 013 3v4h6a2 2 0 012 2.3l-1.4 8A2 2 0 0118.6 21H7" />
                    </svg>
                  </button>
                ))
              : null}
            {onRetry ? (
              <button type="button" aria-label="Regenerate" onClick={onRetry} className="flex size-7 items-center justify-center rounded-md hover:bg-surface-raised hover:text-foreground">
                <RefreshIcon size={14} />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
