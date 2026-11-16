"use client";

import * as React from "react";
import { AIChat, ContextMeter, ModelSelector, type AIChatHelpers } from "@kineticui/ui";

export const models = [
  { id: "anthropic/claude-sonnet-5.5", name: "Claude Sonnet", description: "Fast and capable", speed: 4, intelligence: 4 },
  { id: "anthropic/claude-opus-5.5", name: "Claude Opus", description: "Deepest reasoning", speed: 2, intelligence: 5 },
  { id: "anthropic/claude-haiku-5.5", name: "Claude Haiku", description: "Quickest replies", speed: 5, intelligence: 3 },
];

/** The chat screen. Takes any useChat()-shaped object so it can run on the real API or a mock. */
export function ChatApp({ chat, model, onModelChange }: { chat: AIChatHelpers; model: string; onModelChange: (id: string) => void }) {
  // Rough token estimate for the meter: about four characters per token.
  const used = chat.messages.reduce((n, m) => n + m.parts.reduce((k, p) => k + ("text" in p ? p.text.length : 200), 0), 0) / 4;
  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
        <span className="flex size-7 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" /></svg>
        </span>
        <span className="font-display font-semibold">Assistant</span>
        <span className="ml-auto text-xs text-subtle">{models.find((m) => m.id === model)?.name}</span>
      </header>
      <AIChat
        chat={chat}
        className="min-h-0 flex-1"
        assistantName="Assistant"
        empty={{
          title: "What can I help with?",
          description: "Ask a question, paste some code or describe what you want to build.",
          suggestions: [
            { title: "Explain a concept", prompt: "Explain React Server Components like I'm a designer" },
            { title: "Write some code", prompt: "Write a debounce hook in TypeScript with tests" },
            { title: "Plan a launch", prompt: "Draft a launch checklist for a small SaaS" },
            { title: "Review my idea", prompt: "Poke holes in this idea: a habit tracker for teams" },
          ],
        }}
        toolbar={
          <div className="flex items-center gap-1">
            <ModelSelector models={models} value={model} onValueChange={onModelChange} />
            <ContextMeter used={Math.round(used)} max={200_000} modelName={models.find((m) => m.id === model)?.name} />
          </div>
        }
      />
    </div>
  );
}
