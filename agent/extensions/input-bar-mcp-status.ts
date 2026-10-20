import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { exec } from "node:child_process";

/**
 * Enabled servers in the files pi's built-in MCP actually reads:
 * user-level ~/.pi/agent/mcp.json plus the project .pi/mcp.json override.
 * (A project entry replaces a user-level entry with the same name.)
 * Stale sources from the removed pi-mcp-adapter (mcp-cache.json,
 * ~/.config/mcp/mcp.json) are intentionally NOT counted.
 */
function countConfiguredServers(cwd: string): number {
  const home = process.env.USERPROFILE || process.env.HOME || "";
  const piDir =
    process.env.PI_AGENT_DIR || join(home, ".pi", "agent");
  const names = new Set<string>();
  const files = [join(piDir, "mcp.json"), join(cwd, ".pi", "mcp.json")];
  for (const p of files) {
    try {
      if (!existsSync(p)) continue;
      const cfg = JSON.parse(readFileSync(p, "utf8"));
      const servers = cfg?.mcpServers;
      if (!servers || typeof servers !== "object") continue;
      for (const [name, entry] of Object.entries(servers as Record<string, any>)) {
        if (entry?.enabled === false) continue;
        names.add(name);
      }
    } catch {
      /* unreadable or invalid file: skip it */
    }
  }
  return names.size;
}

/**
 * Live connected/total via `pi mcp list --json`.
 * Shell commands load no extensions, so this never re-runs us.
 */
function checkLive(ctx: any, total: number): void {
  exec(
    "pi mcp list --json",
    { timeout: 60_000, windowsHide: true },
    (err: any, stdout: string) => {
      let connected = 0;
      if (!err) {
        try {
          const list = JSON.parse(stdout);
          connected = (list.servers ?? []).filter(
            (s: any) => s.state === "connected" && s.enabled !== false
          ).length;
        } catch {
          /* parse failed: keep the plain total below */
        }
      }
      try {
        ctx.ui.setStatus("mcp-servers", `MCP: ${connected}/${total}`);
      } catch {
        /* context replaced (reload): drop the update */
      }
    }
  );
}

export default function (pi: ExtensionAPI) {
  pi.on("session_start", (_event, ctx) => {
    const total = countConfiguredServers(ctx.cwd);
    if (total === 0) {
      ctx.ui.setStatus("mcp-servers", "");
      return;
    }
    // immediate placeholder, replaced by the live count once it lands
    ctx.ui.setStatus("mcp-servers", `MCP: ${total}`);
    checkLive(ctx, total);
  });
}
