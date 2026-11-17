"use client";

import * as React from "react";
import { motion } from "motion/react";
import { useMediaQuery } from "@kineticui/core";
import { FooterSimple } from "@kineticui/blocks";
import { AuroraBackground, GradientText, Globe } from "@kineticui/motion";
import { Accordion, AccordionItem, Badge, Button, Countdown, Navbar, Tabs, TabsContent, TabsList, TabsTrigger, Ticket } from "@kineticui/ui";
import { ArrowRightIcon, CalendarIcon, CheckIcon, MapPinIcon, TicketIcon, UsersIcon } from "@kineticui/icons";

// Replace these with your own event.
const event = {
  name: "Kinetic Conf",
  year: "2027",
  tagline: "Two days on motion, interaction and the craft of interfaces that feel alive.",
  starts: "2027-03-14T09:30:00+05:30",
  dates: "14–15 March 2027",
  city: "Bengaluru, India",
  venue: "The Foundry, Residency Road",
  coords: [12.97, 77.59] as [number, number],
};

const nav = [
  { label: "Speakers", href: "#speakers" },
  { label: "Agenda", href: "#agenda" },
  { label: "Tickets", href: "#tickets" },
  { label: "FAQ", href: "#faq" },
];

// Where attendees are flying in from: [lat, lng].
const cities: { label: string; at: [number, number] }[] = [
  { label: "London", at: [51.5, -0.12] },
  { label: "New York", at: [40.7, -74] },
  { label: "San Francisco", at: [37.77, -122.4] },
  { label: "Singapore", at: [1.35, 103.8] },
  { label: "Tokyo", at: [35.68, 139.7] },
  { label: "Berlin", at: [52.52, 13.4] },
  { label: "Sydney", at: [-33.86, 151.2] },
  { label: "Dubai", at: [25.2, 55.27] },
];

const speakers = [
  { name: "Maya Kapoor", role: "Design engineer, Kinetic", talk: "Motion at scale" },
  { name: "Arjun Rao", role: "Staff engineer, Northwind", talk: "Physics without a physics engine" },
  { name: "Lena Ortiz", role: "Design lead, Lumen", talk: "Liquid glass, honestly" },
  { name: "Sam Lee", role: "Founder, Fieldnote", talk: "Voice interfaces that breathe" },
  { name: "Priya Nair", role: "Accessibility lead, Atlas", talk: "Reduced motion is still motion" },
  { name: "Tom Becker", role: "Creative technologist", talk: "Building a node editor in a weekend" },
];

type Slot = { time: string; title: string; who?: string; track?: "Main" | "Workshop" | "Break" };
const agenda: Record<string, Slot[]> = {
  "Day 1": [
    { time: "09:30", title: "Doors, coffee and badges", track: "Break" },
    { time: "10:15", title: "Opening keynote: Motion at scale", who: "Maya Kapoor", track: "Main" },
    { time: "11:10", title: "Physics without a physics engine", who: "Arjun Rao", track: "Main" },
    { time: "12:00", title: "Workshop: springs you can feel", who: "Tom Becker", track: "Workshop" },
    { time: "13:00", title: "Lunch", track: "Break" },
    { time: "14:15", title: "Liquid glass, honestly", who: "Lena Ortiz", track: "Main" },
    { time: "15:30", title: "Lightning talks", track: "Main" },
  ],
  "Day 2": [
    { time: "10:00", title: "Voice interfaces that breathe", who: "Sam Lee", track: "Main" },
    { time: "11:00", title: "Reduced motion is still motion", who: "Priya Nair", track: "Main" },
    { time: "12:00", title: "Workshop: a node editor in a weekend", who: "Tom Becker", track: "Workshop" },
    { time: "13:00", title: "Lunch", track: "Break" },
    { time: "14:30", title: "Panel: the future of interface craft", track: "Main" },
    { time: "16:00", title: "Closing and after-party", track: "Break" },
  ],
};

const tiers = [
  { name: "Online", price: "Free", perks: ["Live stream of the main stage", "Talk recordings", "Community chat"] },
  { name: "Standard", price: "₹6,999", perks: ["Both days in person", "Lunch and coffee", "Recordings", "After-party"], featured: true },
  { name: "Workshop", price: "₹11,999", perks: ["Everything in Standard", "Both hands-on workshops", "Signed print"] },
];

const initials = (n: string) => n.split(" ").map((w) => w[0]).join("");

export default function EventPage() {
  const [torn, setTorn] = React.useState(false);
  const wide = useMediaQuery("(min-width: 640px)");
  return (
    <main className="relative min-h-dvh bg-background text-foreground">
      <Navbar
        logo={
          <span className="flex items-center gap-2 font-display text-base font-semibold">
            <span className="grid size-8 place-items-center rounded-lg bg-accent text-accent-foreground">
              <TicketIcon size={16} />
            </span>
            {event.name}
          </span>
        }
        items={nav}
        actions={
          <Button size="sm" className="rounded-full" asChild>
            <a href="#tickets">Get a ticket</a>
          </Button>
        }
      />

      {/* hero */}
      <section className="relative overflow-hidden">
        <AuroraBackground intensity={0.45} />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 pb-20 pt-32 lg:grid-cols-[1.1fr_1fr]">
          <div className="flex min-w-0 flex-col gap-6">
            <Badge variant="soft" dot="pulse" className="w-fit">
              Early tickets on sale
            </Badge>
            <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl">
              {event.name} <GradientText>{event.year}</GradientText>
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-muted">{event.tagline}</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              <span className="flex items-center gap-2">
                <CalendarIcon size={16} className="text-accent" /> {event.dates}
              </span>
              <span className="flex items-center gap-2">
                <MapPinIcon size={16} className="text-accent" /> {event.city}
              </span>
              <span className="flex items-center gap-2">
                <UsersIcon size={16} className="text-accent" /> 600 seats
              </span>
            </div>
            <Countdown to={event.starts} className="mt-2 max-sm:[zoom:0.82]" />
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="rounded-full" asChild>
                <a href="#tickets">
                  Get your ticket <ArrowRightIcon size={16} />
                </a>
              </Button>
              <Button size="lg" variant="ghost" className="rounded-full" asChild>
                <a href="#agenda">See the agenda</a>
              </Button>
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-[30rem]">
            <Globe
              initialLng={60}
              markers={[{ lat: event.coords[0], lng: event.coords[1], label: event.city.split(",")[0], size: 1.6 }, ...cities.map((c) => ({ lat: c.at[0], lng: c.at[1] }))]}
              arcs={cities.map((c) => ({ from: c.at, to: event.coords }))}
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-border bg-surface-raised/80 px-3 py-1.5 font-mono text-[11px] text-muted backdrop-blur">
              Attendees from {cities.length + 22} countries
            </div>
          </div>
        </div>
      </section>

      {/* speakers */}
      <section id="speakers" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-20">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Speakers</div>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">People who ship motion</h2>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {speakers.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: (i % 3) * 0.07, type: "spring", stiffness: 240, damping: 26 }}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-surface-raised p-5 transition-colors hover:border-border-strong"
            >
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-surface-overlay font-display text-lg font-semibold text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                {initials(s.name)}
              </span>
              <div className="min-w-0">
                <div className="font-semibold">{s.name}</div>
                <div className="truncate text-sm text-muted">{s.role}</div>
                <div className="mt-1 truncate text-sm text-foreground/80">“{s.talk}”</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* agenda */}
      <section id="agenda" className="mx-auto max-w-4xl scroll-mt-24 px-6 py-20">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Agenda</div>
        <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">Two days, one stage, two workshops</h2>
        <Tabs defaultValue="Day 1" className="mt-8">
          <TabsList>
            {Object.keys(agenda).map((d) => (
              <TabsTrigger key={d} value={d}>
                {d}
              </TabsTrigger>
            ))}
          </TabsList>
          {Object.entries(agenda).map(([d, slots]) => (
            <TabsContent key={d} value={d} className="mt-6">
              <ol className="relative border-l border-border">
                {slots.map((s, i) => (
                  <motion.li
                    key={s.time + s.title}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="relative flex flex-col gap-1 py-4 pl-6 sm:flex-row sm:items-center sm:gap-6"
                  >
                    <span className={`absolute -left-[5px] top-6 size-2.5 rounded-full sm:top-1/2 sm:-translate-y-1/2 ${s.track === "Main" ? "bg-accent" : s.track === "Workshop" ? "bg-[#7C8CFF]" : "bg-border-strong"}`} />
                    <span className="w-14 shrink-0 font-mono text-sm text-subtle">{s.time}</span>
                    <span className="flex-1">
                      <span className={s.track === "Break" ? "text-muted" : "font-medium"}>{s.title}</span>
                      {s.who && <span className="block text-sm text-muted">{s.who}</span>}
                    </span>
                    {s.track && s.track !== "Break" && (
                      <Badge variant={s.track === "Main" ? "soft" : "outline"} className="w-fit">
                        {s.track}
                      </Badge>
                    )}
                  </motion.li>
                ))}
              </ol>
            </TabsContent>
          ))}
        </Tabs>
      </section>

      {/* tickets */}
      <section id="tickets" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-20">
        <div className="text-center">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Tickets</div>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">Pick your seat</h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative flex flex-col rounded-2xl border p-6 ${t.featured ? "border-accent bg-surface-raised shadow-[0_20px_60px_-30px_var(--kn-accent)]" : "border-border bg-surface"}`}
            >
              {t.featured && <Badge className="absolute -top-3 left-6">Most popular</Badge>}
              <div className="font-display text-lg font-semibold">{t.name}</div>
              <div className="mt-2 font-display text-4xl font-semibold">{t.price}</div>
              <ul className="mt-5 flex flex-1 flex-col gap-2.5 text-sm text-muted">
                {t.perks.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <CheckIcon size={16} className="mt-0.5 shrink-0 text-accent" /> {p}
                  </li>
                ))}
              </ul>
              <Button className="mt-6 rounded-full" variant={t.featured ? "primary" : "outline"}>
                {t.price === "Free" ? "Register" : "Buy ticket"}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center gap-4">
          <p className="text-sm text-muted">Your pass, on the day. Pull the stub at the door.</p>
          <div className="max-w-full overflow-x-auto px-2 py-4">
            <Ticket
              eyebrow={`${event.name} ${event.year}`}
              title="Standard pass"
              subtitle={event.venue}
              fields={[
                { label: "Date", value: "14–15 Mar" },
                { label: "Doors", value: "09:30" },
                { label: "Seat", value: "Open" },
              ]}
              holder="Maya Kapoor"
              code="KC27-STD-0042"
              art={<div className="size-full bg-[radial-gradient(80%_120%_at_80%_0%,var(--kn-accent)_0%,color-mix(in_oklab,var(--kn-accent)_30%,black)_35%,transparent_70%),linear-gradient(135deg,#111,#1b1f12)]" />}
              orientation={wide ? "horizontal" : "vertical"}
              torn={torn}
              onTornChange={setTorn}
            />
          </div>
          {torn && (
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setTorn(false)} className="text-xs text-subtle underline-offset-4 hover:underline">
              Reset the demo pass
            </motion.button>
          )}
        </div>
      </section>

      {/* faq */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-6 py-20">
        <h2 className="font-display text-4xl font-semibold tracking-tight">Questions</h2>
        <Accordion type="single" collapsible className="mt-8">
          <AccordionItem value="where" title="Where is it?">
            {event.venue}, {event.city}. Ten minutes from MG Road metro.
          </AccordionItem>
          <AccordionItem value="refund" title="Can I get a refund?">
            Yes, a full refund up to 30 days before the event, or transfer your ticket to someone else any time.
          </AccordionItem>
          <AccordionItem value="talks" title="Will talks be recorded?">
            Every main-stage talk is recorded and sent to all ticket holders within a week.
          </AccordionItem>
          <AccordionItem value="access" title="Is the venue accessible?">
            Step-free access throughout, live captions on the main stage and a quiet room on both days.
          </AccordionItem>
        </Accordion>
      </section>

      <FooterSimple brand={`${event.name} ${event.year}`} links={nav} />
    </main>
  );
}
