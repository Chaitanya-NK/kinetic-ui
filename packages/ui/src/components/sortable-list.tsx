"use client";

import * as React from "react";
import { AnimatePresence, Reorder, motion, useDragControls } from "motion/react";
import { cn } from "@kineticui/core";
import { GripVerticalIcon } from "@kineticui/icons";

export type SortableItemState = {
  /** Spread onto the element that should start a drag (and take keyboard focus). */
  handleProps: React.HTMLAttributes<HTMLElement> & { "aria-label": string };
  dragging: boolean;
  lifted: boolean;
  index: number;
};

export type SortableListProps<T> = {
  items: T[];
  onReorder: (items: T[]) => void;
  getKey: (item: T) => string;
  /** Text read to screen readers, e.g. the item title. */
  getLabel?: (item: T) => string;
  renderItem: (item: T, state: SortableItemState) => React.ReactNode;
  axis?: "x" | "y";
  className?: string;
  itemClassName?: string;
};

/**
 * Drag-to-reorder list with spring layout animation. Keyboard: focus a handle, Space to lift,
 * arrow keys to move, Space to drop, Escape to cancel. Moves are announced to screen readers.
 */
export function SortableList<T>({ items, onReorder, getKey, getLabel = getKey, renderItem, axis = "y", className, itemClassName }: SortableListProps<T>) {
  const [lifted, setLifted] = React.useState<string | null>(null);
  const [announce, setAnnounce] = React.useState("");
  const original = React.useRef<T[] | null>(null);
  const handles = React.useRef(new Map<string, HTMLElement>());

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    const next = [...items];
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it!);
    onReorder(next);
    setAnnounce(`${getLabel(it!)} moved to position ${to + 1} of ${items.length}`);
    requestAnimationFrame(() => handles.current.get(getKey(it!))?.focus());
  };

  const onKey = (e: React.KeyboardEvent, item: T, index: number) => {
    const key = getKey(item);
    const prev = axis === "y" ? "ArrowUp" : "ArrowLeft";
    const next = axis === "y" ? "ArrowDown" : "ArrowRight";
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (lifted === key) {
        setLifted(null);
        original.current = null;
        setAnnounce(`${getLabel(item)} dropped at position ${index + 1}`);
      } else {
        setLifted(key);
        original.current = items;
        setAnnounce(`${getLabel(item)} lifted. Use arrow keys to move, Space to drop, Escape to cancel.`);
      }
    } else if (lifted === key && (e.key === prev || e.key === next)) {
      e.preventDefault();
      move(index, index + (e.key === next ? 1 : -1));
    } else if (lifted === key && e.key === "Escape") {
      e.preventDefault();
      if (original.current) onReorder(original.current);
      setLifted(null);
      setAnnounce("Move cancelled");
      requestAnimationFrame(() => handles.current.get(key)?.focus());
    }
  };

  return (
    <>
      <Reorder.Group axis={axis} values={items} onReorder={onReorder} className={cn("flex gap-2", axis === "y" ? "flex-col" : "flex-row", className)}>
        {items.map((item, index) => (
          <SortableRow
            key={getKey(item)}
            item={item}
            index={index}
            lifted={lifted === getKey(item)}
            label={getLabel(item)}
            className={itemClassName}
            renderItem={renderItem}
            onKeyDown={(e) => onKey(e, item, index)}
            registerHandle={(el) => (el ? handles.current.set(getKey(item), el) : handles.current.delete(getKey(item)))}
            onBlurLifted={() => lifted === getKey(item) && setLifted(null)}
          />
        ))}
      </Reorder.Group>
      <span aria-live="assertive" className="sr-only">{announce}</span>
    </>
  );
}

function SortableRow<T>({
  item,
  index,
  lifted,
  label,
  className,
  renderItem,
  onKeyDown,
  registerHandle,
  onBlurLifted,
}: {
  item: T;
  index: number;
  lifted: boolean;
  label: string;
  className?: string;
  renderItem: SortableListProps<T>["renderItem"];
  onKeyDown: (e: React.KeyboardEvent) => void;
  registerHandle: (el: HTMLElement | null) => void;
  onBlurLifted: () => void;
}) {
  const controls = useDragControls();
  const [dragging, setDragging] = React.useState(false);
  const active = dragging || lifted;
  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
      animate={{ scale: active ? 1.02 : 1, boxShadow: active ? "0 18px 40px -12px rgba(0,0,0,.55)" : "0 0 0 rgba(0,0,0,0)" }}
      transition={{ type: "spring", stiffness: 500, damping: 34 }}
      style={{ position: "relative", zIndex: active ? 10 : 0 }}
      className={cn("rounded-xl", active && "ring-2 ring-accent", className)}
    >
      {renderItem(item, {
        index,
        dragging,
        lifted,
        handleProps: {
          ref: registerHandle as React.Ref<HTMLElement>,
          tabIndex: 0,
          role: "button",
          "aria-label": `Reorder ${label}`,
          "aria-pressed": lifted,
          onPointerDown: (e: React.PointerEvent) => {
            e.preventDefault();
            controls.start(e);
          },
          onKeyDown,
          onBlur: onBlurLifted,
          style: { touchAction: "none", cursor: dragging ? "grabbing" : "grab" },
        } as SortableItemState["handleProps"],
      })}
    </Reorder.Item>
  );
}

/** Default grip handle for sortable rows. */
export const SortableHandle = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement> & { "aria-label"?: string }>(({ className, ...props }, ref) => (
  <span
    ref={ref as React.Ref<HTMLSpanElement>}
    className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg text-subtle outline-none transition-colors hover:bg-surface-overlay hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent aria-pressed:bg-accent aria-pressed:text-accent-foreground", className)}
    {...props}
  >
    <GripVerticalIcon size={16} />
  </span>
));
SortableHandle.displayName = "SortableHandle";

/** Drop-in animated presence wrapper for removing items from a SortableList. */
export function SortableEmpty({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-xl border border-dashed border-border-strong p-6 text-center text-sm text-subtle">
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
