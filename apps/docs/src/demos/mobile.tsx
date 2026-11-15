"use client";

import * as React from "react";
import { ActionSheet, Button, PullToRefresh, SwipeActions, SwipeCardStack, toast } from "@kineticui/ui";
import { Parallax, TextScramble } from "@kineticui/motion";
import { BookmarkIcon, EditIcon, MailIcon, ShareIcon, TrashIcon, LinkIcon, CopyIcon } from "@kineticui/icons";

function Phone({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`relative w-[320px] overflow-hidden rounded-[36px] border-[6px] border-surface-overlay bg-background ${className}`}>{children}</div>;
}

function SwipeDemo() {
  const [rows, setRows] = React.useState([
    { id: "1", from: "Maya Kapoor", subject: "Q4 roadmap review", preview: "Can you take a look before Thursday?", unread: true },
    { id: "2", from: "Vercel", subject: "Deployment ready", preview: "kinetic-ui is live on production", unread: true },
    { id: "3", from: "Rohan Joshi", subject: "Lunch?", preview: "New ramen place opened downstairs" },
    { id: "4", from: "Figma", subject: "Rosa commented", preview: "This chart needs a legend." },
  ]);
  return (
    <Phone className="p-3 pt-6">
      <div className="mb-3 px-2 font-display text-xl font-semibold">Inbox</div>
      <div className="flex flex-col gap-2">
        {rows.map((r) => (
          <SwipeActions
            key={r.id}
            left={[{ label: r.unread ? "Read" : "Unread", color: "#4F6BFF", icon: <MailIcon />, onAction: () => setRows((x) => x.map((y) => (y.id === r.id ? { ...y, unread: !y.unread } : y))) }]}
            right={[
              { label: "Save", color: "#F59E0B", icon: <BookmarkIcon />, onAction: () => toast("Saved") },
              { label: "Delete", color: "#EF4444", icon: <TrashIcon />, onAction: () => setRows((x) => x.filter((y) => y.id !== r.id)) },
            ]}
          >
            <div className="flex gap-3 px-4 py-3">
              <span className={`mt-1.5 size-2 shrink-0 rounded-full ${r.unread ? "bg-accent" : "bg-transparent"}`} />
              <div className="flex min-w-0 flex-col">
                <span className="text-sm font-semibold">{r.from}</span>
                <span className="truncate text-sm">{r.subject}</span>
                <span className="truncate text-xs text-subtle">{r.preview}</span>
              </div>
            </div>
          </SwipeActions>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-subtle">Swipe a row left or right</p>
    </Phone>
  );
}

function PullDemo() {
  const [items, setItems] = React.useState(() => ["Design review moved to 3pm", "New comment on Atlas", "Weekly digest is ready"]);
  const extra = ["Rosa shared a file", "Deploy succeeded", "Kemi joined the team", "Invoice paid"];
  return (
    <Phone>
      <PullToRefresh
        height={460}
        className="rounded-none border-0"
        onRefresh={() =>
          new Promise<void>((r) =>
            setTimeout(() => {
              setItems((x) => [extra[x.length % extra.length]!, ...x]);
              r();
            }, 1200),
          )
        }
      >
        <div className="flex flex-col gap-2 p-4 pt-6">
          <div className="mb-1 font-display text-xl font-semibold">Activity</div>
          {items.map((t, i) => (
            <div key={`${t}-${i}`} className="rounded-xl bg-surface-raised p-3.5 text-sm">
              {t}
            </div>
          ))}
          <p className="py-4 text-center text-xs text-subtle">Pull down to refresh</p>
        </div>
      </PullToRefresh>
    </Phone>
  );
}

function SheetDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open action sheet
      </Button>
      <ActionSheet
        open={open}
        onOpenChange={setOpen}
        title="launch-video.mp4"
        description="Shared by Maya · 24 MB"
        actions={[
          { label: "Share", icon: <ShareIcon />, onSelect: () => toast("Share") },
          { label: "Copy link", icon: <LinkIcon />, onSelect: () => toast("Link copied") },
          { label: "Duplicate", icon: <CopyIcon />, onSelect: () => toast("Duplicated") },
          { label: "Rename", icon: <EditIcon />, onSelect: () => toast("Rename") },
          { label: "Delete", icon: <TrashIcon />, destructive: true, onSelect: () => toast("Deleted") },
        ]}
      />
    </>
  );
}

const people = [
  { id: "1", name: "Maya", age: 28, role: "Product designer", city: "Lisbon", tint: "#7C8CFF" },
  { id: "2", name: "Rohan", age: 31, role: "Platform engineer", city: "Bengaluru", tint: "#F4A86A" },
  { id: "3", name: "Rosa", age: 26, role: "Motion designer", city: "Madrid", tint: "#F0A3D0" },
  { id: "4", name: "Kemi", age: 34, role: "CTO", city: "Lagos", tint: "#6EE7A0" },
];

export const mobileDemos: Record<string, () => React.ReactNode> = {
  "text-scramble": () => (
    <div className="flex flex-col items-center gap-5">
      <TextScramble text="KINETIC UI" className="font-display text-5xl font-semibold tracking-tight text-foreground" duration={1200} scrambleOnHover />
      <TextScramble text="ACCESS GRANTED · 200 OK" className="text-sm text-accent" scrambleOnHover />
      <span className="text-xs text-subtle">Hover to scramble again</span>
    </div>
  ),
  parallax: () => (
    <Parallax
      className="w-full max-w-3xl rounded-3xl border border-border"
      height={380}
      layers={[
        { speed: -0.15, content: <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,#1d2a4a,transparent_60%),linear-gradient(#0b0c0e,#14171c)]" /> },
        { speed: 0.25, content: <div className="absolute right-[18%] top-12 size-28 rounded-full bg-[#FFE6A8] shadow-[0_0_80px_#FFE6A8]" /> },
        { speed: 0.45, content: <svg viewBox="0 0 800 300" preserveAspectRatio="none" className="absolute bottom-0 h-56 w-full"><path d="M0 300 L0 170 L140 80 L260 160 L400 60 L560 170 L680 110 L800 160 L800 300Z" fill="#1d2a1a" /></svg> },
        { speed: 0.8, content: <svg viewBox="0 0 800 300" preserveAspectRatio="none" className="absolute -bottom-6 h-40 w-full"><path d="M0 300 L0 200 L180 120 L380 210 L560 130 L800 210 L800 300Z" fill="#0f1a10" /></svg> },
      ]}
    >
      <div className="flex h-full flex-col items-start justify-center gap-2 p-10">
        <span className="font-mono text-xs uppercase tracking-wider text-accent">Scroll the page</span>
        <span className="max-w-sm font-display text-4xl font-semibold tracking-tight">Depth without the bundle weight</span>
      </div>
    </Parallax>
  ),
  "swipe-actions": () => <SwipeDemo />,
  "pull-to-refresh": () => <PullDemo />,
  "action-sheet": () => <SheetDemo />,
  "swipe-card-stack": () => (
    <SwipeCardStack
      className="w-full py-4"
      items={people}
      getKey={(p) => p.id}
      onSwipe={(p, d) => toast(`${d === "right" ? "Liked" : "Passed on"} ${p.name}`)}
      renderCard={(p) => (
        <div className="flex size-full flex-col justify-end p-5" style={{ background: `linear-gradient(180deg, ${p.tint}55, #0b0c0e 85%)` }}>
          <span className="mb-auto flex size-24 items-center justify-center self-center rounded-full font-display text-4xl font-bold text-[#0b0c0e]" style={{ background: p.tint, marginTop: "18%" }}>
            {p.name[0]}
          </span>
          <span className="font-display text-2xl font-semibold text-white">
            {p.name}, {p.age}
          </span>
          <span className="text-sm text-white/70">
            {p.role} · {p.city}
          </span>
        </div>
      )}
    />
  ),
};
