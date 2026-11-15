import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { iconNames } from "@kineticui/icons";
import { blocks, entries, site } from "@/lib/site";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const font = (f: string) => readFile(join(process.cwd(), "assets/og-fonts", f));
const fontsPromise = Promise.all([
  font("space-grotesk-latin-600-normal.woff"),
  font("inter-latin-400-normal.woff"),
  font("jetbrains-mono-latin-500-normal.woff"),
]);

const lime = "#c6f432";

/** Keep text inside the bundled Latin fonts, so the renderer never fetches fallback fonts at build time. */
const clean = (t: string) =>
  t
    .replace(/⌘/g, "Cmd ")
    .replace(/→/g, "->")
    .replace(/[−–]/g, "-")
    .replace(/×/g, "x")
    .replace(/[^\u0000-\u024F\u2014\u2018\u2019\u201C\u201D\u2026\u00B7]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** Branded 1200×630 link preview used by every opengraph-image route. */
export async function ogImage(input: { kicker: string; title: string; description?: string; accentWord?: string }) {
  const kicker = clean(input.kicker);
  const title = clean(input.title);
  const description = input.description ? clean(input.description) : undefined;
  const { accentWord } = input;
  const [display, body, mono] = await fontsPromise;
  const host = site.url.replace(/^https?:\/\//, "");
  const words = title.split(" ");
  const big = title.length > 26 ? 76 : 96;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#0a0a0b", color: "#f4f4f5", fontFamily: "Inter", position: "relative", padding: "64px 72px" }}>
        {/* glow + grid */}
        <div style={{ position: "absolute", left: 0, top: 0, width: 1200, height: 630, display: "flex", backgroundImage: "radial-gradient(ellipse 700px 380px at 78% 0%, rgba(198,244,50,0.22), transparent 70%)" }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: 1200, height: 630, display: "flex", opacity: 0.5, backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: "Space Grotesk", fontSize: 32 }}>
            <svg width="44" height="44" viewBox="0 0 28 28">
              <rect x="2" y="2" width="24" height="24" rx="7" fill={lime} />
              <path d="M9 8v12M9 14l9-6M12 12l7 8" stroke="#0a0a0b" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Kinetic UI
          </div>
          <div style={{ display: "flex", fontFamily: "JetBrains Mono", fontSize: 22, color: "#8a8a93" }}>{host}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", gap: 22 }}>
          <div style={{ display: "flex", fontFamily: "JetBrains Mono", fontSize: 24, letterSpacing: 4, color: lime, textTransform: "uppercase" }}>{kicker}</div>
          <div style={{ display: "flex", flexWrap: "wrap", fontFamily: "Space Grotesk", fontSize: big, lineHeight: 1.02, letterSpacing: -3, maxWidth: 1050 }}>
            {words.map((w, i) => (
              <span key={i} style={{ marginRight: big * 0.26, color: accentWord && w.replace(/[.,]/g, "") === accentWord.replace(/[.,]/g, "") ? lime : "#f4f4f5" }}>{w}</span>
            ))}
          </div>
          {description ? <div style={{ display: "flex", fontSize: 30, lineHeight: 1.4, color: "#a1a1aa", maxWidth: 980 }}>{description.length > 120 ? `${description.slice(0, 117)}…` : description}</div> : null}
        </div>

        <div style={{ display: "flex", gap: 36, marginTop: 44, fontFamily: "JetBrains Mono", fontSize: 22, color: "#8a8a93" }}>
          {[[entries.length, "components"], [blocks.length, "blocks"], [iconNames.length, "icons"], [6, "themes"]].map(([n, l]) => (
            <div key={l as string} style={{ display: "flex", gap: 10 }}>
              <span style={{ color: "#f4f4f5" }}>{n}</span>
              {l}
            </div>
          ))}
          <div style={{ display: "flex", marginLeft: "auto", color: lime }}>Free · MIT</div>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Space Grotesk", data: display, weight: 600, style: "normal" },
        { name: "Inter", data: body, weight: 400, style: "normal" },
        { name: "JetBrains Mono", data: mono, weight: 500, style: "normal" },
      ],
    },
  );
}
