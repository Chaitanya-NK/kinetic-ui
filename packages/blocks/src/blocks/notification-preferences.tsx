"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button, Select, Switch, toast } from "@kineticui/ui";
import { BellIcon, MailIcon, MoonIcon, SmartphoneIcon } from "@kineticui/icons";

const channels = [{ id: "email", label: "Email", icon: MailIcon }, { id: "push", label: "Push", icon: SmartphoneIcon }, { id: "inapp", label: "In-app", icon: BellIcon }] as const;
type Ch = (typeof channels)[number]["id"];
const events = [
  { id: "mention", label: "Mentions", hint: "Someone @mentions you" },
  { id: "comment", label: "Comments", hint: "Replies on your work" },
  { id: "assign", label: "Assignments", hint: "You're assigned a task" },
  { id: "deploy", label: "Deploys", hint: "Builds finish or fail" },
  { id: "digest", label: "Weekly digest", hint: "Summary every Monday" },
  { id: "product", label: "Product updates", hint: "New features and tips" },
];
const init: Record<string, Ch[]> = { mention: ["email", "push", "inapp"], comment: ["inapp", "push"], assign: ["email", "inapp"], deploy: ["inapp"], digest: ["email"], product: [] };

/** Notification preferences: per-event channel matrix, master toggles per channel, quiet hours and digest frequency. */
export function NotificationPreferences() {
  const [prefs, setPrefs] = React.useState(init);
  const [quiet, setQuiet] = React.useState(true);
  const [from, setFrom] = React.useState("22:00");
  const [to, setTo] = React.useState("08:00");
  const [freq, setFreq] = React.useState("instant");
  const toggle = (e: string, c: Ch) => setPrefs((p) => ({ ...p, [e]: p[e]!.includes(c) ? p[e]!.filter((x) => x !== c) : [...p[e]!, c] }));
  const channelOn = (c: Ch) => events.some((e) => prefs[e.id]!.includes(c));
  const setChannel = (c: Ch, on: boolean) => setPrefs((p) => Object.fromEntries(Object.entries(p).map(([k, v]) => [k, on ? (v.includes(c) ? v : [...v, c]) : v.filter((x) => x !== c)])));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <div><h1 className="font-display text-2xl font-semibold">Notifications</h1><p className="text-sm text-muted">Choose how and when we reach you.</p></div>
      <div className="grid grid-cols-3 gap-3">
        {channels.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
            <span className="flex size-9 items-center justify-center rounded-xl bg-surface-raised text-muted"><c.icon size={16} /></span>
            <span className="flex-1 text-sm font-medium">{c.label}</span>
            <Switch aria-label={`All ${c.label} notifications`} checked={channelOn(c.id)} onCheckedChange={(v) => setChannel(c.id, v)} />
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="grid grid-cols-[1fr_repeat(3,72px)] bg-surface px-4 py-3 text-xs text-subtle">
          <span>Event</span>{channels.map((c) => <span key={c.id} className="text-center">{c.label}</span>)}
        </div>
        {events.map((e) => (
          <div key={e.id} className="grid grid-cols-[1fr_repeat(3,72px)] items-center border-t border-border px-4 py-3">
            <div><div className="text-sm font-medium">{e.label}</div><div className="text-xs text-subtle">{e.hint}</div></div>
            {channels.map((c) => {
              const on = prefs[e.id]!.includes(c.id);
              return (
                <button key={c.id} type="button" role="switch" aria-checked={on} aria-label={`${e.label} via ${c.label}`} onClick={() => toggle(e.id, c.id)} className="mx-auto">
                  <span className={`relative flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${on ? "bg-accent" : "bg-surface-overlay"}`}>
                    <motion.span layout transition={{ type: "spring", stiffness: 600, damping: 32 }} className={`size-4 rounded-full ${on ? "ml-auto bg-accent-foreground" : "bg-muted"}`} />
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center gap-3">
          <MoonIcon size={16} className="text-muted" />
          <div className="flex-1"><div className="text-sm font-medium">Quiet hours</div><div className="text-xs text-subtle">Pause push notifications overnight. Mentions still arrive in-app.</div></div>
          <Switch aria-label="Quiet hours" checked={quiet} onCheckedChange={setQuiet} />
        </div>
        <AnimatePresence initial={false}>
          {quiet ? (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="flex flex-wrap items-center gap-2 pl-7 text-sm text-muted">
                From <input type="time" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From" className="h-9 rounded-lg border border-border bg-background px-2 text-foreground" />
                to <input type="time" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To" className="h-9 rounded-lg border border-border bg-background px-2 text-foreground" />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
        <div className="flex items-center gap-3 border-t border-border pt-4">
          <MailIcon size={16} className="text-muted" />
          <div className="flex-1"><div className="text-sm font-medium">Email frequency</div><div className="text-xs text-subtle">Bundle emails to reduce noise.</div></div>
          <Select aria-label="Email frequency" value={freq} onValueChange={setFreq} className="w-40" options={[{ value: "instant", label: "Instantly" }, { value: "hourly", label: "Hourly digest" }, { value: "daily", label: "Daily digest" }]} />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => setPrefs(init)}>Reset</Button>
        <Button onClick={() => toast.success("Preferences saved")}>Save preferences</Button>
      </div>
    </div>
  );
}
