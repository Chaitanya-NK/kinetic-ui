"use client";

import * as React from "react";
import { AreaChart, Avatar, Badge, Button, DonutChart, NotificationCenter, SearchInput, Sidebar, SidebarItem, SidebarSection, Sparkline, StatCard, type AppNotification } from "@kineticui/ui";
import { ChartIcon, FolderIcon, HomeIcon, MailIcon, SettingsIcon, UsersIcon, WalletIcon, BoltIcon } from "@kineticui/icons";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const revenue = months.map((m, i) => ({ month: m, revenue: Math.round(18 + i * 3.4 + Math.sin(i) * 6) * 1000, target: (20 + i * 3) * 1000 }));
const orders = [
  { id: "#3021", customer: "Maya Kapoor", total: "$1,240", status: "Paid" },
  { id: "#3020", customer: "Rohan Joshi", total: "$86", status: "Pending" },
  { id: "#3019", customer: "Rosa Silva", total: "$412", status: "Paid" },
  { id: "#3018", customer: "Kemi Okafor", total: "$2,990", status: "Refunded" },
  { id: "#3017", customer: "Noah Kim", total: "$154", status: "Paid" },
];
const tone = { Paid: "success", Pending: "warning", Refunded: "danger" } as const;

/** SaaS dashboard: collapsible sidebar, top bar with search and notifications, KPIs, charts and recent orders. */
export function DashboardShell() {
  const [collapsed, setCollapsed] = React.useState(false);
  const [active, setActive] = React.useState("Overview");
  const [notes, setNotes] = React.useState<AppNotification[]>([
    { id: "1", title: "New order #3021", body: "Maya Kapoor · $1,240", time: "2m ago" },
    { id: "2", title: "Payout sent", body: "$12,480 to •••• 4242", time: "1h ago", read: true },
  ]);
  const item = (label: string, icon: React.ReactNode, badge?: number) => <SidebarItem label={label} icon={icon} badge={badge} active={active === label} onClick={() => setActive(label)} />;

  return (
    <div className="flex h-[820px] overflow-hidden bg-background">
      <Sidebar
        className="hidden md:flex"
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        header={
          <div className="flex items-center gap-2.5 px-1.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent font-display text-sm font-bold text-accent-foreground">K</span>
            {collapsed ? null : <span className="font-display font-semibold">Kinetic</span>}
          </div>
        }
      >
        <SidebarSection title="Main">
          {item("Overview", <HomeIcon />)}
          {item("Analytics", <ChartIcon />)}
          {item("Orders", <WalletIcon />, 12)}
          {item("Customers", <UsersIcon />)}
        </SidebarSection>
        <SidebarSection title="Workspace">
          {item("Projects", <FolderIcon />)}
          {item("Inbox", <MailIcon />, 3)}
          {item("Settings", <SettingsIcon />)}
        </SidebarSection>
      </Sidebar>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-5">
          <h1 className="font-display text-lg font-semibold">{active}</h1>
          <SearchInput className="ml-auto hidden w-64 sm:flex" placeholder="Search…" />
          <NotificationCenter notifications={notes} onChange={setNotes} />
          <Avatar alt="Maya Kapoor" size="sm" status="online" />
        </header>
        <main className="flex-1 overflow-y-auto p-5">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight">Good morning, Maya</h2>
                <p className="text-sm text-muted">Here&apos;s what happened while you were away.</p>
              </div>
              <Button size="sm">
                <BoltIcon size={14} /> New report
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Revenue" value="$48.2k" delta={12.4} hint="vs last month" chart={<Sparkline data={[4, 6, 5, 8, 7, 9, 12, 11, 14]} width={72} />} />
              <StatCard label="Orders" value="1,284" delta={6.1} hint="vs last month" />
              <StatCard label="Customers" value="9,214" delta={4.1} hint="vs last month" />
              <StatCard label="Refund rate" value="1.2%" delta={-0.4} invertDelta hint="vs last month" />
            </div>
            <div className="grid gap-3 xl:grid-cols-[2fr_1fr]">
              <div className="rounded-2xl border border-border bg-surface p-5">
                <div className="mb-3 flex items-center justify-between text-sm font-medium">
                  Revenue vs target <Badge size="sm">2026</Badge>
                </div>
                <AreaChart data={revenue} index="month" series={[{ key: "revenue", name: "Revenue" }, { key: "target", name: "Target", color: "#7C8CFF" }]} format={(v) => `$${v / 1000}k`} height={230} />
              </div>
              <div className="rounded-2xl border border-border bg-surface p-5">
                <div className="mb-4 text-sm font-medium">Sales by channel</div>
                <DonutChart data={[{ label: "Online", value: 62 }, { label: "Retail", value: 24 }, { label: "Partners", value: 14 }]} size={150} thickness={18} label="Share" format={(v) => `${v}%`} />
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="flex items-center justify-between px-5 py-4 text-sm font-medium">
                Recent orders <Button variant="link" size="sm">View all</Button>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-t border-border hover:bg-surface-raised">
                      <td className="px-5 py-3 font-mono text-xs text-muted">{o.id}</td>
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-2.5">
                          <Avatar alt={o.customer} size="sm" />
                          {o.customer}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={tone[o.status as keyof typeof tone]} dot size="sm">{o.status}</Badge>
                      </td>
                      <td className="px-5 py-3 text-right font-medium tabular-nums">{o.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
