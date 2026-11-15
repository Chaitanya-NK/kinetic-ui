import * as React from "react";

/** One-line footer: brand, links and copyright. */
export function FooterSimple({
  brand = "Kinetic",
  links = [
    { label: "Docs", href: "#docs" },
    { label: "Components", href: "#components" },
    { label: "Blog", href: "#blog" },
    { label: "Privacy", href: "#privacy" },
  ],
}: {
  brand?: string;
  links?: { label: string; href: string }[];
}) {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-10 sm:flex-row sm:justify-between">
        <a href="#top" className="flex items-center gap-2 font-display font-semibold">
          <span className="flex size-7 items-center justify-center rounded-lg bg-accent text-sm font-bold text-accent-foreground">{brand[0]}</span>
          {brand}
        </a>
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-6 text-sm text-muted">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <span className="text-sm text-subtle">© 2026 {brand}</span>
      </div>
    </footer>
  );
}
