"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@kineticui/core";
import { PlusIcon } from "@kineticui/icons";

export type KanbanCard = { id: string; title: string; [key: string]: unknown };
export type KanbanColumn<C extends KanbanCard = KanbanCard> = { id: string; title: string; color?: string; cards: C[]; limit?: number };

export type KanbanProps<C extends KanbanCard> = {
  columns: KanbanColumn<C>[];
  onChange: (columns: KanbanColumn<C>[]) => void;
  renderCard?: (card: C) => React.ReactNode;
  onAddCard?: (columnId: string) => void;
  className?: string;
};

/** Drag-and-drop board. Cards move between columns with mouse or keyboard (Alt+arrows). */
export function Kanban<C extends KanbanCard>({ columns, onChange, renderCard, onAddCard, className }: KanbanProps<C>) {
  const [drag, setDrag] = React.useState<{ id: string; from: string } | null>(null);
  const [over, setOver] = React.useState<{ col: string; index: number } | null>(null);

  const move = (cardId: string, from: string, to: string, index: number) => {
    const next = columns.map((c) => ({ ...c, cards: [...c.cards] }));
    const src = next.find((c) => c.id === from)!;
    const i = src.cards.findIndex((c) => c.id === cardId);
    if (i < 0) return;
    const [card] = src.cards.splice(i, 1);
    const dst = next.find((c) => c.id === to)!;
    const at = from === to && index > i ? index - 1 : index;
    dst.cards.splice(Math.max(0, Math.min(at, dst.cards.length)), 0, card!);
    onChange(next);
  };

  const onKey = (e: React.KeyboardEvent, card: C, colIdx: number, cardIdx: number) => {
    if (!e.altKey) return;
    const col = columns[colIdx]!;
    if (e.key === "ArrowRight" && colIdx < columns.length - 1) move(card.id, col.id, columns[colIdx + 1]!.id, cardIdx);
    else if (e.key === "ArrowLeft" && colIdx > 0) move(card.id, col.id, columns[colIdx - 1]!.id, cardIdx);
    else if (e.key === "ArrowUp" && cardIdx > 0) move(card.id, col.id, col.id, cardIdx - 1);
    else if (e.key === "ArrowDown" && cardIdx < col.cards.length - 1) move(card.id, col.id, col.id, cardIdx + 2);
    else return;
    e.preventDefault();
    requestAnimationFrame(() => (document.querySelector(`[data-kn-card="${card.id}"]`) as HTMLElement | null)?.focus());
  };

  return (
    <div className={cn("flex gap-3 overflow-x-auto pb-2", className)}>
      {columns.map((col, colIdx) => {
        const full = col.limit !== undefined && col.cards.length > col.limit;
        return (
          <section
            key={col.id}
            aria-label={col.title}
            onDragOver={(e) => {
              e.preventDefault();
              if (!over || over.col !== col.id) setOver({ col: col.id, index: col.cards.length });
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (drag && over) move(drag.id, drag.from, over.col, over.index);
              setDrag(null);
              setOver(null);
            }}
            className={cn("flex w-72 shrink-0 flex-col gap-2 rounded-2xl bg-surface p-2.5 transition-colors", over?.col === col.id && "bg-surface-raised")}
          >
            <header className="flex items-center gap-2 px-1.5 py-1">
              <span className="size-2 rounded-full" style={{ background: col.color ?? "var(--kn-muted)" }} />
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <span className={cn("rounded-full px-1.5 font-mono text-[11px]", full ? "bg-danger-soft text-danger" : "text-subtle")}>
                {col.cards.length}
                {col.limit !== undefined ? `/${col.limit}` : ""}
              </span>
              {onAddCard ? (
                <button type="button" aria-label={`Add card to ${col.title}`} onClick={() => onAddCard(col.id)} className="ml-auto flex size-6 items-center justify-center rounded-md text-subtle hover:bg-surface-overlay hover:text-foreground">
                  <PlusIcon size={14} />
                </button>
              ) : null}
            </header>
            <ul className="flex min-h-16 flex-col gap-2">
              {col.cards.map((card, i) => (
                <React.Fragment key={card.id}>
                  {over?.col === col.id && over.index === i && drag?.id !== card.id ? <li className="h-1 rounded-full bg-accent" aria-hidden /> : null}
                  <motion.li
                    layout
                    layoutId={`kn-kanban-${card.id}`}
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    data-kn-card={card.id}
                    tabIndex={0}
                    draggable
                    aria-roledescription="Draggable card"
                    aria-describedby="kn-kanban-help"
                    onDragStartCapture={(e: React.DragEvent) => {
                      e.dataTransfer.effectAllowed = "move";
                      setDrag({ id: card.id, from: col.id });
                    }}
                    onDragEndCapture={() => {
                      setDrag(null);
                      setOver(null);
                    }}
                    onDragOverCapture={(e: React.DragEvent<HTMLLIElement>) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const r = e.currentTarget.getBoundingClientRect();
                      const index = e.clientY < r.top + r.height / 2 ? i : i + 1;
                      if (over?.col !== col.id || over.index !== index) setOver({ col: col.id, index });
                    }}
                    onKeyDown={(e) => onKey(e, card, colIdx, i)}
                    className={cn(
                      "cursor-grab rounded-xl border border-border bg-surface-raised p-3 text-sm outline-none transition-[opacity,box-shadow] hover:border-border-strong focus-visible:ring-2 focus-visible:ring-accent active:cursor-grabbing",
                      drag?.id === card.id && "opacity-40",
                    )}
                  >
                    {renderCard ? renderCard(card) : card.title}
                  </motion.li>
                </React.Fragment>
              ))}
              {over?.col === col.id && over.index === col.cards.length ? <li className="h-1 rounded-full bg-accent" aria-hidden /> : null}
            </ul>
          </section>
        );
      })}
      <span id="kn-kanban-help" className="sr-only">
        Hold Alt and use the arrow keys to move this card.
      </span>
    </div>
  );
}
