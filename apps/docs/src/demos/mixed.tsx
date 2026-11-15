"use client";

import * as React from "react";
import {
  BulkActionBar,
  Button,
  CommentThread,
  FilterBuilder,
  PasskeyLogin,
  ProfileHoverCard,
  ShareSheet,
  UploadQueue,
  applyFilters,
  toast,
  type FilterField,
  type FilterGroup,
  type ThreadComment,
} from "@kineticui/ui";
import { ArchiveIcon, DownloadIcon, ShareIcon, TagIcon, TrashIcon } from "@kineticui/icons";

const maya = { id: "me", name: "Maya Kapoor", color: "#C6F432" };
const arjun = { id: "a", name: "Arjun Mehta", color: "#7dd3fc" };
const lena = { id: "l", name: "Lena Ortiz", color: "#f9a8d4" };
const sam = { id: "s", name: "Sam Okafor", color: "#fcd34d" };

function ProfileDemo() {
  return (
    <p className="max-w-sm text-sm text-muted">
      Shipped by{" "}
      <ProfileHoverCard
        profile={{
          name: "Lena Ortiz",
          handle: "lena.designs",
          color: "#f9a8d4",
          verified: true,
          followsYou: true,
          bio: "Design engineer. Motion, type and tiny details. Building Kinetic UI.",
          location: "Lisbon, Portugal",
          stats: [{ label: "Following", value: 312 }, { label: "Followers", value: 18400 }],
          mutuals: [arjun, sam, maya],
        }}
        onFollowChange={(f) => toast.success(f ? "Following Lena" : "Unfollowed Lena")}
      >
        <a href="#" className="font-semibold text-foreground underline decoration-accent decoration-2 underline-offset-4">@lena.designs</a>
      </ProfileHoverCard>{" "}
      and reviewed by the team. Hover the name.
    </p>
  );
}

function ShareDemo() {
  const [access, setAccess] = React.useState("link");
  return (
    <ShareSheet
      url="https://kinetic.dev/r/launch-notes"
      title="Kinetic UI — launch notes"
      text="Motion-first components for React."
      trigger={<Button><ShareIcon size={15} /> Share</Button>}
      access={{
        value: access,
        onChange: setAccess,
        options: [
          { value: "restricted", label: "Restricted", description: "Only people you invite" },
          { value: "link", label: "Anyone with the link", description: "Can view, no sign-in" },
        ],
      }}
    />
  );
}

const files = ["invoice-2041.pdf", "brand-kit.zip", "q3-report.xlsx", "hero.mp4", "contract.docx", "logo.svg"];

function BulkDemo() {
  const [sel, setSel] = React.useState<Set<string>>(new Set(["invoice-2041.pdf", "q3-report.xlsx"]));
  const [rows, setRows] = React.useState(files);
  const toggle = (f: string) => setSel((s) => { const n = new Set(s); n.has(f) ? n.delete(f) : n.add(f); return n; });
  return (
    <div className="relative flex h-[340px] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex-1 overflow-auto">
        {rows.map((f) => (
          <label key={f} className="flex cursor-pointer items-center gap-3 border-b border-border px-4 py-2.5 text-sm hover:bg-surface-raised">
            <input type="checkbox" checked={sel.has(f)} onChange={() => toggle(f)} className="accent-[var(--kn-accent)]" />
            {f}
          </label>
        ))}
      </div>
      <BulkActionBar
        fixed={false}
        className="absolute bottom-4 left-1/2 -translate-x-1/2"
        count={sel.size}
        total={rows.length}
        noun={["file", "files"]}
        onSelectAll={() => setSel(new Set(rows))}
        onClear={() => setSel(new Set())}
        actions={[
          { id: "dl", label: "Download", icon: <DownloadIcon />, shortcut: "d", onClick: () => toast.success(`Downloading ${sel.size} files`) },
          { id: "tag", label: "Tag", icon: <TagIcon />, shortcut: "t", onClick: () => toast.info("Tag picker") },
          { id: "arc", label: "Archive", icon: <ArchiveIcon />, shortcut: "e", onClick: () => toast(`Archived ${sel.size}`) },
          { id: "del", label: "Delete", icon: <TrashIcon />, destructive: true, onClick: () => { setRows((r) => r.filter((x) => !sel.has(x))); toast.error(`Deleted ${sel.size} files`); setSel(new Set()); } },
        ]}
      />
    </div>
  );
}

const fields: FilterField[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "status", label: "Status", type: "select", options: [{ value: "active", label: "Active" }, { value: "trial", label: "Trial" }, { value: "churned", label: "Churned" }] },
  { key: "plan", label: "Plan", type: "select", options: [{ value: "free", label: "Free" }, { value: "pro", label: "Pro" }, { value: "team", label: "Team" }] },
  { key: "seats", label: "Seats", type: "number" },
];
const customers = [
  { name: "Acme Corp", status: "active", plan: "team", seats: 42 },
  { name: "Globex", status: "trial", plan: "pro", seats: 5 },
  { name: "Initech", status: "active", plan: "pro", seats: 12 },
  { name: "Umbrella", status: "churned", plan: "team", seats: 30 },
  { name: "Hooli", status: "active", plan: "free", seats: 1 },
  { name: "Stark Industries", status: "active", plan: "pro", seats: 8 },
];

function FilterDemo() {
  const [g, setG] = React.useState<FilterGroup>({ join: "and", rules: [{ id: "r1", field: "status", op: "is", value: "active" }, { id: "r2", field: "plan", op: "is", value: "pro" }] });
  const rows = applyFilters(customers, g, fields);
  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <FilterBuilder fields={fields} value={g} onChange={setG} />
      <div className="overflow-hidden rounded-xl border border-border text-sm">
        {rows.length ? rows.map((r) => (
          <div key={r.name} className="flex justify-between border-b border-border px-4 py-2 last:border-0">
            <span>{r.name}</span><span className="font-mono text-xs text-subtle">{r.status} · {r.plan} · {r.seats} seats</span>
          </div>
        )) : <div className="px-4 py-6 text-center text-subtle">No customers match.</div>}
      </div>
    </div>
  );
}

// Simulated upload: random speed, fails ~15% of the time, honours abort.
const fakeUpload = (file: File, onProgress: (p: number) => void, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    let p = 0;
    const fail = file.name.includes("fail") || Math.random() < 0.15;
    const t = setInterval(() => {
      if (signal.aborted) return clearInterval(t);
      p = Math.min(1, p + 0.04 + Math.random() * 0.08);
      onProgress(p);
      if (fail && p > 0.55) { clearInterval(t); reject(new Error("Network error — retry")); }
      else if (p >= 1) { clearInterval(t); resolve(); }
    }, 180);
  });

function UploadDemo() {
  return <UploadQueue upload={fakeUpload} concurrency={2} onComplete={(f) => toast.success(`${f.length} files uploaded`)} />;
}

const initialThread: ThreadComment[] = [
  {
    id: "c1",
    author: arjun,
    time: "2h",
    body: "The new drawer spring feels great on mobile. @Lena can we use the same curve for the sheet?",
    reactions: [{ emoji: "🔥", count: 3 }, { emoji: "👍", count: 2, mine: true }],
    replies: [
      { id: "c2", author: lena, time: "1h", body: "Yes — stiffness 380, damping 32. I'll push it today.", reactions: [{ emoji: "🙌", count: 1 }] },
      { id: "c3", author: sam, time: "45m", body: "Tested on a Pixel 6, no jank." },
    ],
  },
  { id: "c4", author: sam, time: "20m", body: "Docs preview for the share sheet is up." },
];

function ThreadDemo() {
  const [c, setC] = React.useState(initialThread);
  return <CommentThread comments={c} onChange={setC} me={maya} people={[arjun, lena, sam]} />;
}

function PasskeyDemo() {
  return (
    <PasskeyLogin
      onPasskey={() => new Promise((_, rej) => setTimeout(() => rej(new Error("No passkey found for this site on this device.")), 1600))}
      onMagicLink={() => new Promise((r) => setTimeout(r, 900))}
    />
  );
}

export const mixedDemos: Record<string, () => React.ReactNode> = {
  "profile-hover-card": () => <ProfileDemo />,
  "share-sheet": () => <ShareDemo />,
  "bulk-action-bar": () => <BulkDemo />,
  "filter-builder": () => <FilterDemo />,
  "upload-queue": () => <UploadDemo />,
  "comment-thread": () => <ThreadDemo />,
  "passkey-login": () => <PasskeyDemo />,
};
