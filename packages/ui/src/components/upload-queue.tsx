"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { CheckIcon, FileIcon, ImageIcon, PauseIcon, PlayIcon, RotateCwIcon, UploadIcon, VideoIcon, XIcon } from "@kineticui/icons";

export type UploadItem = { id: string; file: File; progress: number; status: "queued" | "uploading" | "paused" | "done" | "error"; error?: string; speed?: number };

export type UploadQueueProps = {
  /**
   * Upload one file. Report progress with onProgress(0–1); honour signal.aborted to pause/cancel.
   * Throw to mark as failed.
   */
  upload: (file: File, onProgress: (p: number) => void, signal: AbortSignal) => Promise<void>;
  /** Parallel uploads. */
  concurrency?: number;
  accept?: string;
  maxSizeMB?: number;
  onComplete?: (files: File[]) => void;
  className?: string;
};

const fmt = (n: number) => (n < 1048576 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1048576).toFixed(1)} MB`);
const iconFor = (f: File) => (f.type.startsWith("image/") ? <ImageIcon size={16} /> : f.type.startsWith("video/") ? <VideoIcon size={16} /> : <FileIcon size={16} />);

/** Drop zone + upload queue with concurrency, per-file progress and speed, pause/resume, retry, cancel and totals. */
export function UploadQueue({ upload, concurrency = 2, accept, maxSizeMB = 100, onComplete, className }: UploadQueueProps) {
  const [items, setItems] = React.useState<UploadItem[]>([]);
  const [drag, setDrag] = React.useState(false);
  const controllers = React.useRef(new Map<string, AbortController>());
  const input = React.useRef<HTMLInputElement>(null);
  const patch = (id: string, p: Partial<UploadItem>) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, ...p } : x)));

  const add = (files: FileList | File[]) => {
    const next = Array.from(files).map<UploadItem>((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      progress: 0,
      status: file.size > maxSizeMB * 1048576 ? "error" : "queued",
      error: file.size > maxSizeMB * 1048576 ? `Larger than ${maxSizeMB} MB` : undefined,
    }));
    setItems((xs) => [...xs, ...next]);
  };

  // Scheduler: start queued items while under the concurrency limit.
  React.useEffect(() => {
    const active = items.filter((i) => i.status === "uploading").length;
    const queued = items.filter((i) => i.status === "queued").slice(0, Math.max(0, concurrency - active));
    for (const it of queued) {
      const ac = new AbortController();
      controllers.current.set(it.id, ac);
      patch(it.id, { status: "uploading" });
      const start = Date.now();
      const startP = it.progress;
      upload(
        it.file,
        (p) => {
          if (ac.signal.aborted) return;
          const secs = (Date.now() - start) / 1000;
          patch(it.id, { progress: p, speed: secs > 0.2 ? ((p - startP) * it.file.size) / secs : undefined });
        },
        ac.signal,
      ).then(
        () => !ac.signal.aborted && patch(it.id, { status: "done", progress: 1 }),
        (e: unknown) => !ac.signal.aborted && patch(it.id, { status: "error", error: e instanceof Error ? e.message : "Upload failed" }),
      );
    }
    if (items.length && items.every((i) => i.status === "done")) onComplete?.(items.map((i) => i.file));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, concurrency]);

  const pause = (id: string) => {
    controllers.current.get(id)?.abort();
    patch(id, { status: "paused", speed: undefined });
  };
  const remove = (id: string) => {
    controllers.current.get(id)?.abort();
    setItems((xs) => xs.filter((x) => x.id !== id));
  };

  const total = items.reduce((a, i) => a + i.file.size, 0);
  const sent = items.reduce((a, i) => a + i.file.size * i.progress, 0);
  const doneCount = items.filter((i) => i.status === "done").length;

  return (
    <div className={cn("flex w-full max-w-lg flex-col gap-3", className)}>
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); }}
        className={cn("flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed p-6 text-sm transition-colors", drag ? "border-accent bg-accent-soft" : "border-border-strong hover:border-muted")}
      >
        <UploadIcon size={22} className="text-accent" />
        <span><b>Click to upload</b> or drag files here</span>
        <span className="text-xs text-subtle">Up to {maxSizeMB} MB each · {concurrency} at a time</span>
      </button>
      <input ref={input} type="file" multiple accept={accept} hidden onChange={(e) => { if (e.target.files) add(e.target.files); e.target.value = ""; }} />
      {items.length ? (
        <div className="flex items-center gap-3 px-1 text-xs text-subtle">
          <span>{doneCount}/{items.length} uploaded</span>
          <span className="h-1 flex-1 overflow-hidden rounded-full bg-surface-raised">
            <motion.span className="block h-full bg-accent" animate={{ width: `${total ? (sent / total) * 100 : 0}%` }} />
          </span>
          <span className="font-mono">{fmt(sent)} / {fmt(total)}</span>
        </div>
      ) : null}
      <ul className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {items.map((it) => (
            <motion.li key={it.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40 }} className={cn("relative flex items-center gap-3 overflow-hidden rounded-xl border bg-surface p-3", it.status === "error" ? "border-danger/40" : "border-border")}>
              <motion.span className="absolute inset-y-0 left-0 bg-accent-soft/40" animate={{ width: `${it.progress * 100}%` }} transition={{ ease: "linear" }} aria-hidden />
              <span className="relative flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-raised text-muted">{iconFor(it.file)}</span>
              <div className="relative flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">{it.file.name}</span>
                <span className={cn("text-xs", it.status === "error" ? "text-danger" : "text-subtle")}>
                  {it.status === "error" ? it.error : it.status === "done" ? `${fmt(it.file.size)} · done` : it.status === "paused" ? `Paused at ${Math.round(it.progress * 100)}%` : it.status === "queued" ? "Waiting…" : `${Math.round(it.progress * 100)}% · ${it.speed ? `${fmt(it.speed)}/s` : "starting"}`}
                </span>
              </div>
              <span className="relative flex items-center gap-1">
                {it.status === "uploading" ? <button type="button" aria-label="Pause" onClick={() => pause(it.id)} className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface-raised"><PauseIcon size={14} /></button> : null}
                {it.status === "paused" ? <button type="button" aria-label="Resume" onClick={() => patch(it.id, { status: "queued" })} className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface-raised"><PlayIcon size={14} /></button> : null}
                {it.status === "error" && it.file.size <= maxSizeMB * 1048576 ? <button type="button" aria-label="Retry" onClick={() => patch(it.id, { status: "queued", progress: 0, error: undefined })} className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface-raised"><RotateCwIcon size={14} /></button> : null}
                {it.status === "done" ? <span className="flex size-8 items-center justify-center text-success"><CheckIcon size={16} strokeWidth={2.6} /></span> : <button type="button" aria-label="Cancel" onClick={() => remove(it.id)} className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface-raised hover:text-danger"><XIcon size={14} /></button>}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
