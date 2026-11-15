"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { Avatar, Badge, Button, SearchInput, Textarea, Tooltip, toast } from "@kineticui/ui";
import { BookmarkIcon, EditIcon, MailIcon, StarIcon, TrashIcon, ArrowRightIcon } from "@kineticui/icons";

type Mail = { id: string; from: string; color: string; subject: string; preview: string; body: string; time: string; unread?: boolean; starred?: boolean; label?: string };

const initial: Mail[] = [
  { id: "1", from: "Maya Kapoor", color: "#7C8CFF", subject: "Q4 roadmap review", preview: "Could you take a look before Thursday's sync?", body: "Hi!\n\nI've pulled together the Q4 roadmap. Could you take a look before Thursday's sync? I'm especially keen on your thoughts about the blocks launch and the docs revamp.\n\nThanks,\nMaya", time: "9:41", unread: true, label: "Work" },
  { id: "2", from: "Vercel", color: "#E8E8E3", subject: "Deployment ready", preview: "kinetic-ui is live on production.", body: "Your deployment kinetic-ui has been promoted to production.\n\nBuild time: 41s\nRegion: global", time: "8:12", unread: true },
  { id: "3", from: "Rohan Joshi", color: "#F4A86A", subject: "Lunch?", preview: "New ramen place opened downstairs", body: "New ramen place opened downstairs. 1pm?", time: "Yesterday", starred: true, label: "Personal" },
  { id: "4", from: "Rosa Silva", color: "#F0A3D0", subject: "Chart legend feedback", preview: "This chart needs a legend, and maybe…", body: "This chart needs a legend, and maybe a softer grid. Mockups attached.", time: "Mon" },
  { id: "5", from: "Stripe", color: "#6EE7A0", subject: "Payout of $12,480.00", preview: "Your payout is on the way.", body: "Your payout of $12,480.00 is on the way to •••• 4242.", time: "Sun" },
];

const folders = [
  { id: "inbox", label: "Inbox", icon: <MailIcon />, count: 2 },
  { id: "starred", label: "Starred", icon: <StarIcon /> },
  { id: "saved", label: "Saved", icon: <BookmarkIcon /> },
  { id: "trash", label: "Trash", icon: <TrashIcon /> },
];

/** Three-pane email client: folders, message list with unread/starred states, and a reading pane with reply. */
export function InboxScreen() {
  const [mails, setMails] = React.useState(initial);
  const [sel, setSel] = React.useState("1");
  const [folder, setFolder] = React.useState("inbox");
  const [q, setQ] = React.useState("");
  const list = mails.filter((m) => (folder === "starred" ? m.starred : true) && (!q || (m.from + m.subject).toLowerCase().includes(q.toLowerCase())));
  const mail = mails.find((m) => m.id === sel);

  const open = (id: string) => {
    setSel(id);
    setMails((ms) => ms.map((m) => (m.id === id ? { ...m, unread: false } : m)));
  };

  return (
    <div className="flex h-[760px] bg-background text-sm">
      <aside className="hidden w-52 shrink-0 flex-col gap-1 border-r border-border p-3 lg:flex">
        <Button className="mb-3 justify-start" onClick={() => toast("Compose")}>
          <EditIcon size={15} /> Compose
        </Button>
        {folders.map((f) => (
          <button key={f.id} type="button" onClick={() => setFolder(f.id)} className={cn("flex h-9 items-center gap-2.5 rounded-lg px-3 [&_svg]:size-4", folder === f.id ? "bg-surface-raised font-medium text-foreground" : "text-muted hover:text-foreground")}>
            {f.icon}
            <span className="flex-1 text-left">{f.label}</span>
            {f.count ? <span className="font-mono text-xs text-accent">{mails.filter((m) => m.unread).length}</span> : null}
          </button>
        ))}
      </aside>
      <div className="flex w-full flex-col border-r border-border md:w-80 md:shrink-0">
        <div className="border-b border-border p-3">
          <SearchInput value={q} onValueChange={setQ} placeholder="Search mail" shortcut={null} />
        </div>
        <ul className="flex-1 overflow-y-auto">
          <AnimatePresence initial={false}>
            {list.map((m) => (
              <motion.li layout key={m.id} exit={{ opacity: 0, x: -40, height: 0 }}>
                <button type="button" onClick={() => open(m.id)} className={cn("flex w-full gap-3 border-b border-border/60 p-3 text-left transition-colors", sel === m.id ? "bg-accent-soft/40" : "hover:bg-surface")}>
                  <span className={cn("mt-2 size-2 shrink-0 rounded-full", m.unread ? "bg-accent" : "bg-transparent")} />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex items-center gap-2">
                      <span className={cn("flex-1 truncate", m.unread && "font-semibold")}>{m.from}</span>
                      <span className="text-xs text-subtle">{m.time}</span>
                    </span>
                    <span className={cn("truncate", m.unread ? "text-foreground" : "text-muted")}>{m.subject}</span>
                    <span className="truncate text-xs text-subtle">{m.preview}</span>
                  </span>
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
      <article className="hidden min-w-0 flex-1 flex-col md:flex">
        {mail ? (
          <>
            <header className="flex items-center gap-1 border-b border-border p-3">
              <Tooltip content="Star">
                <Button variant="ghost" size="icon-sm" aria-label="Star" onClick={() => setMails((ms) => ms.map((m) => (m.id === mail.id ? { ...m, starred: !m.starred } : m)))}>
                  <StarIcon size={16} className={mail.starred ? "fill-[#F5C451] text-[#F5C451]" : ""} />
                </Button>
              </Tooltip>
              <Tooltip content="Delete">
                <Button variant="ghost" size="icon-sm" aria-label="Delete" onClick={() => { setMails((ms) => ms.filter((m) => m.id !== mail.id)); setSel(list.find((m) => m.id !== mail.id)?.id ?? ""); }}>
                  <TrashIcon size={16} />
                </Button>
              </Tooltip>
              {mail.label ? <Badge size="sm" className="ml-2">{mail.label}</Badge> : null}
              <span className="ml-auto text-xs text-subtle">{mail.time}</span>
            </header>
            <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-6">
              <h2 className="font-display text-2xl font-semibold tracking-tight">{mail.subject}</h2>
              <div className="flex items-center gap-3">
                <Avatar alt={mail.from} color={mail.color} size="sm" />
                <div className="flex flex-col">
                  <span className="font-medium">{mail.from}</span>
                  <span className="text-xs text-subtle">to me</span>
                </div>
              </div>
              <p className="whitespace-pre-line leading-relaxed text-foreground/90">{mail.body}</p>
            </div>
            <form className="flex flex-col gap-2 border-t border-border p-4" onSubmit={(e) => { e.preventDefault(); toast({ title: "Reply sent", tone: "success" }); (e.currentTarget.elements[0] as HTMLTextAreaElement).value = ""; }}>
              <Textarea rows={3} placeholder={`Reply to ${mail.from}…`} aria-label="Reply" />
              <Button type="submit" size="sm" className="self-end">Send <ArrowRightIcon size={14} /></Button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-subtle">Select a message</div>
        )}
      </article>
    </div>
  );
}
