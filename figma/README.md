# Kinetic UI Figma kit

A Figma plugin that builds the Kinetic UI kit inside any Figma file, generated from the same tokens and icons as the React library:

- **Variables**: every colour token in a "Kinetic UI" collection with Dark and Light modes, plus radius and spacing in "Kinetic UI / Size".
- **Styles**: 13 text styles (Space Grotesk, Inter, JetBrains Mono) and an overlay shadow.
- **Icons**: all icons from `@kineticui/icons` as components, 24px with a 2px stroke.
- **Components**: Button, Badge, Field, Checkbox, Radio, Switch, Select, Tabs, Segmented control, Avatar, Alert, Toast, Tooltip, Progress, Kbd, Card, Dialog and Dynamic Island, built as variant sets bound to the variables. Set a frame's Kinetic UI mode to Light and everything re-themes.

## Run it

1. Download `kinetic-ui-figma-kit.zip` from https://kinetic-ui.chaitanya-nk.com/docs/figma and unzip it (or use this folder).
2. In the Figma desktop app, open a new design file.
3. Menu → Plugins → Development → **Import plugin from manifest…** and pick `manifest.json`.
4. Menu → Plugins → Development → **Kinetic UI Kit**. It takes a few seconds.

To share it with your team, publish the file as a library (Assets → Publish).

## Develop

`figma/code.js` is built from `figma/src/code.ts`: run `node figma/build.mjs` after `npm run build:packages`. `node figma/test/smoke.mjs` runs the plugin against a strict mock of the Figma API. CI fails if `code.js` is out of date with the tokens or icons.
