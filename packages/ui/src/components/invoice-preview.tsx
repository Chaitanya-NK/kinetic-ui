"use client";

import * as React from "react";
import { cn } from "@kineticui/core";
import { DownloadIcon, PrinterIcon } from "@kineticui/icons";

export type InvoiceLine = { description: string; detail?: string; qty: number; price: number };
export type InvoiceParty = { name: string; lines?: string[]; email?: string; taxId?: string };

export type InvoiceData = {
  number: string;
  issued: string;
  due: string;
  status?: "paid" | "due" | "overdue" | "draft";
  from: InvoiceParty;
  to: InvoiceParty;
  items: InvoiceLine[];
  /** e.g. 0.18 for 18% GST. */
  taxRate?: number;
  taxLabel?: string;
  discount?: number;
  currency?: string;
  locale?: string;
  notes?: string;
  logo?: React.ReactNode;
};

const statusStyle = { paid: "bg-success-soft text-success", due: "bg-warning-soft text-warning", overdue: "bg-danger-soft text-danger", draft: "bg-surface-overlay text-muted" };

/** Printable invoice document with totals, tax, status stamp, and print / download-as-PDF via the browser. */
export function InvoicePreview({ invoice, className }: { invoice: InvoiceData; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const fmt = new Intl.NumberFormat(invoice.locale ?? "en-IN", { style: "currency", currency: invoice.currency ?? "INR" });
  const subtotal = invoice.items.reduce((a, i) => a + i.qty * i.price, 0);
  const discount = invoice.discount ?? 0;
  const tax = (subtotal - discount) * (invoice.taxRate ?? 0);
  const total = subtotal - discount + tax;

  const print = () => {
    const html = ref.current?.outerHTML;
    const w = window.open("", "_blank", "width=900,height=1100");
    if (!w || !html) return;
    const styles = Array.from(document.querySelectorAll('style,link[rel="stylesheet"]')).map((n) => n.outerHTML).join("");
    w.document.write(`<!doctype html><html class="${document.documentElement.className}"><head><title>Invoice ${invoice.number}</title>${styles}<style>@page{margin:16mm}body{background:#fff}</style></head><body>${html}</body></html>`);
    w.document.close();
    w.onload = () => {
      w.focus();
      w.print();
    };
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={print} className="flex h-9 items-center gap-2 rounded-lg border border-border-strong px-3 text-sm hover:bg-surface-raised">
          <PrinterIcon size={15} /> Print
        </button>
        <button type="button" onClick={print} className="flex h-9 items-center gap-2 rounded-lg bg-accent px-3 text-sm font-semibold text-accent-foreground">
          <DownloadIcon size={15} /> Save as PDF
        </button>
      </div>
      <div ref={ref} className="relative overflow-hidden rounded-2xl bg-white p-10 text-[13px] text-[#1f2328] shadow-[0_20px_60px_-25px_rgba(0,0,0,0.5)]">
        {invoice.status === "paid" ? (
          <span className="pointer-events-none absolute right-10 top-24 rotate-[-14deg] rounded-lg border-4 border-[#1a7f37]/70 px-4 py-1 font-display text-3xl font-bold tracking-widest text-[#1a7f37]/70">PAID</span>
        ) : null}
        <div className="flex items-start justify-between gap-6">
          <div className="flex flex-col gap-1">
            {invoice.logo ?? <span className="flex size-10 items-center justify-center rounded-lg bg-[#0b0c0e] font-display text-lg font-bold text-[#C6F432]">{invoice.from.name[0]}</span>}
            <span className="mt-2 font-semibold">{invoice.from.name}</span>
            {invoice.from.lines?.map((l) => <span key={l} className="text-[#57606a]">{l}</span>)}
            {invoice.from.taxId ? <span className="text-[#57606a]">GSTIN {invoice.from.taxId}</span> : null}
          </div>
          <div className="flex flex-col items-end gap-1 text-right">
            <span className="font-display text-3xl font-semibold tracking-tight">Invoice</span>
            <span className="font-mono text-[#57606a]">{invoice.number}</span>
            {invoice.status ? <span className={cn("mt-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase", statusStyle[invoice.status])}>{invoice.status}</span> : null}
          </div>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-6 border-y border-[#d0d7de] py-5">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] uppercase tracking-wider text-[#57606a]">Billed to</span>
            <span className="font-semibold">{invoice.to.name}</span>
            {invoice.to.lines?.map((l) => <span key={l} className="text-[#57606a]">{l}</span>)}
            {invoice.to.email ? <span className="text-[#57606a]">{invoice.to.email}</span> : null}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] uppercase tracking-wider text-[#57606a]">Issued</span>
            <span>{invoice.issued}</span>
            <span className="mt-2 text-[11px] uppercase tracking-wider text-[#57606a]">Due</span>
            <span>{invoice.due}</span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[11px] uppercase tracking-wider text-[#57606a]">Amount due</span>
            <span className="font-display text-2xl font-semibold">{fmt.format(invoice.status === "paid" ? 0 : total)}</span>
          </div>
        </div>
        <table className="mt-6 w-full">
          <thead>
            <tr className="border-b border-[#d0d7de] text-left text-[11px] uppercase tracking-wider text-[#57606a]">
              <th className="pb-2 font-medium">Description</th>
              <th className="pb-2 text-right font-medium">Qty</th>
              <th className="pb-2 text-right font-medium">Rate</th>
              <th className="pb-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((it, i) => (
              <tr key={i} className="border-b border-[#eaeef2]">
                <td className="py-3">
                  <div className="font-medium">{it.description}</div>
                  {it.detail ? <div className="text-[#57606a]">{it.detail}</div> : null}
                </td>
                <td className="py-3 text-right tabular-nums">{it.qty}</td>
                <td className="py-3 text-right tabular-nums">{fmt.format(it.price)}</td>
                <td className="py-3 text-right font-medium tabular-nums">{fmt.format(it.qty * it.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 ml-auto flex w-64 flex-col gap-1.5">
          <div className="flex justify-between"><span className="text-[#57606a]">Subtotal</span><span className="tabular-nums">{fmt.format(subtotal)}</span></div>
          {discount ? <div className="flex justify-between"><span className="text-[#57606a]">Discount</span><span className="tabular-nums">−{fmt.format(discount)}</span></div> : null}
          {invoice.taxRate ? <div className="flex justify-between"><span className="text-[#57606a]">{invoice.taxLabel ?? "Tax"} ({Math.round(invoice.taxRate * 100)}%)</span><span className="tabular-nums">{fmt.format(tax)}</span></div> : null}
          <div className="mt-1 flex justify-between border-t border-[#d0d7de] pt-2 text-base font-semibold"><span>Total</span><span className="tabular-nums">{fmt.format(total)}</span></div>
        </div>
        {invoice.notes ? <p className="mt-8 rounded-lg bg-[#f6f8fa] p-3 text-[#57606a]">{invoice.notes}</p> : null}
      </div>
    </div>
  );
}
