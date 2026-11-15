"use client";

import { useState } from "react";
import { cn } from "@kineticui/core";
import { CheckIcon, CopyIcon } from "@kineticui/icons";

export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : "Copy"}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      className={cn(
        "flex size-8 items-center justify-center rounded-lg border border-border bg-surface-raised text-muted transition-colors hover:text-foreground",
        copied && "border-accent text-accent",
        className,
      )}
    >
      {copied ? <CheckIcon size={14} strokeWidth={2.5} /> : <CopyIcon size={14} />}
    </button>
  );
}

export function CodeBlock({ code, className, maxHeight = 520 }: { code: string; className?: string; maxHeight?: number }) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-border bg-[#0D0D10]", className)}>
      <CopyButton text={code} className="absolute right-3 top-3 z-10" />
      <pre className="overflow-auto p-5 pr-14 font-mono text-[13px] leading-relaxed text-[#D4D4D8]" style={{ maxHeight }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function Command({ command }: { command: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-[#0D0D10] py-2 pl-4 pr-2 font-mono text-[13px] text-[#D4D4D8]">
      <span className="overflow-x-auto whitespace-nowrap">
        <span className="text-[#8A8A93]">$ </span>
        {command}
      </span>
      <CopyButton text={command} />
    </div>
  );
}
