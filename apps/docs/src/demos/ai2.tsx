"use client";

import * as React from "react";
import {
  AIChat,
  ArtifactPanel,
  Button,
  ChatMessage,
  CodeBlock,
  ContextMeter,
  Conversation,
  MessageBranch,
  WebPreview,
  useMockChat,
  type AIMessagePart,
  type ArtifactVersion,
} from "@kineticui/ui";
import { CodeIcon, FileTextIcon, PlusIcon } from "@kineticui/icons";

/* ---------------------------------------------------------------- ai-chat */

const script = (input: string, turn: number): AIMessagePart[] =>
  !/deploy|ship|preview/i.test(input)
    ? [
        { type: "reasoning", text: `The user asked: "${input}". I should check the Kinetic docs for the animation guidance, then answer briefly with a code example.` },
        { type: "tool-search_docs", toolCallId: `t${turn}`, title: "Searched the docs", state: "output-available", input: { query: "spring animation list" }, output: { results: 3, top: "/docs/motion" } },
        {
          type: "text",
          text: "Use a **spring** with high stiffness and moderate damping so items settle quickly without wobbling.\n\n- `stiffness: 500` keeps it snappy\n- `damping: 34` removes the overshoot\n- Stagger children by about 40 ms\n\nThe `SortableList` component already uses these values.",
        },
        { type: "source-url", sourceId: "s1", url: "https://kinetic-ui.chaitanya-nk.com/docs/motion", title: "Motion tokens" },
        { type: "source-url", sourceId: "s2", url: "https://motion.dev/docs/react-transitions", title: "Transitions" },
      ]
    : [
        { type: "text", text: "I can deploy a preview so you can try it on your phone." },
        { type: "tool-deploy_preview", toolCallId: `t${turn}`, title: "Deploy a preview", state: "output-available", approval: { id: `t${turn}` }, input: { branch: "feat/sortable", env: "preview" }, output: { url: "https://kinetic-git-feat-sortable.vercel.app", ms: 41200 } },
        { type: "text", text: "Done. The preview is live and will update on every push to the branch." },
      ];

function AIChatDemo() {
  const chat = useMockChat(script);
  const used = chat.messages.reduce((n, m) => n + m.parts.reduce((k, p) => k + ("text" in p ? p.text.length : 40), 0), 0) * 9 + 18_000;
  return (
    <div className="flex h-[560px] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-background">
      <AIChat
        chat={chat}
        className="flex-1"
        assistantName="Kinetic"
        empty={{
          title: "What are we building?",
          description: "Wired to useChat() from the AI SDK. This demo streams scripted replies.",
          suggestions: [
            { title: "Animate a list", prompt: "How should I animate a sortable list?" },
            { title: "Ship it", prompt: "Deploy a preview of my branch" },
          ],
        }}
        toolbar={<ContextMeter used={used} max={200_000} modelName="Kinetic Large" usage={{ inputTokens: Math.round(used * 0.8), outputTokens: Math.round(used * 0.2), cachedInputTokens: 12_000 }} pricing={{ input: 3, output: 15, cachedInput: 0.3 }} />}
      />
    </div>
  );
}

/* ---------------------------------------------------------------- conversation */

const lines = [
  "Can you summarise the release notes?",
  "Sure. 0.2 adds forms, sortable lists, resizable panels and virtualised tables.",
  "Which one is the biggest change?",
  "The form layer. It wires React Hook Form to every Kinetic input with animated errors.",
  "Does it work with zod?",
  "Yes, and with valibot, yup or anything that has a resolver.",
  "Nice. What about the AI pieces?",
  "AIChat takes useChat() straight from the AI SDK and renders every message part.",
];

function ConversationDemo() {
  const [msgs, setMsgs] = React.useState(lines.slice(0, 6));
  return (
    <div className="flex h-[420px] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-background">
      <Conversation>
        {msgs.map((t, i) => (
          <ChatMessage key={i} role={i % 2 ? "assistant" : "user"} content={t} />
        ))}
      </Conversation>
      <div className="flex items-center justify-between gap-2 border-t border-border p-3">
        <span className="text-xs text-subtle">Scroll up, then add a message.</span>
        <Button size="sm" onClick={() => setMsgs((m) => [...m, lines[m.length % lines.length]!])}>
          <PlusIcon /> Add message
        </Button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- branch */

const answers = [
  "Use `transform` and `opacity` for anything that animates often. They stay on the compositor, so the main thread is free.",
  "Short version: animate transform and opacity, never width or top. Wrap layout changes in FLIP (motion's `layout` prop does this).",
  "Three rules: compositor-only properties, springs instead of long eases, and respect `prefers-reduced-motion`.",
];

function BranchDemo() {
  const [n, setN] = React.useState(2);
  return (
    <div className="flex w-full max-w-xl flex-col gap-6">
      <ChatMessage role="user" content="How do I keep animations smooth?" />
      <ChatMessage
        role="assistant"
        onRetry={() => setN((x) => Math.min(answers.length, x + 1))}
        content={<MessageBranch branches={answers.slice(0, n).map((a, i) => <ChatText key={i} text={a} />)} />}
      />
    </div>
  );
}
const ChatText = ({ text }: { text: string }) => <p className="text-foreground/90">{text.split("`").map((s, i) => (i % 2 ? <code key={i} className="rounded bg-surface-overlay px-1 font-mono text-[13px] text-accent">{s}</code> : s))}</p>;

/* ---------------------------------------------------------------- web preview */

function FakeSite({ dark }: { dark: boolean }) {
  return (
    <div className={`flex size-full flex-col gap-6 overflow-auto p-6 ${dark ? "bg-[#0b0b0c] text-white" : "bg-white text-zinc-900"}`}>
      <nav className="flex items-center justify-between text-sm">
        <b>Northwind</b>
        <span className="hidden gap-5 opacity-70 sm:flex"><span>Product</span><span>Pricing</span><span>Docs</span></span>
        <span className="rounded-full bg-[#C6F432] px-3 py-1 text-xs font-semibold text-black">Sign up</span>
      </nav>
      <div className="flex flex-col gap-3 pt-6">
        <span className="w-fit rounded-full border border-current/20 px-3 py-1 text-[11px] opacity-70">Generated in 41s</span>
        <h1 className="max-w-md font-display text-4xl font-semibold leading-tight tracking-tight">Ship your roadmap, not your meetings.</h1>
        <p className="max-w-sm text-sm opacity-60">Plan, track and launch in one quiet workspace.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {["Roadmaps", "Docs", "Releases"].map((t) => (
          <div key={t} className={`rounded-xl p-4 text-sm ${dark ? "bg-white/5" : "bg-zinc-100"}`}><b>{t}</b><p className="mt-1 text-xs opacity-60">Everything in one place.</p></div>
        ))}
      </div>
    </div>
  );
}

function WebPreviewDemo() {
  const [loading, setLoading] = React.useState(false);
  const [dark, setDark] = React.useState(true);
  return (
    <div className="flex w-full max-w-4xl flex-col gap-3">
      <WebPreview
        url="https://northwind-preview.vercel.app"
        loading={loading}
        height={440}
        logs={[
          { level: "log", time: "12:04:01", message: "ready in 812ms" },
          { level: "warn", time: "12:04:02", message: "Image is missing width/height: /hero.png" },
          { level: "error", time: "12:04:05", message: "Hydration mismatch in <PricingToggle>" },
        ]}
      >
        <FakeSite dark={dark} />
      </WebPreview>
      <div className="flex justify-center gap-2">
        <Button size="sm" variant="outline" onClick={() => { setLoading(true); setTimeout(() => { setDark((d) => !d); setLoading(false); }, 1500); }}>Regenerate</Button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- artifact */

const v1 = `export function PricingCard({ plan, price }) {
  return (
    <div className="rounded-2xl border p-6">
      <h3>{plan}</h3>
      <p>\${price}/mo</p>
    </div>
  );
}`;
const v2 = `export function PricingCard({ plan, price, popular }) {
  return (
    <div className={cn("rounded-2xl border p-6", popular && "border-accent")}>
      {popular && <Badge>Most popular</Badge>}
      <h3>{plan}</h3>
      <p className="text-4xl font-semibold">\${price}<span>/mo</span></p>
      <Button className="w-full">Start trial</Button>
    </div>
  );
}`;

function Card({ popular }: { popular?: boolean }) {
  return (
    <div className="flex size-full items-center justify-center gap-4 p-6">
      {[["Starter", 0], ["Pro", 24]].map(([p, n], i) => (
        <div key={p} className={`flex w-48 flex-col gap-3 rounded-2xl border bg-surface-raised p-5 ${popular && i === 1 ? "border-accent" : "border-border"}`}>
          {popular && i === 1 ? <span className="w-fit rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">Most popular</span> : null}
          <span className="font-medium">{p}</span>
          <span className={popular ? "font-display text-3xl font-semibold" : "text-sm"}>${n}<span className="text-xs text-subtle">/mo</span></span>
          {popular ? <span className="rounded-lg bg-accent py-1.5 text-center text-xs font-semibold text-accent-foreground">Start trial</span> : null}
        </div>
      ))}
    </div>
  );
}

function ArtifactDemo() {
  const [open, setOpen] = React.useState(true);
  const [versions, setVersions] = React.useState<ArtifactVersion[]>([
    { id: "1", label: "First draft", code: v1, preview: <Card />, codeView: <CodeBlock files={{ name: "pricing-card.tsx", code: v1 }} className="rounded-none border-0" maxHeight={9999} /> },
  ]);
  const [gen, setGen] = React.useState(false);
  return (
    <div className="grid h-[480px] w-full max-w-4xl grid-cols-1 gap-3 md:grid-cols-[1fr_1.4fr]">
      <div className="flex flex-col justify-end gap-4 rounded-2xl border border-border bg-background p-4">
        <ChatMessage role="user" content="Make a pricing card component." />
        <ChatMessage
          role="assistant"
          content={
            <button type="button" onClick={() => setOpen(true)} className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface p-3 text-left hover:border-accent">
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent-soft"><CodeIcon size={16} /></span>
              <span className="flex flex-col"><b className="text-sm text-foreground">PricingCard</b><span className="text-xs text-subtle">Click to open component</span></span>
            </button>
          }
        />
        <Button
          size="sm"
          variant="outline"
          disabled={gen || versions.length > 1}
          onClick={() => {
            setOpen(true);
            setGen(true);
            setTimeout(() => {
              setVersions((v) => [...v, { id: "2", label: "Highlight the popular plan", code: v2, preview: <Card popular />, codeView: <CodeBlock files={{ name: "pricing-card.tsx", code: v2 }} className="rounded-none border-0" maxHeight={9999} /> }]);
              setGen(false);
            }, 1400);
          }}
        >
          Ask: highlight the popular plan
        </Button>
      </div>
      <div className="relative min-h-0">
        <ArtifactPanel open={open} onOpenChange={setOpen} title="PricingCard" kind="React component" icon={<FileTextIcon />} versions={versions} generating={gen} filename="pricing-card.tsx" />
        {!open ? <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border-strong text-sm text-subtle">Panel closed. Open it from the chat.</div> : null}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- context meter */

function ContextDemo() {
  const [used, setUsed] = React.useState(64_000);
  return (
    <div className="flex h-72 flex-col items-center justify-end gap-6">
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface p-2">
        <ContextMeter used={used} max={200_000} modelName="Kinetic Large" usage={{ inputTokens: Math.round(used * 0.78), cachedInputTokens: 22_000, outputTokens: Math.round(used * 0.18), reasoningTokens: Math.round(used * 0.04) }} pricing={{ input: 3, output: 15, cachedInput: 0.3 }} onCompact={() => setUsed(30_000)} />
        <span className="h-5 w-px bg-border" />
        <Button size="sm" variant="ghost" onClick={() => setUsed((u) => Math.min(200_000, u + 34_000))}>Add a long file</Button>
      </div>
    </div>
  );
}

export const ai2Demos: Record<string, () => React.ReactNode> = {
  "ai-chat": () => <AIChatDemo />,
  conversation: () => <ConversationDemo />,
  "message-branch": () => <BranchDemo />,
  "web-preview": () => <WebPreviewDemo />,
  "artifact-panel": () => <ArtifactDemo />,
  "context-meter": () => <ContextDemo />,
};
