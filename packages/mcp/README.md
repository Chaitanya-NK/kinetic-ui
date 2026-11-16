# @kineticui/mcp

MCP server for [Kinetic UI](https://kinetic-ui.chaitanya-nk.com). Lets Claude, Cursor, VS Code and other AI tools search the library, read component source and install components into your project.

## Hosted (no install)

Point any MCP client at:

```
https://kinetic-ui.chaitanya-nk.com/mcp
```

Claude Code:

```bash
claude mcp add --transport http kinetic-ui https://kinetic-ui.chaitanya-nk.com/mcp
```

## Local

```json
{ "mcpServers": { "kinetic-ui": { "command": "npx", "args": ["-y", "@kineticui/mcp"] } } }
```

Set `KINETIC_REGISTRY_URL` to use a self-hosted docs site.

## Tools

| Tool | What it does |
| --- | --- |
| `search_components` | Find components and blocks from a description |
| `list_components` | Browse categories or one category |
| `get_component` | Source, install commands, imports, dependencies and usage |
| `get_install_command` | Kinetic CLI, shadcn or npm command for any package manager |
| `get_setup` | One-time project setup |

`@kineticui/mcp/core` exports the transport-agnostic server (`createKineticServer`) if you want to host it yourself.

MIT
