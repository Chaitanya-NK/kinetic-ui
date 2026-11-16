"use client";

import * as React from "react";
import { useMockChat, type AIMessagePart } from "@kineticui/ui";
import { ChatApp, models } from "./chat-app";

const reply = (input: string): AIMessagePart[] => [
  { type: "reasoning", text: `They asked: "${input}". A short, structured answer with an example will be most useful.` },
  {
    type: "text",
    text: "Here's the short version.\n\n- **Start small**: ship one flow end to end\n- **Measure it**: add one metric you'll actually check\n- **Iterate weekly**: keep a running changelog\n\nThis preview streams scripted replies. The installed template talks to your model through `/api/chat`.",
  },
];

export default function Preview() {
  const [model, setModel] = React.useState(models[0]!.id);
  const chat = useMockChat(reply);
  return <ChatApp chat={chat} model={model} onModelChange={setModel} />;
}
