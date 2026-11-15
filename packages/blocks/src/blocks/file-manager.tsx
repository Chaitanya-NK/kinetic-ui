"use client";

import * as React from "react";
import { cn } from "@kineticui/core";
import { Breadcrumb, Button, ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger, FileDropzone, Progress, SegmentedControl, TreeView, toast } from "@kineticui/ui";
import { DownloadIcon, EditIcon, FileIcon, FolderIcon, ImageIcon, ShareIcon, TrashIcon, UploadIcon, VideoIcon } from "@kineticui/icons";

type Item = { id: string; name: string; kind: "folder" | "image" | "video" | "doc"; size: string; modified: string };
const items: Item[] = [
  { id: "1", name: "Brand assets", kind: "folder", size: "24 items", modified: "Today" },
  { id: "2", name: "Launch video", kind: "folder", size: "6 items", modified: "Yesterday" },
  { id: "3", name: "hero-shot.png", kind: "image", size: "2.4 MB", modified: "Today" },
  { id: "4", name: "teaser.mp4", kind: "video", size: "48 MB", modified: "Nov 12" },
  { id: "5", name: "press-kit.pdf", kind: "doc", size: "8.1 MB", modified: "Nov 10" },
  { id: "6", name: "palette.png", kind: "image", size: "640 KB", modified: "Nov 9" },
  { id: "7", name: "roadmap.pdf", kind: "doc", size: "1.2 MB", modified: "Nov 2" },
];
const icon = { folder: <FolderIcon />, image: <ImageIcon />, video: <VideoIcon />, doc: <FileIcon /> };
const tint = { folder: "text-accent bg-accent-soft", image: "text-[#7C8CFF] bg-[#7C8CFF]/15", video: "text-[#F0A3D0] bg-[#F0A3D0]/15", doc: "text-[#F4A86A] bg-[#F4A86A]/15" };

/** Drive-style file browser: folder tree, breadcrumb, grid/list views, right-click actions, drop-to-upload and storage meter. */
export function FileManager() {
  const [view, setView] = React.useState("grid");
  const [sel, setSel] = React.useState<string | null>("3");
  const [uploading, setUploading] = React.useState(false);

  const menu = (it: Item, child: React.ReactNode) => (
    <ContextMenu key={it.id}>
      <ContextMenuTrigger asChild>{child}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => toast(`Sharing ${it.name}`)}><ShareIcon /> Share</ContextMenuItem>
        <ContextMenuItem shortcut="⌘D"><DownloadIcon /> Download</ContextMenuItem>
        <ContextMenuItem shortcut="F2"><EditIcon /> Rename</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem destructive onSelect={() => toast(`Moved ${it.name} to trash`)}><TrashIcon /> Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );

  return (
    <div className="flex h-[760px] bg-background text-sm">
      <aside className="hidden w-60 shrink-0 flex-col gap-4 border-r border-border p-3 md:flex">
        <Button onClick={() => setUploading((u) => !u)}><UploadIcon size={15} /> Upload</Button>
        <TreeView
          className="flex-1"
          selected="design"
          defaultExpanded={["drive", "design"]}
          data={[
            { id: "drive", label: "My Drive", children: [
              { id: "design", label: "Design", children: [{ id: "brand", label: "Brand assets" }, { id: "launch", label: "Launch video" }] },
              { id: "eng", label: "Engineering", children: [{ id: "specs", label: "Specs" }] },
              { id: "finance", label: "Finance" },
            ] },
            { id: "shared", label: "Shared with me", children: [{ id: "s1", label: "Partners" }] },
          ]}
        />
        <div className="rounded-xl border border-border p-3">
          <Progress value={68} label="Storage" />
          <p className="mt-2 text-xs text-subtle">68 GB of 100 GB used</p>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3">
          <Breadcrumb items={[{ label: "My Drive", href: "#drive" }, { label: "Design", href: "#design" }, { label: "Q4 launch" }]} />
          <SegmentedControl className="ml-auto" value={view} defaultValue="grid" onValueChange={setView} options={[{ value: "grid", label: "Grid" }, { value: "list", label: "List" }]} />
        </header>
        <div className="flex-1 overflow-y-auto p-5">
          {uploading ? (
            <FileDropzone className="mb-5" onFiles={(f: File[]) => toast(`${f.length} file(s) uploading`)} />
          ) : null}
          {view === "grid" ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {items.map((it) =>
                menu(
                  it,
                  <button type="button" onClick={() => setSel(it.id)} onDoubleClick={() => toast(`Open ${it.name}`)} className={cn("flex flex-col gap-3 rounded-2xl border p-3 text-left transition-colors", sel === it.id ? "border-accent bg-accent-soft/30" : "border-border bg-surface hover:border-border-strong")}>
                    <span className={cn("flex aspect-[4/3] items-center justify-center rounded-xl [&_svg]:size-8", tint[it.kind])}>{icon[it.kind]}</span>
                    <span className="flex flex-col">
                      <span className="truncate font-medium">{it.name}</span>
                      <span className="text-xs text-subtle">{it.size}</span>
                    </span>
                  </button>,
                ),
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border">
              {items.map((it) =>
                menu(
                  it,
                  <button type="button" onClick={() => setSel(it.id)} className={cn("flex w-full items-center gap-3 border-b border-border px-4 py-2.5 text-left last:border-0", sel === it.id ? "bg-accent-soft/30" : "hover:bg-surface")}>
                    <span className={cn("flex size-8 items-center justify-center rounded-lg [&_svg]:size-4", tint[it.kind])}>{icon[it.kind]}</span>
                    <span className="flex-1 truncate font-medium">{it.name}</span>
                    <span className="hidden w-24 text-xs text-subtle sm:block">{it.modified}</span>
                    <span className="w-20 text-right font-mono text-xs text-subtle">{it.size}</span>
                  </button>,
                ),
              )}
            </div>
          )}
          <p className="mt-4 text-center text-xs text-subtle">Right-click a file for actions. Double-click to open.</p>
        </div>
      </div>
    </div>
  );
}
