"use client";

import * as React from "react";
import { AnimatePresence, motion, useMotionValue, useTransform, animate } from "motion/react";
import { cn, useControllableState, useReducedMotion } from "@kineticui/core";
import { QrCode } from "./qr-code";

export type TicketField = { label: string; value: React.ReactNode };

export type TicketProps = {
  /** Small line above the title, e.g. the organiser. */
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Label and value pairs, e.g. date, gate, seat. */
  fields?: TicketField[];
  /** Name printed on the ticket. */
  holder?: React.ReactNode;
  /** Encoded in the QR code on the stub. */
  code: string;
  /** Short code printed under the QR. Defaults to `code`. */
  codeLabel?: React.ReactNode;
  /** Text on the stub above the QR. */
  stubLabel?: React.ReactNode;
  /** Artwork behind the main part: an image URL or any node. */
  art?: React.ReactNode;
  /** Stub on the right (horizontal) or at the bottom (vertical). */
  orientation?: "horizontal" | "vertical";
  /** Let people drag the stub to tear it off. */
  tearable?: boolean;
  torn?: boolean;
  defaultTorn?: boolean;
  onTornChange?: (torn: boolean) => void;
  className?: string;
};

const NOTCH = 14;

/**
 * An event ticket with a perforated stub. Drag the stub across the perforation (or press Enter on it)
 * to tear it off.
 */
export function Ticket({
  eyebrow,
  title,
  subtitle,
  fields = [],
  holder,
  code,
  codeLabel,
  stubLabel = "Admit one",
  art,
  orientation = "horizontal",
  tearable = true,
  torn: tornProp,
  defaultTorn = false,
  onTornChange,
  className,
}: TicketProps) {
  const reduced = useReducedMotion();
  const [torn, setTorn] = useControllableState({ value: tornProp, defaultValue: defaultTorn, onChange: onTornChange });
  const h = orientation === "horizontal";
  const pull = useMotionValue(0);
  const rotate = useTransform(pull, [0, 120], [0, h ? 7 : -5]);
  const strain = useTransform(pull, [0, 70], [0, 1]);
  const threshold = 70;

  const tear = () => {
    if (torn) return;
    setTorn(true);
  };
  React.useEffect(() => {
    if (!torn) animate(pull, 0, { type: "spring", stiffness: 400, damping: 30 });
  }, [torn, pull]);

  // A notch cut at both ends of the perforation, on the side that touches the other part.
  const mask = (side: "end" | "start") => {
    const at = h ? (side === "end" ? ["right top", "right bottom"] : ["left top", "left bottom"]) : side === "end" ? ["left bottom", "right bottom"] : ["left top", "right top"];
    const pos = h ? ["top", "bottom"] : ["left", "right"];
    const size = h ? "100% 51%" : "51% 100%";
    const g = (i: number) => `radial-gradient(circle ${NOTCH}px at ${at[i]}, #0000 98%, #000) ${pos[i]}/${size} no-repeat`;
    return `${g(0)}, ${g(1)}`;
  };

  return (
    <div
      className={cn("relative inline-flex font-sans text-foreground", h ? "flex-row" : "flex-col", className)}
      style={{ filter: "drop-shadow(0 18px 30px rgb(0 0 0 / .35))" }}
    >
      {/* main */}
      <div
        className={cn("relative flex overflow-hidden bg-surface-raised", h ? "w-[22rem] flex-col rounded-l-[18px]" : "w-[19rem] flex-col rounded-t-[18px]")}
        style={{ mask: mask("end"), WebkitMask: mask("end") }}
      >
        {art && (
          <div className="relative h-28 overflow-hidden">
            {typeof art === "string" ? <img src={art} alt="" className="size-full object-cover" /> : art}
            <div className="absolute inset-0 bg-gradient-to-t from-surface-raised to-transparent" />
          </div>
        )}
        <div className={cn("flex flex-1 flex-col gap-4 p-5", art && "-mt-6 relative")}>
          <div>
            {eyebrow && <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">{eyebrow}</div>}
            <div className="mt-1 font-display text-2xl font-semibold leading-tight tracking-tight">{title}</div>
            {subtitle && <div className="mt-1 text-sm text-muted">{subtitle}</div>}
          </div>
          {fields.length > 0 && (
            <dl className="grid grid-cols-3 gap-x-3 gap-y-3">
              {fields.map((f) => (
                <div key={f.label} className="min-w-0">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">{f.label}</dt>
                  <dd className="mt-0.5 truncate text-sm font-medium">{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {holder && (
            <div className="mt-auto flex items-center justify-between border-t border-dashed border-border pt-3 text-xs text-muted">
              <span className="font-mono uppercase tracking-[0.14em] text-subtle">Holder</span>
              <span className="font-medium text-foreground">{holder}</span>
            </div>
          )}
        </div>
      </div>

      {/* stub */}
      <AnimatePresence initial={false}>
        {!torn ? (
          <motion.div
            key="stub"
            role={tearable ? "button" : undefined}
            tabIndex={tearable ? 0 : undefined}
            onKeyDown={(e) => {
              if (tearable && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                tear();
              }
            }}
            drag={tearable && !reduced ? (h ? "x" : "y") : false}
            dragConstraints={h ? { left: 0, right: 0 } : { top: 0, bottom: 0 }}
            dragElastic={{ left: 0, right: 0.6, top: 0, bottom: 0.6 }}
            dragSnapToOrigin
            onDrag={(_, info) => pull.set(Math.max(0, h ? info.offset.x : info.offset.y))}
            onDragEnd={(_, info) => {
              const d = h ? info.offset.x : info.offset.y;
              if (d > threshold) tear();
              else pull.set(0);
            }}
            style={{ rotate, transformOrigin: h ? "0% 100%" : "0% 0%", mask: mask("start"), WebkitMask: mask("start") }}
            exit={
              reduced
                ? { opacity: 0 }
                : h
                  ? { x: 260, y: 160, rotate: 28, opacity: 0, transition: { duration: 0.7, ease: [0.3, 0, 0.7, 1] } }
                  : { y: 220, x: 40, rotate: -14, opacity: 0, transition: { duration: 0.7, ease: [0.3, 0, 0.7, 1] } }
            }
            className={cn(
              "relative flex items-center justify-center bg-surface-raised outline-none focus-visible:ring-2 focus-visible:ring-ring",
              h ? "w-36 flex-col gap-2 rounded-r-[18px] border-l-2 border-dashed border-border px-4 py-5" : "w-[19rem] flex-row gap-4 rounded-b-[18px] border-t-2 border-dashed border-border p-4",
              tearable && !reduced && (h ? "cursor-grab active:cursor-grabbing" : "cursor-grab active:cursor-grabbing"),
            )}
          >
            {tearable && <span className="sr-only">Tear off the stub. </span>}
            <motion.div
              aria-hidden
              className={cn("pointer-events-none absolute bg-accent/70", h ? "-left-[2px] top-0 h-full w-[2px]" : "-top-[2px] left-0 h-[2px] w-full")}
              style={{ opacity: strain }}
            />
            <div className={cn("text-center", !h && "order-2 text-left")}>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">{stubLabel}</div>
              {!h && <div className="mt-1 font-mono text-xs text-muted">{codeLabel ?? code}</div>}
              {!h && tearable && <div className="mt-2 text-[11px] text-subtle">Pull down to tear</div>}
            </div>
            <div className="rounded-lg bg-white p-1.5 text-black">
              <QrCode value={code} size={h ? 92 : 76} margin={1} />
            </div>
            {h && <div className="font-mono text-[11px] text-muted">{codeLabel ?? code}</div>}
            {h && tearable && <div className="text-[10px] text-subtle">Pull to tear</div>}
          </motion.div>
        ) : (
          <motion.div
            key="torn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn("flex items-center justify-center text-xs text-subtle", h ? "w-36" : "h-24 w-[19rem]")}
          >
            <span className="font-mono uppercase tracking-[0.18em]">Checked in</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
