# @kineticui/blocks

78 ready-made blocks for Kinetic UI: app screens, marketing pages, commerce flows and personal-site widgets.

```bash
npm i @kineticui/blocks @kineticui/ui @kineticui/core @kineticui/icons @kineticui/motion
```

```tsx
import { PricingTable, BillingPage, BlogPost } from "@kineticui/blocks";

export default function Page() {
  return <PricingTable />;
}
```

Every block renders with sensible demo content and no required props. To customise one deeply, copy its source with `npx @kineticui/cli add pricing-table`.

Docs: https://kinetic-ui.chaitanya-nk.com

Part of [Kinetic UI](https://github.com/Chaitanya-NK/kinetic-ui). MIT licensed.
