"use client";

import * as React from "react";
import { GravityBox, GravityPill, HoloCard, type HoloFoil } from "@kineticui/motion";
import { ReceiptPrinter, SegmentedControl, Stories, StoryPlayer, Ticket, type Story } from "@kineticui/ui";
import { BoltIcon, RefreshIcon, SparkleIcon } from "@kineticui/icons";

/* ---------------------------------------------------------------- holo card */

function HoloDemo() {
  const [foil, setFoil] = React.useState<HoloFoil>("rainbow");
  return (
    <div className="flex flex-col items-center gap-6">
      <HoloCard foil={foil} className="w-64">
        <div className="relative flex aspect-[5/7] flex-col bg-[radial-gradient(120%_80%_at_20%_0%,#2a3d0c_0%,#0d0f0a_55%,#0a0a0a_100%)] p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Kinetic member</span>
            <span className="font-mono text-[10px] text-white/50">No. 0042</span>
          </div>
          <div className="mt-6 grid size-24 place-items-center self-center rounded-full bg-accent font-display text-3xl font-bold text-black shadow-[0_0_60px_rgb(198_244_50/.35)]">
            MK
          </div>
          <div className="mt-5 text-center">
            <div className="font-display text-2xl font-semibold text-white">Maya Kapoor</div>
            <div className="mt-1 text-sm text-white/60">Design engineer</div>
          </div>
          <div className="mt-auto grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-center">
            {[
              ["Since", "2024"],
              ["Ships", "128"],
              ["Tier", "Holo"],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">{k}</div>
                <div className="font-display text-sm font-semibold text-white">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </HoloCard>
      <SegmentedControl
        aria-label="Foil"
        defaultValue="rainbow"
        value={foil}
        onValueChange={(v) => setFoil(v as HoloFoil)}
        options={[
          { value: "rainbow", label: "Rainbow" },
          { value: "sparkle", label: "Sparkle" },
          { value: "lines", label: "Lines" },
          { value: "none", label: "None" },
        ]}
      />
    </div>
  );
}

/* ---------------------------------------------------------------- ticket */

function TicketDemo() {
  const [torn, setTorn] = React.useState(false);
  return (
    <div className="flex flex-col items-center gap-5">
      <Ticket
        eyebrow="Kinetic Conf 2027"
        title="Motion at Scale"
        subtitle="Main hall, Bengaluru"
        fields={[
          { label: "Date", value: "14 Mar" },
          { label: "Doors", value: "09:30" },
          { label: "Seat", value: "C 12" },
        ]}
        holder="Maya Kapoor"
        code="KC27-C12-0042"
        art={<div className="size-full bg-[radial-gradient(80%_120%_at_80%_0%,#c6f432_0%,#4a6b0b_35%,transparent_70%),linear-gradient(135deg,#111,#1b1f12)]" />}
        torn={torn}
        onTornChange={setTorn}
      />
      <button
        type="button"
        onClick={() => setTorn(false)}
        className={`flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted transition-opacity hover:text-foreground ${torn ? "" : "pointer-events-none opacity-0"}`}
      >
        <RefreshIcon className="size-3.5" /> New ticket
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------- gravity */

const tags = ["React", "Motion", "Tailwind", "TypeScript", "Design systems", "Next.js", "Accessibility", "Figma", "WebGL", "Radix", "Framer", "Prototyping"];

function GravityDemo() {
  const [run, setRun] = React.useState(0);
  return (
    <div className="relative w-full max-w-2xl">
      <GravityBox key={run} start="inView" className="h-[22rem] w-full rounded-2xl border border-border bg-surface">
        {tags.map((t, k) => (
          <GravityPill key={t} className={k % 4 === 0 ? "border-transparent bg-accent text-accent-foreground" : undefined}>
            {t}
          </GravityPill>
        ))}
      </GravityBox>
      <div className="pointer-events-none absolute left-5 top-4">
        <div className="font-display text-xl font-semibold">What I work with</div>
        <div className="text-sm text-muted">Grab one and throw it.</div>
      </div>
      <button
        type="button"
        onClick={() => setRun((r) => r + 1)}
        className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-border bg-surface-raised px-3 py-1.5 text-xs text-muted hover:text-foreground"
      >
        <RefreshIcon className="size-3.5" /> Drop again
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------- stories */

const card = (bg: string, title: string, body: string, icon?: React.ReactNode) => (
  <div className="flex size-full flex-col justify-center gap-3 p-8" style={{ background: bg }}>
    {icon}
    <div className="font-display text-4xl font-bold leading-[1.05] tracking-tight">{title}</div>
    <div className="text-base text-white/75">{body}</div>
  </div>
);

const people: Story[] = [
  {
    id: "maya",
    name: "Maya Kapoor",
    items: [
      { id: "m1", time: "2h", content: card("radial-gradient(120% 90% at 0% 0%, #6b8f12, #12160a 60%)", "v0.3 is out.", "Signature components, playful bits and a node editor.", <SparkleIcon className="size-8 text-accent" />), caption: "Swipe for the highlights" },
      { id: "m2", time: "2h", content: card("linear-gradient(160deg, #1d2b55, #0b0d16)", "Dynamic Island", "Live activities in a black pill.") },
      { id: "m3", time: "1h", content: card("linear-gradient(200deg, #4b1d3f, #120a10)", "Liquid Glass", "Real refraction, on the web.") },
    ],
  },
  {
    id: "arjun",
    name: "Arjun Rao",
    items: [
      { id: "a1", time: "5h", content: card("linear-gradient(170deg, #0f3d3a, #081514)", "Morning build", "Gravity Box tags for the team page.", <BoltIcon className="size-8 text-[#5eead4]" />) },
      { id: "a2", time: "4h", content: card("linear-gradient(170deg, #3d2a0f, #140e08)", "Receipts", "Printing line by line, with sound.") },
    ],
  },
  {
    id: "lena",
    name: "Lena Ortiz",
    items: [{ id: "l1", time: "8h", content: card("linear-gradient(170deg, #2a1452, #0d0818)", "Holo cards", "Tilt it. Watch the foil.") }],
  },
  {
    id: "sam",
    name: "Sam Lee",
    items: [{ id: "s1", time: "12h", content: card("linear-gradient(170deg, #3a0f14, #140709)", "Tickets", "Pull the stub to check in.") }],
  },
];

function StoriesDemo() {
  return (
    <div className="flex w-full flex-col items-center gap-6">
      <Stories stories={people} />
      <StoryPlayer stories={people} className="w-[17rem]" />
    </div>
  );
}

/* ---------------------------------------------------------------- receipt */

function ReceiptDemo() {
  return (
    <ReceiptPrinter
      merchant="Kinetic Coffee"
      meta={["12 Residency Rd, Bengaluru", "Order #2048 · 17 Nov 2026 09:41"]}
      items={[
        { label: "Flat white", qty: 2, amount: 220 },
        { label: "Almond croissant", amount: 180 },
        { label: "Cold brew tonic", amount: 260 },
        { label: "Banana bread", amount: 140 },
      ]}
      tax={0.05}
      taxLabel="GST"
      adjustments={[{ label: "Member discount", amount: -50 }]}
      currency="INR"
      locale="en-IN"
      footer="Thanks, Maya. See you tomorrow."
      barcode="KC-2048-0941"
    />
  );
}

export const playfulDemos: Record<string, () => React.ReactNode> = {
  "holo-card": () => <HoloDemo />,
  ticket: () => <TicketDemo />,
  "gravity-box": () => <GravityDemo />,
  stories: () => <StoriesDemo />,
  "receipt-printer": () => <ReceiptDemo />,
};
