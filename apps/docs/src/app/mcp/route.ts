import registry from "@/generated/registry.json";
import { createKineticServer, type IndexItem, type JsonRpcMessage, type RegistryItem } from "@kineticui/mcp/core";
import { site } from "@/lib/site";
import { usage } from "@/lib/usage";

/*
 * Hosted MCP endpoint (Streamable HTTP, stateless). Point any MCP client at https://<site>/mcp.
 * Every request is answered with a plain JSON response, which the spec allows instead of SSE.
 */

const items = registry as unknown as RegistryItem[];
const byName = new Map(items.map((i) => [i.name, i]));
const server = createKineticServer({
  siteUrl: site.url,
  index: async () => items.map(({ name, type, title, description, categories }) => ({ name, type, title, description, categories }) as IndexItem),
  item: async (name) => byName.get(name) ?? null,
  usage: async (name) => usage[name] ?? null,
});

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version, Authorization",
  "Access-Control-Expose-Headers": "Mcp-Session-Id",
};

export async function POST(req: Request) {
  let body: JsonRpcMessage | JsonRpcMessage[];
  try {
    body = await req.json();
  } catch {
    return Response.json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }, { status: 400, headers: cors });
  }
  const batch = Array.isArray(body) ? body : [body];
  const out = (await Promise.all(batch.map((m) => server.handle(m)))).filter(Boolean);
  // Only notifications or client responses: acknowledge with 202 and no body.
  if (!out.length) return new Response(null, { status: 202, headers: cors });
  return Response.json(Array.isArray(body) ? out : out[0], { headers: cors });
}

// This server never pushes messages, so there is no SSE stream to open.
export function GET() {
  return new Response("Kinetic UI MCP endpoint. POST JSON-RPC here, or see /docs/ai.", { status: 405, headers: { ...cors, Allow: "POST, OPTIONS" } });
}

export function DELETE() {
  return new Response(null, { status: 405, headers: { ...cors, Allow: "POST, OPTIONS" } });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: cors });
}
