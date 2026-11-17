"use client";

import * as React from "react";
import { animate, motion, useMotionValue } from "motion/react";
import { cn, useReducedMotion } from "@kineticui/core";

export type ReceiptLine = { label: React.ReactNode; qty?: number; amount: number };

export type ReceiptPrinterProps = {
  merchant: React.ReactNode;
  /** Small lines under the merchant name: address, order number, date. */
  meta?: React.ReactNode[];
  items: ReceiptLine[];
  /** Tax rate as a fraction, e.g. 0.18. Leave out for no tax line. */
  tax?: number;
  taxLabel?: string;
  /** Extra lines like discounts or tips, added after the subtotal. */
  adjustments?: ReceiptLine[];
  currency?: string;
  locale?: string;
  /** Footer text, e.g. "Thank you". */
  footer?: React.ReactNode;
  /** Barcode payload printed at the bottom. */
  barcode?: string;
  /** Change this value to print again. */
  printKey?: React.Key;
  /** Start printing as soon as it mounts. Default true. */
  autoPrint?: boolean;
  /** Milliseconds per printed line. */
  speed?: number;
  onPrinted?: () => void;
  /** Called on every printed line, e.g. to play a tick sound. */
  onLine?: (index: number) => void;
  className?: string;
};

/** A deterministic, scannable-looking (not real) barcode from a string. */
function Barcode({ value }: { value: string }) {
  const bars: number[] = [];
  let seed = 7;
  for (const ch of value + value) {
    seed = (seed * 31 + ch.charCodeAt(0)) % 9973;
    bars.push(1 + (seed % 3), 1 + ((seed >> 2) % 2));
  }
  let x = 0;
  const rects = bars.map((w, k) => {
    const r = k % 2 === 0 ? <rect key={k} x={x} y={0} width={w} height={40} /> : null;
    x += w;
    return r;
  });
  return (
    <svg viewBox={`0 0 ${x} 40`} preserveAspectRatio="none" className="h-10 w-full" fill="currentColor" aria-hidden>
      {rects}
    </svg>
  );
}

/**
 * A thermal receipt that prints line by line out of a slot, then can be torn off.
 * Feed it real line items; totals are worked out for you.
 */
export function ReceiptPrinter({
  merchant,
  meta = [],
  items,
  tax,
  taxLabel = "Tax",
  adjustments = [],
  currency = "USD",
  locale,
  footer = "Thank you",
  barcode,
  printKey,
  autoPrint = true,
  speed = 140,
  onPrinted,
  onLine,
  className,
}: ReceiptPrinterProps) {
  const reduced = useReducedMotion();
  const fmt = React.useMemo(() => new Intl.NumberFormat(locale, { style: "currency", currency }), [locale, currency]);
  const subtotal = items.reduce((s, l) => s + l.amount * (l.qty ?? 1), 0);
  const taxAmount = tax ? subtotal * tax : 0;
  const total = subtotal + taxAmount + adjustments.reduce((s, l) => s + l.amount, 0);

  const paper = React.useRef<HTMLDivElement>(null);
  const y = useMotionValue(-2000);
  const [state, setState] = React.useState<"idle" | "printing" | "done" | "torn">(autoPrint ? "printing" : "idle");
  const [run, setRun] = React.useState(0);
  const cbs = React.useRef({ onPrinted, onLine });
  cbs.current = { onPrinted, onLine };

  React.useEffect(() => {
    if (printKey === undefined) return;
    setState("printing");
    setRun((r) => r + 1);
  }, [printKey]);

  React.useEffect(() => {
    const el = paper.current;
    if (!el) return;
    const H = el.offsetHeight;
    if (state === "idle") {
      y.set(H);
      return;
    }
    if (state !== "printing") return;
    const rows = Array.from(el.querySelectorAll<HTMLElement>("[data-row]"));
    if (reduced) {
      y.set(0);
      setState("done");
      cbs.current.onPrinted?.();
      return;
    }
    y.set(H);
    let k = 0;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const feed = () => {
      if (cancelled) return;
      if (k >= rows.length) {
        animate(y, 0, { type: "spring", stiffness: 500, damping: 40 });
        setState("done");
        cbs.current.onPrinted?.();
        return;
      }
      const row = rows[k]!;
      const bottom = row.offsetTop + row.offsetHeight;
      animate(y, Math.max(0, H - bottom - 14), { type: "spring", stiffness: 900, damping: 38 });
      cbs.current.onLine?.(k);
      k++;
      timer = setTimeout(feed, speed * (0.8 + Math.random() * 0.5));
    };
    timer = setTimeout(feed, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [state, run, reduced, speed, y]);

  const Row = ({ children, className: c }: { children: React.ReactNode; className?: string }) => (
    <div data-row="" className={c}>
      {children}
    </div>
  );
  const Rule = () => <div data-row="" className="my-2 border-t border-dashed border-neutral-400" />;
  const money = (n: number) => fmt.format(n);

  return (
    <div className={cn("relative inline-flex w-[19rem] flex-col items-center pt-3", className)}>
      {/* paper */}
      <div className="relative w-[17rem] pb-3" style={{ clipPath: "inset(-800px -60px 0 -60px)" }}>
        <motion.div
          ref={paper}
          aria-live="polite"
          style={{ y }}
          animate={state === "torn" ? { y: -60, rotate: -7, opacity: 0 } : { rotate: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.8, 1] }}
          className="relative bg-[#f7f5ef] px-5 pb-6 pt-5 font-mono text-[12px] leading-[1.55] text-neutral-800"
        >
          <Row className="text-center font-display text-base font-bold tracking-tight text-neutral-900">{merchant}</Row>
          {meta.map((m, k) => (
            <Row key={k} className="text-center text-[11px] text-neutral-500">
              {m}
            </Row>
          ))}
          <Rule />
          {items.map((l, k) => (
            <Row key={k} className="flex gap-2">
              <span className="w-6 shrink-0 text-neutral-500">{l.qty ?? 1}x</span>
              <span className="min-w-0 flex-1 truncate">{l.label}</span>
              <span className="tabular-nums">{money(l.amount * (l.qty ?? 1))}</span>
            </Row>
          ))}
          <Rule />
          <Row className="flex justify-between text-neutral-600">
            <span>Subtotal</span>
            <span className="tabular-nums">{money(subtotal)}</span>
          </Row>
          {tax ? (
            <Row className="flex justify-between text-neutral-600">
              <span>
                {taxLabel} {Math.round(tax * 1000) / 10}%
              </span>
              <span className="tabular-nums">{money(taxAmount)}</span>
            </Row>
          ) : null}
          {adjustments.map((l, k) => (
            <Row key={k} className="flex justify-between text-neutral-600">
              <span>{l.label}</span>
              <span className="tabular-nums">{money(l.amount)}</span>
            </Row>
          ))}
          <Row className="mt-1 flex justify-between text-[15px] font-bold text-neutral-900">
            <span>TOTAL</span>
            <span className="tabular-nums">{money(total)}</span>
          </Row>
          <Rule />
          {footer && <Row className="text-center text-neutral-600">{footer}</Row>}
          {barcode && (
            <Row className="mt-2 text-neutral-900">
              <Barcode value={barcode} />
              <div className="mt-1 text-center text-[10px] tracking-[0.3em] text-neutral-500">{barcode}</div>
            </Row>
          )}
          {/* torn zigzag edges */}
          <div
            aria-hidden
            className="absolute inset-x-0 -top-2 h-2"
            style={{
              background: "linear-gradient(-135deg, transparent 6px, #f7f5ef 0) 0 0/12px 100%, linear-gradient(135deg, transparent 6px, #f7f5ef 0) 0 0/12px 100%",
              backgroundRepeat: "repeat-x",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-x-0 -bottom-2 h-2"
            style={{
              background: "linear-gradient(-45deg, transparent 6px, #f7f5ef 0) 0 0/12px 100%, linear-gradient(45deg, transparent 6px, #f7f5ef 0) 0 0/12px 100%",
              backgroundRepeat: "repeat-x",
            }}
          />
        </motion.div>
      </div>

      {/* printer */}
      <div className="relative z-10 -mt-2 w-full rounded-2xl border border-border bg-surface-raised px-4 pb-3 pt-3 shadow-overlay">
        <div className="mb-3 h-2.5 rounded-full bg-black shadow-[inset_0_2px_3px_rgb(0_0_0/.8)]" />
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">Kinetic Print</span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-muted">
            <span
              className={cn("size-1.5 rounded-full", state === "printing" ? "animate-kn-pulse bg-accent" : state === "done" ? "bg-success" : "bg-border-strong")}
            />
            {state === "printing" ? "Printing" : state === "done" ? "Ready" : state === "torn" ? "Torn" : "Idle"}
          </span>
        </div>
      </div>

      {/* controls */}
      <div className="mt-4 flex gap-2">
        {state === "done" && (
          <button type="button" onClick={() => setState("torn")} className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground">
            Tear off
          </button>
        )}
        {(state === "done" || state === "torn" || state === "idle") && (
          <button
            type="button"
            onClick={() => {
              setState("printing");
              setRun((r) => r + 1);
            }}
            className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground transition-transform active:scale-95"
          >
            {state === "idle" ? "Print" : "Print again"}
          </button>
        )}
      </div>
    </div>
  );
}
