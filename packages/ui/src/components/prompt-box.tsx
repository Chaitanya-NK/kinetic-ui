"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { FileIcon, PlusIcon, XIcon } from "@kineticui/icons";

export type PromptAttachment = { id: string; name: string; size?: string; preview?: string };

export type PromptBoxProps = {
  value?: string;
  onValueChange?: (v: string) => void;
  onSubmit: (value: string, attachments: PromptAttachment[]) => void;
  /** While true the send button becomes a stop button. */
  streaming?: boolean;
  onStop?: () => void;
  placeholder?: string;
  /** Quick prompts shown above the box while it's empty. */
  suggestions?: string[];
  /** Left side of the toolbar, e.g. <ModelSelector />. */
  toolbar?: React.ReactNode;
  /** Enable the attach button. Called with chosen files; return attachments to show. */
  onAttach?: (files: File[]) => PromptAttachment[] | Promise<PromptAttachment[]>;
  maxRows?: number;
  disabled?: boolean;
  className?: string;
};

/** Chat composer: auto-growing input, attachments, suggestions, Enter to send, stop while streaming. */
export function PromptBox({
  value: controlled,
  onValueChange,
  onSubmit,
  streaming,
  onStop,
  placeholder = "Ask anything…",
  suggestions,
  toolbar,
  onAttach,
  maxRows = 8,
  disabled,
  className,
}: PromptBoxProps) {
  const [inner, setInner] = React.useState("");
  const value = controlled ?? inner;
  const setValue = (v: string) => (onValueChange ? onValueChange(v) : setInner(v));
  const [files, setFiles] = React.useState<PromptAttachment[]>([]);
  const [drag, setDrag] = React.useState(false);
  const ta = React.useRef<HTMLTextAreaElement>(null);
  const fileInput = React.useRef<HTMLInputElement>(null);

  React.useLayoutEffect(() => {
    const el = ta.current;
    if (!el) return;
    el.style.height = "auto";
    const line = parseFloat(getComputedStyle(el).lineHeight) || 22;
    el.style.height = `${Math.min(el.scrollHeight, line * maxRows)}px`;
  }, [value, maxRows]);

  const submit = () => {
    if (streaming || disabled || (!value.trim() && !files.length)) return;
    onSubmit(value.trim(), files);
    setValue("");
    setFiles([]);
  };

  const attach = async (list: FileList | null) => {
    if (!list?.length || !onAttach) return;
    const added = await onAttach(Array.from(list));
    setFiles((f) => [...f, ...added]);
  };

  const canSend = !!value.trim() || files.length > 0;

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <AnimatePresence>
        {suggestions?.length && !value && !files.length ? (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setValue(s);
                  ta.current?.focus();
                }}
                className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted transition-colors hover:border-border-strong hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
      <div
        onDragOver={(e) => {
          if (!onAttach) return;
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          if (!onAttach) return;
          e.preventDefault();
          setDrag(false);
          void attach(e.dataTransfer.files);
        }}
        className={cn(
          "relative flex flex-col gap-2 rounded-[20px] border border-border-strong bg-surface p-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition-colors focus-within:border-muted",
          drag && "border-accent bg-accent-soft",
        )}
      >
        {files.length ? (
          <div className="flex flex-wrap gap-2 px-1 pt-1">
            {files.map((f) => (
              <motion.span layout key={f.id} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-2 rounded-xl border border-border bg-surface-raised py-1.5 pl-1.5 pr-2 text-xs">
                {f.preview ? <img src={f.preview} alt="" className="size-8 rounded-lg object-cover" /> : <span className="flex size-8 items-center justify-center rounded-lg bg-surface-overlay text-muted"><FileIcon size={14} /></span>}
                <span className="flex flex-col">
                  <span className="max-w-36 truncate font-medium">{f.name}</span>
                  {f.size ? <span className="text-subtle">{f.size}</span> : null}
                </span>
                <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles((x) => x.filter((y) => y.id !== f.id))} className="ml-1 text-subtle hover:text-foreground">
                  <XIcon size={13} />
                </button>
              </motion.span>
            ))}
          </div>
        ) : null}
        <textarea
          ref={ta}
          rows={1}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          aria-label="Message"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
          className="resize-none bg-transparent px-2 pt-1.5 text-[15px] leading-[22px] text-foreground outline-none placeholder:text-subtle"
        />
        <div className="flex items-center gap-1.5">
          {onAttach ? (
            <>
              <input ref={fileInput} type="file" multiple hidden onChange={(e) => void attach(e.target.files).then(() => (e.target.value = ""))} />
              <button type="button" aria-label="Attach files" onClick={() => fileInput.current?.click()} className="flex size-9 items-center justify-center rounded-full text-muted hover:bg-surface-raised hover:text-foreground">
                <PlusIcon size={18} />
              </button>
            </>
          ) : null}
          {toolbar}
          <span className="ml-auto hidden pr-1 font-mono text-[10px] text-subtle sm:block">{value ? "⇧↵ new line" : ""}</span>
          {streaming ? (
            <button type="button" aria-label="Stop generating" onClick={onStop} className="flex size-9 items-center justify-center rounded-full bg-foreground text-background">
              <span className="size-3 rounded-[3px] bg-current" />
            </button>
          ) : (
            <button
              type="button"
              aria-label="Send"
              disabled={!canSend || disabled}
              onClick={submit}
              className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground transition-[opacity,transform] active:scale-90 disabled:opacity-30"
            >
              <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
