/** Raw token values, mirrored in styles.css. Useful for charts and canvas drawing. */
export const tokens = {
  dark: {
    background: "#0A0A0B",
    surface: "#111114",
    surfaceRaised: "#17171B",
    border: "#26262C",
    foreground: "#F4F4F5",
    muted: "#A1A1AA",
    subtle: "#8A8A93",
  },
  light: {
    background: "#FAFAF9",
    surface: "#FFFFFF",
    surfaceRaised: "#F4F4F5",
    border: "#E4E4E7",
    foreground: "#18181B",
    muted: "#52525B",
    subtle: "#71717A",
  },
  radius: { sm: "8px", md: "12px", lg: "16px", xl: "20px", full: "999px" },
  ease: {
    out: "cubic-bezier(.16,1,.3,1)",
    spring: "cubic-bezier(.2,.9,.3,1.2)",
  },
} as const;

export const accents = {
  lime: { dark: "#C6F432", light: "#4D7C0F" },
  blue: { dark: "#7C8CFF", light: "#3B4FE0" },
  orange: { dark: "#F4A86A", light: "#C2410C" },
  rose: { dark: "#F0A3D0", light: "#BE185D" },
  mint: { dark: "#6EE7A0", light: "#047857" },
} as const;
