"use client";

import * as React from "react";
import { AdminUsers, BillingPage, DashboardShell, SettingsPage, TeamRoles } from "@kineticui/blocks";
import { DashboardFrame } from "./dashboard-frame";

const pages: Record<string, React.ComponentType> = {
  "/dashboard": DashboardShell,
  "/dashboard/users": AdminUsers,
  "/dashboard/team": TeamRoles,
  "/dashboard/billing": BillingPage,
  "/dashboard/settings": SettingsPage,
};

/** Single-page preview of the template for the docs site (the real template uses one route per page). */
export default function Preview() {
  const [path, setPath] = React.useState("/dashboard");
  const Page = pages[path]!;
  return (
    <DashboardFrame active={path} onNavigate={setPath}>
      <div className="mx-auto max-w-7xl px-4 py-6"><Page /></div>
    </DashboardFrame>
  );
}
