/**
 * Theme presets and a small colour engine that derives a full Kinetic token set from three seed colours.
 * The preset CSS in styles.css is generated from this file (scripts/gen-theme-css.mjs), so the two never drift.
 */

export const themeTokenNames = [
  "background", "surface", "surface-raised", "surface-overlay", "border", "border-strong",
  "foreground", "muted", "subtle",
  "accent", "accent-foreground", "accent-soft", "accent-soft-foreground",
  "success", "success-soft", "warning", "warning-soft", "danger", "danger-soft", "info", "info-soft",
  "ring", "shadow",
] as const;

export type ThemeTokenName = (typeof themeTokenNames)[number];
export type ThemeTokens = Record<ThemeTokenName, string>;
export type ThemeSeed = {
  mode: "dark" | "light";
  background: string;
  foreground: string;
  accent: string;
  /** Optional status colour overrides. */
  success?: string;
  warning?: string;
  danger?: string;
  info?: string;
};

// ── colour helpers ────────────────────────────────────────────────────────────
type RGB = [number, number, number];
export function hexToRgb(hex: string): RGB {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function rgbToHex([r, g, b]: RGB): string {
  return `#${[r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("")}`;
}
/** Mix a towards b by t (0 = a, 1 = b). */
export function mix(a: string, b: string, t: number): string {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return rgbToHex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]);
}
function luminance(hex: string) {
  const c = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
}
/** WCAG contrast ratio between two hex colours (1–21). */
export function contrast(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (l1 + 0.05) / (l2 + 0.05);
}

const statusDefaults = {
  dark: { success: "#6ee7a0", warning: "#fbbf5a", danger: "#ff8a8a", info: "#9aa6ff" },
  light: { success: "#047857", warning: "#b45309", danger: "#b91c1c", info: "#3b4fe0" },
};

/** Derive every token from a seed. Surfaces step from the background towards the foreground. */
export function createTheme(seed: ThemeSeed): ThemeTokens {
  const { mode, background: bg, foreground: fg, accent } = seed;
  const dark = mode === "dark";
  const st = { ...statusDefaults[mode], ...Object.fromEntries(Object.entries(seed).filter(([k, v]) => k in statusDefaults.dark && v)) } as typeof statusDefaults.dark;
  const [r, g, b] = hexToRgb(accent);
  const accentFg = contrast(accent, "#0a0a0b") >= contrast(accent, "#ffffff") ? mix(bg, "#000000", dark ? 0 : 0.85) : "#ffffff";
  const soft = (c: string) => mix(bg, c, dark ? 0.12 : 0.14);
  return {
    background: bg,
    surface: dark ? mix(bg, fg, 0.03) : mix(bg, "#ffffff", 0.75),
    "surface-raised": mix(bg, fg, dark ? 0.06 : 0.035),
    "surface-overlay": dark ? mix(bg, fg, 0.085) : mix(bg, "#ffffff", 0.9),
    border: mix(bg, fg, dark ? 0.13 : 0.1),
    "border-strong": mix(bg, fg, dark ? 0.21 : 0.17),
    foreground: fg,
    muted: mix(fg, bg, dark ? 0.33 : 0.3),
    subtle: mix(fg, bg, dark ? 0.44 : 0.31),
    accent,
    "accent-foreground": accentFg,
    "accent-soft": soft(accent),
    "accent-soft-foreground": dark ? mix(accent, fg, 0.35) : mix(accent, fg, 0.3),
    success: st.success,
    "success-soft": soft(st.success),
    warning: st.warning,
    "warning-soft": soft(st.warning),
    danger: st.danger,
    "danger-soft": soft(st.danger),
    info: st.info,
    "info-soft": soft(st.info),
    ring: `rgb(${r} ${g} ${b} / ${dark ? 0.35 : 0.3})`,
    shadow: dark ? "0 24px 48px rgb(0 0 0 / 0.45)" : "0 16px 32px rgb(0 0 0 / 0.08)",
  };
}

export type ThemePreset = "midnight" | "sunset" | "paper" | "mono" | "forest" | "ocean";

export const themePresets: Record<ThemePreset, { label: string; description: string; seed: ThemeSeed }> = {
  midnight: { label: "Midnight", description: "Deep navy with periwinkle accents.", seed: { mode: "dark", background: "#070b16", foreground: "#e6ebff", accent: "#7c9cff" } },
  sunset: { label: "Sunset", description: "Warm charcoal and coral.", seed: { mode: "dark", background: "#140c0a", foreground: "#fbeee6", accent: "#ff8a5b" } },
  paper: { label: "Paper", description: "Warm off-white, ink and terracotta.", seed: { mode: "light", background: "#f6f1e7", foreground: "#2a2520", accent: "#b4532a" } },
  mono: { label: "Mono", description: "Pure greyscale, white accent.", seed: { mode: "dark", background: "#0a0a0a", foreground: "#fafafa", accent: "#fafafa" } },
  forest: { label: "Forest", description: "Moss dark with fresh green.", seed: { mode: "dark", background: "#08110c", foreground: "#e7f3ea", accent: "#5fd38d" } },
  ocean: { label: "Ocean", description: "Airy light with deep teal.", seed: { mode: "light", background: "#f3f8fb", foreground: "#0f2530", accent: "#0e7490" } },
};

/** Tokens for a preset. */
export const presetTokens = (p: ThemePreset): ThemeTokens => createTheme(themePresets[p].seed);

/** Serialise tokens as CSS custom properties under a selector, ready to paste into globals.css. */
export function themeToCss(tokens: ThemeTokens, selector = ":root", colorScheme?: "dark" | "light"): string {
  const lines = themeTokenNames.map((k) => `  --kn-${k}: ${tokens[k]};`);
  if (colorScheme) lines.push(`  color-scheme: ${colorScheme};`);
  return `${selector} {\n${lines.join("\n")}\n}`;
}

/** Tokens as an inline style object, for scoping a theme to one subtree. */
export function themeToStyle(tokens: ThemeTokens): Record<string, string> {
  return Object.fromEntries(themeTokenNames.map((k) => [`--kn-${k}`, tokens[k]]));
}
