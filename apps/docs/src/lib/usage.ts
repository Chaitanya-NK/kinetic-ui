/** Real-world usage snippets shown on component pages, for components that wire into other libraries. */
export const usage: Record<string, { title?: string; note?: string; code: string }[]> = {
  form: [
    {
      note: "Install the form peer dependencies once: npm i react-hook-form zod @hookform/resolvers",
      code: `"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@kineticui/ui";
import { Form, FormField, FormSubmit } from "@kineticui/ui/form";

const schema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

export function SignIn() {
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });
  return (
    <Form form={form} onSubmit={async (values) => { await signIn(values); }}>
      <FormField name="email" label="Email" required>
        {(field) => <Input {...field} type="email" />}
      </FormField>
      <FormField name="password" label="Password" required>
        {(field) => <Input {...field} type="password" />}
      </FormField>
      <FormSubmit>Sign in</FormSubmit>
    </Form>
  );
}`,
    },
  ],
  "ai-chat": [
    {
      title: "Client",
      code: `"use client";
import { useChat } from "@ai-sdk/react";
import { AIChat, ContextMeter } from "@kineticui/ui";

export default function Chat() {
  const chat = useChat(); // POSTs to /api/chat by default
  return <AIChat chat={chat} className="h-dvh" empty={{ title: "How can I help?" }} />;
}`,
    },
    {
      title: "Route handler (app/api/chat/route.ts)",
      code: `import { convertToModelMessages, streamText, type UIMessage } from "ai";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const result = streamText({
    model: "anthropic/claude-sonnet-5.5", // any AI Gateway or provider model
    messages: await convertToModelMessages(messages),
  });
  return result.toUIMessageStreamResponse({ sendReasoning: true, sendSources: true });
}`,
    },
    {
      title: "Only the message renderer",
      note: "Already have your own layout? Render AI SDK message parts with Kinetic components.",
      code: `import { MessageParts } from "@kineticui/ui";

{messages.map((m) => (
  <MessageParts
    key={m.id}
    message={m}
    onApproval={chat.addToolApprovalResponse}
    renderTool={(part) => part.type === "tool-weather" ? <WeatherCard {...part.output} /> : undefined}
  />
))}`,
    },
  ],
  "sortable-list": [
    {
      code: `const [items, setItems] = useState(tasks);

<SortableList
  items={items}
  onReorder={setItems}
  getKey={(t) => t.id}
  getLabel={(t) => t.title}
  renderItem={(t, { handleProps }) => (
    <div className="flex items-center gap-3 rounded-xl border p-2">
      <SortableHandle {...handleProps} />
      {t.title}
    </div>
  )}
/>`,
    },
  ],
  resizable: [
    {
      code: `<ResizablePanelGroup direction="horizontal" autoSaveId="editor">
  <ResizablePanel defaultSize={22} minSize={15} collapsible>
    <Sidebar />
  </ResizablePanel>
  <ResizableHandle />
  <ResizablePanel>
    <Editor />
  </ResizablePanel>
</ResizablePanelGroup>`,
    },
  ],
  "virtual-list": [
    {
      code: `<VirtualTable
  rows={customers}           // 100,000 rows is fine
  height={480}
  columns={[
    { key: "name", header: "Name", width: "2fr", sortValue: (r) => r.name, render: (r) => r.name },
    { key: "mrr", header: "MRR", align: "right", sortValue: (r) => r.mrr, render: (r) => \`$\${r.mrr}\` },
  ]}
/>`,
    },
  ],
};
