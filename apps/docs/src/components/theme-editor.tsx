"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  contrast,
  createTheme,
  themePresets,
  themeToCss,
  themeToStyle,
  type ThemePreset,
  type ThemeSeed,
  type ThemeTokenName,
  type ThemeTokens,
} from "@kineticui/core";
import {
  AvatarStack,
  Badge,
  BarChart,
  Button,
  Checkbox,
  CodeBlock,
  CopyButton,
  Input,
  Progress,
  SegmentedControl,
  StatCard,
  Switch,
  toast,
} from "@kineticui/ui";
import { CheckIcon, DownloadIcon, LinkIcon, RotateCcwIcon, SparkleIcon } from "@kineticui/icons";

const defaults: Record<"default-dark" | "default-light", { label: string; seed: ThemeSeed }> = {
  "default-dark": { label: "Kinetic Dark", seed: { mode: "dark", background: "#0a0a0b", foreground: "#f4f4f5", accent: "#c6f432" } },
  "default-light": { label: "Kinetic Light", seed: { mode: "light", background: "#fafaf9", foreground: "#18181b", accent: "#4d7c0f" } },
};
type PresetId = keyof typeof defaults | ThemePreset;
const allPresets: { id: PresetId; label: string; seed: ThemeSeed }[] = [
  ...Object.entries(defaults).map(([id, v]) => ({ id: id as PresetId, ...v })),
  ...Object.entries(themePresets).map(([id, v]) => ({ id: id as PresetId, label: v.label, seed: v.seed })),
];
const isHex = (v: string) => /^#[0-9a-f]{6}$/i.test(v);
const groups: { label: string; keys: ThemeTokenName[] }[] = [
  { label: "Surfaces", keys: ["background", "surface", "surface-raised", "surface-overlay", "border", "border-strong"] },
  { label: "Text", keys: ["foreground", "muted", "subtle"] },
  { label: "Accent", keys: ["accent", "accent-foreground", "accent-soft", "accent-soft-foreground"] },
  { label: "Status", keys: ["success", "success-soft", "warning", "warning-soft", "danger", "danger-soft", "info", "info-soft"] },
];

type State = { preset: PresetId | "custom"; seed: ThemeSeed; overrides: Partial<ThemeTokens> };
const encode = (s: State) => btoa(JSON.stringify(s));
const decode = (h: string): State | null => {
  try {
    const s = JSON.parse(atob(h)) as State;
    return s.seed && isHex(s.seed.background) ? s : null;
  } catch {
    return null;
  }
};

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [text, setText] = React.useState(value);
  React.useEffect(() => setText(value), [value]);
  return (
    <label className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2">
      <span className="relative size-7 shrink-0 overflow-hidden rounded-lg ring-1 ring-border-strong" style={{ background: value }}>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} aria-label={`${label} colour`} className="absolute inset-0 cursor-pointer opacity-0" />
      </span>
      <span className="flex-1 text-sm">{label}</span>
      <input
        value={text}
        onChange={(e) => { setText(e.target.value); if (isHex(e.target.value)) onChange(e.target.value.toLowerCase()); }}
        aria-label={`${label} hex`}
        spellCheck={false}
        className="w-20 bg-transparent text-right font-mono text-xs uppercase text-muted outline-none focus:text-foreground"
      />
    </label>
  );
}

function ContrastRow({ label, fg, bg, min }: { label: string; fg: string; bg: string; min: number }) {
  if (!isHex(fg) || !isHex(bg)) return null;
  const r = contrast(fg, bg);
  const pass = r >= min;
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="flex h-6 w-9 items-center justify-center rounded-md font-semibold" style={{ background: bg, color: fg }}>Aa</span>
      <span className="flex-1 text-muted">{label}</span>
      <span className="font-mono">{r.toFixed(2)}</span>
      <Badge size="sm" variant={pass ? "success" : "danger"}>{pass ? "Pass" : "Fail"} {min}:1</Badge>
    </div>
  );
}

function Preview({ tokens, mode }: { tokens: ThemeTokens; mode: "dark" | "light" }) {
  const [tab, setTab] = React.useState("overview");
  const [on, setOn] = React.useState(true);
  return (
    <div style={{ ...themeToStyle(tokens), colorScheme: mode } as React.CSSProperties} className={`${mode} flex flex-col gap-4 rounded-3xl border border-border bg-background p-5 text-foreground transition-colors duration-300`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground"><SparkleIcon size={16} /></span>
          <span className="font-display font-semibold">Acme Analytics</span>
        </div>
        <SegmentedControl aria-label="Preview tab" defaultValue="overview" value={tab} onValueChange={setTab} options={[{ value: "overview", label: "Overview" }, { value: "reports", label: "Reports" }]} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Revenue" value="$48.2k" delta={12.4} hint="vs last week" />
        <StatCard label="Active users" value="3,214" delta={4.1} hint="vs last week" />
        <StatCard label="Churn" value="1.8%" delta={-0.6} invertDelta hint="vs last week" />
      </div>
      <div className="grid gap-3 md:grid-cols-[1.4fr_1fr] [&>*]:min-w-0">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="mb-2 text-sm font-semibold">Weekly signups</div>
          <BarChart data={[{ d: "Mon", v: 32 }, { d: "Tue", v: 48 }, { d: "Wed", v: 41 }, { d: "Thu", v: 66 }, { d: "Fri", v: 58 }, { d: "Sat", v: 24 }, { d: "Sun", v: 30 }]} index="d" series={[{ key: "v", name: "Signups", color: "var(--kn-accent)" }]} height={160} />
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
          <div className="text-sm font-semibold">Invite your team</div>
          <Input placeholder="name@company.com" aria-label="Email" />
          <Switch checked={on} onCheckedChange={setOn} label="Send weekly digest" />
          <Checkbox defaultChecked label="Admin access" />
          <div className="flex gap-2">
            <Button size="sm">Send invite</Button>
            <Button size="sm" variant="secondary">Cancel</Button>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="solid">Solid</Badge><Badge variant="soft">Soft</Badge><Badge variant="success" dot>Success</Badge><Badge variant="warning" dot>Warning</Badge><Badge variant="danger" dot>Danger</Badge><Badge variant="info" dot>Info</Badge>
        <span className="ml-auto"><AvatarStack size="sm" avatars={[{ alt: "Maya Kapoor", color: tokens.accent }, { alt: "Lena Ortiz", color: tokens.info }, { alt: "Sam Okafor", color: tokens.warning }]} /></span>
      </div>
      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface-raised p-4 text-sm">
        <Progress value={68} label="Storage · 68 GB of 100 GB" showValue />
        <p className="text-muted">Muted text reads like this. <span className="text-subtle">Subtle text is for hints and timestamps.</span></p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button size="sm" variant="outline">Outline</Button><Button size="sm" variant="ghost">Ghost</Button><Button size="sm" variant="soft">Soft</Button><Button size="sm" variant="destructive">Delete</Button>
        </div>
      </div>
    </div>
  );
}

/** Live theme editor: pick a preset or seed colours, fine-tune any token, check contrast, preview real components and export CSS. */
export function ThemeEditor() {
  const [state, setState] = React.useState<State>({ preset: "default-dark", seed: defaults["default-dark"].seed, overrides: {} });
  const [format, setFormat] = React.useState("root");
  const [applied, setApplied] = React.useState(false);
  const [tokenOpen, setTokenOpen] = React.useState(false);

  React.useEffect(() => {
    const s = decode(location.hash.slice(1));
    if (s) setState(s);
  }, []);

  const base = React.useMemo(() => createTheme(state.seed), [state.seed]);
  const tokens = { ...base, ...state.overrides } as ThemeTokens;
  const mode = state.seed.mode;

  // Optionally apply to the whole docs site, restoring on unmount or toggle off.
  React.useEffect(() => {
    if (!applied) return;
    const root = document.documentElement;
    const style = themeToStyle(tokens);
    for (const [k, v] of Object.entries(style)) root.style.setProperty(k, v);
    return () => { for (const k of Object.keys(style)) root.style.removeProperty(k); };
  }, [applied, tokens]);

  const setSeed = (p: Partial<ThemeSeed>) => setState((s) => ({ ...s, preset: "custom", seed: { ...s.seed, ...p } }));
  const setToken = (k: ThemeTokenName, v: string) => setState((s) => ({ ...s, preset: "custom", overrides: { ...s.overrides, [k]: v } }));
  const resetToken = (k: ThemeTokenName) => setState((s) => { const o = { ...s.overrides }; delete o[k]; return { ...s, overrides: o }; });

  const name = state.preset === "custom" ? "custom" : state.preset.replace(/^default-/, "kinetic-");
  const css = format === "root"
    ? `/* Paste after @import "@kineticui/core/styles.css"; */\n${themeToCss(tokens, `:root, .${mode}`, mode)}`
    : format === "data"
      ? `/* Use with <html data-theme="${name}"> */\n${themeToCss(tokens, `[data-theme="${name}"]`, mode)}`
      : `import { createTheme, themeToCss } from "@kineticui/core";\n\nexport const theme = createTheme(${JSON.stringify(state.seed, null, 2)});${Object.keys(state.overrides).length ? `\nObject.assign(theme, ${JSON.stringify(state.overrides, null, 2)});` : ""}\n\n// e.g. write themeToCss(theme) into a <style> tag or a CSS file at build time.`;

  const download = () => {
    const blob = new Blob([css], { type: "text/css" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `kinetic-theme-${name}.${format === "ts" ? "ts" : "css"}` });
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const share = async () => {
    history.replaceState(null, "", `#${encode(state)}`);
    await navigator.clipboard?.writeText(location.href).catch(() => {});
    toast.success("Link copied", { description: "Anyone with the link sees this theme." });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-3 overflow-x-auto pb-2">
        {allPresets.map((p) => {
          const t = createTheme(p.seed);
          const active = state.preset === p.id;
          return (
            <motion.button
              key={p.id}
              type="button"
              whileTap={{ scale: 0.96 }}
              aria-pressed={active}
              onClick={() => setState({ preset: p.id, seed: p.seed, overrides: {} })}
              className={`relative flex w-36 shrink-0 flex-col gap-2 rounded-2xl border p-2 text-left transition-colors ${active ? "border-accent" : "border-border hover:border-border-strong"}`}
            >
              <span className="flex h-16 flex-col justify-between rounded-xl p-2" style={{ background: t.background, border: `1px solid ${t.border}` }}>
                <span className="h-1.5 w-12 rounded-full" style={{ background: t.foreground, opacity: 0.8 }} />
                <span className="flex items-center gap-1">
                  <span className="h-4 w-8 rounded" style={{ background: t.accent }} />
                  <span className="h-4 flex-1 rounded" style={{ background: t["surface-raised"] }} />
                </span>
              </span>
              <span className="flex items-center justify-between px-1 text-xs font-medium">{p.label}{active ? <CheckIcon size={12} className="text-accent" /> : null}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
        <aside className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Seed colours</span>
            <SegmentedControl aria-label="Mode" defaultValue="dark" value={mode} onValueChange={(m) => setSeed({ mode: m as "dark" | "light" })} options={[{ value: "dark", label: "Dark" }, { value: "light", label: "Light" }]} />
          </div>
          <div className="flex flex-col gap-2">
            <ColorField label="Background" value={state.seed.background} onChange={(v) => setSeed({ background: v })} />
            <ColorField label="Foreground" value={state.seed.foreground} onChange={(v) => setSeed({ foreground: v })} />
            <ColorField label="Accent" value={state.seed.accent} onChange={(v) => setSeed({ accent: v })} />
          </div>
          <p className="text-xs leading-relaxed text-subtle">Every other token is derived from these three. Surfaces step from background towards foreground; soft colours blend into the background.</p>

          <div className="flex flex-col gap-2.5 rounded-2xl border border-border bg-surface p-4">
            <span className="text-sm font-semibold">Contrast</span>
            <ContrastRow label="Text on background" fg={tokens.foreground} bg={tokens.background} min={7} />
            <ContrastRow label="Muted on background" fg={tokens.muted} bg={tokens.background} min={4.5} />
            <ContrastRow label="Subtle on surface" fg={tokens.subtle} bg={tokens.surface} min={4.5} />
            <ContrastRow label="Accent button text" fg={tokens["accent-foreground"]} bg={tokens.accent} min={4.5} />
            <ContrastRow label="Accent on background" fg={tokens.accent} bg={tokens.background} min={3} />
          </div>

          <div className="flex flex-col rounded-2xl border border-border">
            <button type="button" aria-expanded={tokenOpen} onClick={() => setTokenOpen(!tokenOpen)} className="flex items-center justify-between p-4 text-sm font-semibold">
              All tokens
              <span className="text-xs font-normal text-subtle">{Object.keys(state.overrides).length ? `${Object.keys(state.overrides).length} overridden` : "Fine-tune any token"}</span>
            </button>
            <AnimatePresence initial={false}>
              {tokenOpen ? (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="flex flex-col gap-4 border-t border-border p-4">
                    {groups.map((g) => (
                      <div key={g.label} className="flex flex-col gap-1.5">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-subtle">{g.label}</span>
                        {g.keys.map((k) => (
                          <div key={k} className="flex items-center gap-2.5">
                            <span className="relative size-6 shrink-0 overflow-hidden rounded-md ring-1 ring-border-strong" style={{ background: tokens[k] }}>
                              <input type="color" value={isHex(tokens[k]) ? tokens[k] : "#000000"} onChange={(e) => setToken(k, e.target.value)} aria-label={`--kn-${k}`} className="absolute inset-0 cursor-pointer opacity-0" />
                            </span>
                            <span className="flex-1 font-mono text-xs">{k}</span>
                            {state.overrides[k] ? (
                              <button type="button" aria-label={`Reset ${k}`} onClick={() => resetToken(k)} className="text-warning hover:text-foreground"><RotateCcwIcon size={12} /></button>
                            ) : null}
                            <span className="w-16 text-right font-mono text-[11px] uppercase text-subtle">{tokens[k]}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="flex flex-col gap-3">
            <Switch checked={applied} onCheckedChange={setApplied} label="Apply to this whole site" description="Preview the theme on every page until you reload." />
            <Button variant="secondary" onClick={() => void share()}><LinkIcon size={15} /> Copy share link</Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-6">
          <Preview tokens={tokens} mode={mode} />
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-semibold">Export</span>
              <div className="flex flex-wrap items-center gap-2">
                <SegmentedControl aria-label="Export format" defaultValue="root" value={format} onValueChange={setFormat} options={[{ value: "root", label: ":root" }, { value: "data", label: "Attribute" }, { value: "ts", label: "TypeScript" }]} />
                <CopyButton value={css} label="Copy" />
                <Button size="sm" variant="secondary" onClick={download}><DownloadIcon size={14} /> Download</Button>
              </div>
            </div>
            <CodeBlock files={[{ name: format === "ts" ? "theme.ts" : "globals.css", language: format === "ts" ? "ts" : "css", code: css }]} maxHeight={360} />
          </div>
        </div>
      </div>
    </div>
  );
}
