"use client";

import * as React from "react";
import { motion } from "motion/react";
import { ComposeForm, ContactMethods, TerminalContact, toast, type ContactInfo } from "@kineticui/ui";

const defaultContact: ContactInfo = {
  name: "Maya Kapoor",
  title: "Design Engineer",
  org: "Kinetic Labs",
  email: "maya@kinetic.dev",
  phone: "+91 98765 43210",
  location: "Bengaluru, India",
  website: "https://kinetic-ui.vercel.app",
  socials: [
    { url: "https://www.linkedin.com/in/maya-kapoor" },
    { url: "https://github.com/maya-kapoor" },
    { url: "https://x.com/mayakapoor", label: "x-twitter" },
    { url: "https://instagram.com/maya.designs" },
  ],
};

export type ContactPageProps = {
  contact?: ContactInfo;
  /** Sends the compose form. Wire this to your API route, Resend, Formspree… */
  onSend?: (data: { name: string; email: string; topic: string; message: string; files: File[] }) => Promise<void> | void;
  /** Bot-check widget (e.g. Cloudflare Turnstile) and whether it has passed. */
  verification?: React.ReactNode;
  verified?: boolean;
  /** IANA zone for the "it's 4:12 pm here" line. */
  timeZone?: string;
};

/** Portfolio contact page: a terminal-style contact card beside an email-style compose form. */
export function ContactPage({ contact = defaultContact, onSend, verification, verified, timeZone = "Asia/Kolkata" }: ContactPageProps) {
  return (
    <section className="mx-auto flex min-h-[860px] max-w-6xl flex-col gap-10 px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-accent">Contact</span>
        <h1 className="max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">Let&apos;s build something together.</h1>
        <p className="max-w-xl text-lg text-muted">Pick whatever&apos;s easiest: copy my details, save my card, or send a note right here.</p>
      </motion.div>
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.15fr]">
        <div className="flex flex-col gap-6">
          <TerminalContact contact={contact} />
          <ContactMethods
            timeZone={timeZone}
            methods={[
              ...(contact.email ? [{ kind: "email" as const, value: contact.email, hint: "Replies within a day" }] : []),
              ...(contact.phone ? [{ kind: "whatsapp" as const, value: contact.phone, hint: "Quick questions" }] : []),
            ]}
          />
        </div>
        <ComposeForm
          to={{ name: contact.name }}
          verification={verification}
          verified={verified}
          onSubmit={async (d) => {
            if (onSend) return onSend(d);
            await toast.promise(new Promise((r) => setTimeout(r, 1000)), { loading: "Sending…", success: "Message sent", error: "Couldn't send" });
          }}
        />
      </div>
    </section>
  );
}
