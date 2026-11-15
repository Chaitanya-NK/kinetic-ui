"use client";

import * as React from "react";
import { cn } from "@kineticui/core";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, SearchIcon } from "@kineticui/icons";

export type DataTableColumn<T> = {
  key: string;
  header: React.ReactNode;
  /** Value used for sorting and search. Defaults to row[key]. */
  accessor?: (row: T) => string | number | Date | null | undefined;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  width?: number | string;
};

export type DataTableProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];
  /** Unique id per row. */
  getRowId: (row: T) => string;
  /** Show a search box that filters across columns. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Row checkboxes plus a bulk-action bar. */
  selectable?: boolean;
  bulkActions?: (selected: T[], clear: () => void) => React.ReactNode;
  pageSize?: number;
  /** Extra controls next to the search box. */
  toolbar?: React.ReactNode;
  emptyMessage?: React.ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
};

type Sort = { key: string; dir: "asc" | "desc" } | null;

function Check({ checked, indeterminate, onChange, label }: { checked: boolean; indeterminate?: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={cn(
        "flex size-4 items-center justify-center rounded-[5px] border transition-colors",
        checked || indeterminate ? "border-accent bg-accent text-accent-foreground" : "border-border-strong hover:border-muted",
      )}
    >
      {indeterminate ? <span className="h-0.5 w-2 rounded bg-current" /> : checked ? (
        <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M2.5 6.5l2.3 2.2L9.5 3.5" /></svg>
      ) : null}
    </button>
  );
}

/** Sortable, searchable, paginated table with row selection and bulk actions. */
export function DataTable<T>({
  data,
  columns,
  getRowId,
  searchable = true,
  searchPlaceholder = "Search…",
  selectable,
  bulkActions,
  pageSize = 8,
  toolbar,
  emptyMessage = "No results.",
  onRowClick,
  className,
}: DataTableProps<T>) {
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<Sort>(null);
  const [page, setPage] = React.useState(0);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const value = React.useCallback(
    (row: T, col: DataTableColumn<T>) => (col.accessor ? col.accessor(row) : (row as Record<string, unknown>)[col.key]) as string | number | Date | null | undefined,
    [],
  );

  const rows = React.useMemo(() => {
    let out = data;
    const q = query.trim().toLowerCase();
    if (q) out = out.filter((r) => columns.some((c) => String(value(r, c) ?? "").toLowerCase().includes(q)));
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col) {
        out = [...out].sort((a, b) => {
          const va = value(a, col);
          const vb = value(b, col);
          const na = va instanceof Date ? va.getTime() : va;
          const nb = vb instanceof Date ? vb.getTime() : vb;
          const r = typeof na === "number" && typeof nb === "number" ? na - nb : String(na ?? "").localeCompare(String(nb ?? ""), undefined, { numeric: true });
          return sort.dir === "asc" ? r : -r;
        });
      }
    }
    return out;
  }, [data, query, sort, columns, value]);

  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, pages - 1);
  const visible = rows.slice(current * pageSize, current * pageSize + pageSize);
  const visibleIds = visible.map(getRowId);
  const allOnPage = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
  const someOnPage = visibleIds.some((id) => selected.has(id));
  const selectedRows = data.filter((r) => selected.has(getRowId(r)));
  const clear = () => setSelected(new Set());

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const cycleSort = (key: string) =>
    setSort((s) => (s?.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null));

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {searchable || toolbar ? (
        <div className="flex flex-wrap items-center gap-2">
          {searchable ? (
            <label className="flex h-9 min-w-56 flex-1 items-center gap-2 rounded-[10px] border border-border bg-surface px-3 text-sm focus-within:border-accent sm:max-w-xs">
              <SearchIcon size={15} className="text-subtle" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(0);
                }}
                placeholder={searchPlaceholder}
                aria-label="Search table"
                className="flex-1 bg-transparent outline-none placeholder:text-subtle"
              />
            </label>
          ) : null}
          {toolbar}
        </div>
      ) : null}

      <div className="relative overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {selectable ? (
                <th className="w-10 px-4 py-3">
                  <Check
                    label="Select page"
                    checked={allOnPage}
                    indeterminate={!allOnPage && someOnPage}
                    onChange={() =>
                      setSelected((s) => {
                        const n = new Set(s);
                        visibleIds.forEach((id) => (allOnPage ? n.delete(id) : n.add(id)));
                        return n;
                      })
                    }
                  />
                </th>
              ) : null}
              {columns.map((c) => {
                const active = sort?.key === c.key;
                return (
                  <th
                    key={c.key}
                    style={{ width: c.width }}
                    aria-sort={active ? (sort!.dir === "asc" ? "ascending" : "descending") : undefined}
                    className={cn("px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-wider text-subtle", c.align === "right" && "text-right", c.align === "center" && "text-center")}
                  >
                    {c.sortable ? (
                      <button type="button" onClick={() => cycleSort(c.key)} className={cn("inline-flex items-center gap-1 uppercase hover:text-foreground", active && "text-foreground")}>
                        {c.header}
                        {active ? sort!.dir === "asc" ? <ChevronUpIcon size={12} /> : <ChevronDownIcon size={12} /> : <span className="flex flex-col opacity-40"><ChevronUpIcon size={9} /><ChevronDownIcon size={9} className="-mt-1" /></span>}
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visible.length ? (
              visible.map((row) => {
                const id = getRowId(row);
                const isSel = selected.has(id);
                return (
                  <tr
                    key={id}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    data-selected={isSel || undefined}
                    className={cn("border-b border-border last:border-0 transition-colors hover:bg-surface-raised data-[selected]:bg-accent-soft/50", onRowClick && "cursor-pointer")}
                  >
                    {selectable ? (
                      <td className="px-4 py-3">
                        <Check label="Select row" checked={isSel} onChange={() => toggle(id)} />
                      </td>
                    ) : null}
                    {columns.map((c) => (
                      <td key={c.key} className={cn("px-4 py-3", c.align === "right" && "text-right tabular-nums", c.align === "center" && "text-center")}>
                        {c.cell ? c.cell(row) : String(value(row, c) ?? "")}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-12 text-center text-subtle">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {selectable && selected.size > 0 ? (
          <div className="sticky bottom-0 flex items-center gap-3 border-t border-border-strong bg-surface-overlay px-4 py-2.5 text-sm animate-[kn-slide-up_0.2s_var(--ease-kn-out)]">
            <span className="font-medium">{selected.size} selected</span>
            <button type="button" onClick={clear} className="text-xs text-subtle hover:text-foreground">
              Clear
            </button>
            <div className="ml-auto flex items-center gap-2">{bulkActions?.(selectedRows, clear)}</div>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between text-xs text-subtle">
        <span>
          {rows.length ? `${current * pageSize + 1}–${Math.min(rows.length, (current + 1) * pageSize)} of ${rows.length}` : "0 rows"}
        </span>
        <div className="flex items-center gap-1">
          <button type="button" aria-label="Previous page" disabled={current === 0} onClick={() => setPage(current - 1)} className="flex size-8 items-center justify-center rounded-lg hover:bg-surface-raised disabled:opacity-30">
            <ChevronLeftIcon size={15} />
          </button>
          <span className="px-2 tabular-nums">
            {current + 1} / {pages}
          </span>
          <button type="button" aria-label="Next page" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} className="flex size-8 items-center justify-center rounded-lg hover:bg-surface-raised disabled:opacity-30">
            <ChevronRightIcon size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
