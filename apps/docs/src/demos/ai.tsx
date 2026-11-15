"use client";

import * as React from "react";
import {
  AgentPlan,
  AudioPlayer,
  AudioRecorder,
  AvatarUploader,
  Button,
  Changelog,
  ChatMessage,
  Citation,
  CommentLayer,
  FeatureVoting,
  ImageCropper,
  LiveCursors,
  Masonry,
  ModelSelector,
  MoodPicker,
  NotificationCenter,
  NpsSurvey,
  Presence,
  PromptBox,
  QrCode,
  Reviews,
  Sources,
  ThinkingBlock,
  ToolCall,
  TypingIndicator,
  UsageMeter,
  VersionHistory,
  VideoPlayer,
  VoiceInput,
  toast,
  useStreamedText,
  type AppNotification,
  type CommentThread,
  type FeatureRequest,
  type ImageCropperHandle,
  type LiveCursor,
  type PlanStep,
  type PromptAttachment,
} from "@kineticui/ui";
import { BoltIcon, GlobeIcon, SearchIcon, SparkleIcon, UsersIcon } from "@kineticui/icons";

const models = [
  { id: "opus", name: "Kinetic Pro", description: "Best for complex, multi-step work", badge: "New", intelligence: 5, speed: 3, icon: <SparkleIcon /> },
  { id: "sonnet", name: "Kinetic", description: "Balanced for everyday tasks", intelligence: 4, speed: 4, icon: <BoltIcon /> },
  { id: "haiku", name: "Kinetic Lite", description: "Fastest answers", intelligence: 3, speed: 5, icon: <GlobeIcon /> },
];

const sources = [
  { id: 1, title: "Scroll-driven animations — guide", url: "https://developer.mozilla.org/docs/Web/CSS/CSS_scroll-driven_animations", snippet: "Scroll-driven animations let you link an animation's progress to a scroll container instead of time." },
  { id: 2, title: "Accessible motion: prefers-reduced-motion", url: "https://web.dev/articles/prefers-reduced-motion", snippet: "Respect the user's OS-level preference to reduce non-essential motion." },
  { id: 3, title: "Animating layout with FLIP", url: "https://aerotwist.com/blog/flip-your-animations/", snippet: "First, Last, Invert, Play — a technique for cheap layout animations." },
  { id: 4, title: "Motion for React docs", url: "https://motion.dev/docs/react", snippet: "Production-ready animation library for React." },
  { id: 5, title: "Spring physics explained", url: "https://www.joshwcomeau.com/animation/a-friendly-introduction-to-spring-physics/" },
];

const answer = `Short version: **animate transforms and opacity**, and let springs do the easing.

1. Use \`transform\` and \`opacity\` so the browser can composite on the GPU.
2. Prefer springs over fixed durations for anything the user drags or flings.
3. Wrap everything in a \`prefers-reduced-motion\` check.

\`\`\`tsx
<motion.div layout transition={{ type: "spring", stiffness: 400 }} />
\`\`\``;

function ChatDemo() {
  const [turns, setTurns] = React.useState<{ q: string; id: number }[]>([{ q: "How do I make UI animations feel smooth?", id: 0 }]);
  const [streaming, setStreaming] = React.useState(true);
  const last = turns.at(-1)!;
  const { text, done } = useStreamedText(answer, { speed: 50, enabled: streaming });
  React.useEffect(() => {
    if (done) setStreaming(false);
  }, [done]);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      {turns.map((t) => (
        <React.Fragment key={t.id}>
          <ChatMessage role="user" content={t.q} />
          <ChatMessage
            role="assistant"
            streaming={t.id === last.id && streaming}
            content={t.id === last.id ? text : answer}
            before={
              <>
                <ThinkingBlock duration={6}>The user wants practical rules, not theory. Lead with the compositor-friendly properties, then easing, then accessibility.</ThinkingBlock>
                <ToolCall name="web_search" title="Searched the web" status="success" icon={<SearchIcon />} meta="5 results" input={{ query: "smooth ui animation best practices" }} output="Found 5 sources from MDN, web.dev and motion.dev." />
              </>
            }
            after={!streaming || t.id !== last.id ? <Sources sources={sources} max={3} /> : null}
            onRetry={() => setStreaming(true)}
            onFeedback={(g) => toast(g ? "Thanks!" : "Thanks, we'll improve")}
          />
        </React.Fragment>
      ))}
      <PromptBox
        streaming={streaming}
        onStop={() => setStreaming(false)}
        onSubmit={(q) => {
          setTurns((t) => [...t, { q, id: t.length }]);
          setStreaming(true);
        }}
        suggestions={["Explain springs", "Show a layout animation", "Respect reduced motion"]}
        toolbar={<ModelSelector models={models} />}
        onAttach={(files) => files.map((f) => ({ id: `${f.name}-${Date.now()}`, name: f.name, size: `${Math.round(f.size / 1024)} KB` }))}
      />
    </div>
  );
}

function PromptDemo() {
  const [streaming, setStreaming] = React.useState(false);
  const [sent, setSent] = React.useState<string | null>(null);
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <PromptBox
        streaming={streaming}
        onStop={() => setStreaming(false)}
        onSubmit={(v: string, files: PromptAttachment[]) => {
          setSent(`${v}${files.length ? ` (+${files.length} files)` : ""}`);
          setStreaming(true);
          window.setTimeout(() => setStreaming(false), 2500);
        }}
        placeholder="Message Kinetic…"
        suggestions={["Summarise this PDF", "Draft a launch email", "Find bugs in my code"]}
        toolbar={<ModelSelector models={models} />}
        onAttach={(files) => files.map((f) => ({ id: `${f.name}-${Date.now()}`, name: f.name, size: `${Math.round(f.size / 1024)} KB` }))}
      />
      <span className="text-xs text-subtle">{sent ? `Sent: ${sent}` : "Enter to send, Shift+Enter for a new line, drop files to attach."}</span>
    </div>
  );
}

function PlanDemo() {
  const titles = ["Read the repository", "Find components missing tests", "Write tests for Button and Dialog", "Run the test suite", "Open a pull request"];
  const [i, setI] = React.useState(1);
  React.useEffect(() => {
    const t = window.setInterval(() => setI((x) => (x >= titles.length ? 0 : x + 1)), 1600);
    return () => window.clearInterval(t);
  }, [titles.length]);
  const steps: PlanStep[] = titles.map((title, k) => ({
    id: String(k),
    title,
    status: k < i ? "done" : k === i ? "running" : "pending",
    detail: k === 2 ? "Using Vitest + Testing Library" : undefined,
    substeps: k === 2 ? [{ title: "button.test.tsx", done: i > 2 }, { title: "dialog.test.tsx", done: i > 2 }] : undefined,
  }));
  return <AgentPlan className="w-full max-w-md" title="Add missing tests" steps={steps} />;
}

const names = [
  { name: "Maya", color: "#7C8CFF" },
  { name: "Rohan", color: "#F4A86A" },
  { name: "Rosa", color: "#F0A3D0" },
];

function CursorsDemo() {
  const [cursors, setCursors] = React.useState<LiveCursor[]>(names.map((n, i) => ({ id: n.name, name: n.name, color: n.color, x: 0.2 + i * 0.25, y: 0.3 + i * 0.15 })));
  React.useEffect(() => {
    let t = 0;
    const id = window.setInterval(() => {
      t += 1;
      setCursors((cs) =>
        cs.map((c, i) => ({
          ...c,
          x: 0.5 + Math.sin(t / 2 + i * 2) * 0.32,
          y: 0.45 + Math.cos(t / 3 + i) * 0.3,
          message: i === 0 && t % 8 < 3 ? "Love this layout" : undefined,
        })),
      );
    }, 900);
    return () => window.clearInterval(id);
  }, []);
  return (
    <LiveCursors relative cursors={cursors} className="h-72 w-full max-w-2xl rounded-2xl border border-border bg-surface">
      <div className="grid h-full grid-cols-3 gap-3 p-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="rounded-xl bg-surface-raised" />
        ))}
      </div>
    </LiveCursors>
  );
}

function CommentsDemo() {
  const [threads, setThreads] = React.useState<CommentThread[]>([
    { id: "a", x: 0.28, y: 0.38, comments: [{ id: "1", author: "Maya Kapoor", color: "#7C8CFF", text: "Can we try a bolder headline?", time: "2h" }, { id: "2", author: "Rohan Joshi", color: "#F4A86A", text: "On it.", time: "1h" }] },
    { id: "b", x: 0.72, y: 0.66, comments: [{ id: "3", author: "Rosa Silva", color: "#F0A3D0", text: "This chart needs a legend.", time: "20m" }] },
  ]);
  return (
    <div className="flex w-full max-w-2xl flex-col gap-2">
      <CommentLayer threads={threads} onThreadsChange={setThreads} me={{ name: "You", color: "#C6F432" }} className="h-80 rounded-2xl border border-border bg-surface">
        <div className="flex h-full flex-col gap-3 p-6">
          <div className="h-8 w-2/3 rounded-lg bg-surface-raised" />
          <div className="h-4 w-1/2 rounded bg-surface-raised" />
          <div className="mt-2 grid flex-1 grid-cols-2 gap-3">
            <div className="rounded-xl bg-surface-raised" />
            <div className="rounded-xl bg-surface-raised" />
          </div>
        </div>
      </CommentLayer>
      <span className="text-center text-xs text-subtle">Click anywhere to drop a comment pin.</span>
    </div>
  );
}

function NotificationsDemo() {
  const av = (t: string, c: string) => <span className="flex size-8 items-center justify-center rounded-full text-[11px] font-bold text-[#0b0c0e]" style={{ background: c }}>{t}</span>;
  const [items, setItems] = React.useState<AppNotification[]>([
    { id: "1", title: <><b>Maya</b> mentioned you in <b>Q4 roadmap</b></>, body: "“@you can you own the pricing section?”", time: "2m ago", icon: av("MK", "#7C8CFF"), category: "Mentions" },
    { id: "2", title: <><b>Rohan</b> invited you to <b>Atlas</b></>, time: "1h ago", icon: av("RJ", "#F4A86A"), actions: <><Button size="sm">Accept</Button><Button size="sm" variant="secondary">Decline</Button></> },
    { id: "3", title: "Deploy succeeded", body: "kinetic-ui · production · 41s", time: "3h ago", icon: <span className="flex size-8 items-center justify-center rounded-full bg-success-soft text-success"><BoltIcon size={14} /></span>, read: true },
    { id: "4", title: <><b>Rosa</b> resolved your comment</>, time: "Yesterday", icon: av("RS", "#F0A3D0"), read: true },
  ]);
  return (
    <div className="flex h-[440px] w-full justify-end pr-8 pt-2">
      <NotificationCenter notifications={items} onChange={setItems} onOpenSettings={() => toast("Settings")} />
    </div>
  );
}

function VotingDemo() {
  const [items, setItems] = React.useState<FeatureRequest[]>([
    { id: "1", title: "Dark mode for the docs", description: "Match the OS setting automatically.", votes: 128, status: "shipped", comments: 14, createdAt: 1 },
    { id: "2", title: "Figma kit", description: "Components and tokens as a Figma library.", votes: 96, status: "in-progress", comments: 22, createdAt: 2 },
    { id: "3", title: "Vue and Svelte ports", votes: 71, status: "planned", comments: 31, createdAt: 3, voted: true },
    { id: "4", title: "Date range picker presets", description: "Last 7 days, this quarter, custom.", votes: 44, comments: 5, createdAt: 4 },
  ]);
  return <FeatureVoting className="w-full max-w-xl" items={items} onVote={(id, v) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, voted: v, votes: x.votes + (v ? 1 : -1) } : x)))} />;
}

function CropDemo() {
  const ref = React.useRef<ImageCropperHandle>(null);
  const [out, setOut] = React.useState<string | null>(null);
  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-4 sm:flex-row sm:items-start">
      <ImageCropper ref={ref} src="/media/poster.jpg" round className="w-64" />
      <div className="flex flex-col items-center gap-3">
        <Button size="sm" onClick={() => setOut(ref.current?.getCroppedImage({ size: 256 }) ?? null)}>Crop</Button>
        {out ? <img src={out} alt="Cropped result" className="size-24 rounded-full ring-2 ring-accent" /> : <span className="size-24 rounded-full border border-dashed border-border-strong" />}
      </div>
    </div>
  );
}

function AvatarDemo() {
  const [url, setUrl] = React.useState<string | null>(null);
  return (
    <AvatarUploader
      value={url}
      onRemove={() => setUrl(null)}
      onUpload={(file, progress) =>
        new Promise<string>((resolve) => {
          let p = 0;
          const t = window.setInterval(() => {
            p += 0.1;
            progress(Math.min(1, p));
            if (p >= 1) {
              window.clearInterval(t);
              const u = URL.createObjectURL(file);
              setUrl(u);
              resolve(u);
            }
          }, 120);
        })
      }
    />
  );
}

const shades = ["#2a3a12", "#1d2a4a", "#4a2a12", "#3a1230", "#123a2a", "#2a2a2a"];

export const aiDemos: Record<string, () => React.ReactNode> = {
  "prompt-box": () => <PromptDemo />,
  "chat-message": () => <ChatDemo />,
  "thinking-block": () => (
    <div className="flex w-full max-w-lg flex-col gap-6">
      <ThinkingBlock active defaultOpen>Comparing three approaches. The second avoids a re-render on every keystroke, so it should feel faster on low-end phones…</ThinkingBlock>
      <ThinkingBlock duration={14}>Checked the docs, ran the numbers twice, and the answer holds.</ThinkingBlock>
    </div>
  ),
  "tool-call": () => (
    <div className="flex w-full max-w-lg flex-col gap-2">
      <ToolCall name="search_web" title="Searching the web" status="running" icon={<SearchIcon />} input={{ query: "kinetic ui components" }} />
      <ToolCall name="read_file" title="Read package.json" status="success" meta="0.2s" defaultOpen input={{ path: "package.json" }} output={<code className="font-mono text-xs">{`{ "name": "kinetic-ui", "private": true }`}</code>} />
      <ToolCall name="run_command" title="Run npm publish" status="pending" input={{ cmd: "npm publish --access public" }} onApprove={() => toast("Approved")} onDeny={() => toast("Denied")} />
      <ToolCall name="send_email" title="Email the team" status="error" output="SMTP timeout after 30s" />
    </div>
  ),
  citations: () => (
    <div className="flex w-full max-w-xl flex-col gap-4 text-[15px] leading-relaxed text-muted">
      <p>
        Animate <b className="text-foreground">transform</b> and <b className="text-foreground">opacity</b> to stay on the compositor<Citation source={sources[0]!} index={1} />, and always honour the reduced-motion setting<Citation source={sources[1]!} index={2} />. For layout changes, FLIP keeps things cheap<Citation source={sources[2]!} index={3} />.
      </p>
      <Sources sources={sources} max={3} />
    </div>
  ),
  "model-selector": () => (
    <div className="flex h-72 items-end">
      <ModelSelector models={models} onValueChange={(id) => toast(`Model: ${id}`)} />
    </div>
  ),
  "voice-input": () => <VoiceInput onTranscript={(t) => toast(t || "No speech detected")} />,
  "usage-meter": () => (
    <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
      <UsageMeter title="Tokens this month" unit="tokens" limit={2_000_000} segments={[{ label: "Chat", value: 640_000 }, { label: "API", value: 410_000 }, { label: "Agents", value: 220_000 }]} footnote="Resets in 9 days" />
      <UsageMeter title="Seats" limit={10} segments={[{ label: "Admins", value: 2 }, { label: "Members", value: 7 }]} action={<Button size="sm">Add seats</Button>} />
    </div>
  ),
  "agent-plan": () => <PlanDemo />,
  "live-cursors": () => <CursorsDemo />,
  presence: () => (
    <div className="flex flex-col items-center gap-6">
      <Presence
        users={[
          { id: "1", name: "Maya Kapoor", color: "#7C8CFF", status: "active", activity: "Editing Pricing" },
          { id: "2", name: "Rohan Joshi", color: "#F4A86A", status: "active", activity: "Viewing Hero" },
          { id: "3", name: "Rosa Silva", color: "#F0A3D0", status: "idle" },
          { id: "4", name: "Kemi Okafor", color: "#6EE7A0", status: "away" },
          { id: "5", name: "Lena Fischer", color: "#E8E8E3" },
          { id: "6", name: "Noah Kim", color: "#C6F432" },
        ]}
      />
      <span className="flex items-center gap-2 text-xs text-subtle">
        <UsersIcon size={13} /> 6 people in this file
      </span>
    </div>
  ),
  "typing-indicator": () => (
    <div className="flex flex-col items-start gap-4">
      <TypingIndicator variant="bubble" />
      <TypingIndicator names={["Maya"]} />
      <TypingIndicator names={["Maya", "Rohan"]} />
      <TypingIndicator names={["Maya", "Rohan", "Rosa"]} />
    </div>
  ),
  "comment-pin": () => <CommentsDemo />,
  "version-history": () => (
    <VersionHistory
      className="w-full max-w-sm"
      selected="v1"
      onRestore={(v) => toast(`Restored ${v.label ?? v.time}`)}
      onCompare={(a, b) => toast(`Comparing ${a} and ${b}`)}
      versions={[
        { id: "v0", time: "Today, 14:02", author: "You", color: "#C6F432", current: true },
        { id: "v1", time: "Today, 11:40", author: "Maya Kapoor", color: "#7C8CFF", changes: "Edited pricing table, 3 comments" },
        { id: "v2", time: "Yesterday, 18:15", author: "Rohan Joshi", color: "#F4A86A", label: "Launch copy v2" },
        { id: "v3", time: "Yesterday, 09:03", author: "Rosa Silva", color: "#F0A3D0", changes: "New hero image" },
        { id: "v4", time: "Nov 12, 16:20", author: "You", color: "#C6F432", label: "First draft" },
      ]}
    />
  ),
  "notification-center": () => <NotificationsDemo />,
  nps: () => <NpsSurvey onSubmit={(r) => toast(`Score ${r.score}`)} onDismiss={() => toast("Dismissed")} />,
  "mood-picker": () => <MoodPicker onValueChange={(v) => toast(["Awful", "Bad", "Okay", "Good", "Great"][v]!)} />,
  "feature-voting": () => <VotingDemo />,
  changelog: () => (
    <Changelog
      className="w-full max-w-2xl"
      entries={[
        {
          version: "2.4.0",
          date: "Nov 14, 2026",
          title: "AI components and a faster data table",
          summary: "Thirty new components for chat, agents and collaboration, plus a data table that stays smooth with thousands of rows.",
          media: <div className="flex h-36 items-center justify-center bg-[linear-gradient(135deg,var(--kn-accent-soft),transparent)] font-display text-2xl font-semibold">Kinetic AI</div>,
          changes: [
            { type: "new", text: "PromptBox, ChatMessage, ThinkingBlock, ToolCall and Citations" },
            { type: "improved", text: "DataTable sorting is now locale-aware" },
            { type: "fixed", text: "Tooltip no longer flickers inside dialogs" },
          ],
        },
        { version: "2.3.0", date: "Oct 28, 2026", title: "Charts", changes: [{ type: "new", text: "Bar, line, area, donut and funnel charts with no dependencies" }, { type: "removed", text: "Legacy `Graph` component" }] },
      ]}
    />
  ),
  reviews: () => (
    <Reviews
      className="w-full max-w-3xl"
      reviews={[
        { id: "1", author: "Maya Kapoor", rating: 5, title: "Finally, motion done right", body: "Every component feels considered. The command palette alone saved us a week.", date: "Nov 2, 2026", verified: true, helpful: 24, avatarColor: "#7C8CFF" },
        { id: "2", author: "Rohan Joshi", rating: 4, title: "Great defaults", body: "Theming took ten minutes. I'd love more chart types.", date: "Oct 21, 2026", verified: true, helpful: 9, avatarColor: "#F4A86A" },
        { id: "3", author: "Rosa Silva", rating: 5, body: "Accessible out of the box, which is rare for animated libraries.", date: "Oct 3, 2026", helpful: 15, avatarColor: "#F0A3D0" },
        { id: "4", author: "Noah Kim", rating: 3, body: "Good, but the bundle could be smaller if you use everything.", date: "Sep 18, 2026", helpful: 3, avatarColor: "#6EE7A0" },
      ]}
    />
  ),
  "audio-player": () => <AudioPlayer className="w-full max-w-lg" src="/media/track.mp3" title="Night Drive" artist="Kinetic Sessions" cover={<div className="size-full bg-[linear-gradient(135deg,#C6F432,#1d2a4a)]" />} />,
  "video-player": () => (
    <VideoPlayer
      className="w-full max-w-2xl"
      src="/media/demo.mp4"
      poster="/media/poster.jpg"
      title="Kinetic UI in 8 seconds"
      chapters={[{ time: 0, title: "Intro" }, { time: 3, title: "Components" }, { time: 6, title: "Theming" }]}
    />
  ),
  "audio-recorder": () => <AudioRecorder onRecorded={() => toast("Voice note saved")} />,
  "avatar-uploader": () => <AvatarDemo />,
  "image-cropper": () => <CropDemo />,
  masonry: () => (
    <Masonry className="w-full max-w-3xl">
      {[180, 260, 140, 220, 300, 160, 240, 190, 130].map((h, i) => (
        <div key={i} className="flex items-end rounded-2xl border border-border p-4" style={{ height: h, background: `linear-gradient(160deg, ${shades[i % shades.length]}, var(--kn-surface))` }}>
          <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
        </div>
      ))}
    </Masonry>
  ),
  "qr-code": () => (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <div className="rounded-2xl bg-white p-3 text-[#0b0c0e]">
        <QrCode value="https://kinetic-ui.vercel.app" size={160} />
      </div>
      <div className="rounded-2xl border border-border bg-surface p-3 text-accent">
        <QrCode value="https://kinetic-ui.vercel.app/components/qr-code" size={160} variant="dots" />
      </div>
      <div className="rounded-2xl bg-white p-3 text-[#0b0c0e]">
        <QrCode
          value="https://github.com/Chaitanya-NK/kinetic-ui"
          size={160}
          variant="dots"
          logo={<span className="flex size-full items-center justify-center rounded-md bg-[#C6F432] font-bold text-[#0b0c0e]">K</span>}
        />
      </div>
    </div>
  ),
};
