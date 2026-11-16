"use client";

import * as React from "react";
import { ScrollArea as ScrollPrimitive } from "radix-ui";
import { cn } from "@kineticui/core";

export type ScrollAreaProps = React.ComponentPropsWithoutRef<typeof ScrollPrimitive.Root> & {
  orientation?: "vertical" | "horizontal" | "both";
  /** Fade the content at edges that can still scroll. */
  fade?: boolean;
  viewportClassName?: string;
  viewportRef?: React.Ref<HTMLDivElement>;
};

/** Custom-styled scroll container: slim pill thumbs that grow on hover, plus optional edge fades. */
export const ScrollArea = React.forwardRef<React.ElementRef<typeof ScrollPrimitive.Root>, ScrollAreaProps>(
  ({ className, viewportClassName, viewportRef, orientation = "vertical", fade = true, type = "hover", children, ...props }, ref) => {
    const inner = React.useRef<HTMLDivElement>(null);
    const [edges, setEdges] = React.useState({ top: false, bottom: false, left: false, right: false });
    React.useImperativeHandle(viewportRef, () => inner.current!);
    const measure = React.useCallback(() => {
      const el = inner.current;
      if (!el) return;
      setEdges({
        top: el.scrollTop > 2,
        bottom: el.scrollTop + el.clientHeight < el.scrollHeight - 2,
        left: el.scrollLeft > 2,
        right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2,
      });
    }, []);
    React.useEffect(() => {
      measure();
      const el = inner.current;
      if (!el) return;
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      if (el.firstElementChild) ro.observe(el.firstElementChild);
      return () => ro.disconnect();
    }, [measure]);
    const v = orientation !== "horizontal";
    const h = orientation !== "vertical";
    const mask = fade
      ? [
          v ? `linear-gradient(to bottom, ${edges.top ? "transparent" : "#000"}, #000 28px, #000 calc(100% - 28px), ${edges.bottom ? "transparent" : "#000"})` : null,
          h ? `linear-gradient(to right, ${edges.left ? "transparent" : "#000"}, #000 28px, #000 calc(100% - 28px), ${edges.right ? "transparent" : "#000"})` : null,
        ].filter(Boolean)
      : [];
    return (
      <ScrollPrimitive.Root ref={ref} type={type} className={cn("relative overflow-hidden", className)} {...props}>
        <ScrollPrimitive.Viewport
          ref={inner}
          onScroll={measure}
          style={mask.length ? { maskImage: mask.join(","), WebkitMaskImage: mask.join(","), maskComposite: "intersect", WebkitMaskComposite: "source-in" } : undefined}
          className={cn("size-full rounded-[inherit] outline-none focus-visible:ring-2 focus-visible:ring-accent", viewportClassName)}
        >
          {children}
        </ScrollPrimitive.Viewport>
        {v ? <ScrollBar orientation="vertical" /> : null}
        {h ? <ScrollBar orientation="horizontal" /> : null}
        <ScrollPrimitive.Corner />
      </ScrollPrimitive.Root>
    );
  },
);
ScrollArea.displayName = "ScrollArea";

export function ScrollBar({ orientation = "vertical", className }: { orientation?: "vertical" | "horizontal"; className?: string }) {
  return (
    <ScrollPrimitive.Scrollbar
      orientation={orientation}
      className={cn(
        "group flex touch-none select-none p-0.5 transition-[width,height,opacity] duration-150 data-[state=hidden]:opacity-0 data-[state=visible]:opacity-100",
        orientation === "vertical" ? "h-full w-2 hover:w-3" : "h-2 flex-col hover:h-3",
        className,
      )}
    >
      <ScrollPrimitive.Thumb className="relative flex-1 rounded-full bg-border-strong transition-colors group-hover:bg-muted active:!bg-accent" />
    </ScrollPrimitive.Scrollbar>
  );
}
