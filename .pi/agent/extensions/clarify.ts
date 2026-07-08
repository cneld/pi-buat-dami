import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

// ponytail: ganti env var PI_VAULT_PATH atau set langsung di sini
const VAULT = process.env.PI_VAULT_PATH || "~/Desktop/pi&Secondbrain";

let ponytailLevel = "full";

function detectLevel(prompt: string): string | null {
  const lower = prompt.toLowerCase();
  if (/ponytail\s+off/.test(lower)) return "off";
  if (/ponytail\s+ultra/.test(lower)) return "ultra";
  if (/ponytail\s+lazy/.test(lower)) return "lazy";
  if (/ponytail\s+full/.test(lower)) return "full";
  return null;
}

export default function (pi: ExtensionAPI) {
  pi.on("before_agent_start", async (event, ctx) => {
    const level = detectLevel(event.prompt);
    if (level) ponytailLevel = level;

    try {
      ctx.ui.setStatus("ponytail", `ponytail: ${ponytailLevel}`);
    } catch {
      // non-TUI mode, ignore
    }

    const ponytailSection =
      ponytailLevel !== "off"
        ? `\n\n## Ponytail Mode (level: ${ponytailLevel})

${
  ponytailLevel === "ultra"
    ? `
- Shortest possible solution. Stdlib/native first, always.
- No dependencies unless strictly necessary.
- No boilerplate, no abstractions.
- One-liner > function > class.
- If it can be done in 3 lines, don't write 10.`
  : ponytailLevel === "lazy"
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
        `\n\n## Second Brain — Session Context Protocol

Vault path: ${VAULT}

### START: read these before anything else
1. \`${VAULT}/01 - AI Memory/Pi Profile.md\` — identity, preferences, user context
2. \`${VAULT}/01 - AI Memory/Decisions Log.md\` — prior decisions
3. \`${VAULT}/01 - AI Memory/Sessions/\` — latest session file (sorted descending)
4. \`${VAULT}/04 - Daily/<today>.md\` — today's daily note (if exists)

### MID-SESSION: update progressively (safe for Ctrl+C 2x)
1. **Daily Note** — update \`${VAULT}/04 - Daily/<today>.md\` after each meaningful task
2. **Session Log** — update \`${VAULT}/01 - AI Memory/Sessions/<today>.md\` gradually
3. **Decisions Log** — append to \`${VAULT}/01 - AI Memory/Decisions Log.md\` on new decisions
4. **Pi Profile** — update \`${VAULT}/01 - AI Memory/Pi Profile.md\` when meaningful new context emerges

Don't wait for session end. If Ctrl+C hits mid-task, latest state is already saved.` +
        `\n\n## Response Footer

Append this footer to every response:

\`\`\`
[Ponytail: ${ponytailLevel} | Context-mode: active]
\`\`\`

Context-mode stays "active" as long as you have context-mode tools available.`,
    };
  });
}