"use client";

import * as React from "react";
import { motion } from "motion/react";
import { AuroraBackground, HoloCard, KineticType } from "@kineticui/motion";
import { Button, DynamicIsland, Input, SocialIcon, SoundProvider, SoundToggle, Stories, islandMusic, useSound, type SocialNetwork, type Story } from "@kineticui/ui";
import { ArrowUpRightIcon, BookmarkIcon, CalendarIcon, CheckIcon, MapPinIcon, PlayIcon, ShoppingBagIcon, SparkleIcon } from "@kineticui/icons";

// Replace these with your own details.
const me = {
  name: "Maya Kapoor",
  initials: "MK",
  handle: "@maya.builds",
  role: "Design engineer",
  bio: "I make interfaces that move. Components, motion systems and the occasional tiny game.",
  location: "Bengaluru",
};

const socials: { network: SocialNetwork; href: string; label: string }[] = [
  { network: "github", href: "https://github.com/", label: "GitHub" },
  { network: "x", href: "https://x.com/", label: "X" },
  { network: "instagram", href: "https://instagram.com/", label: "Instagram" },
  { network: "youtube", href: "https://youtube.com/", label: "YouTube" },
  { network: "dribbble", href: "https://dribbble.com/", label: "Dribbble" },
];

const links = [
  { title: "Motion course: early access", sub: "12 lessons on building UI that feels alive", href: "#", icon: PlayIcon, featured: true },
  { title: "Book a design review", sub: "30 minutes, async or live", href: "#", icon: CalendarIcon },
  { title: "My component kit", sub: "Everything I use, open source", href: "#", icon: SparkleIcon },
  { title: "Desk setup", sub: "Keyboard, monitor, lights", href: "#", icon: ShoppingBagIcon },
  { title: "Reading list", sub: "Books that changed how I design", href: "#", icon: BookmarkIcon },
];

const slide = (bg: string, title: string, body: string) => (
  <div className="flex size-full flex-col justify-end gap-2 p-7 pb-16 text-white" style={{ background: bg }}>
    <div className="font-display text-3xl font-bold leading-tight tracking-tight">{title}</div>
    <div className="text-sm text-white/75">{body}</div>
  </div>
);

const highlights: Story[] = [
  {
    id: "launch",
    name: "Launch",
    items: [
      { id: "l1", content: slide("radial-gradient(120% 90% at 0% 0%, #6b8f12, #12160a 60%)", "Kit v2 is live", "Forty new components, all motion-first."), time: "2d" },
      { id: "l2", content: slide("linear-gradient(160deg, #1d2b55, #0b0d16)", "Thank you", "3,000 stars in a week. Wild."), time: "2d" },
    ],
  },
  { id: "studio", name: "Studio", items: [{ id: "s1", content: slide("linear-gradient(170deg, #3d2a0f, #140e08)", "New desk", "Finally, a standing setup."), time: "5d" }] },
  { id: "talks", name: "Talks", items: [{ id: "t1", content: slide("linear-gradient(170deg, #2a1452, #0d0818)", "Kinetic Conf", "Speaking on motion at scale, March 14."), time: "1w" }] },
  { id: "travel", name: "Travel", items: [{ id: "v1", content: slide("linear-gradient(170deg, #0f3d3a, #081514)", "Kyoto", "Notes on wayfinding and type."), time: "3w" }] },
];

function LinkCard({ link, index }: { link: (typeof links)[number]; index: number }) {
  const { play } = useSound();
  const Icon = link.icon;
  return (
    <motion.a
      href={link.href}
      onClick={() => play("tap")}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 + index * 0.06, type: "spring", stiffness: 260, damping: 24 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={
        link.featured
          ? "group relative flex items-center gap-4 overflow-hidden rounded-2xl bg-accent p-4 text-accent-foreground shadow-[0_10px_40px_-12px_var(--kn-accent)]"
          : "group flex items-center gap-4 rounded-2xl border border-border bg-surface-raised/80 p-4 backdrop-blur transition-colors hover:border-border-strong"
      }
    >
      <span className={link.featured ? "grid size-11 shrink-0 place-items-center rounded-xl bg-black/15" : "grid size-11 shrink-0 place-items-center rounded-xl bg-surface-overlay text-accent"}>
        <Icon size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold">{link.title}</span>
        <span className={link.featured ? "block truncate text-sm opacity-75" : "block truncate text-sm text-muted"}>{link.sub}</span>
      </span>
      <ArrowUpRightIcon size={18} className="shrink-0 opacity-60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
    </motion.a>
  );
}

function Newsletter() {
  const { play } = useSound();
  const [done, setDone] = React.useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
        play("success");
      }}
      className="rounded-2xl border border-border bg-surface-raised/80 p-5 backdrop-blur"
    >
      <div className="font-display text-lg font-semibold">One email a month</div>
      <p className="mt-1 text-sm text-muted">What I built, what I learned, no fluff.</p>
      {done ? (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center gap-2 text-sm font-medium text-accent">
          <CheckIcon size={16} /> You&apos;re in. See you next month.
        </motion.div>
      ) : (
        <div className="mt-4 flex gap-2">
          <Input type="email" required placeholder="you@example.com" aria-label="Email address" wrapperClassName="min-w-0 flex-1" className="min-w-0" />
          <Button type="submit" className="shrink-0">Subscribe</Button>
        </div>
      )}
    </form>
  );
}

export default function LinkInBio() {
  const [playing, setPlaying] = React.useState(true);
  return (
    <SoundProvider>
      <main className="relative min-h-dvh overflow-hidden bg-background text-foreground">
        <AuroraBackground intensity={0.4} />
        <DynamicIsland fixed activity={islandMusic({ title: "Late Night Build", artist: "Maya's focus mix", playing, progress: 0.38, onToggle: () => setPlaying((p) => !p) })} />

        <div className="relative mx-auto flex max-w-md flex-col gap-6 px-5 pb-16 pt-24">
          <div className="flex justify-center">
            <HoloCard foil="sparkle" intensity={0.55} className="w-full max-w-[22rem]">
              <div className="flex flex-col items-center bg-[radial-gradient(120%_80%_at_50%_0%,color-mix(in_oklab,var(--kn-accent)_22%,transparent),transparent_60%),var(--kn-surface-raised)] px-6 pb-6 pt-8 text-center">
                <span className="grid size-24 place-items-center rounded-full bg-accent font-display text-3xl font-bold text-accent-foreground shadow-[0_0_60px_-8px_var(--kn-accent)]">
                  {me.initials}
                </span>
                <KineticType text={me.name} as="h1" effect="weight" minWeight={500} maxWeight={800} className="mt-5 font-display text-3xl font-semibold tracking-tight" />
                <div className="mt-1 font-mono text-xs text-subtle">{me.handle}</div>
                <p className="mt-3 text-sm leading-relaxed text-muted">{me.bio}</p>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-subtle">
                  <MapPinIcon size={13} /> {me.location} · {me.role}
                </div>
              </div>
            </HoloCard>
          </div>

          <div className="flex items-center justify-center gap-2">
            {socials.map((s) => (
              <a
                key={s.network}
                href={s.href}
                aria-label={s.label}
                target="_blank"
                rel="noreferrer"
                className="grid size-10 place-items-center rounded-full border border-border bg-surface-raised/80 text-muted transition-colors hover:border-accent hover:text-accent"
              >
                <SocialIcon network={s.network} size={16} />
              </a>
            ))}
          </div>

          <Stories stories={highlights} className="justify-center" />

          <nav aria-label="Links" className="flex flex-col gap-3">
            {links.map((l, i) => (
              <LinkCard key={l.title} link={l} index={i} />
            ))}
          </nav>

          <Newsletter />

          <footer className="flex items-center justify-between pt-2 text-xs text-subtle">
            <span>© {new Date().getFullYear()} {me.name}</span>
            <SoundToggle />
          </footer>
        </div>
      </main>
    </SoundProvider>
  );
}
