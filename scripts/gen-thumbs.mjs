// Captures a thumbnail of every component demo and block for the docs site.
//
//   npm run build -w docs && npm run start -w docs     (in one terminal)
//   npm i --no-save playwright && npx playwright install chromium   (once)
//   node scripts/gen-thumbs.mjs [http://localhost:3000] [slug ...]
//
// Writes apps/docs/public/thumbs/{c,b,t}/<slug>.webp and apps/docs/src/lib/thumbs.json.
// Run it again after adding or visually changing a component or block.
import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const only = new Set(process.argv.slice(3));

let chromium, sharp;
try {
  ({ chromium } = await import("playwright"));
  sharp = (await import("sharp")).default;
} catch {
  console.error("Needs playwright and sharp: npm i --no-save playwright && npx playwright install chromium");
  process.exit(1);
}

const index = JSON.parse(readFileSync(`${root}apps/docs/src/generated/index.json`, "utf8"));
const out = `${root}apps/docs/public/thumbs`;
for (const d of ["c", "b", "t"]) mkdirSync(`${out}/${d}`, { recursive: true });

const templateList = existsSync(`${root}apps/docs/src/generated/templates.json`) ? JSON.parse(readFileSync(`${root}apps/docs/src/generated/templates.json`, "utf8")) : [];
const jobs = [...index, ...templateList.map((t) => ({ name: t.name, type: "template" }))]
  .filter((e) => !only.size || only.has(e.name))
  .map((e) =>
    e.type === "template"
      ? { name: e.name, dir: "t", url: `${base}/template-preview/${e.name}`, viewport: { width: 1440, height: 900 } }
      : e.type === "registry:block"
      ? { name: e.name, dir: "b", url: `${base}/preview/${e.name}`, viewport: { width: 1440, height: 900 } }
      : { name: e.name, dir: "c", url: `${base}/demo/${e.name}`, viewport: { width: 1000, height: 625 } },
  );

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2 });
let done = 0;
for (const j of jobs) {
  await page.setViewportSize(j.viewport);
  await page.goto(j.url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800); // let entrance animations settle
  // Components: crop to the demo's own content (plus padding) so small controls fill the card.
  const clip =
    j.dir === "c"
      ? await page.evaluate(({ vw, vh }) => {
          const root = document.querySelector("[data-demo-root]");
          const kids = root ? [...root.querySelectorAll(":scope > *")] : [];
          if (!kids.length) return null;
          let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
          for (const k of kids) {
            const x = k.getBoundingClientRect();
            if (!x.width || !x.height) continue;
            l = Math.min(l, x.left); t = Math.min(t, x.top); r = Math.max(r, x.right); b = Math.max(b, x.bottom);
          }
          if (!isFinite(l)) return null;
          const pad = 56;
          let w = Math.max(r - l + pad * 2, 480), h = Math.max(b - t + pad * 2, 300);
          if (w / h > 1.6) h = w / 1.6; else w = h * 1.6;
          w = Math.min(w, vw); h = Math.min(h, vh);
          const cx = (l + r) / 2, cy = (t + b) / 2;
          const x = Math.min(Math.max(cx - w / 2, 0), vw - w), y = Math.min(Math.max(cy - h / 2, 0), vh - h);
          return { x, y, width: w, height: h };
        }, { vw: j.viewport.width, vh: j.viewport.height })
      : null;
  const png = await page.screenshot({ type: "png", ...(clip ? { clip } : {}) });
  await sharp(png).resize(800, 500, { fit: "cover", position: "top" }).webp({ quality: 74 }).toFile(`${out}/${j.dir}/${j.name}.webp`);
  process.stdout.write(`\r${++done}/${jobs.length} ${j.dir}/${j.name}`.padEnd(60));
}
await browser.close();

// Manifest of slugs that have a thumbnail, so the site can fall back gracefully.
const list = (d) => (existsSync(`${out}/${d}`) ? readdirSync(`${out}/${d}`).filter((f) => f.endsWith(".webp")).map((f) => f.slice(0, -5)).sort() : []);
writeFileSync(`${root}apps/docs/src/lib/thumbs.json`, `${JSON.stringify({ components: list("c"), blocks: list("b"), templates: list("t") }, null, 2)}\n`);
console.log(`\n✓ ${done} thumbnails → apps/docs/public/thumbs`);
