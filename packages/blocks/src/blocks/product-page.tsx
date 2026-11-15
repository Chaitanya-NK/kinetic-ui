"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { Accordion, AccordionItem, Badge, Breadcrumb, Button, NumberInput, Rating, toast } from "@kineticui/ui";
import { CartIcon, CheckIcon, HeartIcon } from "@kineticui/icons";

const colors = [
  { id: "lime", label: "Volt", hex: "#C6F432" },
  { id: "blue", label: "Ocean", hex: "#7C8CFF" },
  { id: "orange", label: "Ember", hex: "#F4A86A" },
  { id: "rose", label: "Bloom", hex: "#F0A3D0" },
];
const sizes = ["39", "40", "41", "42", "43", "44", "45"];
const soldOut = new Set(["39", "45"]);

/** Product detail: gallery with thumbnails, colour and size pickers, quantity, add-to-cart with feedback and details accordion. */
export function ProductPage() {
  const [color, setColor] = React.useState(colors[0]!);
  const [view, setView] = React.useState(0);
  const [size, setSize] = React.useState<string | null>(null);
  const [qty, setQty] = React.useState(1);
  const [added, setAdded] = React.useState(false);
  const [fav, setFav] = React.useState(false);

  const shoe = (angle: number) => (
    <svg viewBox="0 0 400 300" className="size-full" aria-hidden>
      <g transform={`rotate(${angle} 200 150)`}>
        <path d="M60 190c10-40 50-70 90-80l40-40c20-10 40 0 50 20l20 40c40 10 80 20 90 50 5 15-5 30-25 30H80c-20 0-25-10-20-20z" fill={color.hex} />
        <path d="M60 205h330c0 15-10 25-30 25H85c-20 0-28-12-25-25z" fill="#E8E8E3" />
        <path d="M150 130l20 30M175 115l20 30M200 100l20 30" stroke="#0b0c0e" strokeWidth="6" strokeLinecap="round" />
      </g>
    </svg>
  );

  return (
    <section className="mx-auto flex min-h-[820px] max-w-6xl flex-col gap-6 p-6 md:p-10">
      <Breadcrumb items={[{ label: "Shop", href: "#shop" }, { label: "Running", href: "#running" }, { label: "Stride Runner" }]} />
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-border" style={{ background: `radial-gradient(circle at 50% 40%, ${color.hex}33, var(--kn-surface) 70%)` }}>
            <AnimatePresence mode="wait">
              <motion.div key={`${color.id}-${view}`} initial={{ opacity: 0, scale: 0.92, rotate: -4 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ type: "spring", stiffness: 200, damping: 22 }} className="absolute inset-10">
                {shoe([-8, 0, 12, -20][view]!)}
              </motion.div>
            </AnimatePresence>
            <Badge variant="solid" className="absolute left-4 top-4">New</Badge>
            <button type="button" aria-label="Save" aria-pressed={fav} onClick={() => setFav(!fav)} className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-background/70 backdrop-blur">
              <HeartIcon size={18} className={fav ? "fill-danger text-danger" : ""} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <button key={i} type="button" aria-label={`View ${i + 1}`} onClick={() => setView(i)} className={cn("aspect-square overflow-hidden rounded-xl border bg-surface p-2 transition-colors", view === i ? "border-accent" : "border-border hover:border-border-strong")}>
                {shoe([-8, 0, 12, -20][i]!)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-4xl font-semibold tracking-tight">Stride Runner</h1>
            <div className="flex items-center gap-2 text-sm text-muted">
              <Rating defaultValue={4.5} readOnly size={16} /> 4.5 · 1,284 reviews
            </div>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="font-display text-3xl font-semibold">$149</span>
              <span className="text-muted line-through">$179</span>
              <Badge variant="success" size="sm">Save 17%</Badge>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-sm">Colour: <b>{color.label}</b></span>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button key={c.id} type="button" aria-label={c.label} aria-pressed={color.id === c.id} onClick={() => setColor(c)} className={cn("size-9 rounded-full ring-2 ring-offset-2 ring-offset-background transition-shadow", color.id === c.id ? "ring-foreground" : "ring-transparent")} style={{ background: c.hex }} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <span className="flex justify-between text-sm">Size (EU) <a href="#size-guide" className="text-accent hover:underline">Size guide</a></span>
            <div role="radiogroup" aria-label="Size" className="grid grid-cols-7 gap-2">
              {sizes.map((s) => (
                <button key={s} type="button" role="radio" aria-checked={size === s} disabled={soldOut.has(s)} onClick={() => setSize(s)} className={cn("h-11 rounded-xl border text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:text-subtle disabled:line-through", size === s ? "border-accent bg-accent text-accent-foreground" : "border-border hover:border-border-strong")}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <NumberInput value={qty} onValueChange={setQty} min={1} max={5} aria-label="Quantity" />
            <Button
              size="lg"
              className="flex-1"
              disabled={!size}
              onClick={() => {
                setAdded(true);
                toast({ title: `Added ${qty} × Stride Runner (${color.label}, ${size})`, tone: "success" });
                setTimeout(() => setAdded(false), 1800);
              }}
            >
              {added ? <><CheckIcon size={16} /> Added</> : <><CartIcon size={16} /> {size ? "Add to cart" : "Select a size"}</>}
            </Button>
          </div>
          <Accordion type="single" collapsible defaultValue="details">
            <AccordionItem value="details" title="Details">Engineered mesh upper, responsive foam midsole, 8 mm drop. Weight 248 g (EU 42).</AccordionItem>
            <AccordionItem value="shipping" title="Shipping & returns">Free delivery over $250. Free 30-day returns.</AccordionItem>
            <AccordionItem value="care" title="Care">Hand wash cold. Air dry away from direct heat.</AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  );
}
