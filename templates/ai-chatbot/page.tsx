"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { AIChatHelpers } from "@kineticui/ui";
import { ChatApp, models } from "./chat-app";

export default function ChatPage() {
  const [model, setModel] = React.useState(models[0]!.id);
  const modelRef = React.useRef(model);
  modelRef.current = model;
  const chat = useChat({
    // Send the chosen model with every request.
    transport: new DefaultChatTransport({ api: "/api/chat", body: () => ({ model: modelRef.current }) }),
  });
  return <ChatApp chat={chat as unknown as AIChatHelpers} model={model} onModelChange={setModel} />;
}
