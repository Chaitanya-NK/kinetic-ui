"use client";

import { ThemeProvider } from "@kineticui/core/theme";
import { Toaster } from "@kineticui/ui";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultMode="dark" defaultAccent="lime">
      {children}
      <Toaster />
    </ThemeProvider>
  );
}
