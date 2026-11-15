"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button, Field, Input, RadioCard, RadioGroup, Stepper, TagInput, toast } from "@kineticui/ui";
import { ConfettiButton } from "@kineticui/motion";
import { BoltIcon, CodeIcon, UsersIcon } from "@kineticui/icons";

export type OnboardingWizardProps = {
  onComplete?: (data: { workspace: string; url: string; role: string; invites: string[] }) => void;
};

const steps = ["Workspace", "About you", "Invite team"];

/** Three-step onboarding with sliding panels, validation and a celebratory finish. */
export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = React.useState(0);
  const [dir, setDir] = React.useState(1);
  const [workspace, setWorkspace] = React.useState("Acme");
  const [role, setRole] = React.useState("engineer");
  const [invites, setInvites] = React.useState<string[]>(["maya@acme.io"]);
  const url = workspace.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const go = (n: number) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
  };

  return (
    <div className="flex min-h-[640px] items-center justify-center p-6">
      <div className="flex w-full max-w-lg flex-col gap-8">
        <Stepper steps={steps} current={step} />
        <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-7">
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              initial={{ opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -40 }}
              transition={{ type: "spring", stiffness: 400, damping: 36 }}
              className="flex flex-col gap-5"
            >
              {step === 0 ? (
                <>
                  <div>
                    <h2 className="font-display text-2xl font-semibold tracking-tight">Create your workspace</h2>
                    <p className="mt-1 text-sm text-muted">This is where your team will collaborate.</p>
                  </div>
                  <Field label="Workspace name" htmlFor="kn-ob-ws">
                    <Input id="kn-ob-ws" value={workspace} onChange={(e) => setWorkspace(e.target.value)} autoFocus />
                  </Field>
                  <Field label="URL" hint="You can change this later." htmlFor="kn-ob-url">
                    <Input id="kn-ob-url" readOnly value={url} leading={<span className="text-subtle">kinetic.app/</span>} />
                  </Field>
                </>
              ) : step === 1 ? (
                <>
                  <div>
                    <h2 className="font-display text-2xl font-semibold tracking-tight">What do you do?</h2>
                    <p className="mt-1 text-sm text-muted">We&apos;ll tailor templates to your role.</p>
                  </div>
                  <RadioGroup value={role} onValueChange={setRole} className="grid gap-2">
                    <RadioCard value="engineer" title="Engineering" description="Ship features, review code" aside={<CodeIcon size={18} />} />
                    <RadioCard value="design" title="Design" description="Prototype and hand off" aside={<BoltIcon size={18} />} />
                    <RadioCard value="lead" title="Leadership" description="Plan and track the roadmap" aside={<UsersIcon size={18} />} />
                  </RadioGroup>
                </>
              ) : (
                <>
                  <div>
                    <h2 className="font-display text-2xl font-semibold tracking-tight">Invite your team</h2>
                    <p className="mt-1 text-sm text-muted">Kinetic is better together. Press Enter after each email.</p>
                  </div>
                  <TagInput value={invites} onValueChange={setInvites} placeholder="name@company.com" />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-between">
          <Button variant="ghost" disabled={step === 0} onClick={() => go(step - 1)}>
            Back
          </Button>
          <span className="font-mono text-xs text-subtle">
            {step + 1} / {steps.length}
          </span>
          {step < steps.length - 1 ? (
            <Button disabled={step === 0 && !url} onClick={() => go(step + 1)}>
              Continue
            </Button>
          ) : (
            <ConfettiButton
              className="h-10 rounded-[10px] bg-accent px-4 text-sm font-semibold text-accent-foreground"
              onClick={() => {
                onComplete?.({ workspace, url, role, invites });
                if (!onComplete) toast({ title: `${workspace} is ready`, tone: "success" });
              }}
            >
              Finish setup
            </ConfettiButton>
          )}
        </div>
      </div>
    </div>
  );
}
