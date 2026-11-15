"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@kineticui/core";
import { CameraIcon, TrashIcon } from "@kineticui/icons";

export type AvatarUploaderProps = {
  value?: string | null;
  /** Receives the chosen file. Return a promise to show upload progress; call `progress(0–1)` to update the ring. */
  onUpload: (file: File, progress: (p: number) => void) => Promise<string | void> | string | void;
  onRemove?: () => void;
  /** Accepted image types. */
  accept?: string;
  maxSizeMB?: number;
  size?: number;
  fallback?: React.ReactNode;
  className?: string;
};

/** Click or drop an image onto a round avatar; shows an upload progress ring and remove option. */
export function AvatarUploader({ value, onUpload, onRemove, accept = "image/png,image/jpeg,image/webp", maxSizeMB = 5, size = 96, fallback, className }: AvatarUploaderProps) {
  const input = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [over, setOver] = React.useState(false);
  const shown = preview ?? value ?? null;
  const r = size / 2 + 4;
  const c = 2 * Math.PI * r;

  const handle = async (file?: File) => {
    if (!file) return;
    setError(null);
    if (!accept.split(",").some((t) => file.type === t.trim())) return setError("Use a PNG, JPG or WebP image.");
    if (file.size > maxSizeMB * 1024 * 1024) return setError(`Max ${maxSizeMB} MB.`);
    const local = URL.createObjectURL(file);
    setPreview(local);
    setProgress(0);
    try {
      const out = await onUpload(file, (p) => setProgress(p));
      if (typeof out === "string") setPreview(out);
    } catch {
      setError("Upload failed. Try again.");
      setPreview(null);
    } finally {
      setProgress(null);
    }
  };

  return (
    <div className={cn("flex items-center gap-5", className)}>
      <button
        type="button"
        aria-label="Change photo"
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void handle(e.dataTransfer.files[0]);
        }}
        className="group relative shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        style={{ width: size, height: size }}
      >
        <span className={cn("flex size-full items-center justify-center overflow-hidden rounded-full bg-surface-raised text-subtle ring-2 transition-all", over ? "ring-accent" : "ring-border")}>
          {shown ? <img src={shown} alt="" className="size-full object-cover" /> : fallback ?? <CameraIcon size={size / 3.5} />}
        </span>
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
          <CameraIcon size={20} />
        </span>
        {progress !== null ? (
          <svg className="pointer-events-none absolute -rotate-90" style={{ inset: -6, width: size + 12, height: size + 12 }} viewBox={`0 0 ${size + 12} ${size + 12}`} aria-hidden>
            <circle cx={(size + 12) / 2} cy={(size + 12) / 2} r={r} fill="none" stroke="var(--kn-border)" strokeWidth="3" />
            <motion.circle cx={(size + 12) / 2} cy={(size + 12) / 2} r={r} fill="none" stroke="var(--kn-accent)" strokeWidth="3" strokeLinecap="round" strokeDasharray={c} animate={{ strokeDashoffset: c * (1 - progress) }} />
          </svg>
        ) : null}
        <input ref={input} type="file" accept={accept} hidden onChange={(e) => void handle(e.target.files?.[0]).then(() => (e.target.value = ""))} />
      </button>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <button type="button" onClick={() => input.current?.click()} className="h-9 rounded-[10px] border border-border-strong px-3.5 text-sm font-medium hover:bg-surface-raised">
            {shown ? "Change" : "Upload photo"}
          </button>
          {shown && onRemove ? (
            <button
              type="button"
              aria-label="Remove photo"
              onClick={() => {
                setPreview(null);
                onRemove();
              }}
              className="flex size-9 items-center justify-center rounded-[10px] text-muted hover:bg-danger-soft hover:text-danger"
            >
              <TrashIcon size={15} />
            </button>
          ) : null}
        </div>
        <span className={cn("text-xs", error ? "text-danger" : "text-subtle")}>
          {error ?? (progress !== null ? `Uploading… ${Math.round(progress * 100)}%` : `PNG, JPG or WebP, up to ${maxSizeMB} MB. Drop a file on the avatar.`)}
        </span>
      </div>
    </div>
  );
}
