"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { BellIcon } from "@kineticui/icons";

export type AppNotification = {
  id: string;
  title: React.ReactNode;
  body?: React.ReactNode;
  time: string;
  read?: boolean;
  /** Avatar, icon or initials. */
  icon?: React.ReactNode;
  /** Buttons such as Accept / Decline. */
  actions?: React.ReactNode;
  category?: string;
};

export type NotificationCenterProps = {
  notifications: AppNotification[];
  onChange: (notifications: AppNotification[]) => void;
  onOpenSettings?: () => void;
  className?: string;
};

/** Bell with unread badge that opens an inbox: All / Unread tabs, mark-all-read, dismiss. */
export function NotificationCenter({ notifications, onChange, onOpenSettings, className }: NotificationCenterProps) {
  const [tab, setTab] = React.useState<"all" | "unread">("all");
  const unread = notifications.filter((n) => !n.read).length;
  const list = tab === "unread" ? notifications.filter((n) => !n.read) : notifications;
  const id = React.useId();

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        className={cn("relative flex size-10 items-center justify-center rounded-xl text-muted outline-none hover:bg-surface-raised hover:text-foreground focus-visible:ring-2 focus-visible:ring-foreground data-[state=open]:bg-surface-raised data-[state=open]:text-foreground", className)}
      >
        <BellIcon size={19} className={unread ? "origin-top animate-[kn-bell_2.4s_ease-in-out_infinite]" : undefined} />
        <AnimatePresence>
          {unread ? (
            <motion.span
              key={unread}
              initial={{ scale: 0.4 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-mono text-[9px] font-bold text-accent-foreground ring-2 ring-background"
            >
              {unread > 9 ? "9+" : unread}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content align="end" sideOffset={8} className="z-50 w-[min(380px,calc(100vw-1rem))] overflow-hidden rounded-2xl border border-border-strong bg-surface-raised shadow-overlay data-[state=open]:animate-[kn-pop_0.16s_var(--ease-kn-out)]">
          <div className="flex items-center gap-1 border-b border-border px-3 pt-3">
            {(["all", "unread"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)} className={cn("relative px-2.5 pb-2.5 text-sm capitalize", tab === t ? "text-foreground" : "text-subtle hover:text-foreground")}>
                {t}
                {t === "unread" && unread ? <span className="ml-1.5 rounded-full bg-surface-overlay px-1.5 font-mono text-[10px]">{unread}</span> : null}
                {tab === t ? <motion.span layoutId={`kn-notif-${id}`} className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-accent" /> : null}
              </button>
            ))}
            <button type="button" disabled={!unread} onClick={() => onChange(notifications.map((n) => ({ ...n, read: true })))} className="ml-auto pb-2.5 text-xs text-accent disabled:text-subtle">
              Mark all read
            </button>
          </div>
          <ul className="max-h-[400px] overflow-y-auto">
            <AnimatePresence initial={false}>
              {list.length ? (
                list.map((n) => (
                  <motion.li
                    layout
                    key={n.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className={cn("group relative flex gap-3 border-b border-border/60 px-4 py-3 last:border-0", !n.read && "bg-accent-soft/25")}
                    onClick={() => !n.read && onChange(notifications.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
                  >
                    {n.icon ? <span className="shrink-0">{n.icon}</span> : null}
                    <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
                      <div className="leading-snug text-foreground">{n.title}</div>
                      {n.body ? <div className="text-xs text-muted">{n.body}</div> : null}
                      <div className="flex items-center gap-2 text-[11px] text-subtle">
                        {n.time}
                        {n.category ? <span>· {n.category}</span> : null}
                      </div>
                      {n.actions ? <div className="mt-1 flex gap-2">{n.actions}</div> : null}
                    </div>
                    {!n.read ? <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" aria-label="Unread" /> : null}
                    <button
                      type="button"
                      aria-label="Dismiss"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange(notifications.filter((x) => x.id !== n.id));
                      }}
                      className="absolute right-2 top-2 hidden size-6 items-center justify-center rounded-md text-subtle hover:bg-surface-overlay hover:text-foreground group-hover:flex"
                    >
                      ✕
                    </button>
                  </motion.li>
                ))
              ) : (
                <li className="flex flex-col items-center gap-2 px-4 py-12 text-center">
                  <BellIcon size={22} className="text-subtle" />
                  <span className="text-sm font-medium">You&apos;re all caught up</span>
                  <span className="text-xs text-subtle">New notifications will show up here.</span>
                </li>
              )}
            </AnimatePresence>
          </ul>
          {onOpenSettings ? (
            <button type="button" onClick={onOpenSettings} className="w-full border-t border-border py-2.5 text-xs text-muted hover:bg-surface-overlay hover:text-foreground">
              Notification settings
            </button>
          ) : null}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
