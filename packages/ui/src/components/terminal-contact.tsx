"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn, useReducedMotion } from "@kineticui/core";
import { MacWindow } from "./mac-window";
import { SocialIcon, detectNetwork } from "./social-icons";
import { buildVCard, downloadVCard, type ContactInfo } from "./vcard";

export type TerminalContactProps = {
  contact: ContactInfo;
  /** Shown in the title bar. Defaults to "<first>@portfolio: ~/contact". */
  title?: string;
  tone?: "auto" | "light" | "dark";
  /** Type the intro commands out on mount. */
  animate?: boolean;
  /** Called by `message <text>` typed in the prompt. Return a promise to show "sending…". */
  onMessage?: (text: string) => Promise<void> | void;
  className?: string;
};

type Line = { kind: "cmd" | "out" | "err" | "ok"; content: React.ReactNode };

const COMMANDS = ["help", "whoami", "email", "phone", "socials", "vcard", "cat contact.vcf", "copy email", "message", "open", "clear"];

/**
 * Portfolio contact card styled as a macOS terminal. Shows contact.txt, socials and quick actions,
 * then gives you a live prompt: help, email, socials, vcard, copy email, open <network>, message <text>, clear.
 * ↑/↓ for history, Tab to complete.
 */
export function TerminalContact({ contact, title, tone = "light", animate = true, onMessage, className }: TerminalContactProps) {
  const first = contact.name.split(/\s+/)[0]!.toLowerCase();
  const [lines, setLines] = React.useState<Line[]>([]);
  const [input, setInput] = React.useState("");
  const [history, setHistory] = React.useState<string[]>([]);
  const [hIndex, setHIndex] = React.useState<number | null>(null);
  const [copied, setCopied] = React.useState<string | null>(null);
  const [introDone, setIntroDone] = React.useState(!animate);
  const [typed, setTyped] = React.useState({ step: animate ? 0 : 3, chars: 0 });
  const reduced = useReducedMotion();
  // People who prefer reduced motion get the finished terminal straight away, without the typing intro.
  React.useEffect(() => {
    if (!reduced) return;
    setIntroDone(true);
    setTyped({ step: 3, chars: 0 });
  }, [reduced]);
  const body = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
    setCopied(key);
    setTimeout(() => setCopied(null), 1400);
  };

  const intro = ["cat contact.txt", "ls socials/", "./actions"];

  // Type the intro commands one after another.
  React.useEffect(() => {
    if (introDone) return;
    if (typed.step >= intro.length) {
      setIntroDone(true);
      return;
    }
    const cmd = intro[typed.step]!;
    const t = setTimeout(
      () => setTyped((s) => (s.chars < cmd.length ? { ...s, chars: s.chars + 1 } : { step: s.step + 1, chars: 0 })),
      typed.chars < cmd.length ? 35 : 260,
    );
    return () => clearTimeout(t);
  }, [typed, introDone]);

  React.useEffect(() => {
    body.current?.scrollTo({ top: body.current.scrollHeight, behavior: "smooth" });
  }, [lines, typed.step]);

  const link = "underline decoration-current/30 underline-offset-[5px] transition-colors hover:decoration-current";
  const Prompt = ({ children }: { children: React.ReactNode }) => (
    <div className="flex gap-3">
      <span className="text-accent-soft-foreground [color:var(--kn-term-accent)]">❯</span>
      <span>{children}</span>
    </div>
  );

  const run = async (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    setHistory((h) => [...h, cmd]);
    setHIndex(null);
    const push = (...l: Line[]) => setLines((x) => [...x, { kind: "cmd", content: cmd }, ...l]);
    const [name, ...rest] = cmd.split(/\s+/);
    const arg = rest.join(" ");
    switch (name) {
      case "clear":
        setLines([]);
        return;
      case "help":
        return push({
          kind: "out",
          content: (
            <div className="grid grid-cols-[150px_1fr] gap-x-4 gap-y-0.5">
              {[
                ["whoami", "who you're talking to"],
                ["email / phone", "print contact details"],
                ["socials", "list profiles"],
                ["open <network>", "open a profile, e.g. open github"],
                ["copy email", "copy address to clipboard"],
                ["vcard", "download contact.vcf"],
                ["message <text>", "send me a note from here"],
                ["clear", "clear the screen"],
              ].map(([k, v]) => (
                <React.Fragment key={k}>
                  <span>{k}</span>
                  <span className="opacity-60">{v}</span>
                </React.Fragment>
              ))}
            </div>
          ),
        });
      case "whoami":
        return push({ kind: "out", content: [contact.name, contact.title, contact.org].filter(Boolean).join(" · ") });
      case "email":
        return push({ kind: "out", content: contact.email ? <a href={`mailto:${contact.email}`} className={link}>{contact.email}</a> : "no email on file" });
      case "phone":
        return push({ kind: "out", content: contact.phone ? <a href={`tel:${contact.phone}`} className={link}>{contact.phone}</a> : "no phone on file" });
      case "socials":
      case "ls":
        return push({ kind: "out", content: (contact.socials ?? []).map((s) => `${detectNetwork(s.url)}  ${s.url}`).join("\n") || "nothing here" });
      case "open": {
        const s = contact.socials?.find((x) => detectNetwork(x.url) === arg.toLowerCase() || (x.label ?? "").toLowerCase() === arg.toLowerCase());
        if (!s) return push({ kind: "err", content: `open: no profile named "${arg}". Try: ${(contact.socials ?? []).map((x) => detectNetwork(x.url)).join(", ")}` });
        window.open(s.url, "_blank", "noopener");
        return push({ kind: "ok", content: `opening ${s.url}` });
      }
      case "copy":
        if (contact.email) await copy(contact.email, "email");
        return push({ kind: "ok", content: "✓ email copied to clipboard" });
      case "vcard":
      case "./save-contact.vcf":
        downloadVCard(contact);
        return push({ kind: "ok", content: "✓ contact.vcf downloaded" });
      case "cat":
        if (arg === "contact.vcf") return push({ kind: "out", content: <pre className="whitespace-pre-wrap text-[12px] opacity-80">{buildVCard(contact)}</pre> });
        return push({ kind: "err", content: `cat: ${arg || "?"}: No such file. Try: cat contact.vcf` });
      case "message": {
        if (!arg) return push({ kind: "err", content: "usage: message <your note + how to reach you>" });
        setLines((x) => [...x, { kind: "cmd", content: cmd }, { kind: "out", content: "sending…" }]);
        try {
          await (onMessage?.(arg) ?? new Promise((r) => setTimeout(r, 700)));
          setLines((x) => [...x.slice(0, -1), { kind: "ok", content: `✓ delivered. ${contact.name.split(" ")[0]} will get back to you soon.` }]);
        } catch {
          setLines((x) => [...x.slice(0, -1), { kind: "err", content: "✕ couldn't send. Try email instead." }]);
        }
        return;
      }
      case "sudo":
        return push({ kind: "err", content: "nice try." });
      default:
        return push({ kind: "err", content: `command not found: ${name}. Type 'help'.` });
    }
  };

  const showStep = (i: number) => introDone || typed.step > i;
  const typing = (i: number) => (!introDone && typed.step === i ? intro[i]!.slice(0, typed.chars) : intro[i]);

  return (
    <MacWindow
      title={title ?? `${first}@portfolio: ~/contact`}
      tone={tone}
      mono
      className={cn("[--kn-term-accent:#2f7d9a] data-[tone=dark]:[--kn-term-accent:var(--kn-accent)]", className)}
      data-tone={tone}
      bodyClassName="text-[14px] leading-7"
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={body} className="flex max-h-[520px] flex-col gap-4 overflow-y-auto p-6">
        {/* 1. contact.txt */}
        {(introDone || typed.step >= 0) ? (
          <div>
            <Prompt>{typing(0)}</Prompt>
            {showStep(0) ? (
              <motion.dl initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 grid grid-cols-[110px_1fr] gap-y-1 opacity-90">
                {contact.email ? (<><dt className="opacity-75">email:</dt><dd><a href={`mailto:${contact.email}`} className={link}>{contact.email}</a></dd></>) : null}
                {contact.phone ? (<><dt className="opacity-75">phone:</dt><dd><a href={`tel:${contact.phone}`} className={link}>{contact.phone}</a></dd></>) : null}
                {contact.location ? (<><dt className="opacity-75">location:</dt><dd>{contact.location}</dd></>) : null}
                {contact.title ? (<><dt className="opacity-75">role:</dt><dd>{contact.title}</dd></>) : null}
              </motion.dl>
            ) : null}
          </div>
        ) : null}
        {/* 2. socials */}
        {typed.step >= 1 || introDone ? (
          <div>
            <Prompt>{typing(1)}</Prompt>
            {showStep(1) ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 flex flex-wrap gap-x-7 gap-y-2">
                {(contact.socials ?? []).map((s, i) => {
                  const n = detectNetwork(s.url);
                  return (
                    <motion.a key={s.url} href={s.url} target="_blank" rel="noreferrer" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="flex items-center gap-2">
                      <SocialIcon network={n} size={17} />
                      <span className={link}>{s.label ?? (n === "x" ? "x-twitter" : n)}</span>
                    </motion.a>
                  );
                })}
              </motion.div>
            ) : null}
          </div>
        ) : null}
        {/* 3. actions */}
        {typed.step >= 2 || introDone ? (
          <div>
            <Prompt>{typing(2)}</Prompt>
            {showStep(2) ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 flex flex-wrap gap-3">
                {contact.email ? (
                  <button type="button" onClick={() => void copy(contact.email!, "btn")} className="rounded-md border border-current/20 px-4 py-2 transition-colors hover:border-current/50 hover:bg-current/5">
                    {copied === "btn" || copied === "email" ? "✓ copied" : "copy-email"}
                  </button>
                ) : null}
                <button type="button" onClick={() => downloadVCard(contact)} className="rounded-md border border-current/20 px-4 py-2 transition-colors hover:border-current/50 hover:bg-current/5">
                  save-contact.vcf
                </button>
              </motion.div>
            ) : null}
          </div>
        ) : null}
        {/* history */}
        {lines.map((l, i) =>
          l.kind === "cmd" ? (
            <Prompt key={i}>{l.content}</Prompt>
          ) : (
            <div key={i} className={cn("-mt-3 whitespace-pre-wrap pl-6", l.kind === "err" && "text-danger", l.kind === "ok" && "text-success")}>
              {l.content}
            </div>
          ),
        )}
        {/* live prompt */}
        {introDone ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void run(input);
              setInput("");
            }}
            className="flex items-center gap-3"
          >
            <span className="[color:var(--kn-term-accent)]">❯</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp" && history.length) {
                  e.preventDefault();
                  const i = hIndex === null ? history.length - 1 : Math.max(0, hIndex - 1);
                  setHIndex(i);
                  setInput(history[i]!);
                }
                if (e.key === "ArrowDown" && hIndex !== null) {
                  e.preventDefault();
                  const i = hIndex + 1;
                  if (i >= history.length) {
                    setHIndex(null);
                    setInput("");
                  } else {
                    setHIndex(i);
                    setInput(history[i]!);
                  }
                }
                if (e.key === "Tab") {
                  const m = COMMANDS.find((c) => c.startsWith(input) && c !== input);
                  if (m) {
                    e.preventDefault();
                    setInput(m);
                  }
                }
                if (e.key === "l" && e.ctrlKey) {
                  e.preventDefault();
                  setLines([]);
                }
              }}
              aria-label="Terminal input. Type help for commands."
              placeholder={lines.length ? "" : "type 'help'"}
              spellCheck={false}
              autoComplete="off"
              className="flex-1 bg-transparent caret-[var(--kn-term-accent)] outline-none placeholder:opacity-40"
            />
          </form>
        ) : null}
      </div>
    </MacWindow>
  );
}
