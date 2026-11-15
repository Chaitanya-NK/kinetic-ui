# @kineticui/ui

164 motion-first, accessible React components for Next.js and Tailwind CSS v4.

```bash
npm i @kineticui/ui @kineticui/core @kineticui/icons
```

```css
/* app/globals.css */
@import "tailwindcss";
@import "@kineticui/core/styles.css";
@source "../node_modules/@kineticui";
```

```tsx
import { Button, ShareSheet, Toaster, toast } from "@kineticui/ui";

<Button onClick={() => toast.success("Saved")}>Save</Button>
```

Forms, editors, navigation, overlays, data tables and charts, AI chat, collaboration, media, mobile gestures, contact and feedback components. Built on Radix primitives and Motion, with keyboard support and reduced-motion fallbacks.

Docs: https://kinetic-ui.chaitanya-nk.com

Part of [Kinetic UI](https://github.com/Chaitanya-NK/kinetic-ui). MIT licensed.
