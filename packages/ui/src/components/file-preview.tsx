"use client";

import * as React from "react";
import { cn } from "@kineticui/core";
import { DownloadIcon, FileIcon, FileTextIcon, ZoomInIcon, ZoomOutIcon } from "@kineticui/icons";
import { tokenize } from "./code-block";

export type PreviewFile = {
  name: string;
  /** URL (http, blob: or data:). */
  url?: string;
  /** Inline text content for code / text files. */
  content?: string;
  size?: number;
  mime?: string;
};

const kindOf = (f: PreviewFile): "image" | "pdf" | "video" | "audio" | "code" | "text" | "other" => {
  const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
  const m = f.mime ?? "";
  if (m.startsWith("image/") || /^(png|jpe?g|gif|webp|svg|avif)$/.test(ext)) return "image";
  if (m === "application/pdf" || ext === "pdf") return "pdf";
  if (m.startsWith("video/") || /^(mp4|webm|mov)$/.test(ext)) return "video";
  if (m.startsWith("audio/") || /^(mp3|wav|ogg|m4a)$/.test(ext)) return "audio";
  if (/^(tsx?|jsx?|css|json|sh|py|go|rs|html|md)$/.test(ext)) return "code";
  if (m.startsWith("text/") || /^(txt|csv|log)$/.test(ext)) return "text";
  return "other";
};
const bytes = (n?: number) => (n === undefined ? "" : n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(1)} MB`);

/** Previews images (zoom), PDFs, video, audio, code (highlighted), text and CSV, with a header and download. */
export function FilePreview({ file, height = 440, className }: { file: PreviewFile; height?: number; className?: string }) {
  const kind = kindOf(file);
  const [zoom, setZoom] = React.useState(1);
  const ext = file.name.split(".").pop()?.toLowerCase();
  const lang = (ext === "ts" || ext === "tsx" || ext === "js" || ext === "jsx" ? ext : ext === "css" ? "css" : ext === "json" ? "json" : ext === "sh" ? "bash" : "text") as "tsx";

  let body: React.ReactNode;
  if (kind === "image" && file.url) {
    body = (
      <div className="flex h-full items-center justify-center overflow-auto bg-[repeating-conic-gradient(var(--kn-surface-raised)_0_25%,transparent_0_50%)] bg-[length:20px_20px] p-6">
        <img src={file.url} alt={file.name} style={{ transform: `scale(${zoom})` }} className="max-h-full max-w-full rounded-lg object-contain transition-transform" />
      </div>
    );
  } else if (kind === "pdf" && file.url) body = <iframe src={file.url} title={file.name} className="size-full bg-white" />;
  else if (kind === "video" && file.url) body = <video src={file.url} controls className="size-full bg-black object-contain" />;
  else if (kind === "audio" && file.url) body = <div className="flex h-full items-center justify-center p-8"><audio src={file.url} controls className="w-full" /></div>;
  else if ((kind === "code" || kind === "text") && file.content !== undefined) {
    if (ext === "csv") {
      const rows = file.content.trim().split("\n").map((r) => r.split(","));
      body = (
        <div className="h-full overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface-raised">
              <tr>{rows[0]?.map((h, i) => <th key={i} className="border-b border-border px-3 py-2 text-left font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.slice(1).map((r, i) => (
                <tr key={i} className="border-b border-border/60">{r.map((c, j) => <td key={j} className="px-3 py-2 tabular-nums text-muted">{c}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else {
      const toks = kind === "code" ? tokenize(file.content, lang) : [{ t: file.content }];
      body = (
        <pre className="h-full overflow-auto bg-[#0b0c0e] p-4 font-mono text-[12.5px] leading-[21px] text-[#E8E8E3]">
          {toks.map((t, i) => <span key={i} className={"c" in t ? t.c : undefined}>{t.t}</span>)}
        </pre>
      );
    }
  } else {
    body = (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <FileIcon size={40} className="text-subtle" />
        <span className="text-sm text-muted">No preview available for this file type.</span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-2xl border border-border bg-surface", className)}>
      <div className="flex items-center gap-3 border-b border-border px-4 py-2.5">
        <span className="flex size-8 items-center justify-center rounded-lg bg-surface-raised text-muted"><FileTextIcon size={16} /></span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium">{file.name}</span>
          <span className="font-mono text-[11px] uppercase text-subtle">{kind} {bytes(file.size) ? `· ${bytes(file.size)}` : ""}</span>
        </div>
        {kind === "image" ? (
          <>
            <button type="button" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface-raised hover:text-foreground"><ZoomOutIcon size={15} /></button>
            <span className="w-10 text-center font-mono text-xs text-subtle">{Math.round(zoom * 100)}%</span>
            <button type="button" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(3, z + 0.25))} className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface-raised hover:text-foreground"><ZoomInIcon size={15} /></button>
          </>
        ) : null}
        {file.url || file.content ? (
          <a
            href={file.url ?? `data:text/plain;charset=utf-8,${encodeURIComponent(file.content ?? "")}`}
            download={file.name}
            aria-label="Download"
            className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface-raised hover:text-foreground"
          >
            <DownloadIcon size={15} />
          </a>
        ) : null}
      </div>
      <div style={{ height }}>{body}</div>
    </div>
  );
}
