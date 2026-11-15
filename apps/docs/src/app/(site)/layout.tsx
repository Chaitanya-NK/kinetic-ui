import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main">{children}</main>
      <footer className="mt-24 border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Kinetic UI · MIT licensed</span>
          <nav aria-label="Footer" className="flex gap-6">
            <Link href="/docs" className="hover:text-foreground">Docs</Link>
            <Link href="/components" className="hover:text-foreground">Components</Link>
            <Link href="/blocks" className="hover:text-foreground">Blocks</Link>
            <Link href="/icons" className="hover:text-foreground">Icons</Link>
            <a href={site.github} className="hover:text-foreground">GitHub</a>
            <a href="/r/index.json" className="hover:text-foreground">Registry</a>
          </nav>
        </div>
      </footer>
    </>
  );
}
