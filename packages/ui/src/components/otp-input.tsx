"use client";

import * as React from "react";
import { cn } from "@kineticui/core";

export type OtpInputProps = {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  /** Called once every box is filled. */
  onComplete?: (value: string) => void;
  /** Insert a dash after this many digits, e.g. 3 for "123-456". */
  groupAfter?: number;
  invalid?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  "aria-label"?: string;
};

/** One-time-code input: auto-advance, backspace to go back, paste to fill. */
export function OtpInput({
  length = 6,
  value: controlled,
  onChange,
  onComplete,
  groupAfter,
  invalid,
  disabled,
  autoFocus,
  className,
  ...rest
}: OtpInputProps) {
  const [internal, setInternal] = React.useState("");
  const value = controlled ?? internal;
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);

  const set = (next: string) => {
    const clean = next.replace(/\D/g, "").slice(0, length);
    if (controlled === undefined) setInternal(clean);
    onChange?.(clean);
    if (clean.length === length) onComplete?.(clean);
    return clean;
  };

  const focus = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  return (
    <div role="group" aria-label={rest["aria-label"] ?? "One-time code"} className={cn("flex items-center gap-2", className)}>
      {Array.from({ length }).map((_, i) => (
        <React.Fragment key={i}>
          {groupAfter && i === groupAfter ? <span aria-hidden className="h-0.5 w-2.5 rounded bg-border-strong" /> : null}
          <input
            ref={(el) => {
              refs.current[i] = el;
            }}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            aria-label={`Digit ${i + 1}`}
            maxLength={1}
            disabled={disabled}
            autoFocus={autoFocus && i === 0}
            value={value[i] ?? ""}
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => {
              const ch = e.target.value.replace(/\D/g, "").slice(-1);
              if (!ch) return;
              const arr = value.padEnd(length, " ").split("");
              arr[i] = ch;
              set(arr.join("").replace(/\s+$/, ""));
              focus(i + 1);
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace") {
                e.preventDefault();
                const arr = value.split("");
                if (arr[i]) {
                  arr.splice(i, 1);
                  set(arr.join(""));
                } else {
                  arr.splice(i - 1, 1);
                  set(arr.join(""));
                  focus(i - 1);
                }
              } else if (e.key === "ArrowLeft") focus(i - 1);
              else if (e.key === "ArrowRight") focus(i + 1);
            }}
            onPaste={(e) => {
              e.preventDefault();
              const clean = set(e.clipboardData.getData("text"));
              focus(clean.length);
            }}
            className={cn(
              "h-14 w-12 rounded-xl border border-border bg-background text-center font-mono text-xl font-semibold text-foreground outline-none transition-[border-color,box-shadow]",
              "focus:border-accent focus:shadow-[0_0_0_4px_var(--kn-ring)] disabled:opacity-50",
              invalid && "border-danger",
            )}
          />
        </React.Fragment>
      ))}
    </div>
  );
}
