/**
 * `npx @kineticui/mcp` — stdio MCP server. Reads newline-delimited JSON-RPC on stdin, writes responses to stdout.
 * Set KINETIC_REGISTRY_URL to point at a self-hosted docs site.
 */
import { createInterface } from "node:readline";
import { createKineticServer, httpSource, type JsonRpcMessage } from "./core.js";

const site = process.env.KINETIC_REGISTRY_URL ?? "https://kinetic-ui.chaitanya-nk.com";
const server = createKineticServer(httpSource(site));
const send = (m: unknown) => process.stdout.write(`${JSON.stringify(m)}\n`);

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  process.stderr.write(`Kinetic UI MCP server

Add to your AI tool's MCP config:

  { "mcpServers": { "kinetic-ui": { "command": "npx", "args": ["-y", "@kineticui/mcp"] } } }

Or use the hosted endpoint, no install: ${site}/mcp
`);
  process.exit(0);
}

const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
rl.on("line", async (line) => {
  if (!line.trim()) return;
  let msg: JsonRpcMessage | JsonRpcMessage[];
  try {
    msg = JSON.parse(line);
  } catch {
    send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } });
    return;
  }
  const batch = Array.isArray(msg) ? msg : [msg];
  const out = (await Promise.all(batch.map((m) => server.handle(m)))).filter(Boolean);
  if (!out.length) return;
  send(Array.isArray(msg) ? out : out[0]);
});
rl.on("close", () => process.exit(0));
process.stderr.write(`kinetic-ui MCP server ready (registry: ${site})\n`);
