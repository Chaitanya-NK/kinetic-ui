"use client";

import * as React from "react";
import {
  ActivityFeed,
  Badge,
  Button,
  CommandBar,
  CookieConsent,
  FilePreview,
  InvoicePreview,
  Keys,
  MonthCalendar,
  OnboardingChecklist,
  OrgChart,
  OverflowTabs,
  PageHeader,
  ProgressSteps,
  RatingSummary,
  ShortcutOverlay,
  SkeletonCard,
  SkeletonDashboard,
  SkeletonList,
  SkeletonProfile,
  SkeletonTable,
  SplitCompare,
  TopLoader,
  WhatsNew,
  WorldMap,
  toast,
  topLoader,
  type Activity,
  type ChecklistTask,
  type ProgressStep,
} from "@kineticui/ui";
import {
  ChatIcon,
  CircleIcon,
  CodeIcon,
  EditIcon,
  FolderIcon,
  GitMergeIcon,
  HandIcon,
  ImageIcon,
  MousePointerIcon,
  PenToolIcon,
  RocketIcon,
  SettingsIcon,
  ShareIcon,
  SquareIcon,
  TypeIcon,
  UsersIcon,
} from "@kineticui/icons";

const at = (d: number, h = 9, m = 0) => new Date(2026, 10, d, h, m);

function ChecklistDemo() {
  const [tasks, setTasks] = React.useState<ChecklistTask[]>([
    { id: "1", title: "Create your workspace", done: true },
    { id: "2", title: "Invite your team", description: "Projects move faster with teammates. Invite up to 5 people free.", time: "1 min", action: { label: "Invite people", onClick: () => toast("Invite") } },
    { id: "3", title: "Connect GitHub", description: "Link a repo to get preview deploys on every pull request.", time: "2 min", action: { label: "Connect", onClick: () => toast("GitHub") } },
    { id: "4", title: "Ship your first deploy", time: "3 min" },
  ]);
  return (
    <OnboardingChecklist
      tasks={tasks}
      onToggle={(id, done) => setTasks((t) => t.map((x) => (x.id === id ? { ...x, done } : x)))}
      reward={<><b>Nice work!</b> You unlocked 30 extra days of Pro.</>}
    />
  );
}

function StepsDemo() {
  const [steps, setSteps] = React.useState<ProgressStep[]>([
    { id: "a", title: "Account", description: "Basic details", tasks: [{ id: "a1", label: "Verify email", done: true }, { id: "a2", label: "Add a profile photo", done: true }] },
    { id: "b", title: "Company profile", description: "Tell us about your team", tasks: [{ id: "b1", label: "Company name", done: true }, { id: "b2", label: "Team size" }, { id: "b3", label: "Industry" }] },
    { id: "c", title: "Billing", tasks: [{ id: "c1", label: "Add payment method" }, { id: "c2", label: "Choose a plan" }] },
    { id: "d", title: "Go live", content: "Flip the switch when everything above is done." },
  ]);
  return (
    <ProgressSteps
      className="w-full max-w-md"
      steps={steps}
      onToggleTask={(s, t, done) => setSteps((all) => all.map((x) => (x.id === s ? { ...x, tasks: x.tasks?.map((y) => (y.id === t ? { ...y, done } : y)) } : x)))}
    />
  );
}

function FeedDemo() {
  const base: Activity[] = [
    { id: "1", actor: { name: "Maya Kapoor", color: "#7C8CFF" }, verb: "commented on", target: "Pricing page", group: "Today", time: "2m", type: "comment", icon: <ChatIcon />, detail: "Can we try the annual toggle above the cards?" },
    { id: "2", actor: { name: "Rohan Joshi", color: "#F4A86A" }, verb: "merged", target: "#482 Column pinning", group: "Today", time: "1h", type: "code", icon: <GitMergeIcon /> },
    { id: "3", actor: { name: "Rosa Silva", color: "#F0A3D0" }, verb: "uploaded 3 files to", target: "Brand assets", group: "Yesterday", time: "5:12 pm", type: "file", icon: <FolderIcon /> },
    { id: "4", actor: { name: "Kemi Okafor", color: "#6EE7A0" }, verb: "deployed", target: "v2.5.0 to production", group: "Yesterday", time: "11:02 am", type: "code", icon: <RocketIcon /> },
  ];
  const [items, setItems] = React.useState(base);
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Button size="sm" variant="secondary" className="self-start" onClick={() => setItems((x) => [{ id: String(Date.now()), actor: { name: "Noah Kim", color: "#E8E8E3" }, verb: "invited", target: "2 people", group: "Today", time: "now", type: "team", icon: <UsersIcon /> }, ...x])}>
        Simulate new activity
      </Button>
      <ActivityFeed live items={items} filters={[{ value: "comment", label: "Comments" }, { value: "code", label: "Code" }, { value: "file", label: "Files" }]} />
    </div>
  );
}

function LoaderDemo() {
  return (
    <div className="relative flex w-full max-w-md flex-col items-center gap-4 overflow-hidden rounded-2xl border border-border bg-surface p-8 pt-10">
      <TopLoader fixed={false} />
      <p className="text-center text-sm text-muted">The bar sits at the top of this card here. In an app, mount it once at the top of the page.</p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button size="sm" onClick={() => topLoader.start()}>Start</Button>
        <Button size="sm" variant="secondary" onClick={() => topLoader.done()}>Done</Button>
        <Button size="sm" variant="outline" onClick={() => void topLoader.track(new Promise((r) => setTimeout(r, 1800)))}>Track a 1.8s request</Button>
      </div>
    </div>
  );
}

function CookieDemo() {
  const [variant, setVariant] = React.useState<"card" | "bar" | "modal">("bar");
  const [k, setK] = React.useState(0);
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex gap-2">
        {(["card", "bar", "modal"] as const).map((v) => (
          <Button key={v} size="sm" variant={variant === v ? "primary" : "secondary"} onClick={() => { setVariant(v); setK((x) => x + 1); }}>{v}</Button>
        ))}
      </div>
      <CookieConsent key={variant + k} variant={variant} position="inline" open storageKey="kn-demo-cookie2" className={variant === "bar" ? "w-full" : undefined} />
    </div>
  );
}

function CommandBarDemo() {
  const [tool, setTool] = React.useState("select");
  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex h-40 w-full max-w-xl items-center justify-center rounded-2xl border border-dashed border-border-strong text-sm text-subtle">
        Active tool: <b className="ml-1 text-foreground">{tool}</b> · press V, H, R, O, T, P
      </div>
      <CommandBar
        value={tool}
        onValueChange={setTool}
        items={[
          { id: "select", label: "Select", icon: <MousePointerIcon />, shortcut: "v" },
          { id: "hand", label: "Hand", icon: <HandIcon />, shortcut: "h" },
          { type: "separator", id: "s1" },
          { id: "rect", label: "Rectangle", icon: <SquareIcon />, shortcut: "r" },
          { id: "ellipse", label: "Ellipse", icon: <CircleIcon />, shortcut: "o" },
          { id: "text", label: "Text", icon: <TypeIcon />, shortcut: "t" },
          { id: "pen", label: "Pen", icon: <PenToolIcon />, shortcut: "p" },
          { id: "image", label: "Image", icon: <ImageIcon /> },
          { type: "separator", id: "s2" },
          { id: "comment", label: "Comment", icon: <ChatIcon />, shortcut: "c" },
        ]}
      />
    </div>
  );
}

function ShortcutsDemo() {
  const [last, setLast] = React.useState("—");
  return (
    <div className="flex flex-col items-center gap-4 text-sm">
      <p className="text-muted">
        Press <Keys combo="shift+?" /> to open, or try <Keys combo="g d" /> and <Keys combo="mod+s" />.
      </p>
      <span>Last action: <b>{last}</b></span>
      <ShortcutOverlay
        shortcuts={[
          { keys: "mod+k", label: "Command palette", group: "General", action: () => setLast("Command palette") },
          { keys: "mod+s", label: "Save", group: "General", action: () => setLast("Saved") },
          { keys: "g d", label: "Go to dashboard", group: "Navigation", action: () => setLast("Dashboard") },
          { keys: "g i", label: "Go to inbox", group: "Navigation", action: () => setLast("Inbox") },
          { keys: "c", label: "Create issue", group: "Issues", action: () => setLast("New issue") },
          { keys: "e", label: "Edit issue", group: "Issues" },
          { keys: "mod+enter", label: "Submit", group: "Issues" },
          { keys: "j", label: "Next item", group: "Lists" },
          { keys: "k", label: "Previous item", group: "Lists" },
        ]}
      />
    </div>
  );
}

function WhatsNewDemo() {
  const [open, setOpen] = React.useState(false);
  const media = (c: string, t: string) => <div className="flex size-full items-center justify-center font-display text-3xl font-semibold" style={{ background: `linear-gradient(135deg, ${c}, var(--kn-surface))` }}>{t}</div>;
  return (
    <>
      <Button onClick={() => setOpen(true)}>Show what&apos;s new</Button>
      <WhatsNew
        version="2.5"
        autoOpen={false}
        open={open}
        onOpenChange={setOpen}
        slides={[
          { title: "Editors are here", body: "Rich text, Markdown and a code editor with smart indentation.", media: media("#2a3a12", "Editors") },
          { title: "World map", body: "A dotted world map with markers and animated arcs. No tiles, no keys.", media: media("#1d2a4a", "World map") },
          { title: "348 icons", body: "Every icon drawn on the same grid, with a searchable gallery.", media: media("#3a1230", "Icons"), tag: "Design" },
        ]}
        cta={{ label: "Start exploring", onClick: () => toast.success("Enjoy 2.5!") }}
      />
    </>
  );
}

function TabsDemo() {
  const [w, setW] = React.useState(100);
  return (
    <div className="flex w-full flex-col gap-4">
      <input type="range" min={30} max={100} value={w} onChange={(e) => setW(Number(e.target.value))} aria-label="Container width" className="w-48 self-center accent-[var(--kn-accent)]" />
      <div style={{ width: `${w}%` }} className="mx-auto rounded-2xl border border-border bg-surface p-2 transition-[width]">
        <OverflowTabs
          tabs={[
            { value: "overview", label: "Overview" },
            { value: "issues", label: "Issues", count: 24 },
            { value: "prs", label: "Pull requests", count: 3 },
            { value: "actions", label: "Actions" },
            { value: "projects", label: "Projects" },
            { value: "wiki", label: "Wiki" },
            { value: "security", label: "Security" },
            { value: "insights", label: "Insights" },
            { value: "settings", label: "Settings", icon: <SettingsIcon /> },
          ]}
        />
      </div>
      <p className="text-center text-xs text-subtle">Drag the slider to shrink the container.</p>
    </div>
  );
}

export const display2Demos: Record<string, () => React.ReactNode> = {
  "world-map": () => (
    <div className="w-full max-w-3xl">
      <WorldMap
        markers={[
          { id: "hyd", lat: 17.4, lng: 78.5, label: "Hyderabad", value: "HQ · 120 people" },
          { id: "sfo", lat: 37.8, lng: -122.4, label: "San Francisco", value: "Sales · 18" },
          { id: "lon", lat: 51.5, lng: -0.1, label: "London", value: "EMEA · 32", color: "#7C8CFF" },
          { id: "sgp", lat: 1.35, lng: 103.8, label: "Singapore", value: "APAC · 21", color: "#F4A86A" },
          { id: "sao", lat: -23.5, lng: -46.6, label: "São Paulo", value: "LATAM · 9", color: "#F0A3D0" },
          { id: "syd", lat: -33.9, lng: 151.2, label: "Sydney", value: "ANZ · 7", color: "#6EE7A0" },
        ]}
        arcs={[
          { from: [17.4, 78.5], to: [37.8, -122.4] },
          { from: [17.4, 78.5], to: [51.5, -0.1], color: "#7C8CFF" },
          { from: [17.4, 78.5], to: [1.35, 103.8], color: "#F4A86A" },
          { from: [51.5, -0.1], to: [-23.5, -46.6], color: "#F0A3D0" },
        ]}
        onMarkerClick={(m) => toast(m.label ?? m.id)}
      />
    </div>
  ),
  "org-chart": () => (
    <OrgChart
      className="w-full"
      onSelect={(n) => toast(`${n.name} · ${n.title}`)}
      data={{
        id: "ceo", name: "Kemi Okafor", title: "CEO", color: "#6EE7A0",
        children: [
          { id: "cto", name: "Rohan Joshi", title: "CTO", color: "#F4A86A", children: [{ id: "e1", name: "Arjun Rao", title: "Platform" }, { id: "e2", name: "Noah Kim", title: "Frontend", color: "#E8E8E3" }] },
          { id: "cpo", name: "Maya Kapoor", title: "Design", color: "#7C8CFF", children: [{ id: "d1", name: "Rosa Silva", title: "Brand", color: "#F0A3D0" }] },
          { id: "coo", name: "Lena Fischer", title: "Operations", color: "#F5C451", children: [{ id: "o1", name: "Sofia Marin", title: "Support" }, { id: "o2", name: "Tom Becker", title: "Finance" }, { id: "o3", name: "Aiko Sato", title: "People" }] },
        ],
      }}
    />
  ),
  "month-calendar": () => (
    <MonthCalendar
      className="w-full"
      month={new Date(2026, 10, 1)}
      onEventClick={(e) => toast(e.title)}
      events={[
        { id: "1", title: "Sprint planning", date: at(2, 10), color: "#7C8CFF" },
        { id: "2", title: "Design review", date: at(5, 14) },
        { id: "3", title: "Offsite", date: at(11), end: at(13), allDay: true, color: "#F4A86A" },
        { id: "4", title: "Launch v2.5", date: at(17, 11), color: "#6EE7A0" },
        { id: "5", title: "1:1 Maya", date: at(17, 15), color: "#F0A3D0" },
        { id: "6", title: "Retro", date: at(17, 16) },
        { id: "7", title: "Board meeting", date: at(17, 18), color: "#F5C451" },
        { id: "8", title: "Holiday", date: at(26), allDay: true, color: "#E8E8E3" },
      ]}
    />
  ),
  "invoice-preview": () => (
    <InvoicePreview
      className="w-full max-w-2xl"
      invoice={{
        number: "INV-2026-0142",
        issued: "Nov 14, 2026",
        due: "Nov 28, 2026",
        status: "due",
        from: { name: "Kinetic Labs Pvt Ltd", lines: ["4th Floor, Hitech City", "Hyderabad, Telangana 500081"], taxId: "36AABCK1234Z1Z5" },
        to: { name: "Acme Corp", lines: ["12 Lavelle Road", "Bengaluru 560001"], email: "accounts@acme.io" },
        items: [
          { description: "Kinetic Pro — annual", detail: "12 seats, Nov 2026 – Oct 2027", qty: 12, price: 2400 },
          { description: "Onboarding workshop", detail: "2 × 90 min sessions", qty: 1, price: 15000 },
          { description: "Priority support", qty: 12, price: 400 },
        ],
        taxRate: 0.18,
        taxLabel: "GST",
        notes: "Pay by UPI or bank transfer. Please quote the invoice number in the reference.",
      }}
    />
  ),
  "file-preview": () => (
    <div className="grid w-full gap-4 lg:grid-cols-2">
      <FilePreview height={300} file={{ name: "poster.jpg", url: "/media/poster.jpg", size: 21746 }} />
      <FilePreview height={300} file={{ name: "button.tsx", size: 412, content: `export function Button({ children }) {\n  return <button className="btn">{children}</button>;\n}\n` }} />
      <FilePreview height={220} file={{ name: "revenue.csv", content: "month,revenue,orders\nAug,41200,812\nSep,44950,866\nOct,48210,931\nNov,51040,982" }} />
      <FilePreview height={220} file={{ name: "track.mp3", url: "/media/track.mp3", size: 96801 }} />
    </div>
  ),
  "split-compare": () => (
    <SplitCompare
      className="w-full"
      leftLabel="Original"
      rightLabel="Rewritten"
      left={<div className="flex flex-col gap-3 text-sm leading-relaxed text-muted">{Array.from({ length: 8 }, (_, i) => <p key={i}>Paragraph {i + 1}. Our product helps teams to be able to collaborate in a more efficient manner across many different tools and workflows that they use every single day.</p>)}</div>}
      right={<div className="flex flex-col gap-3 text-sm leading-relaxed">{Array.from({ length: 8 }, (_, i) => <p key={i}>Paragraph {i + 1}. Kinetic helps teams work together across the tools they already use.</p>)}</div>}
    />
  ),
  "progress-steps": () => <StepsDemo />,
  "onboarding-checklist": () => <ChecklistDemo />,
  "rating-summary": () => <RatingSummary counts={[18, 22, 64, 311, 892]} aspects={[{ label: "Ease of use", score: 4.7 }, { label: "Docs", score: 4.4 }, { label: "Performance", score: 4.6 }, { label: "Price", score: 3.4 }]} onFilter={(s) => toast(s ? `${s}-star reviews` : "All reviews")} />,
  "whats-new": () => <WhatsNewDemo />,
  "activity-feed": () => <FeedDemo />,
  "top-loader": () => <LoaderDemo />,
  skeletons: () => (
    <div className="grid w-full gap-4 md:grid-cols-3">
      <SkeletonCard />
      <SkeletonProfile />
      <SkeletonList rows={4} />
      <SkeletonTable className="md:col-span-2" rows={4} />
      <SkeletonDashboard className="md:col-span-3" />
    </div>
  ),
  "cookie-consent": () => <CookieDemo />,
  "page-header": () => {
    const Demo = () => {
      const [tab, setTab] = React.useState("overview");
      return (
        <PageHeader
          className="w-full"
          breadcrumbs={[{ label: "Projects", href: "#" }, { label: "Kinetic", href: "#" }, { label: "Web app" }]}
          icon={<CodeIcon />}
          title="Web app"
          badges={<><Badge variant="success" dot size="sm">Production</Badge><Badge size="sm">Next.js</Badge></>}
          description="Marketing site and dashboard. Deploys on every push to main."
          actions={<><Button variant="secondary" size="sm"><ShareIcon size={14} /> Share</Button><Button size="sm"><EditIcon size={14} /> Edit</Button></>}
          meta={[{ label: "Last deploy", value: "4 min ago" }, { label: "Region", value: "ap-south-1" }, { label: "Owner", value: "Maya Kapoor" }]}
          tabs={[{ value: "overview", label: "Overview" }, { value: "deploys", label: "Deployments", count: 128 }, { value: "logs", label: "Logs" }, { value: "settings", label: "Settings" }]}
          activeTab={tab}
          onTabChange={setTab}
        />
      );
    };
    return <Demo />;
  },
  "overflow-tabs": () => <TabsDemo />,
  "shortcut-overlay": () => <ShortcutsDemo />,
  "command-bar": () => <CommandBarDemo />,
};

