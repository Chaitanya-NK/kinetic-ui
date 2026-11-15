"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Badge, Button, CopyButton, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Input, toast } from "@kineticui/ui";
import { AlertTriangleIcon, EyeIcon, EyeOffIcon, KeyIcon, PlusIcon, TrashIcon } from "@kineticui/icons";

type Key = { id: string; name: string; prefix: string; scopes: string[]; created: string; used: string; env: "live" | "test" };
const seedKeys: Key[] = [
  { id: "1", name: "Production server", prefix: "kn_live_7Hq2", scopes: ["read", "write"], created: "Sep 2, 2026", used: "2 min ago", env: "live" },
  { id: "2", name: "CI pipeline", prefix: "kn_test_aP9x", scopes: ["read"], created: "Oct 11, 2026", used: "1 hour ago", env: "test" },
  { id: "3", name: "Analytics export", prefix: "kn_live_Zm4c", scopes: ["read"], created: "Nov 1, 2026", used: "Never", env: "live" },
];
const allScopes = ["read", "write", "admin"];
const randomKey = (env: string) => `kn_${env}_${Array.from(crypto.getRandomValues(new Uint8Array(24)), (b) => "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 56]).join("")}`;

/** API keys manager: list with masked keys, create dialog with scopes and environment, one-time reveal, and revoke. */
export function ApiKeys() {
  const [keys, setKeys] = React.useState(seedKeys);
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [env, setEnv] = React.useState<"live" | "test">("test");
  const [scopes, setScopes] = React.useState<string[]>(["read"]);
  const [created, setCreated] = React.useState<string | null>(null);
  const [shown, setShown] = React.useState(false);
  const [confirm, setConfirm] = React.useState<string | null>(null);

  const create = () => {
    const k = randomKey(env);
    setKeys((ks) => [{ id: String(Date.now()), name: name || "Untitled key", prefix: k.slice(0, 12), scopes, created: "Today", used: "Never", env }, ...ks]);
    setCreated(k);
    setShown(false);
  };
  const close = () => { setOpen(false); setTimeout(() => { setCreated(null); setName(""); setScopes(["read"]); }, 200); };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="font-display text-2xl font-semibold">API keys</h1><p className="text-sm text-muted">Keys grant access to your workspace. Keep them secret.</p></div>
        <Button onClick={() => setOpen(true)}><PlusIcon size={15} /> Create key</Button>
      </div>
      <ul className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {keys.map((k) => (
            <motion.li key={k.id} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-surface p-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-surface-raised text-muted"><KeyIcon size={17} /></span>
              <div className="flex min-w-48 flex-1 flex-col gap-1">
                <div className="flex items-center gap-2 font-medium">{k.name}<Badge size="sm" variant={k.env === "live" ? "success" : "warning"}>{k.env}</Badge></div>
                <span className="font-mono text-xs text-subtle">{k.prefix}••••••••••••</span>
              </div>
              <div className="flex gap-1">{k.scopes.map((s) => <Badge key={s} size="sm">{s}</Badge>)}</div>
              <div className="flex w-32 flex-col text-xs text-subtle"><span>Created {k.created}</span><span>Used {k.used}</span></div>
              <AnimatePresence mode="wait" initial={false}>
                {confirm === k.id ? (
                  <motion.div key="c" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setConfirm(null)}>Cancel</Button>
                    <Button size="sm" variant="destructive" onClick={() => { setKeys((ks) => ks.filter((x) => x.id !== k.id)); setConfirm(null); toast.success(`Revoked ${k.name}`); }}>Revoke</Button>
                  </motion.div>
                ) : (
                  <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Button size="icon-sm" variant="ghost" aria-label={`Revoke ${k.name}`} onClick={() => setConfirm(k.id)}><TrashIcon size={15} /></Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{created ? "Save your key" : "Create API key"}</DialogTitle>
            <DialogDescription>{created ? "This is the only time you'll see the full key." : "Choose a name, environment and permissions."}</DialogDescription>
          </DialogHeader>
          {created ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-2 pl-3">
                <code className="flex-1 truncate font-mono text-xs">{shown ? created : `${created.slice(0, 12)}${"•".repeat(24)}`}</code>
                <Button size="icon-sm" variant="ghost" aria-label={shown ? "Hide key" : "Show key"} onClick={() => setShown(!shown)}>{shown ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}</Button>
                <CopyButton value={created} />
              </div>
              <div className="flex gap-2 rounded-xl bg-warning-soft p-3 text-xs text-warning"><AlertTriangleIcon size={14} className="shrink-0" /> Store it in a secret manager. If you lose it, create a new key.</div>
              <Button onClick={close}>Done</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Production server" aria-label="Key name" autoFocus />
              <div className="grid grid-cols-2 gap-2">
                {(["test", "live"] as const).map((e) => (
                  <button key={e} type="button" onClick={() => setEnv(e)} className={`rounded-xl border p-3 text-left text-sm ${env === e ? "border-accent bg-accent-soft/40" : "border-border"}`}>
                    <div className="font-medium capitalize">{e}</div><div className="text-xs text-subtle">{e === "test" ? "Sandbox data only" : "Real customer data"}</div>
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs text-subtle">Permissions</span>
                <div className="flex gap-2">
                  {allScopes.map((s) => <button key={s} type="button" aria-pressed={scopes.includes(s)} onClick={() => setScopes((x) => (x.includes(s) ? x.filter((y) => y !== s) : [...x, s]))} className={`h-8 rounded-full border px-3 text-sm ${scopes.includes(s) ? "border-accent bg-accent text-accent-foreground" : "border-border"}`}>{s}</button>)}
                </div>
              </div>
              <Button onClick={create} disabled={!scopes.length}>Create key</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
