import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { existsSync } from "node:fs";

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

// F-04: ponytail level is now per-session (was module-level mutable state that
// leaked across concurrent sessions in the same process).
const DEFAULT_LEVEL = "full";
const ponytailLevels = new Map<string, string>();

function sessionKey(pi: ExtensionAPI, ctx: any): string {
  try {
    const id = ctx?.sessionManager?.getSessionId?.() ?? pi.getSessionName?.();
    if (typeof id === "string" && id) return id;
  } catch {
    // ignore — fall through to default key
  }
  return "default";
}

function detectLevel(prompt: string): string | null {
  const lower = prompt.toLowerCase();
  if (/ponytail\s+off/.test(lower)) return "off";
  if (/ponytail\s+ultra/.test(lower)) return "ultra";
  if (/ponytail\s+lazy/.test(lower)) return "lazy";
  if (/ponytail\s+full/.test(lower)) return "full";
  return null;
}

export default function (pi: ExtensionAPI) {
  pi.on("session_start", (_event, ctx) => {
    ponytailLevels.set(sessionKey(pi, ctx), DEFAULT_LEVEL);
  });

  pi.on("session_shutdown", (_event, ctx) => {
    ponytailLevels.delete(sessionKey(pi, ctx));
  });

  pi.on("before_agent_start", async (event, ctx) => {
    const key = sessionKey(pi, ctx);
    let level = ponytailLevels.get(key) ?? DEFAULT_LEVEL;
    const detected = detectLevel(event.prompt);
    if (detected) level = detected;
    ponytailLevels.set(key, level);

    try {
      ctx.ui.setStatus("ponytail", `ponytail: ${level}`);
    } catch {
      // non-TUI mode, ignore
    }

    const ponytailSection =
      level !== "off"
        ? `\n\n## Ponytail Mode (level: ${level})

${
  level === "ultra"
    ? `
- Shortest possible solution. Stdlib/native first, always.
- No dependencies unless strictly necessary.
- No boilerplate, no abstractions.
- One-liner > function > class.
- If it can be done in 3 lines, don't write 10.`
  : level === "lazy"
    ? `
- Laziest solution that works. Stdlib/native first.
- No dependencies unless existing one does it.
- No boilerplate, no unrequested abstractions.
- Delete over add.`
    : `
- Stdlib and native first.
- No unrequested abstractions, no boilerplate.
- Deletion over addition.
- Shortest working diff wins.`
}`

        : "";

    // F-07: only inject the Second Brain protocol when the vault is present.
    const secondBrainSection = vaultExists()
      ? `\n\n## Second Brain — Session Context Protocol

Vault path: ${VAULT}

### START: read these before anything else
1. \`${VAULT}/01 - AI Memory/Pi Profile.md\` — identity, preferences, user context
2. \`${VAULT}/01 - AI Memory/Skills & Context.md\` — installed extensions, skills, packages, tools
3. \`${VAULT}/01 - AI Memory/Decisions Log.md\` — prior decisions
4. \`${VAULT}/01 - AI Memory/Sessions/\` — latest session file (sorted descending)
5. \`${VAULT}/04 - Daily/<today>.md\` — today's daily note (if exists)

### MID-SESSION: update progressively (safe for Ctrl+C 2x)
1. **Daily Note** — update \`${VAULT}/04 - Daily/<today>.md\` after each meaningful task
2. **Session Log** — update \`${VAULT}/01 - AI Memory/Sessions/<today>.md\` gradually
3. **Skills & Context** — update \`${VAULT}/01 - AI Memory/Skills & Context.md\` whenever installing/uninstalling extensions, skills, packages, or tools
4. **Decisions Log** — append to \`${VAULT}/01 - AI Memory/Decisions Log.md\` on new decisions
5. **Pi Profile** — update \`${VAULT}/01 - AI Memory/Pi Profile.md\` when meaningful new context emerges

Don't wait for session end. If Ctrl+C hits mid-task, latest state is already saved.`
      : "";

    return {
      systemPrompt:
        event.systemPrompt +
        `\n\n## Clarifying Questions

Before acting on a user request, determine if the user's intent is fully clear. 
If the request is vague, ambiguous, or missing critical details, ask clarifying 
questions FIRST before reading files, writing code, or executing commands.

Do NOT ask questions for trivial requests ("hello", "thanks", "what's 2+2").
Do NOT ask questions when the request is already clear and specific.

Examples of when to ask:
- "Bikin aplikasi todo" → "Ada preferensi stack? React/Vue? Local storage / API?"
- "Fix bug ini" → "Bisa jelasin expected vs actual behavior?"
- "Refactor kode ini" → "Prioritas readability / performance / maintainability?"

When asking questions, be concise — max 2-3 pertanyaan, langsung ke intinya.` +
        ponytailSection +
        secondBrainSection +
        `\n\n## Response Footer

Append this footer to every response:

\`\`\`
[Ponytail: ${level} | Context-mode: active]
\`\`\`

Context-mode stays "active" as long as you have context-mode tools available.`,
    };
  });
}
