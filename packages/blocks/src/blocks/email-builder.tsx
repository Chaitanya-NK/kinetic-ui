"use client";

import * as React from "react";
import { Reorder, motion, AnimatePresence } from "motion/react";
import { Button, SegmentedControl } from "@kineticui/ui";
import { GripVerticalIcon, HeadingIcon, ImageIcon, MinusIcon, MonitorIcon, SmartphoneIcon, SquareIcon, TrashIcon, TypeIcon } from "@kineticui/icons";

type Kind = "heading" | "text" | "image" | "button" | "divider";
type Block = { id: string; kind: Kind; text: string };
const palette: { kind: Kind; label: string; icon: React.ComponentType<{ size?: number }>; text: string }[] = [
  { kind: "heading", label: "Heading", icon: HeadingIcon, text: "Big news inside" },
  { kind: "text", label: "Text", icon: TypeIcon, text: "Write something your readers will love." },
  { kind: "image", label: "Image", icon: ImageIcon, text: "" },
  { kind: "button", label: "Button", icon: SquareIcon, text: "Call to action" },
  { kind: "divider", label: "Divider", icon: MinusIcon, text: "" },
];
let n = 10;

/** Email builder: drag to reorder content blocks, edit inline, desktop/mobile preview and a properties panel. */
export function EmailBuilder() {
  const [blocks, setBlocks] = React.useState<Block[]>([
    { id: "1", kind: "heading", text: "Kinetic UI 1.4 is live" },
    { id: "2", kind: "image", text: "" },
    { id: "3", kind: "text", text: "Share sheets, filter builders, upload queues and passkey sign-in. Everything moves, nothing gets in the way." },
    { id: "4", kind: "button", text: "Read the changelog" },
    { id: "5", kind: "divider", text: "" },
    { id: "6", kind: "text", text: "You're receiving this because you subscribed to product updates." },
  ]);
  const [sel, setSel] = React.useState<string | null>("1");
  const [device, setDevice] = React.useState("desktop");
  const [accent, setAccent] = React.useState("#C6F432");
  const selected = blocks.find((b) => b.id === sel);
  const update = (id: string, text: string) => setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, text } : b)));

  return (
    <div className="grid min-h-[720px] grid-cols-1 border-border md:grid-cols-[200px_1fr_240px]">
      <aside className="flex flex-col gap-2 border-b border-border p-4 md:border-b-0 md:border-r">
        <span className="mb-1 font-mono text-[10px] uppercase tracking-widest text-subtle">Blocks</span>
        <div className="grid grid-cols-3 gap-2 md:grid-cols-1">
          {palette.map((p) => (
            <motion.button key={p.kind} whileTap={{ scale: 0.95 }} type="button" onClick={() => { const id = String(++n); setBlocks((b) => [...b, { id, kind: p.kind, text: p.text }]); setSel(id); }} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm hover:border-accent">
              <p.icon size={15} /> {p.label}
            </motion.button>
          ))}
        </div>
      </aside>
      <main className="flex flex-col items-center gap-4 bg-[radial-gradient(var(--kn-border)_1px,transparent_1px)] bg-[size:16px_16px] p-6">
        <div className="flex w-full items-center justify-between">
          <span className="text-sm text-muted">Subject: <b className="text-foreground">What&apos;s new in Kinetic UI</b></span>
          <SegmentedControl aria-label="Preview size" defaultValue="desktop" value={device} onValueChange={setDevice} options={[{ value: "desktop", label: <MonitorIcon size={14} /> }, { value: "mobile", label: <SmartphoneIcon size={14} /> }]} />
        </div>
        <motion.div animate={{ width: device === "desktop" ? 560 : 340 }} transition={{ type: "spring", stiffness: 260, damping: 30 }} className="max-w-full overflow-hidden rounded-xl bg-white text-[#111] shadow-overlay">
          <div className="flex items-center gap-2 px-6 py-4"><span className="size-5 rounded" style={{ background: accent }} /><b className="text-sm">Kinetic</b></div>
          <Reorder.Group axis="y" values={blocks} onReorder={setBlocks} className="flex flex-col px-6 pb-6">
            {blocks.map((b) => (
              <Reorder.Item key={b.id} value={b} onPointerDown={() => setSel(b.id)} className={`group relative -mx-3 cursor-grab rounded-lg px-3 py-2 active:cursor-grabbing ${sel === b.id ? "ring-2" : "hover:ring-1 hover:ring-black/10"}`} style={sel === b.id ? { ["--tw-ring-color" as string]: accent } : undefined}>
                <GripVerticalIcon size={14} className="absolute -left-1 top-1/2 -translate-y-1/2 text-black/30 opacity-0 group-hover:opacity-100" />
                {b.kind === "heading" ? <h2 className="text-2xl font-bold tracking-tight">{b.text}</h2>
                  : b.kind === "text" ? <p className="text-[15px] leading-relaxed text-black/70">{b.text}</p>
                  : b.kind === "image" ? <div className="aspect-[2/1] rounded-lg" style={{ background: `linear-gradient(135deg, ${accent}, #0ea5e9)` }} />
                  : b.kind === "button" ? <span className="inline-block rounded-lg px-5 py-2.5 text-sm font-semibold" style={{ background: accent }}>{b.text}</span>
                  : <hr className="border-black/10" />}
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </motion.div>
      </main>
      <aside className="flex flex-col gap-4 border-t border-border p-4 md:border-l md:border-t-0">
        <span className="font-mono text-[10px] uppercase tracking-widest text-subtle">Properties</span>
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div key={selected.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
              <span className="text-sm font-medium capitalize">{selected.kind}</span>
              {selected.kind === "text" ? (
                <textarea value={selected.text} onChange={(e) => update(selected.id, e.target.value)} rows={5} aria-label="Text" className="rounded-lg border border-border bg-background p-2 text-sm outline-none focus:border-accent" />
              ) : selected.kind === "heading" || selected.kind === "button" ? (
                <input value={selected.text} onChange={(e) => update(selected.id, e.target.value)} aria-label="Text" className="h-9 rounded-lg border border-border bg-background px-2 text-sm outline-none focus:border-accent" />
              ) : <p className="text-xs text-subtle">No settings for this block.</p>}
              <Button variant="destructive" size="sm" onClick={() => { setBlocks((b) => b.filter((x) => x.id !== selected.id)); setSel(null); }}><TrashIcon size={14} /> Remove block</Button>
            </motion.div>
          ) : <p className="text-xs text-subtle">Select a block to edit it.</p>}
        </AnimatePresence>
        <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4">
          <span className="text-xs text-subtle">Brand colour</span>
          <div className="flex gap-2">
            {["#C6F432", "#7dd3fc", "#f9a8d4", "#fcd34d"].map((c) => <button key={c} type="button" aria-label={c} onClick={() => setAccent(c)} className={`size-7 rounded-full ${accent === c ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : ""}`} style={{ background: c }} />)}
          </div>
          <Button className="mt-2">Send test email</Button>
        </div>
      </aside>
    </div>
  );
}
