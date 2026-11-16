import data from "@/generated/templates.json";

export type TemplateFile = { type: string; target: string; content: string };
export type Template = {
  name: string;
  title: string;
  description: string;
  category: string;
  notes: string | null;
  uses: string[];
  dependencies: string[];
  files: TemplateFile[];
};

const order = ["saas-landing", "saas-dashboard", "ai-chatbot", "portfolio", "docs-site"];
const rank = (n: string) => (order.indexOf(n) + 1 || 99);
export const templates = (data as Template[]).slice().sort((a, b) => rank(a.name) - rank(b.name));
export const getTemplate = (name: string) => templates.find((t) => t.name === name);
export const templateCategoryLabel: Record<string, string> = { marketing: "Marketing site", app: "Web app", ai: "AI app" };
