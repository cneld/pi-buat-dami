import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

function getMcpServerCount(): number {
  const piDir =
    process.env.PI_AGENT_DIR ||
    join(process.env.HOME || process.env.USERPROFILE || "", ".pi", "agent");

  const names = new Set<string>();

  // 1. configured servers from mcp.json
  try {
    const p = join(piDir, "mcp.json");
    if (existsSync(p)) {
      const raw = readFileSync(p, "utf8");
      const cfg = JSON.parse(raw);
      const s = cfg.mcpServers;
      if (s && typeof s === "object") for (const k of Object.keys(s)) names.add(k);
    }
  } catch (e: any) { console.error("[mcp-status] mcp.json read failed:", e.message); }

  // 2. cached servers from mcp-cache.json (includes auto-discovered like github, FigmaEdit)
  try {
    const p = join(piDir, "mcp-cache.json");
    if (existsSync(p)) {
      const raw = readFileSync(p, "utf8");
      const cache = JSON.parse(raw);
      const s = cache.servers;
      if (s && typeof s === "object") for (const k of Object.keys(s)) names.add(k);
    }
  } catch (e: any) { console.error("[mcp-status] mcp-cache.json read failed:", e.message); }

  // 3. global MCP config
  try {
    const p = join(process.env.HOME || process.env.USERPROFILE || "", ".config", "mcp", "mcp.json");
    if (existsSync(p)) {
      const raw = readFileSync(p, "utf8");
      const cfg = JSON.parse(raw);
      const s = cfg.mcpServers;
      if (s && typeof s === "object") for (const k of Object.keys(s)) names.add(k);
    }
  } catch (e: any) { console.error("[mcp-status] global mcp.json read failed:", e.message); }

  return names.size;
}

export default function (pi: ExtensionAPI) {
  const setStat = (ctx: any) => {
    const count = getMcpServerCount();
    ctx.ui.setStatus("mcp-servers", count > 0 ? `MCP: ${count}` : "");
  };

  pi.on("session_start", (_event, ctx) => setStat(ctx));
  pi.on("agent_start", (_event, ctx) => setStat(ctx));
}
