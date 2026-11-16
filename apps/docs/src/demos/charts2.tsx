"use client";

import * as React from "react";
import { BarList, Button, CandlestickChart, Gauge, RadarChart, ScatterChart, Treemap, type Candle, type ScatterGroup, type TreemapNode } from "@kineticui/ui";
import { GlobeIcon, LinkIcon, MailIcon, MessageCircleIcon, SearchIcon } from "@kineticui/icons";

const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647), seed / 2147483647);

/* radar */
const skills = [
  { axis: "Speed", kinetic: 92, other: 70 },
  { axis: "A11y", kinetic: 88, other: 64 },
  { axis: "Motion", kinetic: 96, other: 48 },
  { axis: "Theming", kinetic: 84, other: 76 },
  { axis: "Bundle", kinetic: 78, other: 58 },
  { axis: "DX", kinetic: 90, other: 72 },
];

/* scatter */
function scatterData(): ScatterGroup[] {
  const r = rng(11);
  const mk = (n: number, base: number, slope: number) => Array.from({ length: n }, () => {
    const x = Math.round(r() * 100);
    return { x, y: Math.round(base + x * slope + (r() - 0.5) * 40), z: Math.round(r() * 900 + 100), label: `Campaign ${Math.round(r() * 900)}` };
  });
  return [
    { key: "search", name: "Search", points: mk(22, 20, 1.1) },
    { key: "social", name: "Social", points: mk(22, 10, 0.6) },
  ];
}

/* candles */
function candles(n = 60): Candle[] {
  const r = rng(42);
  let p = 182;
  return Array.from({ length: n }, (_, i) => {
    const open = p;
    const close = Math.max(20, open + (r() - 0.47) * 6);
    const high = Math.max(open, close) + r() * 3;
    const low = Math.min(open, close) - r() * 3;
    p = close;
    const d = new Date(Date.UTC(2026, 8, 1 + i));
    return { time: `${d.getUTCDate()} ${["Sep", "Oct", "Nov"][d.getUTCMonth() - 8]}`, open, high, low, close, volume: Math.round(2000 + r() * 8000) };
  });
}

/* treemap */
const spend: TreemapNode[] = [
  { name: "Engineering", children: [{ name: "Salaries", value: 820 }, { name: "Cloud", value: 240 }, { name: "Tools", value: 64 }, { name: "Hardware", value: 48 }] },
  { name: "Marketing", children: [{ name: "Ads", value: 210 }, { name: "Events", value: 96 }, { name: "Content", value: 54 }, { name: "Sponsorships", value: 40 }] },
  { name: "Sales", children: [{ name: "Salaries", value: 300 }, { name: "Travel", value: 60 }, { name: "CRM", value: 24 }] },
  { name: "Operations", children: [{ name: "Office", value: 120 }, { name: "Legal", value: 44 }, { name: "Finance", value: 38 }] },
  { name: "Support", children: [{ name: "Salaries", value: 140 }, { name: "Helpdesk", value: 18 }] },
];

function GaugeDemo() {
  const [v, setV] = React.useState(72);
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap items-end justify-center gap-8">
        <Gauge value={v} label="Performance score" zones={[{ to: 49, color: "var(--kn-danger)", label: "Poor" }, { to: 89, color: "var(--kn-warning)", label: "Needs work" }, { to: 100, color: "var(--kn-accent)", label: "Good" }]} />
        <Gauge value={Math.round(v * 0.62)} max={64} sweep={180} size={200} needle={false} label="GB used of 64" format={(x) => `${Math.round(x)}`} zones={[{ to: 64, color: "#7C8CFF" }]} />
      </div>
      <div className="flex gap-2">
        {[18, 61, 97].map((n) => (
          <Button key={n} size="sm" variant={v === n ? "primary" : "outline"} onClick={() => setV(n)}>{n}</Button>
        ))}
        <Button size="sm" variant="ghost" onClick={() => setV(Math.round(Math.random() * 100))}>Random</Button>
      </div>
    </div>
  );
}

export const chart2Demos: Record<string, () => React.ReactNode> = {
  "radar-chart": () => (
    <RadarChart
      data={skills}
      index="axis"
      max={100}
      series={[{ key: "kinetic", name: "Kinetic UI" }, { key: "other", name: "Typical kit" }]}
      size={340}
    />
  ),
  "scatter-chart": () => {
    const d = scatterData();
    return (
      <div className="flex w-full max-w-3xl flex-col gap-8">
        <ScatterChart groups={d} trend xLabel="Spend ($k)" yLabel="Signups" height={300} />
      </div>
    );
  },
  gauge: () => <GaugeDemo />,
  treemap: () => (
    <div className="w-full max-w-3xl">
      <Treemap data={spend} height={380} format={(v) => `$${v}k`} />
    </div>
  ),
  "candlestick-chart": () => (
    <div className="w-full max-w-3xl rounded-2xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-baseline gap-3">
        <span className="font-display text-lg font-semibold">KNTC</span>
        <span className="text-xs text-subtle">Kinetic Corp · 1D</span>
      </div>
      <CandlestickChart data={candles()} movingAverages={[7, 21]} />
    </div>
  ),
  "bar-list": () => (
    <div className="grid w-full max-w-3xl gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
        <div className="flex justify-between text-xs text-subtle"><span>Top pages</span><span>Visitors</span></div>
        <BarList
          limit={5}
          items={[
            { name: "/components", value: 18420 },
            { name: "/", value: 15210 },
            { name: "/blocks", value: 9310 },
            { name: "/docs/installation", value: 6120 },
            { name: "/themes", value: 4180 },
            { name: "/components/globe", value: 3920 },
            { name: "/icons", value: 2210 },
          ]}
        />
      </div>
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
        <div className="flex justify-between text-xs text-subtle"><span>Referrers</span><span>Share</span></div>
        <BarList
          showPercent
          items={[
            { name: "Search", value: 8420, icon: <SearchIcon />, color: "#7C8CFF" },
            { name: "Direct", value: 6210, icon: <LinkIcon />, color: "#6EE7A0" },
            { name: "Social", value: 4310, icon: <MessageCircleIcon />, color: "#F0A3D0" },
            { name: "Newsletter", value: 2120, icon: <MailIcon />, color: "#F4A86A" },
            { name: "Other", value: 980, icon: <GlobeIcon /> },
          ]}
        />
      </div>
    </div>
  ),
};
