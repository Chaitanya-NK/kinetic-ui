"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Button, CopyButton } from "@kineticui/ui";
import { AlertIcon, RefreshIcon } from "@kineticui/icons";

/** 500 page: glitching status code, retry with countdown, and a copyable error reference for support. */
export function Error500({ errorId = "err_7Q2k9xL4", onRetry }: { errorId?: string; onRetry?: () => void }) {
  const [seconds, setSeconds] = React.useState(15);
  React.useEffect(() => {
    if (seconds <= 0) return;
    const t = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [seconds]);
  const retry = () => (onRetry ? onRetry() : window.location.reload());

  return (
    <section className="flex min-h-[640px] flex-col items-center justify-center gap-7 px-6 py-20 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-danger-soft text-danger">
        <AlertIcon size={26} />
      </span>
      <div className="relative font-display text-8xl font-bold tracking-tighter" aria-hidden>
        <span>500</span>
        <motion.span className="absolute inset-0 text-danger mix-blend-screen" animate={{ x: [0, -3, 2, 0, 0], opacity: [0, 0.8, 0.6, 0, 0] }} transition={{ duration: 2.4, repeat: Infinity, times: [0, 0.05, 0.1, 0.15, 1] }}>500</motion.span>
        <motion.span className="absolute inset-0 text-info mix-blend-screen" animate={{ x: [0, 3, -2, 0, 0], opacity: [0, 0.8, 0.6, 0, 0] }} transition={{ duration: 2.4, repeat: Infinity, times: [0, 0.05, 0.1, 0.15, 1], delay: 0.05 }}>500</motion.span>
      </div>
      <div className="flex max-w-md flex-col gap-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Something broke on our end</h1>
        <p className="text-muted">It&apos;s not you. Our team has been alerted and is already looking into it.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={retry}>
          <RefreshIcon size={15} /> {seconds > 0 ? `Retry (${seconds})` : "Retry now"}
        </Button>
        <Button variant="secondary" asChild>
          <a href="#status">System status</a>
        </Button>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-surface py-1.5 pl-3 pr-1.5 text-sm">
        <span className="text-subtle">Error ID</span>
        <code className="font-mono text-foreground">{errorId}</code>
        <CopyButton value={errorId} />
      </div>
    </section>
  );
}
