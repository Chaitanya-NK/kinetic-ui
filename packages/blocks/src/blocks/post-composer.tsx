"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { Avatar, Button, Select, toast } from "@kineticui/ui";
import { CalendarIcon, GlobeIcon, ImageIcon, XIcon } from "@kineticui/icons";

const LIMIT = 280;

/** Social post composer: character ring, image attachments with previews, audience and schedule. */
export function PostComposer() {
  const [text, setText] = React.useState("Kinetic 2.0 is live: 120 components, AI blocks and charts with zero dependencies.");
  const [images, setImages] = React.useState<string[]>([]);
  const [audience, setAudience] = React.useState("everyone");
  const input = React.useRef<HTMLInputElement>(null);
  const left = LIMIT - text.length;
  const pct = Math.min(1, text.length / LIMIT);
  const r = 10;
  const c = 2 * Math.PI * r;

  return (
    <section className="flex min-h-[520px] items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-3xl border border-border bg-surface p-5">
        <div className="flex gap-3">
          <Avatar alt="Maya Kapoor" color="#7C8CFF" />
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <Select className="h-8 w-fit rounded-full border-accent/40 px-3 text-xs text-accent" value={audience} onValueChange={setAudience} options={[{ value: "everyone", label: "Everyone" }, { value: "followers", label: "Followers" }, { value: "team", label: "Only my team" }]} />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="What's happening?"
              aria-label="Post"
              className="resize-none bg-transparent text-lg leading-relaxed outline-none placeholder:text-subtle"
            />
            <AnimatePresence>
              {images.length ? (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className={cn("grid gap-2", images.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
                  {images.map((src) => (
                    <motion.div layout key={src} className="relative aspect-video overflow-hidden rounded-2xl">
                      <img src={src} alt="" className="size-full object-cover" />
                      <button type="button" aria-label="Remove image" onClick={() => setImages((x) => x.filter((y) => y !== src))} className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white">
                        <XIcon size={14} />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
            <span className="flex items-center gap-1.5 text-xs text-accent"><GlobeIcon size={13} /> {audience === "everyone" ? "Everyone can reply" : "Limited replies"}</span>
            <div className="flex items-center gap-1 border-t border-border pt-3">
              <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { const f = Array.from(e.target.files ?? []).slice(0, 4 - images.length); setImages((x) => [...x, ...f.map((file) => URL.createObjectURL(file))]); e.target.value = ""; }} />
              <Button variant="ghost" size="icon-sm" aria-label="Add image" disabled={images.length >= 4} onClick={() => input.current?.click()}><ImageIcon size={17} className="text-accent" /></Button>
              <Button variant="ghost" size="icon-sm" aria-label="Schedule" onClick={() => toast("Scheduling coming soon")}><CalendarIcon size={17} className="text-accent" /></Button>
              <div className="ml-auto flex items-center gap-3">
                <span className="relative flex size-7 items-center justify-center" aria-label={`${left} characters left`}>
                  <svg viewBox="0 0 24 24" className="absolute inset-0 -rotate-90" aria-hidden>
                    <circle cx="12" cy="12" r={r} fill="none" stroke="var(--kn-border)" strokeWidth="2.5" />
                    <motion.circle cx="12" cy="12" r={r} fill="none" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={c} animate={{ strokeDashoffset: c * (1 - pct), stroke: left < 0 ? "var(--kn-danger)" : left < 20 ? "var(--kn-warning)" : "var(--kn-accent)" }} />
                  </svg>
                  {left < 20 ? <span className={cn("font-mono text-[10px]", left < 0 && "text-danger")}>{left}</span> : null}
                </span>
                <Button className="rounded-full" disabled={!text.trim() || left < 0} onClick={() => { toast({ title: "Posted", tone: "success" }); setText(""); setImages([]); }}>Post</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
