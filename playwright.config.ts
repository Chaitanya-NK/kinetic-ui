import { defineConfig } from "@playwright/test";

/**
 * Visual and accessibility tests for every demo, block and template.
 * Run against a production build: `npm run build -w docs`, then `npm run test:e2e`.
 * Baselines are made in CI's Playwright container (see .github/workflows/visual-baselines.yml),
 * so they match pixel for pixel there.
 */
const port = Number(process.env.PORT ?? 3200);
const baseURL = process.env.BASE_URL ?? `http://localhost:${port}`;

export default defineConfig({
  testDir: "tests/e2e",
  snapshotPathTemplate: "{testDir}/__screenshots__/{arg}{ext}",
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined,
  retries: process.env.CI ? 1 : 0,
  timeout: 45_000,
  reporter: process.env.CI ? [["github"], ["html", { open: "never", outputFolder: "playwright-report" }]] : "list",
  updateSnapshots: process.env.CI ? "none" : "missing",
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: "disabled", caret: "hide", scale: "css" },
  },
  use: {
    baseURL,
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
    colorScheme: "dark",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "a11y", testMatch: /a11y\.spec\.ts/ },
    { name: "visual", testMatch: /visual\.spec\.ts/ },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : { command: `npm run start -w docs -- -p ${port}`, url: baseURL, reuseExistingServer: !process.env.CI, timeout: 120_000 },
});
