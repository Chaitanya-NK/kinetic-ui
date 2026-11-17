/** Real-world usage snippets shown on component pages, for components that wire into other libraries. */
export const usage: Record<string, { title?: string; note?: string; code: string }[]> = {
  "node-editor": [
    {
      code: `const [nodes, setNodes] = useState<EditorNode[]>([
  { id: "in", x: 0, y: 0, title: "Webhook", outputs: [{ id: "body" }] },
  { id: "llm", x: 300, y: 0, title: "Summarise", inputs: [{ id: "text" }], outputs: [{ id: "summary" }] },
]);
const [edges, setEdges] = useState<EditorEdge[]>([]);

<NodeEditor
  nodes={nodes}
  onNodesChange={setNodes}
  edges={edges}
  onEdgesChange={setEdges}   // save the graph wherever you like
  isValidConnection={(from, to) => from.node !== to.node}
/>`,
    },
  ],
  "voice-orb": [
    {
      code: `const mic = useMicrophoneLevel();
const [state, setState] = useState<VoiceOrbState>("idle");

<VoiceOrb
  state={state}
  level={mic.active ? mic.level : undefined}  // read every frame, no re-renders
  onClick={async () => {
    if (mic.active) { mic.stop(); setState("thinking"); }
    else { await mic.start(); setState("listening"); }
  }}
/>`,
    },
  ],
  stories: [
    {
      code: `const stories: Story[] = [
  {
    id: "maya",
    name: "Maya Kapoor",
    avatar: "/maya.jpg",
    items: [
      { id: "1", src: "/stories/launch.jpg", caption: "We shipped it", time: "2h" },
      { id: "2", content: <ReleaseCard />, duration: 8 },
    ],
  },
];

// Rings that open a full-screen player
<Stories stories={stories} onSeenChange={saveSeen} />

// Or just the player, inline
<StoryPlayer stories={stories} onClose={() => router.back()} />`,
    },
  ],
  "receipt-printer": [
    {
      code: `const { play } = useSound();

<ReceiptPrinter
  merchant="Kinetic Coffee"
  meta={["Order #2048", "17 Nov 2026, 09:41"]}
  items={[{ label: "Flat white", qty: 2, amount: 4.5 }, { label: "Croissant", amount: 3.75 }]}
  tax={0.05}
  barcode="KC-2048-0941"
  printKey={order.id}          // print again whenever this changes
  onLine={() => play("type")}  // tick per line with UI Sounds
/>`,
    },
  ],
  "dynamic-island": [
    {
      code: `const [playing, setPlaying] = useState(true);

<DynamicIsland
  fixed
  activity={islandMusic({
    title: "Midnight Drive",
    artist: "Neon Coast",
    playing,
    progress: 0.42,
    onToggle: () => setPlaying((p) => !p),
  })}
/>

// Other ready-made activities: islandTimer, islandUpload, islandCall, islandThinking.
// Or pass your own: { id, label, leading, trailing, expanded }.`,
    },
  ],
  "ui-sounds": [
    {
      code: `// Wrap the app once
<SoundProvider>
  <App />
</SoundProvider>

// Anywhere inside
const { play } = useSound();
<Button onClick={() => { save(); play("success"); }}>Save</Button>

// Let people turn sounds on (they're off by default)
<SoundToggle />`,
    },
  ],
  "morph-surface": [
    {
      code: `<MorphSurface label="Feedback" width={320}>
  {({ close, done }) => (
    <form onSubmit={async (e) => { e.preventDefault(); await send(); done("Thanks!"); }}>
      <MorphSurfaceHeader onClose={close}>Send feedback</MorphSurfaceHeader>
      <Textarea />
      <Button type="submit">Send</Button>
    </form>
  )}
</MorphSurface>`,
    },
  ],
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
