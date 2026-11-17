"use client";

import * as React from "react";
import {
  Button,
  NodeEditor,
  SankeyChart,
  SegmentedControl,
  VoiceOrb,
  useMicrophoneLevel,
  type EditorEdge,
  type EditorNode,
  type VoiceOrbState,
} from "@kineticui/ui";
import { BotIcon, DatabaseIcon, MailIcon, MessageSquareIcon, MicIcon, MicOffIcon, PlayIcon, RefreshIcon, WebhookIcon, WorkflowIcon } from "@kineticui/icons";

/* ---------------------------------------------------------------- node editor */

const startNodes: EditorNode[] = [
  { id: "hook", x: 0, y: 120, title: "New ticket", icon: <WebhookIcon className="size-3" />, color: "#7C8CFF", outputs: [{ id: "ticket", label: "ticket" }] },
  {
    id: "crm",
    x: 290,
    y: 20,
    title: "Fetch customer",
    icon: <DatabaseIcon className="size-3" />,
    color: "#F4A86A",
    inputs: [{ id: "email", label: "email" }],
    outputs: [{ id: "profile", label: "profile" }],
  },
  {
    id: "llm",
    x: 580,
    y: 100,
    title: "Summarise",
    icon: <BotIcon className="size-3" />,
    inputs: [
      { id: "ticket", label: "ticket" },
      { id: "context", label: "context" },
    ],
    outputs: [
      { id: "summary", label: "summary" },
      { id: "urgency", label: "urgency" },
    ],
    content: (
      <div className="space-y-1.5">
        <div className="flex justify-between font-mono text-[10px]">
          <span className="text-subtle">model</span>
          <span className="text-foreground">kinetic-1</span>
        </div>
        <textarea
          data-nodrag
          aria-label="Prompt"
          defaultValue="Summarise in two lines and rate urgency 1 to 5."
          rows={2}
          className="w-full resize-none rounded-md border border-border bg-surface px-2 py-1.5 text-[11px] text-foreground outline-none focus:border-accent"
        />
      </div>
    ),
  },
  { id: "branch", x: 880, y: 150, title: "If urgent", icon: <WorkflowIcon className="size-3" />, color: "#F0A3D0", inputs: [{ id: "in", label: "urgency" }], outputs: [{ id: "yes", label: "yes" }, { id: "no", label: "no" }] },
  { id: "slack", x: 1150, y: 60, title: "Page on-call", icon: <MessageSquareIcon className="size-3" />, color: "#6EE7A0", inputs: [{ id: "msg", label: "message" }] },
  { id: "mail", x: 1150, y: 250, title: "Reply by email", icon: <MailIcon className="size-3" />, color: "#6EE7A0", inputs: [{ id: "body", label: "body" }] },
];

const startEdges: EditorEdge[] = [
  { id: "e1", from: { node: "hook", port: "ticket" }, to: { node: "crm", port: "email" } },
  { id: "e2", from: { node: "hook", port: "ticket" }, to: { node: "llm", port: "ticket" } },
  { id: "e3", from: { node: "crm", port: "profile" }, to: { node: "llm", port: "context" } },
  { id: "e4", from: { node: "llm", port: "urgency" }, to: { node: "branch", port: "in" } },
  { id: "e5", from: { node: "branch", port: "yes" }, to: { node: "slack", port: "msg" } },
];

const runOrder = [["hook"], ["crm"], ["llm"], ["branch"], ["slack", "mail"]];

function NodeEditorDemo() {
  const [nodes, setNodes] = React.useState(startNodes);
  const [edges, setEdges] = React.useState(startEdges);
  const [running, setRunning] = React.useState(false);

  const run = async () => {
    setRunning(true);
    setNodes((ns) => ns.map((n) => ({ ...n, status: "idle" })));
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    for (const step of runOrder) {
      // Only run nodes that something is wired into (or the trigger).
      setNodes((ns) => ns.map((n) => (step.includes(n.id) && (n.id === "hook" || edges.some((e) => e.to.node === n.id)) ? { ...n, status: "running" } : n)));
      await wait(900);
      setNodes((ns) => ns.map((n) => (n.status === "running" ? { ...n, status: "done" } : n)));
    }
    setRunning(false);
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-display text-base font-semibold">Support triage</div>
          <div className="text-xs text-muted">Drag nodes, wire ports, Ctrl + scroll to zoom. Try wiring “no” into Reply by email.</div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setNodes(startNodes);
              setEdges(startEdges);
            }}
          >
            <RefreshIcon className="size-3.5" /> Reset
          </Button>
          <Button size="sm" onClick={run} disabled={running}>
            <PlayIcon className="size-3.5" /> {running ? "Running" : "Run"}
          </Button>
        </div>
      </div>
      <NodeEditor nodes={nodes} onNodesChange={setNodes} edges={edges} onEdgesChange={setEdges} className="h-[30rem]" />
    </div>
  );
}

/* ---------------------------------------------------------------- voice orb */

function VoiceOrbDemo() {
  const [state, setState] = React.useState<VoiceOrbState>("speaking");
  const mic = useMicrophoneLevel();
  return (
    <div className="flex flex-col items-center gap-6">
      <VoiceOrb
        state={state}
        level={mic.active ? mic.level : undefined}
        size={240}
        onClick={() => setState((s) => (s === "listening" ? "thinking" : s === "thinking" ? "speaking" : s === "speaking" ? "idle" : "listening"))}
      />
      <div className="font-display text-lg font-medium text-foreground">{{ idle: "Tap to talk", listening: "Listening…", thinking: "Thinking…", speaking: "Speaking…" }[state]}</div>
      <SegmentedControl
        aria-label="Orb state"
        defaultValue="speaking"
        value={state}
        onValueChange={(v) => setState(v as VoiceOrbState)}
        options={[
          { value: "idle", label: "Idle" },
          { value: "listening", label: "Listening" },
          { value: "thinking", label: "Thinking" },
          { value: "speaking", label: "Speaking" },
        ]}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={async () => {
          if (mic.active) mic.stop();
          else {
            await mic.start();
            setState("listening");
          }
        }}
      >
        {mic.active ? <MicOffIcon className="size-3.5" /> : <MicIcon className="size-3.5" />}
        {mic.active ? "Stop microphone" : "Use my microphone"}
      </Button>
      {mic.error && <div className="text-xs text-danger">{mic.error}</div>}
    </div>
  );
}

/* ---------------------------------------------------------------- sankey */

const flowNodes = [
  { id: "search", label: "Search" },
  { id: "social", label: "Social" },
  { id: "direct", label: "Direct" },
  { id: "referral", label: "Referral" },
  { id: "docs", label: "Docs" },
  { id: "pricing", label: "Pricing" },
  { id: "bounce", label: "Bounced", color: "var(--kn-border-strong)" },
  { id: "free", label: "Free" },
  { id: "pro", label: "Pro" },
  { id: "team", label: "Team" },
];
const flowLinks = [
  { source: "search", target: "docs", value: 5200 },
  { source: "search", target: "pricing", value: 1800 },
  { source: "search", target: "bounce", value: 2600 },
  { source: "social", target: "docs", value: 2100 },
  { source: "social", target: "bounce", value: 1900 },
  { source: "social", target: "pricing", value: 600 },
  { source: "direct", target: "pricing", value: 2400 },
  { source: "direct", target: "docs", value: 1300 },
  { source: "referral", target: "docs", value: 1500 },
  { source: "referral", target: "pricing", value: 900 },
  { source: "docs", target: "free", value: 4600 },
  { source: "docs", target: "pro", value: 1200 },
  { source: "pricing", target: "pro", value: 2300 },
  { source: "pricing", target: "team", value: 1100 },
  { source: "pricing", target: "free", value: 900 },
];

function SankeyDemo() {
  const [mode, setMode] = React.useState<"gradient" | "source">("gradient");
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display text-base font-semibold">Where signups come from</div>
          <div className="text-xs text-muted">Visitors last 30 days, by channel, first page and plan.</div>
        </div>
        <SegmentedControl
          aria-label="Link colour"
          defaultValue="gradient"
          value={mode}
          onValueChange={(v) => setMode(v as "gradient" | "source")}
          options={[
            { value: "gradient", label: "Gradient" },
            { value: "source", label: "Source" },
          ]}
        />
      </div>
      <SankeyChart nodes={flowNodes} links={flowLinks} linkColor={mode} height={360} />
    </div>
  );
}

export const appsDemos: Record<string, () => React.ReactNode> = {
  "node-editor": () => <NodeEditorDemo />,
  "voice-orb": () => <VoiceOrbDemo />,
  "sankey-chart": () => <SankeyDemo />,
};
