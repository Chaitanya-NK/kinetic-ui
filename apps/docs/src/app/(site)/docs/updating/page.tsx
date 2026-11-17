import type { Metadata } from "next";
import { Alert } from "@kineticui/ui";
import { CodeBlock, Command } from "@/components/code-block";
import { ComponentsSidebar } from "@/components/components-sidebar";

export const metadata: Metadata = {
  title: "Updating components",
  description: "See what changed upstream with kinetic diff, and pull fixes into copied components with kinetic update, without losing your own edits.",
};

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-24 font-display text-3xl font-semibold tracking-tight text-foreground">
      {children}
    </h2>
  );
}

const states = [
  ["up to date", "Your file matches the latest version."],
  ["update available", "Upstream changed and you haven't touched the file. Update replaces it."],
  ["update available, you edited it too", "Both sides changed. Update merges them line by line and keeps your edits."],
  ["only your edits", "You changed it and upstream didn't. Nothing to do."],
  ["new file upstream", "The component gained a file. Update adds it."],
  ["differs from upstream (no install record)", "Added before install records existed, so there's nothing to merge from. Update skips it unless you pass --force."],
];

export default function UpdatingPage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <ComponentsSidebar />
      <article className="flex min-w-0 max-w-3xl flex-col gap-6 leading-relaxed text-muted">
        <span className="font-mono text-xs tracking-widest text-accent">GETTING STARTED</span>
        <h1 className="font-display text-5xl font-semibold tracking-tight text-foreground">Updating components</h1>
        <p className="text-lg">
          Components you add with the CLI are copied into your project, so they&apos;re yours to edit. When Kinetic UI ships a fix, the CLI can
          show you what changed and merge it in, keeping your own changes.
        </p>

        <H2 id="diff">See what changed</H2>
        <Command command="npx @kineticui/cli diff" />
        <p>
          Checks everything you&apos;ve installed and prints what changed upstream since you added it, as a coloured diff. Name components to check
          just those, or add <code className="font-mono text-foreground">--summary</code> for a list of files without the diff.
        </p>
        <CodeBlock
          code={`badge
  components/kinetic/badge.tsx  update available, you edited it too
@@ -58,5 +58,6 @@
       {...props}
     />
+    <span className="sr-only">{label}</span>
   );

◆ 1 file can be updated. Run kinetic update`}
        />

        <H2 id="update">Pull in fixes</H2>
        <Command command="npx @kineticui/cli update" />
        <p>
          Updates everything, or only the components you name. Files you never edited are replaced. Files you did edit get a three-way merge: your
          changes and the upstream changes are combined wherever they touch different lines. New npm dependencies are installed for you.
        </p>
        <p>
          If you and upstream changed the same lines, the CLI keeps both and marks the spot the way git does. Search for{" "}
          <code className="font-mono text-foreground">&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>, keep the lines you want and delete the markers.{" "}
          <code className="font-mono text-foreground">kinetic diff</code> flags any file that still has them.
        </p>
        <CodeBlock
          code={`<<<<<<< your version
const tone = "brand";
=======
const tone = props.tone ?? "neutral";
>>>>>>> kinetic badge`}
        />

        <H2 id="states">What each status means</H2>
        <div className="overflow-hidden rounded-2xl border border-border">
          {states.map(([s, d]) => (
            <div key={s} className="grid gap-1 border-b border-border px-4 py-3 last:border-0 sm:grid-cols-[17rem_1fr] sm:gap-4">
              <span className="font-mono text-xs text-foreground">{s}</span>
              <span className="text-sm">{d}</span>
            </div>
          ))}
        </div>

        <H2 id="how">How it works</H2>
        <p>
          Every time <code className="font-mono text-foreground">add</code> or <code className="font-mono text-foreground">update</code> writes a
          file, the CLI keeps a copy of it exactly as installed in <code className="font-mono text-foreground">.kinetic/base/</code> and records it in{" "}
          <code className="font-mono text-foreground">.kinetic/lock.json</code>. That copy is the common starting point, so the CLI can tell your
          edits apart from upstream&apos;s.
        </p>
        <Alert tone="info" title="Commit the .kinetic folder">
          It&apos;s small and it lets everyone on your team update components safely. Without it, the CLI can still show differences but can&apos;t
          merge them.
        </Alert>

        <H2 id="older">Components added before 0.3.1</H2>
        <p>
          Older installs have no record to merge from. Unedited files update normally. For files you changed, check the diff first, then replace them
          with <code className="font-mono text-foreground">--force</code>. The CLI saves a backup to{" "}
          <code className="font-mono text-foreground">.kinetic/backup/</code> first. From then on, updates merge normally.
        </p>
        <Command command="npx @kineticui/cli update badge --force" />

        <H2 id="options">Options</H2>
        <CodeBlock
          code={`kinetic diff [name...]      --summary          list files only
kinetic update [name...]    --force            replace edited files that have no install record
                            --dry-run          show what would change, write nothing
                            --no-install       skip installing npm dependencies
                            --registry <url>   use another registry`}
        />
      </article>
    </div>
  );
}
