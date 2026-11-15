"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button, CopyButton, OtpInput, QrCode, Stepper } from "@kineticui/ui";
import { CheckIcon, DownloadIcon, LockIcon } from "@kineticui/icons";

const recovery = ["7KQ2-9XLM", "P4TN-8HDA", "ZQ7R-2MVC", "B9WE-6JUF", "H3YK-5NQP", "M8CS-4TRG"];

/** Two-factor setup: scan a QR code, verify a 6-digit code (try 123456), then save recovery codes. */
export function TwoFactor({
  secret = "JBSWY3DPEHPK3PXP",
  account = "maya@acme.io",
  issuer = "Kinetic",
  onVerify,
}: {
  secret?: string;
  account?: string;
  issuer?: string;
  /** Return true if the code is valid. Defaults to accepting 123456. */
  onVerify?: (code: string) => Promise<boolean> | boolean;
}) {
  const [step, setStep] = React.useState(0);
  const [code, setCode] = React.useState("");
  const [invalid, setInvalid] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const uri = `otpauth://totp/${encodeURIComponent(`${issuer}:${account}`)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;

  const verify = async (value: string) => {
    setBusy(true);
    const ok = await (onVerify?.(value) ?? new Promise<boolean>((r) => setTimeout(() => r(value === "123456"), 700)));
    setBusy(false);
    if (ok) setStep(2);
    else {
      setInvalid(true);
      setCode("");
    }
  };

  return (
    <section className="flex min-h-[700px] items-center justify-center p-6">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-3xl border border-border bg-surface p-7">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent"><LockIcon size={18} /></span>
          <div>
            <h1 className="font-semibold">Two-factor authentication</h1>
            <p className="text-sm text-muted">Add a second step to keep your account safe.</p>
          </div>
        </div>
        <Stepper steps={["Scan", "Verify", "Save codes"]} current={step} />
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-5">
            {step === 0 ? (
              <>
                <p className="text-sm text-muted">Scan this QR code with an authenticator app like 1Password, Authy or Google Authenticator.</p>
                <div className="mx-auto rounded-2xl bg-white p-3 text-[#0b0c0e]">
                  <QrCode value={uri} size={168} />
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-1.5 pl-3 text-xs">
                  <span className="text-subtle">Or enter</span>
                  <code className="flex-1 font-mono tracking-wider">{secret.replace(/(.{4})/g, "$1 ").trim()}</code>
                  <CopyButton value={secret} />
                </div>
                <Button size="lg" onClick={() => setStep(1)}>I&apos;ve scanned it</Button>
              </>
            ) : step === 1 ? (
              <>
                <p className="text-sm text-muted">Enter the 6-digit code from your app.</p>
                <OtpInput length={6} groupAfter={3} value={code} onChange={(v) => { setCode(v); setInvalid(false); }} onComplete={(v) => void verify(v)} invalid={invalid} autoFocus disabled={busy} className="justify-center" />
                <p className="h-4 text-center text-xs">{invalid ? <span className="text-danger">That code didn&apos;t work. Try again.</span> : busy ? <span className="text-subtle">Verifying…</span> : <span className="text-subtle">Tip: the demo accepts 123456</span>}</p>
                <Button variant="ghost" onClick={() => setStep(0)}>Back</Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 rounded-xl bg-success-soft p-3 text-sm text-success">
                  <CheckIcon size={16} /> Two-factor is on.
                </div>
                <p className="text-sm text-muted">Save these recovery codes somewhere safe. Each works once if you lose your device.</p>
                <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-background p-4 font-mono text-sm">
                  {recovery.map((c, i) => (
                    <motion.span key={c} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}>{c}</motion.span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <CopyButton value={recovery.join("\n")} label="Copy codes" className="h-10 flex-1 justify-center" />
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      const a = document.createElement("a");
                      a.href = URL.createObjectURL(new Blob([recovery.join("\n")], { type: "text/plain" }));
                      a.download = `${issuer.toLowerCase()}-recovery-codes.txt`;
                      a.click();
                    }}
                  >
                    <DownloadIcon size={15} /> Download
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
