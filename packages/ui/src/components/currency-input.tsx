"use client";

import * as React from "react";
import { cn } from "@kineticui/core";

export type Currency = { code: string; locale: string; label?: string };

export const currencies: Currency[] = [
  { code: "INR", locale: "en-IN", label: "Indian rupee" },
  { code: "USD", locale: "en-US", label: "US dollar" },
  { code: "EUR", locale: "de-DE", label: "Euro" },
  { code: "GBP", locale: "en-GB", label: "British pound" },
  { code: "JPY", locale: "ja-JP", label: "Japanese yen" },
  { code: "AED", locale: "en-AE", label: "UAE dirham" },
  { code: "SGD", locale: "en-SG", label: "Singapore dollar" },
];

export type CurrencyInputProps = {
  /** Amount in major units (e.g. 1499.5). */
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null, currency: string) => void;
  currency?: string;
  onCurrencyChange?: (code: string) => void;
  /** Show the currency selector. */
  selectable?: boolean;
  min?: number;
  max?: number;
  /** Quick-pick amounts shown as chips. */
  presets?: number[];
  invalid?: boolean;
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
};

/** Money input that formats as you type with the right symbol, grouping and decimals for each currency (lakh/crore for INR). */
export function CurrencyInput({
  value,
  defaultValue = null,
  onValueChange,
  currency: currencyProp,
  onCurrencyChange,
  selectable = true,
  min,
  max,
  presets,
  invalid,
  placeholder = "0",
  className,
  ...aria
}: CurrencyInputProps) {
  const [inner, setInner] = React.useState<number | null>(defaultValue);
  const [code, setCode] = React.useState(currencyProp ?? "INR");
  const amount = value !== undefined ? value : inner;
  const cur = currencies.find((c) => c.code === (currencyProp ?? code)) ?? { code: currencyProp ?? code, locale: "en-US" };
  const fmt = React.useMemo(() => new Intl.NumberFormat(cur.locale, { style: "currency", currency: cur.code }), [cur.locale, cur.code]);
  const decimals = fmt.resolvedOptions().maximumFractionDigits ?? 2;
  const symbol = fmt.formatToParts(0).find((p) => p.type === "currency")?.value ?? cur.code;
  const group = new Intl.NumberFormat(cur.locale).formatToParts(1000.1);
  const decSep = group.find((p) => p.type === "decimal")?.value ?? ".";
  const [text, setText] = React.useState(() => (amount == null ? "" : new Intl.NumberFormat(cur.locale, { maximumFractionDigits: decimals }).format(amount)));
  const [focused, setFocused] = React.useState(false);

  React.useEffect(() => {
    if (!focused) setText(amount == null ? "" : new Intl.NumberFormat(cur.locale, { maximumFractionDigits: decimals, minimumFractionDigits: amount % 1 ? decimals : 0 }).format(amount));
  }, [amount, cur.locale, decimals, focused]);

  const emit = (n: number | null) => {
    if (value === undefined) setInner(n);
    onValueChange?.(n, cur.code);
  };

  const parse = (raw: string) => {
    const cleaned = raw.replace(new RegExp(`[^0-9${decSep === "." ? "\\." : decSep}]`, "g"), "").replace(decSep, ".");
    const [int = "", frac] = cleaned.split(".");
    const limited = frac !== undefined && decimals > 0 ? `${int}.${frac.slice(0, decimals)}` : int;
    const n = limited === "" || limited === "." ? null : Number(limited);
    const intFormatted = int ? new Intl.NumberFormat(cur.locale).format(Number(int)) : "";
    setText(frac !== undefined && decimals > 0 ? `${intFormatted}${decSep}${frac.slice(0, decimals)}` : intFormatted);
    emit(n);
  };

  const out = amount != null && ((min !== undefined && amount < min) || (max !== undefined && amount > max));

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className={cn("flex h-14 items-center overflow-hidden rounded-xl border bg-surface transition-colors focus-within:border-accent", invalid || out ? "border-danger" : "border-border")}>
        <span className="pl-4 pr-1 font-display text-2xl text-subtle">{symbol}</span>
        <input
          inputMode="decimal"
          value={text}
          placeholder={placeholder}
          aria-invalid={invalid || out || undefined}
          aria-label={aria["aria-label"] ?? `Amount in ${cur.code}`}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => parse(e.target.value)}
          className="h-full min-w-0 flex-1 bg-transparent font-display text-2xl font-semibold tabular-nums outline-none placeholder:text-subtle"
        />
        {selectable ? (
          <select
            value={cur.code}
            aria-label="Currency"
            onChange={(e) => {
              setCode(e.target.value);
              onCurrencyChange?.(e.target.value);
            }}
            className="mr-2 h-10 rounded-lg border-0 bg-surface-raised px-2 font-mono text-sm outline-none"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>{c.code}</option>
            ))}
          </select>
        ) : (
          <span className="pr-4 font-mono text-sm text-subtle">{cur.code}</span>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className={out ? "text-danger" : "text-subtle"}>
          {out ? `Enter between ${fmt.format(min ?? 0)} and ${fmt.format(max ?? 0)}` : amount != null ? fmt.format(amount) : " "}
        </span>
        {presets ? (
          <div className="flex gap-1.5">
            {presets.map((p) => (
              <button key={p} type="button" onClick={() => emit(p)} className="rounded-full border border-border px-2.5 py-1 text-muted hover:border-accent hover:text-foreground">
                {new Intl.NumberFormat(cur.locale, { style: "currency", currency: cur.code, notation: "compact" }).format(p)}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
