"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { FileIcon, XIcon } from "@kineticui/icons";

export type ComposeData = {
  name: string;
  email: string;
  topic: string;
  message: string;
  files: File[];
};

export type ComposeFormProps = {
  /** Recipient shown in the To row. */
  to: { name: string; avatar?: React.ReactNode };
  /** Topic chips in the About row. */
  topics?: string[];
  /** Placeholder per topic. */
  placeholders?: Record<string, string>;
  maxLength?: number;
  /** Slot for a bot check such as Cloudflare Turnstile or hCaptcha. */
  verification?: React.ReactNode;
  /** When `verification` is used, pass whether it has passed; Send stays locked until true. */
  verified?: boolean;
  /** Allow file attachments. */
  attachments?: boolean;
  maxFiles?: number;
  /** Max size per file in MB. */
  maxFileSizeMB?: number;
  onSubmit: (data: ComposeData) => Promise<void> | void;
  className?: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Row({ label, children, htmlFor }: { label: string; children: React.ReactNode; htmlFor?: string }) {
  return (
    <div className="flex flex-col gap-2 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:gap-0 sm:py-0">
      <label htmlFor={htmlFor} className="w-28 shrink-0 font-mono text-xs uppercase tracking-[0.18em] text-subtle sm:py-5">
        {label}
      </label>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/** Email-client style contact form: To / From / About rows, topic chips, attachments, character count and a bot-check slot. */
export function ComposeForm({
  to,
  topics = ["Question", "Hiring", "Freelance", "Collaboration", "Other"],
  placeholders = {},
  maxLength = 4000,
  verification,
  verified,
  attachments = true,
  maxFiles = 3,
  maxFileSizeMB = 10,
  onSubmit,
  className,
}: ComposeFormProps) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [topic, setTopic] = React.useState(topics[0] ?? "");
  const [message, setMessage] = React.useState("");
  const [files, setFiles] = React.useState<File[]>([]);
  const [touched, setTouched] = React.useState(false);
  const [state, setState] = React.useState<"idle" | "sending" | "sent" | "error">("idle");
  const [fileError, setFileError] = React.useState<string | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const id = React.useId();

  const errors = {
    name: !name.trim() ? "Add your name" : null,
    email: !EMAIL.test(email) ? "Add a valid email" : null,
    message: message.trim().length < 10 ? "Write at least 10 characters" : null,
  };
  const valid = !errors.name && !errors.email && !errors.message;
  const waiting = verification !== undefined && verified === false;

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...files];
    for (const f of Array.from(list)) {
      if (next.length >= maxFiles) {
        setFileError(`Up to ${maxFiles} files`);
        break;
      }
      if (f.size > maxFileSizeMB * 1024 * 1024) {
        setFileError(`${f.name} is over ${maxFileSizeMB} MB`);
        continue;
      }
      next.push(f);
    }
    setFiles(next);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid || waiting || state === "sending") return;
    setState("sending");
    try {
      await onSubmit({ name: name.trim(), email: email.trim(), topic, message: message.trim(), files });
      setState("sent");
    } catch {
      setState("error");
    }
  };

  const reset = () => {
    setMessage("");
    setFiles([]);
    setTouched(false);
    setState("idle");
  };

  const input = "w-full bg-transparent py-4 text-[17px] text-foreground outline-none placeholder:text-subtle sm:py-5";

  return (
    <form onSubmit={submit} noValidate className={cn("relative flex flex-col overflow-hidden rounded-3xl border border-border bg-surface", className)}>
      <div className="flex items-center gap-3 border-b border-border bg-surface-raised/50 px-6 py-4">
        <span className={cn("size-2.5 rounded-full", state === "sent" ? "bg-success" : state === "error" ? "bg-danger" : "bg-info")} />
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">{state === "sent" ? "Message sent" : "New message"}</span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {state === "sent" ? (
          <motion.div key="sent" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex min-h-[420px] flex-col items-center justify-center gap-4 p-10 text-center">
            <motion.span initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 16 }} className="flex size-16 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <motion.path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.15, duration: 0.5 }} />
              </svg>
            </motion.span>
            <h3 className="font-display text-2xl font-semibold">Sent to {to.name.split(" ")[0]}</h3>
            <p className="max-w-sm text-sm text-muted">
              Thanks, {name.split(" ")[0]}. A reply will land at <b className="text-foreground">{email}</b>, usually within a day.
            </p>
            <button type="button" onClick={reset} className="mt-2 h-10 rounded-full border border-border-strong px-5 text-sm font-medium hover:bg-surface-raised">
              Send another
            </button>
          </motion.div>
        ) : (
          <motion.div key="form" exit={{ opacity: 0 }} className="flex flex-col">
            <Row label="To">
              <span className="my-3 inline-flex items-center gap-2.5 rounded-full border border-border-strong bg-background py-1 pl-1 pr-4 text-[17px] sm:my-4">
                <span className="flex size-7 items-center justify-center overflow-hidden rounded-full bg-info-soft text-sm font-semibold text-info">{to.avatar ?? to.name[0]}</span>
                {to.name}
              </span>
            </Row>
            <Row label="From" htmlFor={`${id}-name`}>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="flex-1">
                  <input id={`${id}-name`} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" aria-invalid={touched && !!errors.name} className={input} />
                  {touched && errors.name ? <span className="-mt-3 block pb-2 text-xs text-danger">{errors.name}</span> : null}
                </div>
                <span className="hidden h-10 w-px bg-border sm:mx-6 sm:block" />
                <div className="flex-1 border-t border-border sm:border-0">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" aria-label="Your email" aria-invalid={touched && !!errors.email} className={input} />
                  {touched && errors.email ? <span className="-mt-3 block pb-2 text-xs text-danger">{errors.email}</span> : null}
                </div>
              </div>
            </Row>
            <Row label="About">
              <div role="radiogroup" aria-label="About" className="flex flex-wrap gap-2 py-3 sm:py-4">
                {topics.map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={topic === t}
                    onClick={() => setTopic(t)}
                    className={cn(
                      "relative h-11 rounded-full border px-5 text-[15px] transition-colors",
                      topic === t ? "border-transparent text-[#0b2a3a]" : "border-border-strong text-muted hover:border-muted hover:text-foreground",
                    )}
                  >
                    {topic === t ? <motion.span layoutId={`${id}-topic`} className="absolute inset-0 rounded-full bg-[#7dd3fc]" transition={{ type: "spring", stiffness: 500, damping: 36 }} /> : null}
                    <span className="relative font-medium">{t}</span>
                  </button>
                ))}
              </div>
            </Row>
            <div className="flex flex-col gap-4 px-6 py-5">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
                placeholder={placeholders[topic] ?? "Write your message…"}
                aria-label="Message"
                aria-invalid={touched && !!errors.message}
                rows={7}
                className="min-h-40 resize-none bg-transparent text-[17px] leading-relaxed text-foreground outline-none placeholder:text-subtle"
              />
              {touched && errors.message ? <span className="-mt-2 text-xs text-danger">{errors.message}</span> : null}
              {files.length ? (
                <div className="flex flex-wrap gap-2">
                  {files.map((f, i) => (
                    <motion.span key={f.name + i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 rounded-xl border border-border bg-background py-1.5 pl-2 pr-1.5 text-xs">
                      <FileIcon size={14} className="text-subtle" />
                      <span className="max-w-40 truncate">{f.name}</span>
                      <span className="text-subtle">{(f.size / 1024).toFixed(0)} KB</span>
                      <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles((x) => x.filter((_, j) => j !== i))} className="text-subtle hover:text-foreground">
                        <XIcon size={12} />
                      </button>
                    </motion.span>
                  ))}
                </div>
              ) : null}
              {verification ? <div>{verification}</div> : null}
            </div>
            <div className="flex items-center gap-4 border-t border-border bg-surface-raised/50 px-6 py-4">
              {attachments ? (
                <>
                  <input ref={fileRef} type="file" multiple hidden onChange={(e) => { setFileError(null); addFiles(e.target.files); e.target.value = ""; }} />
                  <button type="button" aria-label="Attach files" onClick={() => fileRef.current?.click()} className="flex size-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-overlay hover:text-foreground">
                    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M21 11.5l-8.6 8.6a5.5 5.5 0 01-7.8-7.8l8.6-8.6a3.7 3.7 0 015.2 5.2l-8.6 8.6a1.8 1.8 0 01-2.6-2.6l8-8" />
                    </svg>
                  </button>
                </>
              ) : null}
              {fileError ? <span className="text-xs text-danger">{fileError}</span> : state === "error" ? <span className="text-xs text-danger">Couldn&apos;t send. Please try again.</span> : null}
              <span className={cn("ml-auto font-mono text-sm", message.length > maxLength * 0.9 ? "text-warning" : "text-subtle")}>
                {message.length}/{maxLength}
              </span>
              <button
                type="submit"
                disabled={waiting || state === "sending"}
                className={cn(
                  "flex h-12 min-w-36 items-center justify-center gap-2 rounded-2xl px-7 text-[17px] font-semibold transition-all",
                  waiting || state === "sending" ? "bg-[#7dd3fc]/50 text-[#0b2a3a]/60" : "bg-[#7dd3fc] text-[#0b2a3a] hover:brightness-105 active:scale-[0.97]",
                )}
              >
                {waiting ? "Verifying…" : state === "sending" ? (
                  <>
                    <span className="size-4 rounded-full border-2 border-current border-t-transparent animate-kn-spin" /> Sending
                  </>
                ) : (
                  <>
                    Send
                    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
