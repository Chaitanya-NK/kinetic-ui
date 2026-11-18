import { existsSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { blocks, components, prepare, settle, templates } from "./pages";

/**
 * Screenshot every demo, block and template and compare with the committed baseline.
 * Canvas and video are masked (they animate by nature). A few demos are skipped because their
 * content is live by design; add to the list only with a reason.
 */
const skip: Record<string, string> = {
  "c-agent-plan": "Steps advance on a timer by design.",
  "c-live-cursors": "Cursors move continuously by design.",
  "c-chat-message": "Streams text with a blinking caret.",
  "b-blog-post": "Reading progress and animated cover never settle.",
  "t-event-page": "Live countdown and aurora never settle.",
};

const cases = [
  ...components.map((n) => ({ key: `c-${n}`, url: `/demo/${n}`, full: true })),
  ...blocks.map((n) => ({ key: `b-${n}`, url: `/preview/${n}`, full: true })),
  ...templates.map((n) => ({ key: `t-${n}`, url: `/template-preview/${n}`, full: false })),
];

for (const { key, url, full } of cases) {
  test(key, async ({ page }, info) => {
    test.skip(key in skip, skip[key]);
    // Baselines come from CI's container; until they're committed, CI skips instead of failing.
    test.skip(!!process.env.CI && !process.env.UPDATE_BASELINES && !existsSync(info.snapshotPath(`${key}.png`)), "No baseline yet. Run the Visual baselines workflow.");
    await prepare(page);
    await page.goto(url);
    await settle(page, 600);
    await expect(page).toHaveScreenshot(`${key}.png`, {
      fullPage: full,
      mask: [page.locator("canvas, video, iframe")],
    });
  });
}
