"use client";

import { ContactPage, ExperienceTimeline, FooterSimple, PeerTestimonials, PortfolioGallery, SkillsGrid } from "@kineticui/blocks";
import { BlurText, GradientText, OrbitingCircles, Particles } from "@kineticui/motion";
import { Badge, Button, Navbar } from "@kineticui/ui";
import { ArrowRightIcon, CodeIcon, CpuIcon, DatabaseIcon, GitBranchIcon, LayersIcon, PenToolIcon, SmartphoneIcon, TerminalIcon } from "@kineticui/icons";

// Replace these with your own details.
const me = {
  name: "Maya Kapoor",
  initials: "MK",
  role: "Design engineer",
  intro: "I build interfaces that feel alive: motion systems, design tools and the components behind them.",
  location: "Bengaluru, India",
};

const nav = [
  { label: "Work", href: "#work" },
  { label: "Experience", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

export default function Portfolio() {
  return (
    <main className="relative min-h-dvh bg-background text-foreground">
      <Navbar
        logo={<span className="flex size-8 items-center justify-center rounded-lg bg-accent font-display text-sm font-bold text-accent-foreground">{me.initials}</span>}
        items={nav}
        actions={<Button size="sm" variant="outline" className="rounded-full" asChild><a href="#contact">Say hello</a></Button>}
      />

      <section className="relative mx-auto grid min-h-[760px] max-w-6xl items-center gap-12 overflow-hidden px-6 pb-16 pt-32 lg:grid-cols-[1.2fr_1fr]">
        <Particles density={22} className="opacity-60" />
        <div className="relative flex flex-col gap-6">
          <Badge variant="soft" dot="pulse" className="w-fit">Available for new projects</Badge>
          <BlurText text={`Hi, I'm ${me.name}.`} as="h1" className="font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl" />
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            <GradientText>{me.role}</GradientText> in {me.location.split(",")[0]}
          </h2>
          <p className="max-w-lg text-lg leading-relaxed text-muted">{me.intro}</p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" className="rounded-full" asChild><a href="#work">See my work <ArrowRightIcon size={16} /></a></Button>
            <Button size="lg" variant="ghost" className="rounded-full" asChild><a href="#contact">Get in touch</a></Button>
          </div>
        </div>
        <div className="relative mx-auto flex size-[360px] max-w-full items-center justify-center">
          <span className="z-10 flex size-24 items-center justify-center rounded-3xl bg-accent font-display text-3xl font-bold text-accent-foreground shadow-[0_0_80px_-10px_var(--kn-accent)]">{me.initials}</span>
          <OrbitingCircles radius={90} duration={20} iconSize={40}>
            <CodeIcon /><PenToolIcon /><LayersIcon />
          </OrbitingCircles>
          <OrbitingCircles radius={160} duration={34} reverse iconSize={46} offset={20}>
            <TerminalIcon /><DatabaseIcon /><SmartphoneIcon /><GitBranchIcon /><CpuIcon />
          </OrbitingCircles>
        </div>
      </section>

      <section id="work" className="scroll-mt-24 py-12">
        <PortfolioGallery />
      </section>

      <section id="experience" className="scroll-mt-24 py-12">
        <ExperienceTimeline />
      </section>

      <section id="skills" className="scroll-mt-24 py-12">
        <SkillsGrid />
      </section>

      <section className="py-12">
        <PeerTestimonials />
      </section>

      <section id="contact" className="scroll-mt-24 py-12">
        <ContactPage />
      </section>

      <FooterSimple brand={me.name} links={nav} />
    </main>
  );
}
