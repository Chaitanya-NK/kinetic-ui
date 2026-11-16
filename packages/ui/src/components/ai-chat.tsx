"use client";

import * as React from "react";
import { cn } from "@kineticui/core";
import { AlertCircleIcon, FileIcon, RotateCwIcon } from "@kineticui/icons";
import { ChatMessage, SimpleMarkdown } from "./chat-message";
import { ThinkingBlock } from "./thinking-block";
import { ToolCall, type ToolCallProps } from "./tool-call";
import { Sources, type Source } from "./citations";
import { PromptBox } from "./prompt-box";
import { Conversation, ConversationEmpty, type ConversationEmptyProps } from "./conversation";

/*
 * Structural types matching the Vercel AI SDK (v5+) UIMessage and useChat() return value.
 * Nothing is imported from "ai", so this works with any version that keeps these shapes,
 * and with your own backend if you produce the same message parts.
 */

export type AIMessagePart =
  | { type: "text"; text: string; state?: "streaming" | "done" }
  | { type: "reasoning"; text: string; state?: "streaming" | "done" }
  | { type: "source-url"; sourceId: string; url: string; title?: string }
  | { type: "source-document"; sourceId: string; title: string; mediaType?: string; filename?: string }
  | { type: "file"; mediaType: string; url: string; filename?: string }
  | { type: "step-start" }
  | AIToolPart
  | { type: `data-${string}`; id?: string; data: unknown };

export type AIToolPart = {
  /** "tool-<name>" for typed tools, "dynamic-tool" for dynamic ones. */
  type: `tool-${string}` | "dynamic-tool";
  toolName?: string;
  toolCallId: string;
  title?: string;
  state: "input-streaming" | "input-available" | "approval-requested" | "approval-responded" | "output-available" | "output-error" | "output-denied";
  input?: unknown;
  output?: unknown;
  errorText?: string;
  approval?: { id: string; approved?: boolean; reason?: string };
};

export type AIMessage = { id: string; role: "system" | "user" | "assistant"; parts: AIMessagePart[] };

export type AIChatStatus = "submitted" | "streaming" | "ready" | "error";

/** The subset of useChat() that AIChat uses. Pass the hook's return value straight in. */
export type AIChatHelpers = {
  messages: AIMessage[];
  status: AIChatStatus;
  error?: Error | undefined;
  sendMessage: (message: { text: string; files?: unknown }) => unknown;
  stop: () => unknown;
  regenerate?: (opts?: { messageId?: string }) => unknown;
  addToolApprovalResponse?: (r: { id: string; approved: boolean; reason?: string }) => unknown;
  clearError?: () => void;
};

/** Map an AI SDK tool part state onto ToolCall's status. */
export function toolStatus(state: AIToolPart["state"]): ToolCallProps["status"] {
  switch (state) {
    case "approval-requested":
      return "pending";
    case "input-streaming":
    case "input-available":
    case "approval-responded":
      return "running";
    case "output-available":
      return "success";
    default:
      return "error";
  }
}

const toolNameOf = (p: AIToolPart) => p.toolName ?? p.type.replace(/^tool-/, "");
const isTool = (p: AIMessagePart): p is AIToolPart => p.type === "dynamic-tool" || (p.type.startsWith("tool-") && "toolCallId" in p);

export type MessagePartsProps = {
  message: AIMessage;
  /** True while this message is the one being streamed. */
  streaming?: boolean;
  onApproval?: (r: { id: string; approved: boolean }) => void;
  /** Custom renderer per tool name; return undefined to fall back to <ToolCall />. */
  renderTool?: (part: AIToolPart) => React.ReactNode | undefined;
  /** Custom renderer for data-* parts. */
  renderData?: (part: { type: string; data: unknown }) => React.ReactNode;
  /** Draw the blinking caret after streamed text. */
  caret?: boolean;
};

/** Renders every part of one AI SDK message in order: reasoning, tool calls, text, files and sources. */
export function MessageParts({ message, streaming, onApproval, renderTool, renderData, caret = true }: MessagePartsProps) {
  const sources: Source[] = message.parts.flatMap((p, i) =>
    p.type === "source-url" ? [{ id: p.sourceId ?? i, title: p.title || hostname(p.url), url: p.url }] : [],
  );
  const lastTextIndex = message.parts.map((p) => p.type).lastIndexOf("text");
  const nodes = message.parts.map((p, i) => {
    if (p.type === "text") {
      if (!p.text) return null;
      return (
        <div key={i} className="text-sm leading-relaxed">
          <SimpleMarkdown>{p.text}</SimpleMarkdown>
          {caret && streaming && i === lastTextIndex && p.state !== "done" ? <span aria-hidden className="ml-0.5 inline-block h-4 w-[3px] translate-y-[3px] animate-pulse rounded-full bg-accent" /> : null}
        </div>
      );
    }
    if (p.type === "reasoning") {
      const active = p.state === "streaming" || (streaming && p.state !== "done" && i === message.parts.length - 1);
      return (
        <ThinkingBlock key={i} active={active} defaultOpen={active}>
          <span className="whitespace-pre-wrap">{p.text}</span>
        </ThinkingBlock>
      );
    }
    if (isTool(p)) {
      const custom = renderTool?.(p);
      if (custom !== undefined) return <React.Fragment key={p.toolCallId}>{custom}</React.Fragment>;
      return (
        <ToolCall
          key={p.toolCallId}
          name={toolNameOf(p)}
          title={p.title}
          status={toolStatus(p.state)}
          input={p.input}
          output={p.state === "output-error" ? <span className="text-danger">{p.errorText}</span> : p.state === "output-denied" ? <span className="text-subtle">Denied</span> : p.output !== undefined ? <pre className="whitespace-pre-wrap font-mono text-xs">{typeof p.output === "string" ? p.output : JSON.stringify(p.output, null, 2)}</pre> : undefined}
          onApprove={p.state === "approval-requested" && p.approval && onApproval ? () => onApproval({ id: p.approval!.id, approved: true }) : undefined}
          onDeny={p.state === "approval-requested" && p.approval && onApproval ? () => onApproval({ id: p.approval!.id, approved: false }) : undefined}
        />
      );
    }
    if (p.type === "file") {
      return p.mediaType.startsWith("image/") ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={p.url} alt={p.filename ?? "Attached image"} className="max-h-64 max-w-full rounded-xl border border-border object-cover" />
      ) : (
        <a key={i} href={p.url} target="_blank" rel="noreferrer" className="flex w-fit items-center gap-2 rounded-xl border border-border bg-surface-raised px-3 py-2 text-sm hover:border-accent">
          <FileIcon size={15} className="text-subtle" /> {p.filename ?? "File"}
        </a>
      );
    }
    if (p.type.startsWith("data-") && renderData) return <React.Fragment key={i}>{renderData(p as { type: string; data: unknown })}</React.Fragment>;
    return null;
  });
  return (
    <div className="flex flex-col gap-3">
      {nodes}
      {sources.length ? <Sources sources={sources} /> : null}
    </div>
  );
}

function hostname(u: string) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
}

const textOf = (m: AIMessage) => m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");

export type AIChatProps = {
  /** The object returned by useChat() from @ai-sdk/react. */
  chat: AIChatHelpers;
  placeholder?: string;
  empty?: ConversationEmptyProps;
  /** Left side of the composer, e.g. <ModelSelector /> or <ContextMeter />. */
  toolbar?: React.ReactNode;
  renderTool?: MessagePartsProps["renderTool"];
  renderData?: MessagePartsProps["renderData"];
  assistantName?: string;
  className?: string;
};

/**
 * A complete chat UI for the Vercel AI SDK in one component:
 * `const chat = useChat(); return <AIChat chat={chat} />`.
 * Streams text and reasoning, renders tool calls with approvals, sources and files, and handles stop, retry and errors.
 */
export function AIChat({ chat, placeholder = "Ask anything…", empty, toolbar, renderTool, renderData, assistantName, className }: AIChatProps) {
  const { messages, status, error } = chat;
  const busy = status === "submitted" || status === "streaming";
  const visible = messages.filter((m) => m.role !== "system");
  const last = visible[visible.length - 1];
  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      {visible.length === 0 ? (
        <ConversationEmpty {...empty} onSuggestion={(p) => (empty?.onSuggestion ? empty.onSuggestion(p) : chat.sendMessage({ text: p }))} />
      ) : (
        <Conversation contentClassName="mx-auto w-full max-w-3xl">
          {visible.map((m) =>
            m.role === "user" ? (
              <ChatMessage key={m.id} role="user" content={textOf(m)} />
            ) : (
              <ChatMessage
                key={m.id}
                role="assistant"
                name={assistantName}
                streaming={busy && m === last}
                content={<MessageParts message={m} caret={false} streaming={busy && m === last} onApproval={chat.addToolApprovalResponse} renderTool={renderTool} renderData={renderData} />}
                onRetry={!busy && m === last && chat.regenerate ? () => chat.regenerate!({ messageId: m.id }) : undefined}
              />
            ),
          )}
          {status === "submitted" && last?.role === "user" ? (
            <ChatMessage role="assistant" name={assistantName} content={<span className="flex gap-1 py-2">{[0, 1, 2].map((i) => <span key={i} className="size-1.5 animate-bounce rounded-full bg-accent" style={{ animationDelay: `${i * 0.12}s` }} />)}</span>} />
          ) : null}
          {error ? (
            <div role="alert" className="flex items-center gap-3 rounded-xl border border-danger/40 bg-danger-soft/50 px-4 py-3 text-sm">
              <AlertCircleIcon size={16} className="shrink-0 text-danger" />
              <span className="flex-1 text-muted">{error.message || "Something went wrong."}</span>
              {chat.regenerate ? (
                <button type="button" onClick={() => (chat.clearError?.(), chat.regenerate!())} className="flex items-center gap-1.5 rounded-lg border border-border-strong px-2.5 py-1 text-xs font-medium hover:border-accent">
                  <RotateCwIcon size={12} /> Retry
                </button>
              ) : null}
            </div>
          ) : null}
        </Conversation>
      )}
      <div className="mx-auto w-full max-w-3xl p-3 pt-0">
        <PromptBox onSubmit={(text) => text.trim() && chat.sendMessage({ text })} streaming={busy} onStop={() => chat.stop()} placeholder={placeholder} toolbar={toolbar} />
      </div>
    </div>
  );
}

/**
 * A fake useChat() for demos, tests and storybooks: streams scripted replies (reasoning, tools, text, sources)
 * with realistic timing. Swap for the real hook when your API route is ready.
 */
export function useMockChat(script: (input: string, turn: number) => AIMessagePart[], opts: { initial?: AIMessage[]; speed?: number } = {}): AIChatHelpers {
  const [messages, setMessages] = React.useState<AIMessage[]>(opts.initial ?? []);
  const [status, setStatus] = React.useState<AIChatStatus>("ready");
  const cancel = React.useRef(false);
  const turn = React.useRef(0);
  const approvals = React.useRef(new Map<string, (ok: boolean) => void>());
  const speed = opts.speed ?? 1;
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms / speed));

  const stream = async (prompt: string, replaceId?: string) => {
    cancel.current = false;
    setStatus("submitted");
    const id = replaceId ?? `a${Date.now()}`;
    await wait(500);
    const plan = script(prompt, turn.current++);
    const parts: AIMessagePart[] = [];
    const push = () => setMessages((ms) => {
      const msg: AIMessage = { id, role: "assistant", parts: parts.map((p) => ({ ...p })) as AIMessagePart[] };
      const i = ms.findIndex((m) => m.id === id);
      return i >= 0 ? [...ms.slice(0, i), msg, ...ms.slice(i + 1)] : [...ms, msg];
    });
    setStatus("streaming");
    for (const step of plan) {
      if (cancel.current) break;
      if (step.type === "text" || step.type === "reasoning") {
        const p = { ...step, text: "", state: "streaming" as const };
        parts.push(p);
        const words = step.text.split(/(\s+)/);
        for (const w of words) {
          if (cancel.current) break;
          p.text += w;
          push();
          await wait(step.type === "reasoning" ? 14 : 24);
        }
        p.state = "done" as never;
        push();
      } else if (isTool(step)) {
        const final = step;
        const p: AIToolPart = { ...final, state: "input-available", output: undefined };
        parts.push(p);
        push();
        if (final.state === "approval-requested" || final.approval) {
          p.state = "approval-requested";
          p.approval = { id: final.toolCallId };
          push();
          setStatus("ready");
          const ok = await new Promise<boolean>((res) => approvals.current.set(final.toolCallId, res));
          setStatus("streaming");
          if (!ok) {
            p.state = "output-denied";
            push();
            continue;
          }
          p.state = "approval-responded";
          push();
        }
        await wait(900);
        p.state = final.state === "output-error" ? "output-error" : "output-available";
        p.output = final.output;
        p.errorText = final.errorText;
        push();
      } else {
        parts.push(step);
        push();
        await wait(120);
      }
    }
    setStatus("ready");
  };

  return {
    messages,
    status,
    sendMessage: ({ text }) => {
      setMessages((ms) => [...ms, { id: `u${Date.now()}`, role: "user", parts: [{ type: "text", text }] }]);
      void stream(text);
    },
    stop: () => {
      cancel.current = true;
      setStatus("ready");
    },
    regenerate: (o) => {
      const idx = o?.messageId ? messages.findIndex((m) => m.id === o.messageId) : messages.length - 1;
      const prompt = [...messages.slice(0, idx)].reverse().find((m) => m.role === "user");
      setMessages((ms) => ms.slice(0, idx));
      void stream(prompt ? textOf(prompt) : "");
    },
    addToolApprovalResponse: ({ id, approved }) => {
      approvals.current.get(id)?.(approved);
      approvals.current.delete(id);
    },
  };
}
