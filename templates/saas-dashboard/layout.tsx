"use client";

import { usePathname } from "next/navigation";
import { DashboardFrame } from "./dashboard-frame";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardFrame active={usePathname()}>{children}</DashboardFrame>;
}
