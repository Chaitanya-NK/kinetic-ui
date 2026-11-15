"use client";

import * as React from "react";
import { cn } from "@kineticui/core";
import { CheckIcon, UploadIcon, XIcon } from "@kineticui/icons";

export type FileDropzoneProps = {
  /** Called with accepted files. */
  onFiles: (files: File[]) => void;
  /** Same as the input `accept` attribute, e.g. "image/*,.pdf". */
  accept?: string;
  multiple?: boolean;
  /** Max size per file in bytes. */
  maxSize?: number;
  /** Called with files that were rejected and why. */
  onReject?: (rejections: { file: File; reason: string }[]) => void;
  title?: React.ReactNode;
  hint?: React.ReactNode;
  disabled?: boolean;
  className?: string;
};

function matches(file: File, accept?: string) {
  if (!accept) return true;
  return accept.split(",").some((rule) => {
    const r = rule.trim().toLowerCase();
    if (r.startsWith(".")) return file.name.toLowerCase().endsWith(r);
    if (r.endsWith("/*")) return file.type.startsWith(r.slice(0, -1));
    return file.type === r;
  });
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(1)} GB`;
}

/** Drag-and-drop or click to choose. Lights up while a file hovers over it. */
export function FileDropzone({
  onFiles,
  accept,
  multiple = true,
  maxSize,
  onReject,
  title = "Drop files here or click to browse",
  hint,
  disabled,
  className,
}: FileDropzoneProps) {
  const [over, setOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handle = (list: FileList | null) => {
    if (!list) return;
    const ok: File[] = [];
    const bad: { file: File; reason: string }[] = [];
    for (const f of Array.from(list).slice(0, multiple ? undefined : 1)) {
      if (!matches(f, accept)) bad.push({ file: f, reason: "File type not allowed" });
      else if (maxSize && f.size > maxSize) bad.push({ file: f, reason: `Larger than ${formatBytes(maxSize)}` });
      else ok.push(f);
    }
    if (ok.length) onFiles(ok);
    if (bad.length) onReject?.(bad);
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (!disabled) handle(e.dataTransfer.files);
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-border-strong bg-background px-6 py-9 text-center outline-none transition-[background-color,border-color,transform] duration-200",
        "hover:border-subtle focus-visible:ring-2 focus-visible:ring-foreground",
        over && "scale-[1.01] border-accent bg-accent-soft/50",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <span className={cn("flex size-12 items-center justify-center rounded-xl transition-colors", over ? "bg-accent text-accent-foreground" : "bg-surface-overlay text-muted")}>
        <UploadIcon size={20} />
      </span>
      <span className="text-sm font-semibold text-foreground">{over ? "Drop to upload" : title}</span>
      {hint ? <span className="text-xs text-subtle">{hint}</span> : null}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          handle(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export type FileItemProps = {
  name: string;
  size?: number;
  /** 0–100 while uploading. */
  progress?: number;
  status?: "uploading" | "done" | "error";
  error?: string;
  onRemove?: () => void;
  className?: string;
};

/** One row in an upload list. */
export function FileItem({ name, size, progress = 0, status = "uploading", error, onRemove, className }: FileItemProps) {
  const ext = name.split(".").pop()?.slice(0, 4).toUpperCase() ?? "FILE";
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-overlay font-mono text-[10px] font-semibold text-muted">{ext}</span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex justify-between gap-2 text-sm">
          <span className="truncate">{name}</span>
          <span className={cn("shrink-0 font-mono text-xs", status === "error" ? "text-danger" : status === "done" ? "text-success" : "text-subtle")}>
            {status === "error" ? error ?? "Failed" : status === "done" ? "Uploaded" : size ? `${formatBytes((size * progress) / 100)} / ${formatBytes(size)}` : `${Math.round(progress)}%`}
          </span>
        </div>
        {status === "uploading" ? (
          <div className="h-1 overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${progress}%` }} />
          </div>
        ) : null}
      </div>
      {status === "done" ? <CheckIcon size={16} className="text-success" /> : null}
      {onRemove ? (
        <button type="button" aria-label={`Remove ${name}`} onClick={onRemove} className="text-subtle hover:text-foreground">
          <XIcon size={15} />
        </button>
      ) : null}
    </div>
  );
}
