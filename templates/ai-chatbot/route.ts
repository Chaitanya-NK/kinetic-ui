import { convertToModelMessages, streamText, type UIMessage } from "ai";

export const maxDuration = 60;

const allowed = new Set(["anthropic/claude-sonnet-5.5", "anthropic/claude-opus-5.5", "anthropic/claude-haiku-5.5"]);

export async function POST(req: Request) {
  const { messages, model }: { messages: UIMessage[]; model?: string } = await req.json();
  const result = streamText({
    // Strings are routed through the Vercel AI Gateway. Swap in any provider, e.g. anthropic("...").
    model: model && allowed.has(model) ? model : "anthropic/claude-sonnet-5.5",
    instructions: "You are a helpful, concise assistant. Use Markdown for structure and code.",
    messages: await convertToModelMessages(messages),
  });
  return result.toUIMessageStreamResponse({ sendReasoning: true, sendSources: true });
}
