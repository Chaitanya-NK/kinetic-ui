"use client";

import * as React from "react";
import {
  AreaChart,
  Avatar,
  BarChart,
  BeforeAfter,
  Badge,
  Button,
  Carousel,
  CodeBlock,
  DataTable,
  DiffViewer,
  DonutChart,
  FunnelChart,
  Gantt,
  Heatmap,
  JsonViewer,
  Kanban,
  Leaderboard,
  LineChart,
  LogViewer,
  Sparkline,
  StatCard,
  Timeline,
  TreeView,
  UptimeBars,
  WeekCalendar,
  toast,
  type DataTableColumn,
  type KanbanColumn,
  type LogLine,
} from "@kineticui/ui";
import { BoltIcon, ChartIcon, CheckIcon, CodeIcon, UsersIcon, WalletIcon } from "@kineticui/icons";

/** Deterministic pseudo-random so server and client render the same numbers. */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const revenue = months.map((m, i) => ({ month: m, revenue: Math.round(18 + i * 3.4 + Math.sin(i) * 6) * 1000, expenses: Math.round(14 + i * 1.8 + Math.cos(i) * 4) * 1000 }));

type Invoice = { id: string; customer: string; email: string; amount: number; status: "Paid" | "Pending" | "Overdue"; date: string };
const people = ["Maya Kapoor", "Rohan Joshi", "Rosa Silva", "Kemi Okafor", "Lena Fischer", "Arjun Rao", "Sofia Marin", "Noah Kim", "Ines Duarte", "Tom Becker", "Aiko Sato", "Liam Walsh"];
const r1 = rng(7);
const invoices: Invoice[] = Array.from({ length: 23 }, (_, i) => {
  const name = people[i % people.length]!;
  return {
    id: `INV-${String(1040 + i)}`,
    customer: name,
    email: `${name.split(" ")[0]!.toLowerCase()}@acme.io`,
    amount: Math.round(r1() * 4800 + 120),
    status: (["Paid", "Paid", "Pending", "Overdue"] as const)[Math.floor(r1() * 4)]!,
    date: `2026-${String(1 + Math.floor(r1() * 10)).padStart(2, "0")}-${String(1 + Math.floor(r1() * 27)).padStart(2, "0")}`,
  };
});

const tone = { Paid: "success", Pending: "warning", Overdue: "danger" } as const;
const invoiceCols: DataTableColumn<Invoice>[] = [
  { key: "id", header: "Invoice", sortable: true, cell: (r) => <span className="font-mono text-xs">{r.id}</span> },
  {
    key: "customer",
    header: "Customer",
    sortable: true,
    cell: (r) => (
      <div className="flex items-center gap-2.5">
        <Avatar alt={r.customer} size="sm" />
        <div className="flex flex-col">
          <span className="font-medium">{r.customer}</span>
          <span className="text-xs text-subtle">{r.email}</span>
        </div>
      </div>
    ),
  },
  { key: "status", header: "Status", sortable: true, cell: (r) => <Badge variant={tone[r.status]} dot>{r.status}</Badge> },
  { key: "date", header: "Date", sortable: true, cell: (r) => <span className="text-muted">{r.date}</span> },
  { key: "amount", header: "Amount", sortable: true, align: "right", cell: (r) => `$${r.amount.toLocaleString("en-US")}` },
];

function KanbanDemo() {
  type Card = { id: string; title: string; tag: string; who: string };
  const [cols, setCols] = React.useState<KanbanColumn<Card>[]>([
    { id: "todo", title: "To do", color: "var(--kn-muted)", cards: [
      { id: "k1", title: "Audit colour contrast", tag: "Design", who: "Maya Kapoor" },
      { id: "k2", title: "Write migration guide", tag: "Docs", who: "Rohan Joshi" },
      { id: "k3", title: "Add RTL support", tag: "Eng", who: "Rosa Silva" },
    ] },
    { id: "doing", title: "In progress", color: "#7C8CFF", limit: 3, cards: [
      { id: "k4", title: "Data table virtualisation", tag: "Eng", who: "Kemi Okafor" },
      { id: "k5", title: "Chart tooltips", tag: "Eng", who: "Arjun Rao" },
    ] },
    { id: "review", title: "Review", color: "#F4A86A", cards: [{ id: "k6", title: "Command palette a11y", tag: "QA", who: "Lena Fischer" }] },
    { id: "done", title: "Done", color: "var(--kn-accent)", cards: [{ id: "k7", title: "Ship v1 registry", tag: "Eng", who: "Noah Kim" }] },
  ]);
  return (
    <Kanban
      className="w-full"
      columns={cols}
      onChange={setCols}
      onAddCard={(col) => setCols((c) => c.map((x) => (x.id === col ? { ...x, cards: [...x.cards, { id: `n${Date.now()}`, title: "New task", tag: "New", who: "You" }] } : x)))}
      renderCard={(c) => (
        <div className="flex flex-col gap-2.5">
          <span className="font-medium">{c.title}</span>
          <div className="flex items-center justify-between">
            <Badge variant="neutral">{c.tag}</Badge>
            <Avatar alt={c.who} size="sm" />
          </div>
        </div>
      )}
    />
  );
}

function LogDemo() {
  const msgs: LogLine[] = [
    { level: "info", source: "build", message: "Installing dependencies…" },
    { level: "info", source: "build", message: "added 412 packages in 6.2s" },
    { level: "info", source: "build", message: "Running `next build`" },
    { level: "warn", source: "next", message: "Image with src /hero.png has no width" },
    { level: "info", source: "next", message: "Compiled successfully in 3.9s" },
    { level: "info", source: "next", message: "Generating static pages (76/76)" },
    { level: "error", source: "edge", message: "Function /api/og exceeded 1MB bundle limit" },
    { level: "info", source: "deploy", message: "Uploading build outputs…" },
    { level: "success", source: "deploy", message: "Deployed to kinetic-ui.vercel.app in 41s" },
  ];
  const [lines, setLines] = React.useState<LogLine[]>(() => msgs.slice(0, 3).map((m, i) => ({ ...m, time: `12:04:0${i}` })));
  React.useEffect(() => {
    if (lines.length >= msgs.length) return;
    const t = window.setTimeout(() => setLines((l) => [...l, { ...msgs[l.length]!, time: `12:04:${String(l.length * 3).padStart(2, "0")}` }]), 700);
    return () => window.clearTimeout(t);
  });
  return <LogViewer className="w-full max-w-2xl" lines={lines} height={240} title="deploy · production" />;
}

const r2 = rng(42);
const heat: Record<string, number> = {};
{
  const end = new Date(2026, 10, 14);
  for (let i = 0; i < 26 * 7; i++) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    const v = r2();
    heat[`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`] = v < 0.3 ? 0 : Math.floor(v * v * 14);
  }
}

const r3 = rng(9);
const uptime = (bad: number) =>
  Array.from({ length: 60 }, (_, i) => {
    const d = new Date(2026, 8, 16 + i);
    const v = r3();
    const status = v < bad ? "down" : v < bad * 3 ? "degraded" : "up";
    return { date: `${months[d.getMonth()]} ${d.getDate()}`, status, note: status === "down" ? "Elevated error rates for 23 min" : status === "degraded" ? "Increased latency in eu-west" : undefined } as const;
  });

function photo(a: string, b: string, filter: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>${filter ? `<filter id="f">${filter}</filter>` : ""}</defs><g${filter ? ' filter="url(#f)"' : ""}><rect width="800" height="450" fill="url(#s)"/><circle cx="560" cy="170" r="70" fill="#FFE6A8"/><path d="M0 330 L160 210 L280 290 L430 160 L600 300 L800 220 L800 450 L0 450Z" fill="#1d2a1a"/><path d="M0 380 L200 300 L420 360 L620 290 L800 350 L800 450 L0 450Z" fill="#0f1a10"/></g></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const before = `export function Button({ children }) {
  return (
    <button className="btn">
      {children}
    </button>
  );
}`;
const after = `export function Button({ children, loading }) {
  return (
    <button className="btn" disabled={loading}>
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}`;

export const dataDemos: Record<string, () => React.ReactNode> = {
  "data-table": () => (
    <DataTable
      className="w-full"
      data={invoices}
      columns={invoiceCols}
      getRowId={(r) => r.id}
      selectable
      pageSize={6}
      searchPlaceholder="Search invoices"
      toolbar={<Button size="sm" variant="secondary" className="ml-auto">Export CSV</Button>}
      bulkActions={(rows, clear) => (
        <>
          <Button size="sm" variant="secondary" onClick={() => toast(`Reminder sent to ${rows.length}`)}>Send reminder</Button>
          <Button size="sm" variant="destructive" onClick={() => { toast(`Voided ${rows.length}`); clear(); }}>Void</Button>
        </>
      )}
    />
  ),
  charts: () => (
    <div className="grid w-full gap-8 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-3 text-sm font-medium">Revenue vs expenses</div>
        <AreaChart data={revenue} index="month" series={[{ key: "revenue", name: "Revenue" }, { key: "expenses", name: "Expenses", color: "#7C8CFF" }]} format={(v) => `$${v / 1000}k`} height={220} />
      </div>
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-3 text-sm font-medium">Signups by channel</div>
        <BarChart data={revenue.slice(0, 8).map((d, i) => ({ month: d.month, organic: 40 + i * 6, paid: 20 + ((i * 7) % 25), referral: 10 + i * 2 }))} index="month" series={[{ key: "organic", name: "Organic" }, { key: "paid", name: "Paid" }, { key: "referral", name: "Referral" }]} stacked height={220} />
      </div>
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-4 text-sm font-medium">Traffic sources</div>
        <DonutChart data={[{ label: "Search", value: 4820 }, { label: "Direct", value: 2210 }, { label: "Social", value: 1640 }, { label: "Email", value: 930 }]} label="Visits" size={180} />
      </div>
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-4 text-sm font-medium">Checkout funnel</div>
        <FunnelChart steps={[{ label: "Visited", value: 12400 }, { label: "Added to cart", value: 4210 }, { label: "Checkout", value: 2120 }, { label: "Purchased", value: 1380 }]} />
      </div>
      <div className="rounded-2xl border border-border bg-surface p-5 lg:col-span-2">
        <div className="mb-3 text-sm font-medium">Latency p50 / p95 (ms)</div>
        <LineChart data={Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, p50: Math.round(80 + Math.sin(i / 3) * 18), p95: Math.round(190 + Math.sin(i / 3) * 40 + (i === 14 ? 120 : 0)) }))} index="hour" series={[{ key: "p50" }, { key: "p95", color: "#F4A86A" }]} height={200} />
      </div>
    </div>
  ),
  "stat-card": () => (
    <div className="grid w-full gap-3 sm:grid-cols-2">
      <StatCard label="Revenue" icon={<WalletIcon />} value="$48.2k" delta={12.4} hint="vs last month" chart={<Sparkline data={[4, 6, 5, 8, 7, 9, 12, 11, 14]} width={80} />} />
      <StatCard label="Active users" icon={<UsersIcon />} value="9,214" delta={4.1} hint="vs last week" chart={<Sparkline data={[8, 7, 9, 9, 10, 11, 10, 12]} width={80} color="#7C8CFF" />} />
      <StatCard label="Churn" icon={<ChartIcon />} value="2.1%" delta={-0.6} invertDelta hint="vs last month" />
      <StatCard label="p95 latency" icon={<BoltIcon />} value="184ms" delta={9.8} invertDelta hint="regressed" />
    </div>
  ),
  heatmap: () => <Heatmap values={heat} endDate={new Date(2026, 10, 14)} label={(n) => `${n} commits`} />,
  timeline: () => (
    <Timeline
      className="w-full max-w-md"
      items={[
        { title: "Deployed to production", description: "v2.4.0 · 41s build", time: "2m ago", tone: "accent", icon: <CheckIcon /> },
        { title: "Maya approved the pull request", time: "18m ago", tone: "success", content: <div className="rounded-xl border border-border bg-surface p-3 text-sm text-muted">Looks great. Ship it once the a11y check passes.</div> },
        { title: "CI failed on edge runtime", description: "Function /api/og exceeded the bundle limit", time: "1h ago", tone: "danger" },
        { title: "Rohan opened #482", description: "feat(table): column pinning", time: "3h ago", icon: <CodeIcon /> },
      ]}
    />
  ),
  leaderboard: () => {
    const Demo = () => {
      const [entries, setEntries] = React.useState([
        { id: "a", name: "Maya Kapoor", subtitle: "Design", score: 9420, change: 2 },
        { id: "b", name: "Rohan Joshi", subtitle: "Platform", score: 8710, change: -1 },
        { id: "c", name: "Rosa Silva", subtitle: "Design", score: 8230 },
        { id: "d", name: "You", subtitle: "Growth", score: 7640, change: 3, isYou: true },
        { id: "e", name: "Kemi Okafor", subtitle: "CTO", score: 6990, change: -2 },
      ]);
      return (
        <div className="flex w-full max-w-md flex-col gap-3">
          <Leaderboard entries={entries.map((e) => ({ ...e, avatar: <Avatar alt={e.name} size="sm" /> }))} unit="XP" />
          <Button size="sm" variant="secondary" onClick={() => setEntries((es) => es.map((e) => (e.isYou ? { ...e, score: e.score + 900 } : e)))}>
            +900 XP for you
          </Button>
        </div>
      );
    };
    return <Demo />;
  },
  kanban: () => <KanbanDemo />,
  "tree-view": () => {
    const Demo = () => {
      const [sel, setSel] = React.useState("button");
      return (
        <TreeView
          className="w-72 rounded-2xl border border-border bg-surface p-2"
          selected={sel}
          onSelect={(n) => setSel(n.id)}
          defaultExpanded={["src", "components"]}
          data={[
            { id: "src", label: "src", children: [
              { id: "components", label: "components", children: [
                { id: "button", label: "button.tsx", meta: "2.1kb" },
                { id: "dialog", label: "dialog.tsx", meta: "4.8kb" },
                { id: "table", label: "data-table.tsx", meta: "9.2kb" },
              ] },
              { id: "hooks", label: "hooks", children: [{ id: "h1", label: "use-media-query.ts" }] },
              { id: "index", label: "index.ts" },
            ] },
            { id: "pkg", label: "package.json" },
            { id: "readme", label: "README.md" },
          ]}
        />
      );
    };
    return <Demo />;
  },
  "json-viewer": () => (
    <JsonViewer
      className="w-full max-w-lg"
      data={{ id: "evt_1Q8x", type: "invoice.paid", livemode: true, amount: 4900, customer: { id: "cus_29", email: "maya@acme.io", tags: ["pro", "annual"] }, lines: [{ price: "price_pro", qty: 1 }, { price: "price_seat", qty: 4 }], metadata: null }}
    />
  ),
  "diff-viewer": () => <DiffViewer className="w-full max-w-2xl" filename="button.tsx" before={before} after={after} />,
  "log-viewer": () => <LogDemo />,
  gantt: () => (
    <Gantt
      className="w-full"
      today="2026-11-12"
      dayWidth={26}
      tasks={[
        { id: "1", name: "Research", start: "2026-11-02", end: "2026-11-06", progress: 100, color: "#7C8CFF" },
        { id: "2", name: "Design system", start: "2026-11-05", end: "2026-11-14", progress: 70 },
        { id: "3", name: "Build components", start: "2026-11-10", end: "2026-11-24", progress: 35, color: "#F4A86A" },
        { id: "4", name: "Docs site", start: "2026-11-16", end: "2026-11-26", progress: 10, color: "#F0A3D0" },
        { id: "5", name: "Beta launch", start: "2026-11-27", end: "2026-11-27", milestone: true, color: "#6EE7A0" },
      ]}
    />
  ),
  "uptime-bars": () => (
    <div className="flex w-full max-w-xl flex-col gap-6 rounded-2xl border border-border bg-surface p-5">
      <UptimeBars name="API" days={uptime(0.02)} />
      <UptimeBars name="Dashboard" days={uptime(0.01)} />
      <UptimeBars name="Webhooks" days={uptime(0.05)} />
    </div>
  ),
  "week-calendar": () => {
    const at = (d: number, h: number, m = 0) => new Date(2026, 10, 16 + d, h, m);
    return (
      <WeekCalendar
        className="w-full"
        date={new Date(2026, 10, 16)}
        onEventClick={(e) => toast(e.title)}
        events={[
          { id: "1", title: "Standup", start: at(0, 9), end: at(0, 9, 30) },
          { id: "2", title: "Design review", start: at(0, 11), end: at(0, 12, 30), color: "#7C8CFF", location: "Room 4" },
          { id: "3", title: "1:1 with Maya", start: at(0, 11, 30), end: at(0, 12), color: "#F0A3D0" },
          { id: "4", title: "Standup", start: at(1, 9), end: at(1, 9, 30) },
          { id: "5", title: "Customer call", start: at(1, 14), end: at(1, 15), color: "#F4A86A", location: "Zoom" },
          { id: "6", title: "Focus time", start: at(2, 13), end: at(2, 17), color: "#6EE7A0" },
          { id: "7", title: "Sprint planning", start: at(3, 10), end: at(3, 11, 30), color: "#7C8CFF" },
          { id: "8", title: "Launch", start: at(4, 15), end: at(4, 16), location: "All hands" },
        ]}
      />
    );
  },
  "code-block": () => (
    <CodeBlock
      className="w-full max-w-2xl"
      highlight={[6, 7]}
      files={[
        { name: "page.tsx", code: `import { Button, toast } from "@kineticui/ui";\n\nexport default function Page() {\n  // Toasts work anywhere once <Toaster /> is mounted\n  return (\n    <Button onClick={() => toast("Saved")}>\n      Save changes\n    </Button>\n  );\n}\n` },
        { name: "globals.css", code: `@import "tailwindcss";\n@import "@kineticui/core/styles.css";\n\n:root {\n  --kn-radius: 12px;\n}\n` },
        { name: "terminal", language: "bash", code: `npx @kineticui/cli init\nnpx @kineticui/cli add button toast --yes` },
      ]}
    />
  ),
  carousel: () => (
    <Carousel className="w-full max-w-2xl" perView={2} autoplay={4000}>
      {["Instant setup", "Fully typed", "Accessible", "Themeable", "Animated", "Tree-shakable"].map((t, i) => (
        <div key={t} className="flex h-44 flex-col justify-end rounded-2xl border border-border p-5" style={{ background: `linear-gradient(140deg, ${["#2a3a12", "#1d2a4a", "#4a2a12", "#3a1230", "#123a2a", "#2a2a2a"][i]}, var(--kn-surface))` }}>
          <span className="font-mono text-xs text-subtle">0{i + 1}</span>
          <span className="font-display text-xl font-semibold">{t}</span>
        </div>
      ))}
    </Carousel>
  ),
  "before-after": () => (
    <BeforeAfter
      className="aspect-video w-full max-w-2xl"
      before={<img src={photo("#6b7280", "#9ca3af", '<feColorMatrix type="saturate" values="0"/>')} alt="Before: desaturated landscape" />}
      after={<img src={photo("#F4A86A", "#3a1230", "")} alt="After: colour-graded landscape" />}
    />
  ),
};
