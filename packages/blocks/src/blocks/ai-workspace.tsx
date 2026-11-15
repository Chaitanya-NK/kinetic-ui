"use client";

import * as React from "react";
import { cn } from "@kineticui/core";
import { Button, ChatMessage, ModelSelector, PromptBox, Sources, ThinkingBlock, ToolCall, UsageMeter, useStreamedText } from "@kineticui/ui";
import { EditIcon, SearchIcon, SparkleIcon, BoltIcon } from "@kineticui/icons";

const threads = [
  { id: "1", title: "Launch email for v2", time: "Today" },
  { id: "2", title: "Explain spring physics", time: "Today" },
  { id: "3", title: "Refactor DataTable sorting", time: "Yesterday" },
  { id: "4", title: "Pricing page copy", time: "Nov 10" },
  { id: "5", title: "SQL for weekly retention", time: "Nov 8" },
];

const reply = `Here's a draft you can paste straight into your email tool:

**Subject:** Kinetic UI 2.0 is here

Hi there,

We just shipped **120 components** and a new set of **AI blocks**. Everything installs from npm or copies into your app with one command.

- Chat, agent plans and tool calls
- Live cursors and comments
- Charts with zero dependencies

Reply to this email if you'd like a walkthrough.`;

/** ChatGPT-style workspace: thread list, streaming conversation with reasoning and tool calls, composer and usage. */
export function AiWorkspace() {
  const [active, setActive] = React.useState("1");
  const [messages, setMessages] = React.useState<{ id: number; q: string }[]>([{ id: 0, q: "Write a short launch email for Kinetic UI 2.0" }]);
  const [streaming, setStreaming] = React.useState(true);
  const { text, done } = useStreamedText(reply, { speed: 60, enabled: streaming });
  React.useEffect(() => {
    if (done) setStreaming(false);
  }, [done]);
  const last = messages.at(-1)!;

  return (
    <div className="flex h-[820px] bg-background">
      <aside className="hidden w-64 shrink-0 flex-col gap-3 border-r border-border bg-surface p-3 md:flex">
        <Button variant="secondary" className="justify-start" onClick={() => { setMessages([]); setActive(""); }}>
          <EditIcon size={15} /> New chat
        </Button>
        <span className="px-2 pt-2 font-mono text-[10px] uppercase tracking-wider text-subtle">Recent</span>
        <nav aria-label="Chats" className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
          {threads.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              className={cn("flex flex-col rounded-lg px-3 py-2 text-left text-sm", active === t.id ? "bg-surface-overlay text-foreground" : "text-muted hover:bg-surface-raised hover:text-foreground")}
            >
              <span className="truncate">{t.title}</span>
              <span className="text-[11px] text-subtle">{t.time}</span>
            </button>
          ))}
        </nav>
        <UsageMeter className="p-4" title="Messages" limit={500} segments={[{ label: "Used", value: 412 }]} footnote="Resets in 4 days" />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <ModelSelector
            models={[
              { id: "pro", name: "Kinetic Pro", description: "Best for complex work", intelligence: 5, speed: 3, icon: <SparkleIcon /> },
              { id: "fast", name: "Kinetic Lite", description: "Fastest answers", intelligence: 3, speed: 5, icon: <BoltIcon /> },
            ]}
          />
          <span className="ml-auto truncate text-sm text-subtle">{threads.find((t) => t.id === active)?.title ?? "New chat"}</span>
        </header>
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-2xl flex-col gap-7 px-4 py-8">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center gap-3 pt-24 text-center">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                  <SparkleIcon size={22} />
                </span>
                <h2 className="font-display text-2xl font-semibold">What are we building today?</h2>
              </div>
            ) : (
              messages.map((m) => (
                <React.Fragment key={m.id}>
                  <ChatMessage role="user" content={m.q} />
                  <ChatMessage
                    role="assistant"
                    streaming={m.id === last.id && streaming}
                    content={m.id === last.id ? text : reply}
                    before={
                      <>
                        <ThinkingBlock duration={4}>Short, scannable, one clear call to action. Lead with the number.</ThinkingBlock>
                        <ToolCall name="search_docs" title="Read the changelog" status="success" icon={<SearchIcon />} meta="0.4s" />
                      </>
                    }
                    after={m.id !== last.id || !streaming ? <Sources max={2} sources={[{ id: 1, title: "Kinetic 2.0 changelog", url: "https://kinetic-ui.chaitanya-nk.com/changelog" }, { id: 2, title: "Release blog post", url: "https://kinetic-ui.chaitanya-nk.com/blog/2-0" }]} /> : null}
                    onRetry={() => setStreaming(true)}
                    onFeedback={() => {}}
                  />
                </React.Fragment>
              ))
            )}
          </div>
        </div>
        <div className="mx-auto w-full max-w-2xl px-4 pb-4">
          <PromptBox
            streaming={streaming}
            onStop={() => setStreaming(false)}
            onSubmit={(q) => {
              setMessages((ms) => [...ms, { id: ms.length ? ms.at(-1)!.id + 1 : 0, q }]);
              setStreaming(true);
            }}
            suggestions={messages.length ? undefined : ["Draft a launch email", "Summarise this week", "Write SQL for retention"]}
            onAttach={(files) => files.map((f) => ({ id: f.name + Date.now(), name: f.name, size: `${Math.round(f.size / 1024)} KB` }))}
          />
          <p className="mt-2 text-center text-[11px] text-subtle">Kinetic can make mistakes. Check important info.</p>
        </div>
      </div>
    </div>
  );
}
