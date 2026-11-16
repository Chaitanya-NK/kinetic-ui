"use client";

import dynamic from "next/dynamic";

/*
 * Live previews of the starter templates in /templates (repo root). Each is loaded only on its own preview page.
 * Templates whose real pages need routing or an API route ship a preview.tsx that renders the same UI without them.
 */
export const templatePreviews: Record<string, React.ComponentType> = {
  "saas-landing": dynamic(() => import("../../../../templates/saas-landing/page")),
  portfolio: dynamic(() => import("../../../../templates/portfolio/page")),
  "saas-dashboard": dynamic(() => import("../../../../templates/saas-dashboard/preview")),
  "ai-chatbot": dynamic(() => import("../../../../templates/ai-chatbot/preview")),
  "docs-site": dynamic(() => import("../../../../templates/docs-site/preview")),
};

export function TemplatePreview({ slug }: { slug: string }) {
  const Comp = templatePreviews[slug];
  return Comp ? <Comp /> : null;
}
