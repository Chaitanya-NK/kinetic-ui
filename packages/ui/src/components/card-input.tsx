"use client";

import * as React from "react";
import { cn } from "@kineticui/core";
import { LockIcon } from "@kineticui/icons";

export type CardBrand = "visa" | "mastercard" | "amex" | "rupay" | "discover" | "unknown";

export function detectBrand(number: string): CardBrand {
  const n = number.replace(/\D/g, "");
  if (/^4/.test(n)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  if (/^(60|65|81|82|508)/.test(n)) return "rupay";
  if (/^6011|^64[4-9]/.test(n)) return "discover";
  return "unknown";
}

/** Luhn checksum — true for numbers that could be real cards. */
export function luhn(number: string) {
  const d = number.replace(/\D/g, "");
  if (d.length < 12) return false;
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let x = Number(d[d.length - 1 - i]);
    if (i % 2) {
      x *= 2;
      if (x > 9) x -= 9;
    }
    sum += x;
  }
  return sum % 10 === 0;
}

export type CardValue = { number: string; expiry: string; cvc: string; brand: CardBrand; complete: boolean; valid: boolean };

export type CardInputProps = {
  onValueChange?: (value: CardValue) => void;
  className?: string;
  /** Show the "encrypted" note under the field. */
  showNote?: boolean;
};

const brandLabel: Record<CardBrand, string> = { visa: "VISA", mastercard: "MC", amex: "AMEX", rupay: "RUPAY", discover: "DISC", unknown: "CARD" };

/** Card number, expiry and CVC with brand detection, auto-advance and Luhn check. UI only — pass values to your payment provider. */
export function CardInput({ onValueChange, className, showNote = true }: CardInputProps) {
  const [number, setNumber] = React.useState("");
  const [expiry, setExpiry] = React.useState("");
  const [cvc, setCvc] = React.useState("");
  const expRef = React.useRef<HTMLInputElement>(null);
  const cvcRef = React.useRef<HTMLInputElement>(null);
  const brand = detectBrand(number);
  const numLen = brand === "amex" ? 15 : 16;
  const cvcLen = brand === "amex" ? 4 : 3;
  const valid = luhn(number);

  React.useEffect(() => {
    const complete = number.replace(/\D/g, "").length === numLen && expiry.length === 7 && cvc.length === cvcLen;
    onValueChange?.({ number: number.replace(/\D/g, ""), expiry, cvc, brand, complete, valid });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [number, expiry, cvc]);

  const formatNumber = (d: string) =>
    brand === "amex" ? [d.slice(0, 4), d.slice(4, 10), d.slice(10, 15)].filter(Boolean).join(" ") : (d.match(/.{1,4}/g) ?? []).join(" ");

  const numberInvalid = number.replace(/\D/g, "").length === numLen && !valid;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="overflow-hidden rounded-xl border border-border bg-background transition-[border-color,box-shadow] focus-within:border-accent focus-within:shadow-[0_0_0_4px_var(--kn-ring)]">
        <div className={cn("flex h-12 items-center gap-2.5 border-b border-border px-3.5", numberInvalid && "bg-danger-soft/40")}>
          <span className={cn("flex h-6 w-10 shrink-0 items-center justify-center rounded-md font-mono text-[9px] font-bold transition-colors", brand === "unknown" ? "bg-surface-overlay text-subtle" : "bg-accent text-accent-foreground")}>
            {brandLabel[brand]}
          </span>
          <input
            inputMode="numeric"
            autoComplete="cc-number"
            aria-label="Card number"
            aria-invalid={numberInvalid || undefined}
            placeholder="1234 1234 1234 1234"
            value={formatNumber(number.replace(/\D/g, ""))}
            onChange={(e) => {
              const d = e.target.value.replace(/\D/g, "").slice(0, numLen);
              setNumber(d);
              if (d.length === numLen) expRef.current?.focus();
            }}
            className="min-w-0 flex-1 bg-transparent font-mono text-[15px] tracking-wide text-foreground outline-none placeholder:text-border-strong"
          />
        </div>
        <div className="grid grid-cols-2">
          <input
            ref={expRef}
            inputMode="numeric"
            autoComplete="cc-exp"
            aria-label="Expiry date (MM / YY)"
            placeholder="MM / YY"
            value={expiry}
            onChange={(e) => {
              const d = e.target.value.replace(/\D/g, "").slice(0, 4);
              const fixed = d.length >= 1 && Number(d[0]) > 1 ? `0${d}`.slice(0, 4) : d;
              const out = fixed.length > 2 ? `${fixed.slice(0, 2)} / ${fixed.slice(2)}` : fixed;
              setExpiry(out);
              if (fixed.length === 4) cvcRef.current?.focus();
            }}
            className="h-12 border-r border-border bg-transparent px-3.5 font-mono text-[15px] text-foreground outline-none placeholder:text-border-strong"
          />
          <input
            ref={cvcRef}
            inputMode="numeric"
            autoComplete="cc-csc"
            aria-label="Security code"
            placeholder={brand === "amex" ? "CVC (4)" : "CVC"}
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, cvcLen))}
            className="h-12 bg-transparent px-3.5 font-mono text-[15px] text-foreground outline-none placeholder:text-border-strong"
          />
        </div>
      </div>
      {numberInvalid ? <span role="alert" className="text-xs text-danger">That card number doesn’t look right.</span> : null}
      {showNote ? (
        <span className="flex items-center gap-1.5 text-xs text-subtle">
          <LockIcon size={12} /> Encrypted end to end. Focus moves to the next field automatically.
        </span>
      ) : null}
    </div>
  );
}
