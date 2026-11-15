"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { AvatarUploader, Badge, Button, ConfirmDialog, Field, Input, Select, Switch, Textarea, ThemeSwitch, toast } from "@kineticui/ui";
import { BellIcon, CardIcon, LockIcon, SettingsIcon, UserIcon } from "@kineticui/icons";

const sections = [
  { id: "profile", label: "Profile", icon: <UserIcon /> },
  { id: "account", label: "Account", icon: <SettingsIcon /> },
  { id: "notifications", label: "Notifications", icon: <BellIcon /> },
  { id: "billing", label: "Billing", icon: <CardIcon /> },
  { id: "security", label: "Security", icon: <LockIcon /> },
];

function Row({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-border py-5 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{title}</span>
        {description ? <span className="text-sm text-muted">{description}</span> : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/** Settings screen with section nav, profile form, toggles, billing and a danger zone, plus an unsaved-changes bar. */
export function SettingsPage() {
  const [section, setSection] = React.useState("profile");
  const [dirty, setDirty] = React.useState(false);
  const [name, setName] = React.useState("Maya Kapoor");
  const touch = () => setDirty(true);

  return (
    <div className="mx-auto flex min-h-[760px] max-w-5xl flex-col gap-8 p-6 md:flex-row md:p-10">
      <nav aria-label="Settings" className="flex shrink-0 gap-1 overflow-x-auto md:w-52 md:flex-col">
        <h1 className="mb-3 hidden px-3 font-display text-2xl font-semibold tracking-tight md:block">Settings</h1>
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-current={section === s.id ? "page" : undefined}
            onClick={() => setSection(s.id)}
            className={cn(
              "flex h-10 shrink-0 items-center gap-2.5 rounded-xl px-3 text-sm transition-colors [&_svg]:size-4",
              section === s.id ? "bg-surface-raised font-medium text-foreground [&_svg]:text-accent" : "text-muted hover:text-foreground",
            )}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </nav>
      <div className="relative min-w-0 flex-1">
        <AnimatePresence mode="wait">
          <motion.section key={section} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="flex flex-col">
            <h2 className="font-display text-xl font-semibold tracking-tight">{sections.find((s) => s.id === section)?.label}</h2>
            {section === "profile" ? (
              <div className="mt-4 flex flex-col gap-5">
                <AvatarUploader onUpload={(f, p) => new Promise<void>((r) => { let x = 0; const t = setInterval(() => { x += 0.25; p(Math.min(1, x)); if (x >= 1) { clearInterval(t); touch(); r(); } }, 150); })} onRemove={touch} size={72} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" htmlFor="kn-set-name">
                    <Input id="kn-set-name" value={name} onChange={(e) => { setName(e.target.value); touch(); }} />
                  </Field>
                  <Field label="Username" htmlFor="kn-set-user">
                    <Input id="kn-set-user" defaultValue="maya" leading={<span className="text-subtle">@</span>} onChange={touch} />
                  </Field>
                </div>
                <Field label="Bio" hint="Shown on your public profile." htmlFor="kn-set-bio">
                  <Textarea id="kn-set-bio" rows={3} maxLength={160} showCount defaultValue="Design lead. Calm interfaces for loud products." onChange={touch} />
                </Field>
              </div>
            ) : section === "account" ? (
              <div className="mt-2">
                <Row title="Theme" description="Match your system or pick one.">
                  <ThemeSwitch variant="segmented" />
                </Row>
                <Row title="Language">
                  <Select className="w-44" defaultValue="en" onValueChange={touch} options={[{ value: "en", label: "English" }, { value: "hi", label: "Hindi" }, { value: "es", label: "Spanish" }, { value: "de", label: "German" }]} />
                </Row>
                <Row title="Timezone">
                  <Select className="w-44" defaultValue="ist" onValueChange={touch} options={[{ value: "ist", label: "Asia/Kolkata" }, { value: "utc", label: "UTC" }, { value: "pst", label: "America/Los_Angeles" }]} />
                </Row>
              </div>
            ) : section === "notifications" ? (
              <div className="mt-2">
                <Row title="Mentions" description="When someone @mentions you.">
                  <Switch defaultChecked onCheckedChange={touch} aria-label="Mentions" />
                </Row>
                <Row title="Weekly digest" description="A summary every Monday.">
                  <Switch defaultChecked onCheckedChange={touch} aria-label="Weekly digest" />
                </Row>
                <Row title="Product updates" description="New features and tips.">
                  <Switch onCheckedChange={touch} aria-label="Product updates" />
                </Row>
              </div>
            ) : section === "billing" ? (
              <div className="mt-4 flex flex-col gap-4">
                <div className="flex items-center gap-4 rounded-2xl border border-accent/40 bg-accent-soft/40 p-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-semibold">
                      Pro plan <Badge variant="solid" size="sm">Current</Badge>
                    </div>
                    <div className="text-sm text-muted">$24 per seat / month · renews Dec 1</div>
                  </div>
                  <Button variant="secondary" size="sm">Change plan</Button>
                </div>
                <Row title="Payment method" description="Visa ending 4242 · expires 08/28">
                  <Button variant="outline" size="sm">Update</Button>
                </Row>
                <Row title="Invoices" description="Download past invoices as PDF.">
                  <Button variant="ghost" size="sm">View all</Button>
                </Row>
              </div>
            ) : (
              <div className="mt-2">
                <Row title="Two-factor authentication" description="Use an authenticator app for sign-in.">
                  <Switch defaultChecked aria-label="Two-factor" onCheckedChange={touch} />
                </Row>
                <Row title="Active sessions" description="MacBook Pro · Bengaluru · now">
                  <Button variant="outline" size="sm" onClick={() => toast("Signed out of other sessions")}>Sign out others</Button>
                </Row>
                <div className="mt-6 rounded-2xl border border-danger/40 p-5">
                  <div className="font-semibold text-danger">Danger zone</div>
                  <p className="mt-1 text-sm text-muted">Deleting your account removes all workspaces you own. This can&apos;t be undone.</p>
                  <ConfirmDialog
                    tone="destructive"
                    trigger={<Button variant="destructive" size="sm" className="mt-4">Delete account</Button>}
                    title="Delete your account?"
                    description="All data will be permanently removed."
                    confirmText="delete"
                    confirmLabel="Delete account"
                    onConfirm={() => void toast("Account deleted")}
                  />
                </div>
              </div>
            )}
          </motion.section>
        </AnimatePresence>
        <AnimatePresence>
          {dirty ? (
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="sticky bottom-4 mt-8 flex items-center gap-3 rounded-2xl border border-border-strong bg-surface-overlay p-3 pl-5 shadow-overlay"
            >
              <span className="flex-1 text-sm">You have unsaved changes</span>
              <Button variant="ghost" size="sm" onClick={() => setDirty(false)}>Discard</Button>
              <Button size="sm" onClick={() => { setDirty(false); toast({ title: "Settings saved", tone: "success" }); }}>Save changes</Button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
