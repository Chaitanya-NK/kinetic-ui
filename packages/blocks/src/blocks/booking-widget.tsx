"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { Avatar, Button, Calendar, Field, Input, Textarea, toast } from "@kineticui/ui";
import { ClockIcon, GlobeIcon, VideoIcon } from "@kineticui/icons";

const slots = ["09:00", "09:30", "10:30", "11:00", "13:30", "14:00", "15:30", "16:00", "17:00"];

/** Calendly-style scheduler: host info, date picker, time slots and a confirm form. */
export function BookingWidget({ host = "Maya Kapoor", meeting = "Product demo", minutes = 30 }: { host?: string; meeting?: string; minutes?: number }) {
  const [date, setDate] = React.useState<Date | undefined>();
  const [time, setTime] = React.useState<string | null>(null);
  const [confirming, setConfirming] = React.useState(false);
  const label = date ? date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : null;
  // Pretend some slots are taken on odd days.
  const taken = (s: string) => !!date && date.getDate() % 2 === 1 && (s === "10:30" || s === "14:00");

  return (
    <section className="flex min-h-[640px] items-center justify-center p-6">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-surface md:grid-cols-[240px_1fr]">
        <div className="flex flex-col gap-4 border-b border-border p-6 md:border-b-0 md:border-r">
          <Avatar alt={host} color="#7C8CFF" />
          <div>
            <div className="text-sm text-muted">{host}</div>
            <h2 className="font-display text-xl font-semibold">{meeting}</h2>
          </div>
          <ul className="flex flex-col gap-2 text-sm text-muted">
            <li className="flex items-center gap-2"><ClockIcon size={15} /> {minutes} min</li>
            <li className="flex items-center gap-2"><VideoIcon size={15} /> Video call link on confirm</li>
            <li className="flex items-center gap-2"><GlobeIcon size={15} /> Asia/Kolkata</li>
          </ul>
          {label && time ? <div className="rounded-xl bg-accent-soft p-3 text-sm"><b>{time}</b>, {label}</div> : null}
        </div>
        <div className="p-6">
          <AnimatePresence mode="wait">
            {confirming && date && time ? (
              <motion.form
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  toast({ title: "Booked!", description: `${time}, ${label}. Invite sent.`, tone: "success" });
                  setConfirming(false);
                  setTime(null);
                }}
              >
                <h3 className="font-semibold">Your details</h3>
                <Field label="Name" htmlFor="kn-bk-name"><Input id="kn-bk-name" required defaultValue="Rohan Joshi" /></Field>
                <Field label="Email" htmlFor="kn-bk-email"><Input id="kn-bk-email" type="email" required defaultValue="rohan@acme.io" /></Field>
                <Field label="Anything we should know?" htmlFor="kn-bk-note"><Textarea id="kn-bk-note" rows={3} /></Field>
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" onClick={() => setConfirming(false)}>Back</Button>
                  <Button type="submit" className="flex-1">Confirm booking</Button>
                </div>
              </motion.form>
            ) : (
              <motion.div key="pick" exit={{ opacity: 0, x: -20 }} className="grid gap-6 sm:grid-cols-[auto_1fr]">
                <Calendar selected={date} onSelect={(d) => { setDate(d); setTime(null); }} disabled={(d) => d.getDay() === 0 || d.getDay() === 6 || d < new Date(new Date().setHours(0, 0, 0, 0))} />
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">{label ?? "Pick a date"}</span>
                  {date ? (
                    <div className="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-1">
                      {slots.map((s, i) => (
                        <motion.div key={s} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="flex gap-2">
                          <button
                            type="button"
                            disabled={taken(s)}
                            onClick={() => setTime(s)}
                            className={cn("h-10 flex-1 rounded-xl border font-mono text-sm transition-colors disabled:opacity-30 disabled:line-through", time === s ? "border-accent bg-surface-overlay" : "border-border hover:border-accent")}
                          >
                            {s}
                          </button>
                          {time === s ? (
                            <motion.span initial={{ width: 0, opacity: 0 }} animate={{ width: "auto", opacity: 1 }}>
                              <Button className="h-10" onClick={() => setConfirming(true)}>Next</Button>
                            </motion.span>
                          ) : null}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-subtle">Available slots appear here.</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
