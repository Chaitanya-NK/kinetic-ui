import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Page } from "@playwright/test";

type Entry = { name: string; type?: string };
const index = JSON.parse(readFileSync(join(process.cwd(), "apps/docs/public/r/index.json"), "utf8")) as { items: Entry[] };

export const components = index.items.filter((e) => e.type !== "registry:block" && e.type !== "registry:item").map((e) => e.name);
export const blocks = index.items.filter((e) => e.type === "registry:block").map((e) => e.name);
export const templates = index.items.filter((e) => e.type === "registry:item").map((e) => e.name);
export const docsPages = ["/", "/docs", "/docs/ai", "/docs/updating", "/docs/figma", "/components", "/blocks", "/templates", "/themes", "/icons"];

/**
 * Make a page render the same way every run: a fixed date, repeatable Math.random,
 * web fonts loaded and the network quiet.
 */
export async function prepare(page: Page) {
  await page.clock.setFixedTime(new Date("2026-06-15T10:30:00+05:30"));
  await page.addInitScript(() => {
    let s = 0x2f6b9c1d;
    Math.random = () => {
      s ^= s << 13;
      s ^= s >>> 17;
      s ^= s << 5;
      return ((s >>> 0) % 1_000_000) / 1_000_000;
    };
    try {
      localStorage.setItem("kinetic-theme-mode", "dark");
    } catch {}
  });
}

export async function settle(page: Page, extra = 300) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(extra);
}

/** Scroll to the bottom and back so scroll-triggered reveals have all run, then let them finish. */
export async function revealAll(page: Page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(900);
}
