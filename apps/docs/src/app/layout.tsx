import type { Metadata } from "next";
import Link from "next/link";
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: { default: `${site.name} — components that move`, template: `%s · ${site.name}` },
  description: site.description,
  metadataBase: new URL(site.url),
  openGraph: { title: site.name, description: site.description, type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" data-accent="lime" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <a
          href="#main"
          className="sr-only z-50 rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to main content
        </a>
        <Providers>
          <SiteHeader />
          <main id="main">{children}</main>
          <footer className="mt-24 border-t border-border">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between">
              <span>© 2026 Kinetic UI · MIT licensed</span>
              <nav aria-label="Footer" className="flex gap-6">
                <Link href="/docs" className="hover:text-foreground">Docs</Link>
                <Link href="/components" className="hover:text-foreground">Components</Link>
                <a href={site.github} className="hover:text-foreground">GitHub</a>
                <a href="/r/index.json" className="hover:text-foreground">Registry</a>
              </nav>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
