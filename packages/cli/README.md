# @kineticui/cli

Copy Kinetic UI components into your project, shadcn-style.

```bash
npx @kineticui/cli init                 # add tokens to globals.css and write kinetic.json
npx @kineticui/cli add button dialog    # copy components and install their dependencies
npx @kineticui/cli list                 # show everything available
npx @kineticui/cli diff                 # what changed upstream since you added things
npx @kineticui/cli update               # merge upstream fixes in, keeping your edits
```

`add` and `update` keep a copy of each file as installed in `.kinetic/`. That's the common ancestor for a three-way merge, so `update` keeps your edits and only stops for lines both of you changed (marked git-style). Commit the `.kinetic` folder.

Components land in `components/kinetic/` and are yours to edit. The registry is shadcn-compatible, so `npx shadcn add https://kinetic-ui.chaitanya-nk.com/r/button.json` also works.

Options: `--registry <url|dir>`, `--dir <path>`, `--yes`, `--dry-run`, `--no-install`, `--force` and `--summary`. Or set `KINETIC_REGISTRY`.

Docs: https://kinetic-ui.chaitanya-nk.com

Part of [Kinetic UI](https://github.com/Chaitanya-NK/kinetic-ui). MIT licensed.
