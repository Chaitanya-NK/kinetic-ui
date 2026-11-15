"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Badge, Button, toast } from "@kineticui/ui";
import { CheckIcon, LockIcon, MinusIcon } from "@kineticui/icons";

const roles = ["Owner", "Admin", "Editor", "Viewer"] as const;
type Role = (typeof roles)[number];
const groups: { group: string; perms: { id: string; label: string }[] }[] = [
  { group: "Projects", perms: [{ id: "p.view", label: "View projects" }, { id: "p.edit", label: "Edit projects" }, { id: "p.delete", label: "Delete projects" }] },
  { group: "Team", perms: [{ id: "t.invite", label: "Invite members" }, { id: "t.roles", label: "Change roles" }] },
  { group: "Billing", perms: [{ id: "b.view", label: "View invoices" }, { id: "b.manage", label: "Manage plan" }] },
  { group: "Developers", perms: [{ id: "d.keys", label: "Create API keys" }, { id: "d.hooks", label: "Manage webhooks" }] },
];
const initial: Record<Role, string[]> = {
  Owner: groups.flatMap((g) => g.perms.map((p) => p.id)),
  Admin: ["p.view", "p.edit", "p.delete", "t.invite", "t.roles", "b.view", "d.keys", "d.hooks"],
  Editor: ["p.view", "p.edit", "t.invite"],
  Viewer: ["p.view"],
};

/** Roles & permissions matrix: toggle cells per role, owner locked, changes tracked with a save bar. */
export function TeamRoles() {
  const [perms, setPerms] = React.useState(initial);
  const [saved, setSaved] = React.useState(initial);
  const dirty = roles.some((r) => perms[r].slice().sort().join() !== saved[r].slice().sort().join());
  const changed = (r: Role, id: string) => perms[r].includes(id) !== saved[r].includes(id);
  const toggle = (r: Role, id: string) => setPerms((p) => ({ ...p, [r]: p[r].includes(id) ? p[r].filter((x) => x !== id) : [...p[r], id] }));

  return (
    <div className="relative mx-auto flex min-h-[640px] max-w-5xl flex-col gap-6 p-6 pb-24">
      <div><h1 className="font-display text-2xl font-semibold">Roles & permissions</h1><p className="text-sm text-muted">Control what each role can do in this workspace.</p></div>
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="bg-surface">
              <th className="p-4 text-left font-medium text-subtle">Permission</th>
              {roles.map((r) => <th key={r} className="w-28 p-4 text-center font-semibold">{r}<div className="mt-0.5 text-[10px] font-normal text-subtle">{perms[r].length} perms</div></th>)}
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <React.Fragment key={g.group}>
                <tr><td colSpan={5} className="border-t border-border bg-surface/50 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-subtle">{g.group}</td></tr>
                {g.perms.map((p) => (
                  <tr key={p.id} className="border-t border-border hover:bg-surface/40">
                    <td className="px-4 py-3">{p.label}</td>
                    {roles.map((r) => {
                      const on = perms[r].includes(p.id);
                      const locked = r === "Owner";
                      return (
                        <td key={r} className="text-center">
                          <motion.button
                            type="button"
                            whileTap={locked ? undefined : { scale: 0.8 }}
                            disabled={locked}
                            role="checkbox"
                            aria-checked={on}
                            aria-label={`${r}: ${p.label}`}
                            onClick={() => toggle(r, p.id)}
                            className={`relative mx-auto flex size-7 items-center justify-center rounded-lg border transition-colors ${on ? "border-accent bg-accent text-accent-foreground" : "border-border-strong text-subtle hover:border-muted"} ${locked ? "cursor-not-allowed opacity-60" : ""} ${changed(r, p.id) ? "ring-2 ring-warning ring-offset-2 ring-offset-background" : ""}`}
                          >
                            {locked ? <LockIcon size={12} /> : on ? <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}><CheckIcon size={14} strokeWidth={3} /></motion.span> : <MinusIcon size={12} />}
                          </motion.button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <motion.div initial={false} animate={{ y: dirty ? 0 : 100, opacity: dirty ? 1 : 0 }} className="absolute inset-x-6 bottom-6 flex items-center justify-between gap-3 rounded-2xl border border-border-strong bg-surface-overlay p-3 pl-5 shadow-overlay">
        <span className="flex items-center gap-2 text-sm"><Badge variant="warning" size="sm" dot>Unsaved</Badge> You have unsaved permission changes.</span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setPerms(saved)}>Discard</Button>
          <Button size="sm" onClick={() => { setSaved(perms); toast.success("Permissions saved"); }}>Save changes</Button>
        </div>
      </motion.div>
    </div>
  );
}
