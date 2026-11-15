"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Button } from "@kineticui/ui";
import { Magnetic } from "@kineticui/motion";
import { ArrowUpRightIcon } from "@kineticui/icons";

/** Statement footer: oversized brand word, a big CTA and compact link rows. */
export function FooterBigCta({ brand = "Kinetic", email = "hello@kinetic.app" }: { brand?: string; email?: string }) {
  return (
    <footer className="relative overflow-hidden border-t border-border pt-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Have a project in mind? Let&apos;s make it move.</h2>
          <Magnetic>
            <Button size="lg" className="h-14 rounded-full px-8 text-base" asChild>
              <a href={`mailto:${email}`}>
                {email} <ArrowUpRightIcon size={18} />
              </a>
            </Button>
          </Magnetic>
        </div>
        <div className="grid grid-cols-2 gap-6 border-t border-border pt-8 text-sm sm:grid-cols-4">
          {[
            ["Studio", "Bengaluru · Lisbon"],
            ["Social", "GitHub · X · Dribbble"],
            ["Work", "Case studies · Process"],
            ["Legal", "Privacy · Terms"],
          ].map(([h, v]) => (
            <div key={h} className="flex flex-col gap-1">
              <span className="font-mono text-[11px] uppercase tracking-wider text-subtle">{h}</span>
              <span className="text-muted">{v}</span>
            </div>
          ))}
        </div>
      </div>
      <motion.div
        aria-hidden
        initial={{ y: "40%", opacity: 0 }}
        whileInView={{ y: "18%", opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 60, damping: 18 }}
        className="pointer-events-none select-none text-center font-display text-[22vw] font-bold leading-none tracking-tighter text-transparent [-webkit-text-stroke:1px_var(--kn-border-strong)] lg:text-[260px]"
      >
        {brand.toUpperCase()}
      </motion.div>
    </footer>
  );
}
