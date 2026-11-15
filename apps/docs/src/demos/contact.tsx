"use client";

import * as React from "react";
import {
  ChatContact,
  ComposeForm,
  ContactCard,
  ContactMethods,
  ContactWidget,
  MacWindow,
  SocialIcon,
  TerminalContact,
  VCardButton,
  buildVCard,
  toast,
  type ContactInfo,
} from "@kineticui/ui";
import { CalendarIcon, MailIcon } from "@kineticui/icons";

export const demoContact: ContactInfo = {
  name: "Maya Kapoor",
  title: "Design Engineer",
  org: "Kinetic Labs",
  email: "maya@kinetic.dev",
  phone: "+91 98765 43210",
  website: "https://kinetic-ui.vercel.app",
  location: "Bengaluru, India",
  socials: [
    { url: "https://www.linkedin.com/in/maya-kapoor" },
    { url: "https://github.com/maya-kapoor" },
    { url: "https://x.com/mayakapoor", label: "x-twitter" },
    { url: "https://instagram.com/maya.designs" },
  ],
};

const fakeSend = () => new Promise<void>((r) => setTimeout(r, 1100));

/** Stand-in for a real bot check (Turnstile, hCaptcha…): passes after a moment. */
export function DemoVerification({ onVerified }: { onVerified: () => void }) {
  const [ok, setOk] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => {
      setOk(true);
      onVerified();
    }, 2200);
    return () => clearTimeout(t);
  }, [onVerified]);
  return (
    <div className="flex h-16 w-full max-w-xs items-center gap-3 rounded-lg border border-border bg-surface-raised px-4 text-sm">
      {ok ? (
        <span className="flex size-6 items-center justify-center rounded-full bg-success text-background">✓</span>
      ) : (
        <span className="size-6 rounded-full border-2 border-dashed border-success animate-kn-spin" />
      )}
      <span>{ok ? "Success!" : "Verifying…"}</span>
      <span className="ml-auto font-mono text-[10px] uppercase text-subtle">Human check</span>
    </div>
  );
}

function ComposeDemo() {
  const [verified, setVerified] = React.useState(false);
  const onVerified = React.useCallback(() => setVerified(true), []);
  return (
    <ComposeForm
      className="w-full max-w-3xl"
      to={{ name: demoContact.name }}
      verification={<DemoVerification onVerified={onVerified} />}
      verified={verified}
      placeholders={{ Hiring: "Tell me about the role, team and timeline…", Freelance: "What are you building, and by when?" }}
      onSubmit={() => toast.promise(fakeSend(), { loading: "Sending…", success: "Message sent", error: "Couldn't send" })}
    />
  );
}

export const contactDemos: Record<string, () => React.ReactNode> = {
  "terminal-contact": () => (
    <div className="flex w-full flex-col gap-6">
      <TerminalContact className="w-full max-w-2xl self-center" contact={demoContact} onMessage={() => fakeSend()} />
      <TerminalContact className="w-full max-w-2xl self-center" tone="dark" animate={false} contact={demoContact} title="maya@kinetic — zsh" />
      <p className="text-center text-xs text-subtle">Click inside and type <code className="font-mono">help</code>. Try <code className="font-mono">open github</code>, <code className="font-mono">vcard</code> or <code className="font-mono">message hi!</code></p>
    </div>
  ),
  "compose-form": () => <ComposeDemo />,
  vcard: () => (
    <div className="flex w-full flex-col items-center gap-8">
      <ContactCard contact={demoContact} />
      <div className="flex flex-wrap items-center justify-center gap-3">
        <VCardButton contact={demoContact} onDownloaded={() => toast.success("maya-kapoor.vcf downloaded")} />
        <VCardButton contact={demoContact} className="border border-border-strong bg-transparent text-foreground">Add to contacts</VCardButton>
      </div>
      <details className="w-full max-w-md text-xs">
        <summary className="cursor-pointer text-subtle">Preview the generated .vcf</summary>
        <pre className="mt-2 overflow-x-auto rounded-xl border border-border bg-surface p-3 font-mono text-muted">{buildVCard(demoContact)}</pre>
      </details>
    </div>
  ),
  "mac-window": () => (
    <div className="grid w-full max-w-3xl gap-5 md:grid-cols-2">
      <MacWindow title="notes.md" tone="light" bodyClassName="p-5 text-sm leading-relaxed">
        A light window for docs, notes and contact cards.
      </MacWindow>
      <MacWindow title="~/projects — zsh" tone="dark" mono bodyClassName="p-5 text-[13px] leading-6">
        <div><span className="text-accent">❯</span> npm i @kineticui/ui</div>
        <div className="text-white/50">added 1 package in 0.8s</div>
      </MacWindow>
      <MacWindow title="Preferences" className="md:col-span-2" onClose={() => toast("Close")} bodyClassName="p-5 text-sm text-muted">
        tone=&quot;auto&quot; follows your theme. Hover the traffic lights to see their glyphs.
      </MacWindow>
    </div>
  ),
  "chat-contact": () => <ChatContact host={{ name: "Maya", status: "Online · replies in a few hours" }} onComplete={() => fakeSend()} />,
  "contact-methods": () => (
    <ContactMethods
      className="w-full max-w-2xl"
      timeZone="Asia/Kolkata"
      methods={[
        { kind: "email", value: "maya@kinetic.dev", hint: "Best for project enquiries" },
        { kind: "whatsapp", value: "+91 98765 43210", hint: "Quick questions" },
        { kind: "calendar", label: "Book a call", value: "https://cal.com/maya", hint: "30 min intro" },
        { kind: "location", value: "Bengaluru, India", hint: "Open to remote work" },
      ]}
    />
  ),
  "social-icons": () => (
    <div className="flex flex-wrap justify-center gap-3">
      {(["linkedin", "github", "x", "instagram", "youtube", "dribbble", "whatsapp", "telegram", "mail", "globe"] as const).map((n) => (
        <span key={n} className="flex size-12 items-center justify-center rounded-xl border border-border bg-surface text-muted transition-colors hover:text-foreground" title={n}>
          <SocialIcon network={n} size={20} />
        </span>
      ))}
    </div>
  ),
  "contact-widget": () => (
    <div className="flex h-[560px] w-full items-end justify-end">
      <ContactWidget
        fixed={false}
        defaultOpen
        host={{ name: "Maya Kapoor", role: "Design Engineer" }}
        links={[
          { label: "Email me", href: "mailto:maya@kinetic.dev", icon: <MailIcon />, description: "maya@kinetic.dev" },
          { label: "Book a 30-min call", href: "https://cal.com/maya", icon: <CalendarIcon />, description: "Usually available this week" },
        ]}
        onSubmit={() => fakeSend()}
      />
    </div>
  ),
};
