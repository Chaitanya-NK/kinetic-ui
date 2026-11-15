import * as React from "react";

export type ThemeMode = "dark" | "light" | "system";
export type ThemeAccent = "lime" | "blue" | "orange" | "rose" | "mint";

type ThemeContextValue = {
  mode: ThemeMode;
  resolvedMode: "dark" | "light";
  accent: ThemeAccent;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: ThemeAccent) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export type ThemeProviderProps = {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
  defaultAccent?: ThemeAccent;
  /** localStorage key used to remember the choice. Set to null to disable. */
  storageKey?: string | null;
};

function readStored<T extends string>(key: string | null, fallback: T): T {
  if (!key || typeof window === "undefined") return fallback;
  try {
    return (window.localStorage.getItem(key) as T) || fallback;
  } catch {
    return fallback;
  }
}

/**
 * Applies `class="dark"` / `class="light"` and `data-accent` to <html>.
 * All Kinetic tokens read from those, so every component restyles instantly.
 */
export function ThemeProvider({
  children,
  defaultMode = "dark",
  defaultAccent = "lime",
  storageKey = "kinetic-theme",
}: ThemeProviderProps) {
  const [mode, setModeState] = React.useState<ThemeMode>(defaultMode);
  const [accent, setAccentState] = React.useState<ThemeAccent>(defaultAccent);
  const [systemDark, setSystemDark] = React.useState(true);

  React.useEffect(() => {
    setModeState(readStored(storageKey && `${storageKey}-mode`, defaultMode));
    setAccentState(readStored(storageKey && `${storageKey}-accent`, defaultAccent));
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(mql.matches);
    const onChange = () => setSystemDark(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [storageKey, defaultMode, defaultAccent]);

  const resolvedMode = mode === "system" ? (systemDark ? "dark" : "light") : mode;

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(resolvedMode);
    root.style.colorScheme = resolvedMode;
    root.dataset.accent = accent;
  }, [resolvedMode, accent]);

  const persist = (suffix: string, value: string) => {
    if (!storageKey) return;
    try {
      window.localStorage.setItem(`${storageKey}-${suffix}`, value);
    } catch {
      /* storage unavailable */
    }
  };

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      mode,
      resolvedMode,
      accent,
      setMode: (m) => {
        setModeState(m);
        persist("mode", m);
      },
      setAccent: (a) => {
        setAccentState(a);
        persist("accent", a);
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, resolvedMode, accent],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
