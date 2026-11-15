"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@kineticui/ui";
import { DotBackground } from "@kineticui/motion";
import { demos } from "@/demos";
import { CodeBlock, Command } from "./code-block";

export function Preview({ slug, code }: { slug: string; code: string }) {
  const Demo = demos[slug];
  return (
    <Tabs defaultValue="preview">
      <TabsList>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <TabsContent value="preview">
        <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-2xl border border-border bg-background p-8 sm:p-12">
          <DotBackground className="opacity-25" />
          <div className="relative flex w-full items-center justify-center">{Demo ? <Demo /> : <p className="text-muted">Preview coming soon.</p>}</div>
        </div>
      </TabsContent>
      <TabsContent value="code">
        <CodeBlock code={code} />
      </TabsContent>
    </Tabs>
  );
}

export function InstallTabs({ name, pkg, exports, registryUrl }: { name: string; pkg: string; exports: string[]; registryUrl: string }) {
  const importLine = `import { ${exports.slice(0, 4).join(", ")}${exports.length > 4 ? ", …" : ""} } from "${pkg}";`;
  return (
    <Tabs defaultValue="cli">
      <TabsList>
        <TabsTrigger value="cli">Kinetic CLI</TabsTrigger>
        <TabsTrigger value="npm">npm package</TabsTrigger>
        <TabsTrigger value="shadcn">shadcn CLI</TabsTrigger>
      </TabsList>
      <TabsContent value="cli" className="flex flex-col gap-3">
        <p className="text-sm text-muted">Copies the source into your project so you can edit every line.</p>
        <Command command={`npx @kineticui/cli add ${name}`} />
      </TabsContent>
      <TabsContent value="npm" className="flex flex-col gap-3">
        <p className="text-sm text-muted">Install the package and import it. Updates arrive with <code className="font-mono text-foreground">npm update</code>.</p>
        <Command command={`npm i ${pkg} @kineticui/core`} />
        <CodeBlock code={importLine} />
      </TabsContent>
      <TabsContent value="shadcn" className="flex flex-col gap-3">
        <p className="text-sm text-muted">Already using shadcn/ui? Kinetic’s registry is compatible.</p>
        <Command command={`npx shadcn@latest add ${registryUrl}/${name}.json`} />
      </TabsContent>
    </Tabs>
  );
}
