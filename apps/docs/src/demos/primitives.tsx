"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Badge,
  Button,
  ButtonGroup,
  ButtonGroupText,
  Checkbox,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  ScrollArea,
  Select,
  SortableHandle,
  SortableList,
  Switch,
  Textarea,
  TreeSelect,
  VirtualList,
  VirtualTable,
  type TreeSelectNode,
  type VirtualColumn,
} from "@kineticui/ui";
import { Form, FormErrorSummary, FormField, FormSubmit } from "@kineticui/ui/form";
import {
  ChevronDownIcon,
  CopyIcon,
  DownloadIcon,
  FileIcon,
  FolderIcon,
  LockIcon,
  MailIcon,
  MinusIcon,
  PlusIcon,
  SearchIcon,
  ShareIcon,
  TerminalIcon,
} from "@kineticui/icons";

/* ---------------------------------------------------------------- form */

const signup = z.object({
  name: z.string().min(2, "Tell us your name"),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters").regex(/[0-9]/, "Include a number"),
  role: z.string().min(1, "Pick a role"),
  bio: z.string().max(140, "Keep it under 140 characters").optional(),
  terms: z.literal(true, { error: "Accept the terms to continue" }),
});
type Signup = z.infer<typeof signup>;

function FormDemo() {
  const form = useForm<Signup>({
    resolver: zodResolver(signup),
    mode: "onTouched",
    defaultValues: { name: "", email: "", password: "", role: "", bio: "", terms: false as unknown as true },
  });
  return (
    <Form form={form} onSubmit={() => new Promise((r) => setTimeout(r, 1200))} className="w-full max-w-md">
      <FormErrorSummary />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField<Signup, "name"> name="name" label="Name" required showValid>
          {(f) => <Input {...f} placeholder="Maya Kapoor" />}
        </FormField>
        <FormField<Signup, "email"> name="email" label="Email" required showValid>
          {(f) => <Input {...f} type="email" leading={<MailIcon />} placeholder="maya@kinetic.dev" />}
        </FormField>
      </div>
      <FormField<Signup, "password"> name="password" label="Password" required description="8+ characters with a number.">
        {(f) => <Input {...f} type="password" leading={<LockIcon />} placeholder="••••••••" />}
      </FormField>
      <FormField<Signup, "role"> name="role" label="Role" required>
        {({ value, onChange, id, invalid }) => (
          <Select
            id={id}
            invalid={invalid}
            value={value}
            onValueChange={onChange}
            placeholder="Choose one"
            options={[
              { value: "design", label: "Designer" },
              { value: "eng", label: "Engineer" },
              { value: "pm", label: "Product" },
            ]}
          />
        )}
      </FormField>
      <FormField<Signup, "bio"> name="bio" label="Short bio" description="Optional, shown on your profile.">
        {(f) => <Textarea {...f} value={f.value ?? ""} rows={2} placeholder="Building motion-first interfaces." />}
      </FormField>
      <FormField<Signup, "terms"> name="terms" inline label="I accept the terms">
        {({ value, onChange, id, ...rest }) => <Checkbox id={id} checked={!!value} onCheckedChange={(c) => onChange(c === true)} aria-invalid={rest["aria-invalid"]} />}
      </FormField>
      <FormSubmit className="w-full">Create account</FormSubmit>
    </Form>
  );
}

/* ---------------------------------------------------------------- sortable */

const tasks0 = [
  { id: "1", title: "Design the onboarding flow", tag: "Design" },
  { id: "2", title: "Wire the billing webhook", tag: "Backend" },
  { id: "3", title: "Write release notes for 0.2", tag: "Docs" },
  { id: "4", title: "Record the launch film", tag: "Marketing" },
  { id: "5", title: "Audit keyboard focus order", tag: "A11y" },
];

function SortableDemo() {
  const [items, setItems] = React.useState(tasks0);
  return (
    <div className="w-full max-w-md">
      <SortableList
        items={items}
        onReorder={setItems}
        getKey={(t) => t.id}
        getLabel={(t) => t.title}
        renderItem={(t, { handleProps, index }) => (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-raised p-2 pr-4">
            <SortableHandle {...handleProps} />
            <span className="w-5 font-mono text-xs text-subtle">{String(index + 1).padStart(2, "0")}</span>
            <span className="flex-1 truncate text-sm">{t.title}</span>
            <Badge variant="outline">{t.tag}</Badge>
          </div>
        )}
      />
      <p className="mt-3 text-center text-xs text-subtle">Drag a handle, or focus it and press Space then ↑ ↓</p>
    </div>
  );
}

/* ---------------------------------------------------------------- resizable */

function ResizableDemo() {
  return (
    <div className="h-80 w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-surface">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={24} minSize={16} collapsible>
          <div className="flex h-full flex-col gap-1 p-3 text-sm">
            <span className="px-2 pb-2 font-mono text-[10px] uppercase tracking-wider text-subtle">Explorer</span>
            {["app", "components", "lib"].map((f) => (
              <span key={f} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-muted hover:bg-surface-raised"><FolderIcon size={14} />{f}</span>
            ))}
            {["page.tsx", "layout.tsx"].map((f, i) => (
              <span key={f} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${i === 0 ? "bg-accent-soft text-foreground" : "text-muted"}`}><FileIcon size={14} />{f}</span>
            ))}
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={64} minSize={25}>
              <pre className="h-full overflow-hidden p-4 font-mono text-[12px] leading-6 text-muted">
                <span className="text-accent">export default</span> <span className="text-foreground">function</span> Page() {"{"}{"\n"}
                {"  "}<span className="text-accent">return</span> {"<"}<span className="text-foreground">Hero</span> title=<span className="text-success">&quot;Move fast&quot;</span> /{">"};{"\n"}
                {"}"}
              </pre>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel minSize={15} collapsible>
              <div className="flex h-full flex-col gap-1 bg-background/60 p-3 font-mono text-[11px] text-subtle">
                <span className="flex items-center gap-2 text-muted"><TerminalIcon size={12} /> Terminal</span>
                <span><span className="text-accent">$</span> npm run dev</span>
                <span>ready on http://localhost:3000</span>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

/* ---------------------------------------------------------------- virtual */

const first = ["Maya", "Arjun", "Lena", "Sam", "Priya", "Kenji", "Noor", "Elena", "Tomas", "Aisha"];
const last = ["Kapoor", "Mehta", "Ortiz", "Okafor", "Shah", "Sato", "Haddad", "Rossi", "Novak", "Bello"];
const plans = ["Free", "Pro", "Team", "Enterprise"];
type Row = { id: number; name: string; plan: string; mrr: number; seen: number };
function makeRows(n: number): Row[] {
  let s = 7;
  const r = () => ((s = (s * 16807) % 2147483647), s / 2147483647);
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    name: `${first[Math.floor(r() * 10)]} ${last[Math.floor(r() * 10)]}`,
    plan: plans[Math.floor(r() * 4)]!,
    mrr: Math.round(r() * 900),
    seen: Math.floor(r() * 60),
  }));
}

function VirtualDemo() {
  const rows = React.useMemo(() => makeRows(100_000), []);
  const cols: VirtualColumn<Row>[] = [
    { key: "id", header: "#", width: "90px", sortValue: (r) => r.id, render: (r) => <span className="font-mono text-xs text-subtle">{r.id.toLocaleString("en-US")}</span> },
    { key: "name", header: "Customer", width: "2fr", sortValue: (r) => r.name, render: (r) => <span className="truncate">{r.name}</span> },
    { key: "plan", header: "Plan", width: "1fr", sortValue: (r) => r.plan, render: (r) => <Badge variant={r.plan === "Enterprise" ? "solid" : "outline"}>{r.plan}</Badge> },
    { key: "mrr", header: "MRR", width: "1fr", align: "right", sortValue: (r) => r.mrr, render: (r) => <span className="font-mono">${r.mrr}</span> },
    { key: "seen", header: "Last seen", width: "1fr", align: "right", sortValue: (r) => r.seen, render: (r) => <span className="text-muted">{r.seen === 0 ? "today" : `${r.seen}d ago`}</span> },
  ];
  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      <VirtualTable rows={rows} columns={cols} height={340} showStats />
      <VirtualList
        aria-label="Activity log"
        items={rows.slice(0, 20_000)}
        rowHeight={36}
        height={160}
        className="rounded-2xl border border-border bg-surface"
        renderItem={(r, i) => (
          <div className="flex h-full items-center gap-3 border-b border-border/50 px-4 font-mono text-[12px]">
            <span className="w-14 text-subtle">{String(i).padStart(5, "0")}</span>
            <span className="text-accent">{r.plan.toLowerCase()}</span>
            <span className="truncate text-muted">{r.name} upgraded their workspace</span>
          </div>
        )}
      />
    </div>
  );
}

/* ---------------------------------------------------------------- misc */

const tree: TreeSelectNode[] = [
  {
    id: "eng",
    label: "Engineering",
    children: [
      { id: "fe", label: "Frontend", children: [{ id: "web", label: "Web app" }, { id: "ds", label: "Design system" }] },
      { id: "be", label: "Backend", children: [{ id: "api", label: "API" }, { id: "infra", label: "Infrastructure" }] },
    ],
  },
  { id: "design", label: "Design", children: [{ id: "brand", label: "Brand" }, { id: "product", label: "Product design" }] },
  { id: "ops", label: "Operations", children: [{ id: "people", label: "People" }, { id: "finance", label: "Finance" }, { id: "legal", label: "Legal" }] },
];

function TreeSelectDemo() {
  const [many, setMany] = React.useState(["web", "ds", "brand"]);
  const [one, setOne] = React.useState<string[]>(["api"]);
  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <label className="flex flex-col gap-1.5 text-sm font-medium">Teams<TreeSelect aria-label="Teams" data={tree} value={many} onValueChange={setMany} /></label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">Owner team<TreeSelect aria-label="Owner team" data={tree} value={one} onValueChange={setOne} multiple={false} /></label>
    </div>
  );
}

function ButtonGroupDemo() {
  const [n, setN] = React.useState(2);
  return (
    <div className="flex flex-col items-center gap-5">
      <ButtonGroup>
        <Button variant="outline">Day</Button>
        <Button variant="outline">Week</Button>
        <Button variant="outline">Month</Button>
      </ButtonGroup>
      <ButtonGroup variant="solid">
        <Button>Publish</Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" aria-label="More publish options"><ChevronDownIcon /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Schedule</DropdownMenuItem>
            <DropdownMenuItem>Save as draft</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline" size="icon" aria-label="Decrease" onClick={() => setN((v) => Math.max(0, v - 1))}><MinusIcon /></Button>
        <ButtonGroupText className="w-14 justify-center font-mono text-foreground">{n}</ButtonGroupText>
        <Button variant="outline" size="icon" aria-label="Increase" onClick={() => setN((v) => v + 1)}><PlusIcon /></Button>
      </ButtonGroup>
      <ButtonGroup className="w-80">
        <ButtonGroupText>https://</ButtonGroupText>
        <Input wrapperClassName="rounded-none flex-1" defaultValue="kinetic.dev/maya" aria-label="Link" />
        <Button variant="outline" size="icon" aria-label="Copy"><CopyIcon /></Button>
      </ButtonGroup>
    </div>
  );
}

function MenubarDemo() {
  const [view, setView] = React.useState("comfortable");
  const [rulers, setRulers] = React.useState(true);
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem shortcut="⌘N">New tab</MenubarItem>
          <MenubarItem shortcut="⌘⇧N">New window</MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger><ShareIcon /> Share</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Copy link</MenubarItem>
              <MenubarItem>Email</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarItem shortcut="⌘S"><DownloadIcon /> Export</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem shortcut="⌘Z">Undo</MenubarItem>
          <MenubarItem shortcut="⌘⇧Z">Redo</MenubarItem>
          <MenubarSeparator />
          <MenubarItem shortcut="⌘F"><SearchIcon /> Find</MenubarItem>
          <MenubarItem destructive>Delete selection</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked={rulers} onCheckedChange={setRulers}>Show rulers</MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarLabel>Density</MenubarLabel>
          <MenubarRadioGroup value={view} onValueChange={setView}>
            <MenubarRadioItem value="compact">Compact</MenubarRadioItem>
            <MenubarRadioItem value="comfortable">Comfortable</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Help</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Documentation</MenubarItem>
          <MenubarItem shortcut="?">Keyboard shortcuts</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

const tags = Array.from({ length: 40 }, (_, i) => `v0.${Math.floor(i / 10)}.${i % 10}`).reverse();

function ScrollAreaDemo() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-5 sm:flex-row">
      <ScrollArea className="h-64 w-full rounded-2xl border border-border bg-surface sm:w-48">
        <div className="p-3">
          <span className="block px-2 pb-2 font-mono text-[10px] uppercase tracking-wider text-subtle">Releases</span>
          {tags.map((t) => (
            <div key={t} className="rounded-lg px-2 py-1.5 font-mono text-sm text-muted hover:bg-surface-raised hover:text-foreground">{t}</div>
          ))}
        </div>
      </ScrollArea>
      <ScrollArea orientation="horizontal" className="w-full rounded-2xl border border-border bg-surface sm:flex-1 sm:self-start">
        <div className="flex w-max gap-3 p-4">
          {["Aurora", "Graphite", "Lime", "Ocean", "Ember", "Orchid", "Sand", "Mint"].map((n, i) => (
            <div key={n} className="flex h-28 w-24 shrink-0 flex-col justify-end rounded-xl p-2 text-xs font-medium" style={{ background: `linear-gradient(160deg, hsl(${i * 45} 70% 55%), hsl(${i * 45 + 40} 60% 22%))` }}>{n}</div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function CollapsibleDemo() {
  const [open, setOpen] = React.useState(true);
  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-4">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="py-1">
          <span className="flex items-center gap-2">Starred repositories <Badge variant="outline">3</Badge></span>
        </CollapsibleTrigger>
        <div className="mt-3 rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm">chaitanya-nk/kinetic-ui</div>
        <CollapsibleContent className="flex flex-col gap-2 pt-2">
          {["vercel/next.js", "motiondivision/motion"].map((r) => (
            <div key={r} className="rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-muted">{r}</div>
          ))}
        </CollapsibleContent>
      </Collapsible>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm text-muted">
        Expanded <Switch checked={open} onCheckedChange={setOpen} aria-label="Expanded" />
      </div>
    </div>
  );
}

export const primitiveDemos: Record<string, () => React.ReactNode> = {
  form: () => <FormDemo />,
  "sortable-list": () => <SortableDemo />,
  resizable: () => <ResizableDemo />,
  "virtual-list": () => <VirtualDemo />,
  "button-group": () => <ButtonGroupDemo />,
  menubar: () => <MenubarDemo />,
  "scroll-area": () => <ScrollAreaDemo />,
  collapsible: () => <CollapsibleDemo />,
  "tree-select": () => <TreeSelectDemo />,
};
