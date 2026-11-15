"use client";

import * as React from "react";
import {
  AddressAutocomplete,
  CodeEditor,
  CurrencyInput,
  EmojiPicker,
  FontPicker,
  GradientPicker,
  MarkdownEditor,
  ReactionBar,
  RichTextEditor,
  TimeRangeSlider,
  formatMinutes,
  toast,
} from "@kineticui/ui";
import { Button } from "@kineticui/ui";

const md = `## Release notes

Kinetic **2.5** ships *three* new editors and a [docs page](https://kinetic-ui.chaitanya-nk.com).

- [x] Rich text editor
- [x] Markdown with live preview
- [ ] Collaborative cursors

> Write once, preview instantly.

\`\`\`ts
import { MarkdownEditor } from "@kineticui/ui";
\`\`\``;

const code = `import { Button, toast } from "@kineticui/ui";

export function Save() {
  return (
    <Button onClick={() => toast.success("Saved")}>
      Save changes
    </Button>
  );
}
`;

function EmojiDemo() {
  const [picked, setPicked] = React.useState<string[]>([]);
  const [reactions, setReactions] = React.useState([
    { emoji: "👍", count: 4, mine: true },
    { emoji: "🎉", count: 2 },
    { emoji: "🚀", count: 7 },
  ]);
  return (
    <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start">
      <EmojiPicker onSelect={(e) => setPicked((p) => [...p, e].slice(-10))} />
      <div className="flex flex-col gap-4">
        <div className="min-h-10 rounded-xl border border-border bg-surface px-4 py-2 text-2xl">{picked.join(" ") || <span className="text-sm text-subtle">Picked emoji appear here</span>}</div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="mb-3 text-sm">Shipped the new blocks gallery.</p>
          <ReactionBar
            reactions={reactions}
            onToggle={(e) =>
              setReactions((rs) => {
                const r = rs.find((x) => x.emoji === e);
                if (!r) return [...rs, { emoji: e, count: 1, mine: true }];
                return rs.map((x) => (x.emoji === e ? { ...x, mine: !x.mine, count: x.count + (x.mine ? -1 : 1) } : x)).filter((x) => x.count > 0);
              })
            }
          />
        </div>
      </div>
    </div>
  );
}

function TimeDemo() {
  const [r, setR] = React.useState<[number, number]>([10 * 60, 12 * 60 + 30]);
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <TimeRangeSlider value={r} onValueChange={setR} blocked={[[13 * 60, 14 * 60], [16 * 60 + 30, 17 * 60 + 30]]} />
      <Button className="self-start" onClick={() => toast.success(`Booked ${formatMinutes(r[0])}–${formatMinutes(r[1])}`)}>Book this slot</Button>
    </div>
  );
}

export const editorDemos: Record<string, () => React.ReactNode> = {
  "rich-text-editor": () => (
    <RichTextEditor
      className="w-full max-w-2xl"
      defaultValue="<h2>Meeting notes</h2><p>We agreed to ship the <b>blocks gallery</b> on Friday. <i>Maya</i> owns the docs.</p><ul><li>Record a demo video</li><li>Update the changelog</li></ul>"
    />
  ),
  "markdown-editor": () => (
    <div className="flex w-full flex-col gap-6">
      <MarkdownEditor className="w-full" defaultValue={md} />
      <MarkdownEditor className="w-full max-w-xl" layout="tabs" height={220} defaultValue="Use **tabs** layout on small screens." />
    </div>
  ),
  "code-editor": () => <CodeEditor className="w-full max-w-2xl" filename="save.tsx" defaultValue={code} />,
  "emoji-picker": () => <EmojiDemo />,
  "time-range-slider": () => <TimeDemo />,
  "address-autocomplete": () => (
    <AddressAutocomplete className="w-full max-w-md" onSelect={(a) => toast(`${a.line1}, ${a.city}`)} onLocate={(c) => toast(`${c.lat.toFixed(3)}, ${c.lng.toFixed(3)}`)} placeholder="Try “Hyderabad” or “Baker”" />
  ),
  "currency-input": () => (
    <div className="flex w-full max-w-md flex-col gap-6">
      <CurrencyInput defaultValue={125000} presets={[500, 2000, 10000]} min={100} max={10000000} />
      <CurrencyInput currency="USD" selectable={false} defaultValue={1499.5} />
    </div>
  ),
  "gradient-picker": () => <GradientPicker onChange={() => {}} />,
  "font-picker": () => <FontPicker onValueChange={(f) => toast(`Font: ${f}`)} />,
};
