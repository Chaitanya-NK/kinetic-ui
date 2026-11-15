"use client";

import * as React from "react";
import { cn } from "@kineticui/core";
import { Badge, Button, LineChart, SegmentedControl } from "@kineticui/ui";
import { NumberTicker } from "@kineticui/motion";
import { StarIcon } from "@kineticui/icons";

const ranges = { "1D": 24, "1W": 7, "1M": 30, "1Y": 12 } as const;
type Range = keyof typeof ranges;

function series(range: Range, seed: number) {
  const n = ranges[range];
  let v = 182;
  let s = seed;
  return Array.from({ length: n }, (_, i) => {
    s = (s * 16807) % 2147483647;
    v = Math.max(120, v + ((s % 1000) / 1000 - 0.45) * (range === "1D" ? 1.4 : 4));
    const label = range === "1D" ? `${9 + Math.floor(i / 3)}:${String((i % 3) * 20).padStart(2, "0")}` : range === "1Y" ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i]! : `D${i + 1}`;
    return { t: label, price: Math.round(v * 100) / 100 };
  });
}

/** Ticker card: live-ish price, range switcher, area chart, key stats and a watchlist toggle. */
export function StockWidget({ symbol = "KNTC", name = "Kinetic Labs Inc." }: { symbol?: string; name?: string }) {
  const [range, setRange] = React.useState<Range>("1M");
  const [watch, setWatch] = React.useState(false);
  const data = React.useMemo(() => series(range, range.charCodeAt(1) * 97), [range]);
  const first = data[0]!.price;
  const last = data.at(-1)!.price;
  const change = last - first;
  const pct = (change / first) * 100;
  const up = change >= 0;

  return (
    <section className="flex min-h-[560px] items-center justify-center p-6">
      <div className="flex w-full max-w-xl flex-col gap-5 rounded-3xl border border-border bg-surface p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-accent font-display font-bold text-accent-foreground">K</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 font-semibold">{symbol} <Badge size="sm">NASDAQ</Badge></div>
            <div className="text-sm text-subtle">{name}</div>
          </div>
          <Button variant={watch ? "soft" : "secondary"} size="sm" onClick={() => setWatch(!watch)} aria-pressed={watch}>
            <StarIcon size={14} className={watch ? "fill-current" : ""} /> {watch ? "Watching" : "Watch"}
          </Button>
        </div>
        <div className="flex items-end gap-3">
          <span className="font-display text-5xl font-semibold tabular-nums tracking-tight">
            <NumberTicker value={last} prefix="$" decimals={2} duration={0.6} />
          </span>
          <span className={cn("pb-2 font-mono text-sm font-medium", up ? "text-success" : "text-danger")}>
            {up ? "▲" : "▼"} {Math.abs(change).toFixed(2)} ({Math.abs(pct).toFixed(2)}%)
          </span>
        </div>
        <SegmentedControl value={range} defaultValue="1M" onValueChange={(v) => setRange(v as Range)} options={(Object.keys(ranges) as Range[]).map((r) => ({ value: r, label: r }))} />
        <LineChart key={range} data={data} index="t" series={[{ key: "price", name: symbol, color: up ? "var(--kn-success)" : "var(--kn-danger)" }]} area height={200} format={(v) => `$${v.toFixed(0)}`} showLegend={false} />
        <dl className="grid grid-cols-3 gap-3 border-t border-border pt-4 text-sm">
          {[
            ["Open", `$${first.toFixed(2)}`],
            ["High", `$${Math.max(...data.map((d) => d.price)).toFixed(2)}`],
            ["Low", `$${Math.min(...data.map((d) => d.price)).toFixed(2)}`],
            ["Mkt cap", "$42.1B"],
            ["P/E", "31.4"],
            ["Volume", "8.2M"],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-subtle">{k}</dt>
              <dd className="font-mono">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
