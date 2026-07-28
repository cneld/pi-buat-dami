import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { existsSync, readdirSync, statSync, rmSync } from "node:fs";
import { join } from "node:path";

// F-07: vault path is per-machine, not hardcoded to one user.
// Override with `PI_SECOND_BRAIN_VAULT=/path/to/vault`. The block below is
// only injected when the directory actually exists, so other machines are
// not coupled to this path and do not pay the context cost.
const VAULT = process.env.PI_SECOND_BRAIN_VAULT || "C:/Users/ranel/Desktop/pi&Secondbrain";

function vaultExists(): boolean {
  try {
    return existsSync(VAULT);
  } catch {
    return false;
  }
}

const DEFAULT_LEVEL = "full";
const ponytailLevels = new Map<string, string>();

const CAVEMAN_DEFAULT_LEVEL = "full";
const cavemanLevels = new Map<string, string>();

function sessionKey(pi: ExtensionAPI, ctx: any): string {
  try {
    const id = ctx?.sessionManager?.getSessionId?.() ?? pi.getSessionName?.();
    if (typeof id === "string" && id) return id;
  } catch {
    // ignore — fall through to default key
  }
  return "default";
}

function detectCavemanLevel(prompt: string): string | null {
  const lower = prompt.toLowerCase();
  if (/stop caveman|normal mode/.test(lower)) return "off";
  if (/caveman\s+ultra/.test(lower)) return "ultra";
  if (/caveman\s+lite/.test(lower)) return "lite";
  if (/caveman\s+full/.test(lower)) return "full";
  return null;
}

function detectLevel(prompt: string): string | null {
  const lower = prompt.toLowerCase();
  if (/ponytail\s+off/.test(lower)) return "off";
  if (/ponytail\s+ultra/.test(lower)) return "ultra";
  if (/ponytail\s+lazy/.test(lower)) return "lazy";
  if (/ponytail\s+full/.test(lower)) return "full";
  return null;
}

function autoPruneSessions(): void {
  const agentDir = process.env.PI_AGENT_DIR || join(process.env.HOME || process.env.USERPROFILE || "", ".pi");
  const sessionsDir = join(agentDir, "agent", "sessions");
  if (!existsSync(sessionsDir)) return;
  const maxAgeDays = 30;
  const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
  const entries = readdirSync(sessionsDir).filter((n) => !n.startsWith("."));
  for (const name of entries) {
    const full = join(sessionsDir, name);
    try {
      if (statSync(full).mtimeMs < cutoff) rmSync(full, { recursive: true, force: true });
    } catch { /* ignore */ }
  }
}

export default function (pi: ExtensionAPI) {
  pi.on("session_start", (_event, ctx) => {
    ponytailLevels.set(sessionKey(pi, ctx), DEFAULT_LEVEL);
    cavemanLevels.set(sessionKey(pi, ctx), CAVEMAN_DEFAULT_LEVEL);
    autoPruneSessions();
  });

  pi.on("session_shutdown", (_event, ctx) => {
    ponytailLevels.delete(sessionKey(pi, ctx));
    cavemanLevels.delete(sessionKey(pi, ctx));
  });

  pi.on("before_agent_start", async (event, ctx) => {
    const key = sessionKey(pi, ctx);
    let level = ponytailLevels.get(key) ?? DEFAULT_LEVEL;
    const detected = detectLevel(event.prompt);
    if (detected) level = detected;
    ponytailLevels.set(key, level);
    let cavemanLevel = cavemanLevels.get(key) ?? CAVEMAN_DEFAULT_LEVEL;
    const cavemanDetected = detectCavemanLevel(event.prompt);
    if (cavemanDetected) cavemanLevel = cavemanDetected;
    cavemanLevels.set(key, cavemanLevel);

    try {
      ctx.ui.setStatus("ponytail", `ponytail: ${level}`);
      ctx.ui.setStatus("caveman", cavemanLevel !== "off" ? `🦴 ${cavemanLevel.toUpperCase()}` : "");
    } catch {
      // non-TUI mode, ignore
    }

    // F-06: compact mode section — one block, level-specific rules only
    const modeLines: string[] = [];
    if (level !== "off") {
      const rules = level === "ultra"
        ? "Stdlib/native first, no deps, no abstractions, one-liner > function, 3 lines max"
        : level === "lazy"
          ? "Stdlib/native first, no new deps, no boilerplate, delete > add"
          : "Stdlib/native first, no unrequested abstractions, shortest diff wins";
      modeLines.push(`Ponytail: ${level} (${rules})`);
    }
    if (cavemanLevel !== "off") {
      const rules = cavemanLevel === "lite"
        ? "No filler/hedging, keep articles + sentences"
        : cavemanLevel === "ultra"
          ? "Drop articles/conjunctions/filler, fragments OK, no tables/emoji"
          : "Drop articles/filler/hedging, fragments OK, short synonyms, tech acronyms OK";
      modeLines.push(`Caveman: ${cavemanLevel} (${rules})`);
    }
    const modesSection = modeLines.length ? `\n\n## Modes\n${modeLines.map(l => "- " + l).join("\n")}` : "";

    // F-06: compact Second Brain — pointer to vault, not full instructions
    const secondBrainSection = vaultExists()
      ? `\n\n## Second Brain
Vault: ${VAULT}
START: Use native Obsidian CLI to read \`${VAULT}/01 - AI Memory/Pi Profile.md\`, \`Skills & Context.md\`, \`Decisions Log.md\`, latest \`Sessions/*.md\`, \`04 - Daily/<today>.md\`. Use executable `C:/Program Files/Obsidian/Obsidian.com` on Windows; do not use direct file tools for Second Brain.\nMID: Use native Obsidian CLI for all Second Brain edits; update daily notes + session log after each task. Skills/Decisions on change. Profile when new context emerges. Don't wait for session end.\n\nContent format: Obsidian Flavored Markdown (wikilinks, embeds, callouts, frontmatter, tags).`
      : "";

    // F-06: fingerprint guard — prevent double injection
    const fingerprint = "[Ponytail:";
    const alreadyInjected = (event.systemPrompt || "").includes(fingerprint);
    if (alreadyInjected) return { systemPrompt: event.systemPrompt };

    return {
      systemPrompt:
        event.systemPrompt +
        `\n\n## Clarifying Questions
Before acting on a user request, determine if the user's intent is fully clear. If vague/ambiguous, ask clarifying questions FIRST. Do NOT ask for trivial requests or when intent is clear.
Examples: "Bikin app todo" → ask stack preference. "Fix bug" → ask expected vs actual behavior.` +
        modesSection +
        secondBrainSection +
        `\n\n## Response Footer
Append to every response:\n\`\`\`\n[Ponytail: ${level} | Caveman: ${cavemanLevel} | Context-mode: active]\n\`\`\``,
    };
  });
}
