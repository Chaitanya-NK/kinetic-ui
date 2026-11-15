// Writes the [data-theme="…"] preset blocks into packages/core/styles.css from packages/core/src/themes.ts (via the built dist).
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const { themePresets, presetTokens, themeToCss } = await import(`${root}packages/core/dist/index.js`);
const file = `${root}packages/core/styles.css`;
const START = "/* @generated theme presets — edit packages/core/src/themes.ts, then npm run build:packages */";
const END = "/* @end theme presets */";
const blocks = Object.entries(themePresets).map(([id, p]) => `/* ${p.label}: ${p.description} */\n${themeToCss(presetTokens(id), `[data-theme="${id}"]`, p.seed.mode)}`);
const section = `${START}\n${blocks.join("\n\n")}\n${END}`;
let css = readFileSync(file, "utf8");
if (css.includes(START)) css = css.replace(new RegExp(`${START.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${END.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}`), section);
else css = css.replace("@theme inline {", `${section}\n\n@theme inline {`);
writeFileSync(file, css);
console.log(`✓ Theme presets: ${blocks.length} → packages/core/styles.css`);
