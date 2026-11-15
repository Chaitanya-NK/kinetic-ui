"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Avatar, Badge, BulkActionBar, Button, Checkbox, SearchInput, Select, toast } from "@kineticui/ui";
import { DownloadIcon, MailIcon, TrashIcon, UserPlusIcon, UserXIcon } from "@kineticui/icons";

type User = { id: string; name: string; email: string; role: "Owner" | "Admin" | "Member" | "Viewer"; status: "Active" | "Invited" | "Suspended"; last: string; color: string };
const seed: User[] = [
  { id: "1", name: "Maya Kapoor", email: "maya@kinetic.dev", role: "Owner", status: "Active", last: "now", color: "#C6F432" },
  { id: "2", name: "Lena Ortiz", email: "lena@kinetic.dev", role: "Admin", status: "Active", last: "2h ago", color: "#f9a8d4" },
  { id: "3", name: "Arjun Mehta", email: "arjun@kinetic.dev", role: "Member", status: "Active", last: "5h ago", color: "#7dd3fc" },
  { id: "4", name: "Sam Okafor", email: "sam@kinetic.dev", role: "Member", status: "Active", last: "Yesterday", color: "#fcd34d" },
  { id: "5", name: "Noor Haddad", email: "noor@kinetic.dev", role: "Viewer", status: "Invited", last: "—", color: "#a78bfa" },
  { id: "6", name: "Kenji Sato", email: "kenji@kinetic.dev", role: "Member", status: "Suspended", last: "3 weeks ago", color: "#34d399" },
  { id: "7", name: "Ines Moreau", email: "ines@kinetic.dev", role: "Admin", status: "Active", last: "10m ago", color: "#fb923c" },
];
const statusVariant = { Active: "success", Invited: "info", Suspended: "danger" } as const;

/** User management table: search, role/status filters, inline role change, row selection with a bulk action bar. */
export function AdminUsers() {
  const [users, setUsers] = React.useState(seed);
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [sel, setSel] = React.useState<Set<string>>(new Set());
  const list = users.filter((u) => (status === "all" || u.status === status) && `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()));
  const allSel = list.length > 0 && list.every((u) => sel.has(u.id));
  const toggle = (id: string) => setSel((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  return (
    <div className="relative mx-auto flex min-h-[640px] max-w-6xl flex-col gap-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="font-display text-2xl font-semibold">Users</h1><p className="text-sm text-muted">{users.length} people in your workspace</p></div>
        <Button><UserPlusIcon size={15} /> Invite user</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <SearchInput value={q} onValueChange={setQ} placeholder="Search by name or email" className="w-full sm:w-72" />
        <Select aria-label="Status" value={status} onValueChange={setStatus} className="w-40" options={[{ value: "all", label: "All statuses" }, { value: "Active", label: "Active" }, { value: "Invited", label: "Invited" }, { value: "Suspended", label: "Suspended" }]} />
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-surface text-left text-xs text-subtle">
            <tr>
              <th className="w-10 p-3"><Checkbox aria-label="Select all" checked={allSel} onCheckedChange={() => setSel(allSel ? new Set() : new Set(list.map((u) => u.id)))} /></th>
              <th className="p-3 font-medium">User</th><th className="p-3 font-medium">Role</th><th className="p-3 font-medium">Status</th><th className="p-3 font-medium">Last active</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {list.map((u) => (
                <motion.tr key={u.id} layout exit={{ opacity: 0, x: 30 }} className={`border-t border-border transition-colors ${sel.has(u.id) ? "bg-accent-soft/30" : "hover:bg-surface"}`}>
                  <td className="p-3"><Checkbox aria-label={`Select ${u.name}`} checked={sel.has(u.id)} onCheckedChange={() => toggle(u.id)} /></td>
                  <td className="p-3"><div className="flex items-center gap-3"><Avatar alt={u.name} color={u.color} size="sm" /><div><div className="font-medium">{u.name}</div><div className="text-xs text-subtle">{u.email}</div></div></div></td>
                  <td className="p-3">
                    {u.role === "Owner" ? <Badge variant="solid" size="sm">Owner</Badge> : (
                      <select aria-label={`Role for ${u.name}`} value={u.role} onChange={(e) => { setUsers((us) => us.map((x) => (x.id === u.id ? { ...x, role: e.target.value as User["role"] } : x))); toast.success(`${u.name.split(" ")[0]} is now ${e.target.value}`); }} className="h-8 rounded-lg border border-border bg-background px-2 text-sm outline-none focus:border-accent">
                        {["Admin", "Member", "Viewer"].map((r) => <option key={r}>{r}</option>)}
                      </select>
                    )}
                  </td>
                  <td className="p-3"><Badge variant={statusVariant[u.status]} size="sm" dot>{u.status}</Badge></td>
                  <td className="p-3 text-muted">{u.last}</td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {!list.length ? <p className="p-10 text-center text-sm text-subtle">No users match.</p> : null}
      </div>
      <BulkActionBar
        fixed={false}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
        count={sel.size}
        total={list.length}
        noun={["user", "users"]}
        onSelectAll={() => setSel(new Set(list.map((u) => u.id)))}
        onClear={() => setSel(new Set())}
        actions={[
          { id: "mail", label: "Email", icon: <MailIcon />, onClick: () => toast.info(`Composing to ${sel.size}`) },
          { id: "export", label: "Export", icon: <DownloadIcon />, onClick: () => toast.success("CSV exported") },
          { id: "suspend", label: "Suspend", icon: <UserXIcon />, onClick: () => { setUsers((us) => us.map((u) => (sel.has(u.id) && u.role !== "Owner" ? { ...u, status: "Suspended" } : u))); setSel(new Set()); } },
          { id: "remove", label: "Remove", icon: <TrashIcon />, destructive: true, onClick: () => { setUsers((us) => us.filter((u) => !sel.has(u.id) || u.role === "Owner")); toast.error(`Removed ${sel.size} users`); setSel(new Set()); } },
        ]}
      />
    </div>
  );
}
