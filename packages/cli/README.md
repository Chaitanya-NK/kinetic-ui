# @kineticui/cli

Copy Kinetic UI components into your project, shadcn-style.

```bash
npx @kineticui/cli init                 # add tokens to globals.css and write kinetic.json
npx @kineticui/cli add button dialog    # copy components and install their dependencies
npx @kineticui/cli list                 # show everything available
```

Components land in `components/kinetic/` and are yours to edit. The registry is shadcn-compatible, so `npx shadcn add https://kinetic-ui.vercel.app/r/button.json` also works.

Options: `--registry <url|dir>`, `--dir <path>`, `--yes`. Or set `KINETIC_REGISTRY`.

Docs: https://kinetic-ui.vercel.app

Part of [Kinetic UI](https://github.com/Chaitanya-NK/kinetic-ui). MIT licensed.
