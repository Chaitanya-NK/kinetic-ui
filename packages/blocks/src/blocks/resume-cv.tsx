"use client";

import * as React from "react";
import { Button } from "@kineticui/ui";
import { GlobeIcon, MailIcon, MapPinIcon, PhoneIcon, PrinterIcon } from "@kineticui/icons";

const experience = [
  { role: "Senior Design Engineer", org: "Kinetic", period: "2024 — Present", points: ["Built the motion system used across 212 components and 77 blocks.", "Cut bundle size 31% by moving animations to CSS where springs weren't needed.", "Led accessibility audit; reached 99 on Lighthouse a11y across docs."] },
  { role: "Frontend Engineer", org: "Orbit", period: "2021 — 2024", points: ["Shipped the animated money-movement redesign that lifted retention 38%.", "Owned the React Native design system for 40 product engineers."] },
  { role: "UI Developer", org: "Field Studio", period: "2019 — 2021", points: ["Built marketing sites and prototypes for 20+ clients."] },
];
const skills = { Languages: "TypeScript, Swift, Python", Frameworks: "React, Next.js, React Native", Tools: "Figma, Motion, Tailwind, Playwright", Spoken: "English, Hindi, Kannada" };

/**
 * One-page résumé that prints cleanly to A4/Letter PDF: print styles hide chrome, keep colours readable and avoid
 * breaking sections across pages. "Download PDF" opens the browser's print dialog (choose "Save as PDF").
 */
export function ResumeCv() {
  return (
    <div className="flex flex-col items-center gap-4 p-6 print:p-0">
      <style>{`@media print { @page { size: A4; margin: 14mm; } body * { visibility: hidden; } .kn-cv, .kn-cv * { visibility: visible; } .kn-cv { position: absolute; inset: 0; box-shadow: none !important; border: 0 !important; } }`}</style>
      <div className="flex w-full max-w-[820px] justify-end print:hidden">
        <Button onClick={() => window.print()}><PrinterIcon size={15} /> Download PDF</Button>
      </div>
      <article className="kn-cv w-full max-w-[820px] rounded-2xl border border-border bg-white p-10 text-[#16181d] shadow-overlay print:rounded-none print:p-0">
        <header className="flex flex-wrap items-end justify-between gap-6 border-b-2 border-[#16181d] pb-6">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight">Maya Kapoor</h1>
            <p className="mt-1 text-lg text-[#4b5563]">Senior Design Engineer</p>
          </div>
          <ul className="flex flex-col gap-1 text-right text-[13px] text-[#4b5563]">
            <li className="flex items-center justify-end gap-1.5">maya@kinetic.dev <MailIcon size={12} /></li>
            <li className="flex items-center justify-end gap-1.5">+91 98765 43210 <PhoneIcon size={12} /></li>
            <li className="flex items-center justify-end gap-1.5">kinetic.dev/maya <GlobeIcon size={12} /></li>
            <li className="flex items-center justify-end gap-1.5">Bengaluru, India <MapPinIcon size={12} /></li>
          </ul>
        </header>
        <div className="mt-6 grid gap-8 md:grid-cols-[1fr_220px] print:grid-cols-[1fr_200px]">
          <div className="flex flex-col gap-6">
            <section className="break-inside-avoid">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#6b7280]">Profile</h2>
              <p className="text-[14px] leading-relaxed">Design engineer with seven years building interfaces where motion carries meaning. I work at the seam of design and code: prototyping in Figma, shipping in React, and measuring what changes for users.</p>
            </section>
            <section>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#6b7280]">Experience</h2>
              <div className="flex flex-col gap-5">
                {experience.map((e) => (
                  <div key={e.org} className="break-inside-avoid">
                    <div className="flex flex-wrap items-baseline justify-between gap-2"><span className="font-semibold">{e.role} · {e.org}</span><span className="font-mono text-xs text-[#6b7280]">{e.period}</span></div>
                    <ul className="mt-1.5 flex list-disc flex-col gap-1 pl-5 text-[13.5px] leading-relaxed text-[#374151]">{e.points.map((p) => <li key={p}>{p}</li>)}</ul>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <aside className="flex flex-col gap-6">
            <section className="break-inside-avoid">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#6b7280]">Skills</h2>
              <dl className="flex flex-col gap-2.5 text-[13px]">{Object.entries(skills).map(([k, v]) => <div key={k}><dt className="font-semibold">{k}</dt><dd className="text-[#4b5563]">{v}</dd></div>)}</dl>
            </section>
            <section className="break-inside-avoid">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#6b7280]">Education</h2>
              <div className="text-[13px]"><div className="font-semibold">B.Des, Interaction Design</div><div className="text-[#4b5563]">NID Bengaluru · 2015 — 2019</div></div>
            </section>
            <section className="break-inside-avoid">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#6b7280]">Highlights</h2>
              <ul className="flex flex-col gap-1.5 text-[13px] text-[#4b5563]"><li>Speaker, React India 2025</li><li>48k developers use my components</li><li>Awwwards Site of the Day ×2</li></ul>
            </section>
          </aside>
        </div>
      </article>
    </div>
  );
}
