import type { Metadata } from "next";
import Link from "next/link";
import { Alert, Tabs, TabsContent, TabsList, TabsTrigger } from "@kineticui/ui";
import { CodeBlock, Command } from "@/components/code-block";
import { ComponentsSidebar } from "@/components/components-sidebar";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "AI tools & MCP",
  description: "Connect Claude, Cursor, VS Code and other AI tools to Kinetic UI with the MCP server and llms.txt.",
};

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-24 font-display text-3xl font-semibold tracking-tight text-foreground">
      {children}
    </h2>
  );
}

const mcpUrl = `${site.url}/mcp`;

const tools = [
  { name: "search_components", desc: "Find components and blocks from a description, e.g. “a pricing table with a monthly toggle”." },
  { name: "list_components", desc: "Browse every category, or everything in one category." },
  { name: "get_component", desc: "Source code, install commands, imports, dependencies and usage examples for one item." },
  { name: "get_install_command", desc: "The exact command for the Kinetic CLI, shadcn or npm, for any package manager." },
  { name: "get_setup", desc: "One-time project setup: packages, stylesheet, fonts and theming." },
];

export default function AiDocsPage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <ComponentsSidebar />
      <article className="flex min-w-0 max-w-3xl flex-col gap-6 leading-relaxed text-muted">
        <span className="font-mono text-xs tracking-widest text-accent">GETTING STARTED</span>
        <h1 className="font-display text-5xl font-semibold tracking-tight text-foreground">AI tools &amp; MCP</h1>
        <p className="text-lg">
          Let your AI coding assistant find, read and install Kinetic components for you. Ask for “a sortable task list with keyboard support” and it
          picks the right component, adds it to your project and wires it up.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["MCP server", "Live search and install from Claude, Cursor, VS Code and any MCP client."],
            ["llms.txt", "A plain-text map of the library for tools that read docs."],
            ["shadcn registry", "Install with @kinetic/<name> using the shadcn CLI and its MCP."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-2xl border border-border bg-surface p-5">
              <p className="font-semibold text-foreground">{t}</p>
              <p className="mt-1 text-sm">{d}</p>
            </div>
          ))}
        </div>

        <H2 id="mcp">MCP server</H2>
        <p>
          The hosted server needs no install. Point your tool at <code className="font-mono text-foreground">{mcpUrl}</code>, or run it locally with{" "}
          <code className="font-mono text-foreground">npx -y @kineticui/mcp</code>.
        </p>

        <Tabs defaultValue="claude-code">
          <TabsList>
            <TabsTrigger value="claude-code">Claude Code</TabsTrigger>
            <TabsTrigger value="claude">Claude app</TabsTrigger>
            <TabsTrigger value="cursor">Cursor</TabsTrigger>
            <TabsTrigger value="vscode">VS Code</TabsTrigger>
            <TabsTrigger value="local">Local (stdio)</TabsTrigger>
          </TabsList>
          <TabsContent value="claude-code" className="flex flex-col gap-3 pt-4">
            <Command command={`claude mcp add --transport http kinetic-ui ${mcpUrl}`} />
            <p className="text-sm">Add <code className="font-mono">--scope project</code> to share it with your team through <code className="font-mono">.mcp.json</code>.</p>
          </TabsContent>
          <TabsContent value="claude" className="flex flex-col gap-3 pt-4">
            <p className="text-sm">
              In Claude, open <b className="text-foreground">Settings → Connectors → Add custom connector</b>, name it Kinetic UI and paste the URL:
            </p>
            <Command command={mcpUrl} />
          </TabsContent>
          <TabsContent value="cursor" className="flex flex-col gap-3 pt-4">
            <p className="text-sm">Add to <code className="font-mono">.cursor/mcp.json</code> in your project (or <code className="font-mono">~/.cursor/mcp.json</code> for every project):</p>
            <CodeBlock code={JSON.stringify({ mcpServers: { "kinetic-ui": { url: mcpUrl } } }, null, 2)} />
          </TabsContent>
          <TabsContent value="vscode" className="flex flex-col gap-3 pt-4">
            <p className="text-sm">Add to <code className="font-mono">.vscode/mcp.json</code>, then use Copilot Chat in agent mode:</p>
            <CodeBlock code={JSON.stringify({ servers: { "kinetic-ui": { type: "http", url: mcpUrl } } }, null, 2)} />
          </TabsContent>
          <TabsContent value="local" className="flex flex-col gap-3 pt-4">
            <p className="text-sm">For clients that only run local servers, or to work offline against a self-hosted registry:</p>
            <CodeBlock code={JSON.stringify({ mcpServers: { "kinetic-ui": { command: "npx", args: ["-y", "@kineticui/mcp"] } } }, null, 2)} />
            <p className="text-sm">
              Set <code className="font-mono">KINETIC_REGISTRY_URL</code> in <code className="font-mono">env</code> to use your own deployment of the docs.
            </p>
          </TabsContent>
        </Tabs>

        <h3 className="mt-2 font-display text-xl font-semibold text-foreground">Tools</h3>
        <div className="overflow-hidden rounded-2xl border border-border">
          {tools.map((t, i) => (
            <div key={t.name} className={`flex flex-col gap-1 p-4 sm:flex-row sm:gap-6 ${i ? "border-t border-border" : ""}`}>
              <code className="w-48 shrink-0 font-mono text-sm text-accent">{t.name}</code>
              <span className="text-sm">{t.desc}</span>
            </div>
          ))}
        </div>

        <h3 className="mt-2 font-display text-xl font-semibold text-foreground">Try asking</h3>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm">
          <li>“Set up Kinetic UI in this Next.js app.”</li>
          <li>“Add a sign-up form with zod validation using Kinetic components.”</li>
          <li>“Build a chat page with the AI SDK and Kinetic’s AI Chat.”</li>
          <li>“Which Kinetic blocks would make a good SaaS landing page? Install them.”</li>
        </ul>

        <H2 id="llms">llms.txt</H2>
        <p>Tools that read documentation can use these plain-text files instead of crawling the site:</p>
        <ul className="flex flex-col gap-2 text-sm">
          <li>
            <a href="/llms.txt" className="font-mono text-accent hover:underline">/llms.txt</a>: every component and block, one line each, linking to Markdown pages.
          </li>
          <li>
            <a href="/llms-full.txt" className="font-mono text-accent hover:underline">/llms-full.txt</a>: the whole library in one file, with props, imports and usage.
          </li>
          <li>
            <a href="/md/sortable-list.md" className="font-mono text-accent hover:underline">/md/&lt;name&gt;.md</a>: one component, including its full source.
          </li>
        </ul>
        <p className="text-sm">In Cursor, add <code className="font-mono text-foreground">{site.url}/llms-full.txt</code> under Docs and mention <code className="font-mono">@Kinetic</code> in chat.</p>

        <H2 id="shadcn">shadcn registry</H2>
        <p>Already use shadcn? Add Kinetic as a namespaced registry in <code className="font-mono text-foreground">components.json</code>:</p>
        <CodeBlock code={JSON.stringify({ registries: { "@kinetic": `${site.url}/r/{name}.json` } }, null, 2)} />
        <p>Then install with the shadcn CLI, or let the shadcn MCP server do it for you:</p>
        <Command command="npx shadcn@latest add @kinetic/sortable-list @kinetic/globe" />

        <Alert tone="info" title="Your code stays yours">
          Every route installs plain source files into your project. Nothing is called at runtime, and the MCP server only reads the public registry.
        </Alert>

        <p className="text-sm">
          Next: browse the <Link href="/components" className="text-accent hover:underline">components</Link> or the{" "}
          <Link href="/blocks" className="text-accent hover:underline">blocks</Link>.
        </p>
      </article>
    </div>
  );
}
