"use client";

import * as React from "react";
import {
  Autocomplete,
  Calendar,
  CardInput,
  ColorPicker,
  Combobox,
  DatePicker,
  DateRangePicker,
  FileDropzone,
  FileItem,
  InlineEdit,
  MentionInput,
  PasswordInput,
  PhoneInput,
  Rating,
  SearchInput,
  Select,
  SignaturePad,
  TagInput,
  TimePicker,
  ToggleGroup,
  ToggleGroupItem,
  formatTime,
  toast,
  type ComboboxOption,
  type DateRange,
  type TimeValue,
} from "@kineticui/ui";

const stacks = [
  { value: "react", label: "React", group: "Frameworks" },
  { value: "next", label: "Next.js", group: "Frameworks" },
  { value: "vue", label: "Vue", group: "Frameworks" },
  { value: "svelte", label: "Svelte", group: "Frameworks" },
  { value: "ts", label: "TypeScript", group: "Languages" },
  { value: "rust", label: "Rust", group: "Languages" },
  { value: "go", label: "Go", group: "Languages" },
];

function S({ children, className = "w-full max-w-sm" }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex flex-col gap-4 ${className}`}>{children}</div>;
}

function ComboDemo() {
  const [opts, setOpts] = React.useState<ComboboxOption[]>(stacks);
  const [multi, setMulti] = React.useState<string[]>(["react", "next"]);
  return (
    <S>
      <Combobox aria-label="Framework" options={opts} placeholder="Pick one…" />
      <Combobox
        aria-label="Stack"
        multiple
        options={opts}
        value={multi}
        onValueChange={setMulti}
        placeholder="Pick several…"
        onCreate={(label) => {
          const v = label.toLowerCase().replace(/\s+/g, "-");
          setOpts((o) => [...o, { value: v, label }]);
          setMulti((m) => [...m, v]);
        }}
      />
    </S>
  );
}

function CalendarDemo() {
  const [d, setD] = React.useState<Date>();
  const [r, setR] = React.useState<DateRange>({});
  return (
    <div className="flex flex-wrap items-start justify-center gap-8">
      <div className="rounded-2xl border border-border bg-surface p-4">
        <Calendar mode="range" selected={r} onSelect={setR} disabled={(x) => x.getDay() === 0} />
      </div>
      <S className="w-72">
        <DatePicker value={d} onValueChange={setD} />
        <DateRangePicker />
        <p className="text-xs text-subtle">Sundays are disabled in the calendar on the left. Arrow keys move between days.</p>
      </S>
    </div>
  );
}

function TimeDemo() {
  const [t, setT] = React.useState<TimeValue>({ hours: 10, minutes: 30 });
  return (
    <S className="items-center">
      <TimePicker value={t} onValueChange={setT} />
      <span className="text-sm text-muted">Meeting at <b className="text-foreground">{formatTime(t)}</b></span>
    </S>
  );
}

function DropzoneDemo() {
  const [files, setFiles] = React.useState<{ name: string; size: number; progress: number }[]>([
    { name: "pitch-deck.pdf", size: 6_000_000, progress: 70 },
  ]);
  React.useEffect(() => {
    const t = setInterval(() => setFiles((fs) => fs.map((f) => ({ ...f, progress: Math.min(100, f.progress + 8) }))), 400);
    return () => clearInterval(t);
  }, []);
  return (
    <S className="w-full max-w-md">
      <FileDropzone
        accept="image/*,.pdf"
        maxSize={10 * 1024 * 1024}
        hint="PNG, JPG or PDF · up to 10 MB"
        onFiles={(fs) => setFiles((cur) => [...cur, ...fs.map((f) => ({ name: f.name, size: f.size, progress: 0 }))])}
        onReject={(r) => toast({ title: `${r[0]!.file.name} rejected`, description: r[0]!.reason, tone: "error" })}
      />
      {files.map((f, i) => (
        <FileItem key={f.name + i} name={f.name} size={f.size} progress={f.progress} status={f.progress >= 100 ? "done" : "uploading"} onRemove={() => setFiles((x) => x.filter((_, j) => j !== i))} />
      ))}
    </S>
  );
}

function InlineDemo() {
  const [title, setTitle] = React.useState("Q4 Launch plan");
  return (
    <S className="items-center">
      <InlineEdit as="h2" value={title} onSave={setTitle} className="font-display text-2xl font-semibold" />
      <span className="text-xs text-subtle">Click the title · Enter saves · Esc cancels</span>
    </S>
  );
}

function SignatureDemo() {
  const [signed, setSigned] = React.useState(false);
  return (
    <S className="w-full max-w-md">
      <SignaturePad onChange={(d) => setSigned(!!d)} />
      <span className="text-sm text-muted">{signed ? "✓ Signed — ready to submit" : "Draw your signature"}</span>
    </S>
  );
}

const cities = [
  { value: "blr", label: "12 MG Road", description: "Bengaluru, Karnataka 560001" },
  { value: "pune", label: "12 MG Road", description: "Pune, Maharashtra 411001" },
  { value: "del", label: "Connaught Place", description: "New Delhi 110001" },
  { value: "mum", label: "Marine Drive", description: "Mumbai, Maharashtra 400020" },
  { value: "hyd", label: "Banjara Hills", description: "Hyderabad, Telangana 500034" },
];

export const formDemos: Record<string, () => React.ReactNode> = {
  select: () => (
    <S>
      <Select
        aria-label="Status"
        defaultValue="progress"
        options={[
          { value: "backlog", label: "Backlog", icon: <span className="size-2 rounded-full bg-subtle" /> },
          { value: "progress", label: "In progress", icon: <span className="size-2 rounded-full bg-warning" /> },
          { value: "done", label: "Done", icon: <span className="size-2 rounded-full bg-success" /> },
        ]}
      />
      <Select
        aria-label="Timezone"
        placeholder="Choose a timezone"
        options={[
          { value: "ist", label: "Kolkata", description: "UTC+05:30", group: "Asia" },
          { value: "jst", label: "Tokyo", description: "UTC+09:00", group: "Asia" },
          { value: "gmt", label: "London", description: "UTC+00:00", group: "Europe" },
          { value: "cet", label: "Stockholm", description: "UTC+01:00", group: "Europe" },
        ]}
      />
    </S>
  ),
  combobox: () => <ComboDemo />,
  "tag-input": () => (
    <S>
      <TagInput defaultValue={["design", "frontend"]} max={8} suggestions={["bug", "research", "mobile"]} aria-label="Tags" />
    </S>
  ),
  "color-picker": () => <ColorPicker />,
  "toggle-group": () => (
    <S className="items-center">
      <ToggleGroup type="multiple" defaultValue={["bold"]} aria-label="Formatting">
        <ToggleGroupItem value="bold" aria-label="Bold"><b>B</b></ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic"><i className="font-serif">I</i></ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Underline"><u>U</u></ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="single" defaultValue="m" aria-label="Size">
        {["XS", "S", "M", "L", "XL"].map((s) => (
          <ToggleGroupItem key={s} value={s.toLowerCase()} variant="accent">{s}</ToggleGroupItem>
        ))}
      </ToggleGroup>
    </S>
  ),
  "phone-input": () => (
    <S>
      <PhoneInput defaultNumber="9876543210" onValueChange={() => {}} />
    </S>
  ),
  "card-input": () => (
    <S>
      <CardInput />
      <span className="text-xs text-subtle">Try 4242 4242 4242 4242 (valid) or 4242 4242 4242 4241 (fails Luhn).</span>
    </S>
  ),
  "time-picker": () => <TimeDemo />,
  rating: () => <Rating defaultValue={4} labels={["Poor", "Fair", "Good", "Great", "Loved it"]} />,
  calendar: () => <CalendarDemo />,
  "file-dropzone": () => <DropzoneDemo />,
  "password-input": () => (
    <S>
      <PasswordInput showStrength placeholder="Create a password" aria-label="Password" defaultValue="Kinetic2026" />
    </S>
  ),
  autocomplete: () => (
    <S>
      <Autocomplete
        aria-label="Address"
        placeholder="Start typing an address…"
        items={cities}
        emptyItems={cities.slice(0, 2)}
        onSelect={(it) => toast({ title: it.label, description: it.description })}
      />
      <Autocomplete
        aria-label="Async search"
        placeholder="Async: search fruits…"
        onSearch={async (q) => {
          await new Promise((r) => setTimeout(r, 300));
          return ["Apple", "Apricot", "Banana", "Blueberry", "Cherry", "Mango", "Papaya"]
            .filter((f) => f.toLowerCase().includes(q.toLowerCase()))
            .map((f) => ({ value: f, label: f }));
        }}
        onSelect={(it) => toast(it.label)}
      />
    </S>
  ),
  "search-input": () => (
    <S>
      <SearchInput placeholder="Search components" meta="38" />
      <SearchInput pill placeholder="Pill search" shortcut={null} />
    </S>
  ),
  "mention-input": () => (
    <S className="w-full max-w-md">
      <MentionInput
        users={[
          { id: "1", name: "Maya Kapoor", description: "Design", color: "#7C8CFF" },
          { id: "2", name: "Rohan Joshi", description: "Platform", color: "#F4A86A" },
          { id: "3", name: "Rosa Silva", description: "Design", color: "#6EE7A0" },
          { id: "4", name: "Kemi Okafor", description: "CTO", color: "#F0A3D0" },
        ]}
      />
      <span className="text-xs text-subtle">Type @ then a name</span>
    </S>
  ),
  "signature-pad": () => <SignatureDemo />,
  "inline-edit": () => <InlineDemo />,
};
