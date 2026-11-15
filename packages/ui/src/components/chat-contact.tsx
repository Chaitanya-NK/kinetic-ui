"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";

export type ChatContactStep = {
  /** Field key in the result. */
  key: string;
  /** What the host asks. Can use earlier answers: (a) => `Nice to meet you, ${a.name}!` */
  ask: string | ((answers: Record<string, string>) => string);
  placeholder?: string;
  type?: "text" | "email" | "long";
  /** Quick-reply chips instead of (or as well as) typing. */
  options?: string[];
  /** Return an error message to re-ask. */
  validate?: (value: string) => string | null;
};

export type ChatContactProps = {
  host: { name: string; avatar?: React.ReactNode; status?: string };
  steps?: ChatContactStep[];
  onComplete: (answers: Record<string, string>) => Promise<void> | void;
  /** Final message after sending. */
  thanks?: (answers: Record<string, string>) => string;
  className?: string;
};

const defaultSteps: ChatContactStep[] = [
  { key: "name", ask: "Hey! I'm glad you stopped by. What's your name?", placeholder: "Your name", validate: (v) => (v.trim().length < 2 ? "I didn't quite catch that. What should I call you?" : null) },
  { key: "topic", ask: (a) => `Nice to meet you, ${a.name!.split(" ")[0]}! What's this about?`, options: ["A project", "A job opportunity", "Just saying hi", "Something else"] },
  { key: "message", ask: "Tell me a bit more.", placeholder: "Your message", type: "long", validate: (v) => (v.trim().length < 10 ? "Could you add a little more detail?" : null) },
  { key: "email", ask: "And where should I reply?", placeholder: "you@example.com", type: "email", validate: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "That email doesn't look right. Mind checking it?") },
];

type Msg = { from: "host" | "you"; text: string };

/** Conversational contact form: the host asks one question at a time in chat bubbles, with typing indicators and quick replies. */
export function ChatContact({ host, steps = defaultSteps, onComplete, thanks = (a) => `Got it, ${a.name?.split(" ")[0] ?? "friend"}! I'll reply to ${a.email} soon.`, className }: ChatContactProps) {
  const [msgs, setMsgs] = React.useState<Msg[]>([]);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [step, setStep] = React.useState(0);
  const [typing, setTyping] = React.useState(true);
  const [value, setValue] = React.useState("");
  const [done, setDone] = React.useState(false);
  const scroller = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement & HTMLInputElement>(null);
  const current = steps[step];

  const say = React.useCallback((text: string, after = 650) => {
    setTyping(true);
    return new Promise<void>((r) =>
      setTimeout(() => {
        setTyping(false);
        setMsgs((m) => [...m, { from: "host", text }]);
        r();
      }, after),
    );
  }, []);

  React.useEffect(() => {
    const first = steps[0];
    if (first) void say(typeof first.ask === "function" ? first.ask({}) : first.ask, 800);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  React.useEffect(() => {
    if (!typing) inputRef.current?.focus({ preventScroll: true });
  }, [typing]);

  const answer = async (raw: string) => {
    const v = raw.trim();
    if (!v || !current || typing) return;
    setValue("");
    setMsgs((m) => [...m, { from: "you", text: v }]);
    const err = current.validate?.(v);
    if (err) return say(err);
    const next = { ...answers, [current.key]: v };
    setAnswers(next);
    const n = step + 1;
    setStep(n);
    if (n < steps.length) {
      const s = steps[n]!;
      await say(typeof s.ask === "function" ? s.ask(next) : s.ask);
    } else {
      setTyping(true);
      try {
        await onComplete(next);
        await say(thanks(next), 400);
      } catch {
        await say("Hmm, that didn't go through. Could you try again in a minute?", 400);
      }
      setDone(true);
    }
  };

  return (
    <div className={cn("flex h-[560px] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-border bg-surface", className)}>
      <div className="flex items-center gap-3 border-b border-border px-5 py-3.5">
        <span className="relative">
          <span className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-accent font-semibold text-accent-foreground">{host.avatar ?? host.name[0]}</span>
          <span className="absolute bottom-0 right-0 size-3 rounded-full bg-success ring-2 ring-surface" />
        </span>
        <div className="flex flex-col">
          <span className="font-semibold">{host.name}</span>
          <span className="text-xs text-subtle">{typing && msgs.length ? "typing…" : host.status ?? "Usually replies within a day"}</span>
        </div>
        <span className="ml-auto font-mono text-[11px] text-subtle">{Math.min(step, steps.length)}/{steps.length}</span>
      </div>
      <div ref={scroller} className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-5" aria-live="polite">
        {msgs.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={cn(
              "max-w-[80%] whitespace-pre-wrap rounded-[20px] px-4 py-2.5 text-[15px] leading-snug",
              m.from === "host" ? "self-start rounded-bl-md bg-surface-overlay" : "self-end rounded-br-md bg-accent text-accent-foreground",
            )}
          >
            {m.text}
          </motion.div>
        ))}
        <AnimatePresence>
          {typing ? (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex h-9 w-16 items-center justify-center gap-1 self-start rounded-[18px] rounded-bl-md bg-surface-overlay text-muted">
              {[0, 1, 2].map((d) => (
                <span key={d} className="size-1.5 rounded-full bg-current animate-[kn-typing_1.2s_ease-in-out_infinite]" style={{ animationDelay: `${d * 0.15}s` }} />
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
        {!typing && current?.options && !done ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1 flex flex-wrap justify-end gap-2">
            {current.options.map((o) => (
              <button key={o} type="button" onClick={() => void answer(o)} className="rounded-full border border-accent/50 px-3.5 py-1.5 text-sm text-accent hover:bg-accent-soft">
                {o}
              </button>
            ))}
          </motion.div>
        ) : null}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void answer(value);
        }}
        className="flex items-end gap-2 border-t border-border p-3"
      >
        {current?.type === "long" ? (
          <textarea
            ref={inputRef}
            rows={2}
            value={value}
            disabled={typing || done}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void answer(value);
              }
            }}
            placeholder={current.placeholder}
            aria-label={current.placeholder ?? "Reply"}
            className="max-h-32 flex-1 resize-none rounded-2xl bg-background px-4 py-2.5 text-[15px] outline-none placeholder:text-subtle disabled:opacity-50"
          />
        ) : (
          <input
            ref={inputRef}
            type={current?.type === "email" ? "email" : "text"}
            value={value}
            disabled={typing || done}
            onChange={(e) => setValue(e.target.value)}
            placeholder={done ? "Conversation finished" : current?.placeholder ?? "Type a reply…"}
            aria-label={current?.placeholder ?? "Reply"}
            className="h-11 flex-1 rounded-full bg-background px-4 text-[15px] outline-none placeholder:text-subtle disabled:opacity-50"
          />
        )}
        <button type="submit" aria-label="Send" disabled={!value.trim() || typing || done} className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground transition-opacity disabled:opacity-30">
          <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      </form>
    </div>
  );
}
