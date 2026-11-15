"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Avatar, Badge, Button, SegmentedControl } from "@kineticui/ui";
import { BuildingIcon, CalendarIcon, ChatIcon, CheckCircleIcon, MailIcon, MapPinIcon, PhoneIcon, PlusIcon } from "@kineticui/icons";

type Act = { id: string; kind: "email" | "call" | "note" | "meeting" | "deal"; text: string; time: string };
const icon = { email: MailIcon, call: PhoneIcon, note: ChatIcon, meeting: CalendarIcon, deal: CheckCircleIcon };
const stages = ["Lead", "Qualified", "Proposal", "Negotiation", "Won"];

/** CRM contact record: profile, deal stage pipeline, activity timeline with note composer, and key fields. */
export function CrmContact() {
  const [stage, setStage] = React.useState(2);
  const [tab, setTab] = React.useState("activity");
  const [note, setNote] = React.useState("");
  const [acts, setActs] = React.useState<Act[]>([
    { id: "1", kind: "meeting", text: "Demo call with procurement — positive, wants SSO pricing.", time: "Yesterday" },
    { id: "2", kind: "email", text: "Sent proposal v2 with 3-year discount.", time: "3 days ago" },
    { id: "3", kind: "call", text: "Intro call, 25 min. Team of 40 designers.", time: "Last week" },
    { id: "4", kind: "deal", text: "Deal created: Enterprise plan, $48,000 ARR.", time: "2 weeks ago" },
  ]);
  const add = () => {
    if (!note.trim()) return;
    setActs((a) => [{ id: String(Date.now()), kind: "note", text: note.trim(), time: "Just now" }, ...a]);
    setNote("");
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 p-6 lg:grid-cols-[300px_1fr]">
      <aside className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <Avatar alt="Priya Raman" color="#7dd3fc" size="xl" status="online" />
          <div><div className="text-lg font-semibold">Priya Raman</div><div className="text-sm text-muted">Head of Product · Orbit</div></div>
          <div className="flex gap-2">
            {[MailIcon, PhoneIcon, CalendarIcon].map((I, i) => <Button key={i} variant="secondary" size="icon-sm" aria-label={["Email", "Call", "Schedule"][i]}><I size={15} /></Button>)}
          </div>
        </div>
        <dl className="flex flex-col gap-3 border-t border-border pt-4 text-sm">
          {[[MailIcon, "priya@orbit.example"], [PhoneIcon, "+91 98765 43210"], [BuildingIcon, "Orbit · 220 employees"], [MapPinIcon, "Bengaluru, IN"]].map(([I, v], i) => {
            const Ic = I as typeof MailIcon;
            return <div key={i} className="flex items-center gap-2.5 text-muted"><Ic size={14} className="text-subtle" />{v as string}</div>;
          })}
        </dl>
        <div className="flex flex-wrap gap-1.5 border-t border-border pt-4">{["Enterprise", "Decision maker", "Warm"].map((t) => <Badge key={t} size="sm">{t}</Badge>)}</div>
      </aside>
      <div className="flex min-w-0 flex-col gap-5">
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><div className="text-xs text-subtle">Deal</div><div className="font-semibold">Orbit — Enterprise <span className="font-mono text-accent">$48,000</span></div></div>
            <Badge variant={stage === 4 ? "success" : "info"} dot>{stages[stage]}</Badge>
          </div>
          <div className="flex gap-1">
            {stages.map((s, i) => (
              <button key={s} type="button" onClick={() => setStage(i)} className="group flex flex-1 flex-col gap-1.5 text-left">
                <span className="relative h-2 overflow-hidden rounded-full bg-surface-overlay">
                  <motion.span initial={false} animate={{ width: i <= stage ? "100%" : "0%" }} transition={{ delay: Math.abs(i - stage) * 0.05 }} className={`absolute inset-y-0 left-0 ${stage === 4 ? "bg-success" : "bg-accent"}`} />
                </span>
                <span className={`text-[11px] ${i === stage ? "font-medium text-foreground" : "text-subtle group-hover:text-muted"}`}>{s}</span>
              </button>
            ))}
          </div>
        </div>
        <SegmentedControl aria-label="Section" defaultValue="activity" value={tab} onValueChange={setTab} className="w-fit" options={[{ value: "activity", label: "Activity" }, { value: "notes", label: "Notes" }]} />
        <div className="flex gap-2 rounded-2xl border border-border bg-surface p-3">
          <input value={note} onChange={(e) => setNote(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Log a note…" aria-label="Note" className="flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-subtle" />
          <Button size="sm" onClick={add} disabled={!note.trim()}><PlusIcon size={14} /> Log</Button>
        </div>
        <ol className="relative flex flex-col gap-1 pl-2">
          <span className="absolute bottom-4 left-[23px] top-4 w-px bg-border" />
          <AnimatePresence initial={false}>
            {acts.filter((a) => tab === "activity" || a.kind === "note").map((a) => {
              const I = icon[a.kind];
              return (
                <motion.li key={a.id} layout initial={{ opacity: 0, x: -10, height: 0 }} animate={{ opacity: 1, x: 0, height: "auto" }} className="relative flex gap-4 py-2">
                  <span className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-border ${a.kind === "note" ? "bg-accent text-accent-foreground" : "bg-surface-raised text-muted"}`}><I size={14} /></span>
                  <div className="flex flex-1 flex-col gap-0.5 rounded-xl border border-border bg-surface px-4 py-3 text-sm"><span>{a.text}</span><span className="text-xs text-subtle">{a.time}</span></div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>
      </div>
    </div>
  );
}
