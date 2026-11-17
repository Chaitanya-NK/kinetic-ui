import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { blocks, components, docsPages, prepare, settle, templates } from "./pages";

/**
 * Accessibility checks with axe-core (WCAG 2.1 A and AA). Serious and critical problems fail the test.
 * Add an exception here only with a reason; fix the component when you can.
 */
const exceptions: Record<string, { rules: string[]; why: string }> = {};

const pages = [
  ...docsPages.map((p) => ({ name: `page ${p}`, url: p })),
  ...components.map((n) => ({ name: `component ${n}`, url: `/demo/${n}` })),
  ...blocks.map((n) => ({ name: `block ${n}`, url: `/preview/${n}` })),
  ...templates.map((n) => ({ name: `template ${n}`, url: `/template-preview/${n}` })),
];

for (const { name, url } of pages) {
  test(name, async ({ page }) => {
    await prepare(page);
    await page.goto(url);
    await settle(page, 800);
    const skip = exceptions[url.split("/").pop() || url]?.rules ?? [];
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .disableRules(skip)
      .analyze();
    const problems = results.violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map((v) => `${v.id} (${v.impact}): ${v.help}\n    ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join("\n    ")}`);
    expect(problems, `Accessibility problems on ${url}:\n  ${problems.join("\n  ")}`).toEqual([]);
  });
}
