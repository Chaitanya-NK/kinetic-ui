"use client";

import * as React from "react";
import { Avatar, Badge, Button, Kanban, Presence, SearchInput, SegmentedControl, toast, type KanbanColumn } from "@kineticui/ui";
import { FilterIcon, PlusIcon } from "@kineticui/icons";

type Task = { id: string; title: string; tag: "Design" | "Eng" | "Docs" | "QA"; who: string; priority: "low" | "med" | "high"; due?: string };
const tagTone = { Design: "info", Eng: "soft", Docs: "neutral", QA: "warning" } as const;
const prio = { low: "bg-subtle", med: "bg-warning", high: "bg-danger" };

const initial: KanbanColumn<Task>[] = [
  { id: "backlog", title: "Backlog", color: "var(--kn-muted)", cards: [
    { id: "t1", title: "Audit colour contrast", tag: "Design", who: "Maya Kapoor", priority: "med" },
    { id: "t2", title: "Write migration guide", tag: "Docs", who: "Rohan Joshi", priority: "low" },
  ] },
  { id: "todo", title: "To do", color: "#7C8CFF", cards: [
    { id: "t3", title: "RTL support for menus", tag: "Eng", who: "Rosa Silva", priority: "high", due: "Nov 20" },
    { id: "t4", title: "Chart keyboard navigation", tag: "Eng", who: "Arjun Rao", priority: "med" },
  ] },
  { id: "doing", title: "In progress", color: "#F4A86A", limit: 3, cards: [
    { id: "t5", title: "Data table virtualisation", tag: "Eng", who: "Kemi Okafor", priority: "high", due: "Nov 17" },
    { id: "t6", title: "Blocks gallery", tag: "Design", who: "Maya Kapoor", priority: "med" },
  ] },
  { id: "review", title: "Review", color: "#F0A3D0", cards: [{ id: "t7", title: "Command palette a11y", tag: "QA", who: "Lena Fischer", priority: "med", due: "Nov 16" }] },
  { id: "done", title: "Done", color: "var(--kn-accent)", cards: [{ id: "t8", title: "Ship v1 registry", tag: "Eng", who: "Noah Kim", priority: "low" }] },
];

/** Project board: header with team presence, search, filters and view switcher above a drag-and-drop Kanban. */
export function ProjectBoard() {
  const [cols, setCols] = React.useState(initial);
  const [q, setQ] = React.useState("");
  const filtered = q ? cols.map((c) => ({ ...c, cards: c.cards.filter((t) => t.title.toLowerCase().includes(q.toLowerCase())) })) : cols;

  return (
    <div className="flex min-h-[720px] flex-col gap-5 p-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-col">
          <span className="font-mono text-[11px] text-subtle">Kinetic / Q4</span>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Component sprint</h1>
        </div>
        <Presence
          className="ml-2"
          size={28}
          users={[
            { id: "1", name: "Maya Kapoor", color: "#7C8CFF", status: "active" },
            { id: "2", name: "Rohan Joshi", color: "#F4A86A", status: "active" },
            { id: "3", name: "Rosa Silva", color: "#F0A3D0", status: "idle" },
            { id: "4", name: "Kemi Okafor", color: "#6EE7A0" },
            { id: "5", name: "Noah Kim", color: "#E8E8E3" },
          ]}
          max={4}
        />
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <SegmentedControl defaultValue="board" options={[{ value: "board", label: "Board" }, { value: "list", label: "List" }, { value: "timeline", label: "Timeline" }]} />
          <SearchInput value={q} onValueChange={setQ} placeholder="Filter tasks" className="w-48" shortcut={null} />
          <Button variant="secondary" size="sm"><FilterIcon size={14} /> Filters</Button>
          <Button size="sm" onClick={() => toast("New task")}><PlusIcon size={14} /> Task</Button>
        </div>
      </div>
      <Kanban
        columns={filtered}
        onChange={(next) => !q && setCols(next)}
        onAddCard={(col) => setCols((c) => c.map((x) => (x.id === col ? { ...x, cards: [...x.cards, { id: `n${Date.now()}`, title: "Untitled task", tag: "Eng", who: "You", priority: "low" }] } : x)))}
        renderCard={(t) => (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2">
              <span className={`mt-1.5 size-2 shrink-0 rounded-full ${prio[t.priority]}`} title={`${t.priority} priority`} />
              <span className="font-medium leading-snug">{t.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge size="sm" variant={tagTone[t.tag]}>{t.tag}</Badge>
              {t.due ? <span className="font-mono text-[11px] text-subtle">{t.due}</span> : null}
              <Avatar alt={t.who} size="sm" className="ml-auto scale-75" />
            </div>
          </div>
        )}
      />
    </div>
  );
}
