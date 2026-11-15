"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Avatar, Button, CopyButton, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, Input, Select, toast } from "@kineticui/ui";
import { LinkIcon, MailIcon, UsersIcon } from "@kineticui/icons";

type Member = { email: string; name?: string; role: string; pending?: boolean };
const roles = [
  { value: "admin", label: "Admin", description: "Full access, billing and members" },
  { value: "editor", label: "Editor", description: "Create and edit everything" },
  { value: "viewer", label: "Viewer", description: "View and comment" },
];

/** Team invite panel: email + role, member list with role changes, and a shareable link. Opens in a dialog. */
export function InviteTeam({ inviteLink = "https://kinetic.app/join/acme-8f2a" }: { inviteLink?: string }) {
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState("editor");
  const [members, setMembers] = React.useState<Member[]>([
    { email: "maya@acme.io", name: "Maya Kapoor", role: "admin" },
    { email: "rohan@acme.io", name: "Rohan Joshi", role: "editor" },
    { email: "rosa@acme.io", role: "viewer", pending: true },
  ]);
  const valid = /^\S+@\S+\.\S+$/.test(email);

  const invite = () => {
    if (!valid) return;
    setMembers((m) => [{ email, role, pending: true }, ...m]);
    setEmail("");
    toast({ title: `Invite sent to ${email}`, tone: "success" });
  };

  const panel = (
    <div className="flex flex-col gap-5">
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          invite();
        }}
      >
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" leading={<MailIcon size={15} />} wrapperClassName="flex-1" aria-label="Email" />
        <Select className="sm:w-32" value={role} onValueChange={setRole} options={roles} />
        <Button type="submit" disabled={!valid}>Invite</Button>
      </form>
      <div className="flex flex-col">
        <span className="mb-2 font-mono text-[10px] uppercase tracking-wider text-subtle">{members.length} members</span>
        <ul className="flex flex-col">
          <AnimatePresence initial={false}>
            {members.map((m) => (
              <motion.li layout key={m.email} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-3 border-b border-border/60 py-2.5 last:border-0">
                <Avatar alt={m.name ?? m.email} size="sm" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">{m.name ?? m.email}</span>
                  <span className="truncate text-xs text-subtle">{m.pending ? "Invite pending" : m.email}</span>
                </div>
                <Select className="h-8 w-28 text-xs" value={m.role} onValueChange={(r) => setMembers((ms) => ms.map((x) => (x.email === m.email ? { ...x, role: r } : x)))} options={roles} />
                <button type="button" aria-label={`Remove ${m.email}`} onClick={() => setMembers((ms) => ms.filter((x) => x.email !== m.email))} className="px-1 text-subtle hover:text-danger">
                  ✕
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-1.5 pl-3">
        <LinkIcon size={14} className="shrink-0 text-subtle" />
        <span className="flex-1 truncate font-mono text-xs text-muted">{inviteLink}</span>
        <CopyButton value={inviteLink} label="Copy link" />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-[600px] flex-col items-center justify-center gap-6 p-6">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-surface p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <UsersIcon size={18} />
          </span>
          <div>
            <h2 className="font-semibold">Invite your team</h2>
            <p className="text-sm text-muted">Collaborate on projects in Acme.</p>
          </div>
        </div>
        {panel}
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary">Open as dialog</Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Invite your team</DialogTitle>
            <DialogDescription>Collaborate on projects in Acme.</DialogDescription>
          </DialogHeader>
          {panel}
        </DialogContent>
      </Dialog>
    </div>
  );
}
